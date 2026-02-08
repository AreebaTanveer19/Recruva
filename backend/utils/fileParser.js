const fs = require('fs').promises;
const pdfParse = require('pdf-parse'); 
const mammoth = require('mammoth');

/**
 * Extract text from uploaded file
 */
async function extractTextFromFile(filePath, mimeType) {
  try {
    const fileBuffer = await fs.readFile(filePath);

    switch (mimeType) {
      case 'application/pdf':
        return await extractFromPDF(fileBuffer);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractFromDOCX(fileBuffer);

      case 'application/msword':
        return await extractFromDOC(fileBuffer);

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Extract text from PDF
 */
async function extractFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX
 */
async function extractFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * DOC not supported
 */
async function extractFromDOC() {
  throw new Error('DOC files are not supported. Please convert to DOCX or PDF.');
}

/**
 * Clean text
 */
function cleanText(text) {
  if (!text) return '';

  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

module.exports = {
  extractTextFromFile,
  cleanText
};
