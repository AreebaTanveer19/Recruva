const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESUME_BUCKET = process.env.SUPABASE_RESUME_BUCKET || 'resumes';

let supabaseClient;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }

  return supabaseClient;
}

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function buildStoragePath(candidateId, originalName) {
  const extension = (path.extname(originalName) || '.pdf').toLowerCase();
  const baseName = sanitizeFileName(path.basename(originalName, extension) || 'resume');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return `candidate-${candidateId}/${timestamp}-${baseName}${extension}`;
}

async function uploadResumeBuffer({ buffer, originalName, candidateId, contentType }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Cannot upload an empty file to Supabase.');
  }

  const supabase = getSupabaseClient();
  const storagePath = buildStoragePath(candidateId, originalName);

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(RESUME_BUCKET)
    .getPublicUrl(storagePath);

  const pdfUrl = publicUrlData?.publicUrl;

  if (!pdfUrl) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signedError || !signedData?.signedUrl) {
      throw new Error('Supabase uploaded the resume, but no URL could be generated.');
    }

    return {
      pdfUrl: signedData.signedUrl,
      storagePath,
      bucket: RESUME_BUCKET,
    };
  }

  return {
    pdfUrl,
    storagePath,
    bucket: RESUME_BUCKET,
  };
}

async function uploadResumeFile({ localFilePath, originalName, candidateId, contentType }) {
  const fileBuffer = await fs.readFile(localFilePath);
  return uploadResumeBuffer({
    buffer: fileBuffer,
    originalName,
    candidateId,
    contentType,
  });
}

async function deleteResumeObject(storagePath) {
  if (!storagePath) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    await supabase.storage.from(RESUME_BUCKET).remove([storagePath]);
  } catch (error) {
    console.error('Failed to delete resume from Supabase:', error.message);
  }
}

function extractStoragePathFromSupabaseUrl(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  try {
    const url = new URL(fileUrl);
    const pathMarkers = ['/object/public/', '/object/sign/', '/object/authenticated/'];

    for (const marker of pathMarkers) {
      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex >= 0) {
        const fullStoragePath = url.pathname.slice(markerIndex + marker.length);
        const parts = fullStoragePath.split('/').filter(Boolean);

        if (parts.length < 2) {
          return null;
        }

        parts.shift(); // remove bucket
        return decodeURIComponent(parts.join('/'));
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  uploadResumeFile,
  uploadResumeBuffer,
  deleteResumeObject,
  extractStoragePathFromSupabaseUrl,
};
