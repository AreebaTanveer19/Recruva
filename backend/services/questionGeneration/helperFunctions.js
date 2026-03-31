
// ─── Helper: extract significant words for similarity comparison ──
export function getSignificantWords(text) {
  const stopWords = new Set([
    "what", "is", "the", "a", "an", "of", "in", "and", "or", "how",
    "do", "does", "can", "you", "for", "to", "are", "with", "this",
    "that", "your", "explain", "describe", "define", "give", "between"
  ]);
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
}

// ─── Helper: deduplicate weighted keywords by name ────────────────
export function dedupeKeywords(weightedKeywords) {
  const map = new Map();
  weightedKeywords.forEach(k => {
    if (!map.has(k.name) || map.get(k.name).weight < k.weight) {
      map.set(k.name, k);
    }
  });
  return Array.from(map.values());
}

// ─── Helper: convert keyword names to weighted format ─────────────
export function convertToWeightedKeywords(keywords) {
  return keywords.map((k, index) => ({
    name:   k,
    weight: keywords.length - index,
  }));
}

// ─── Helper: check if two questions are too similar ───────────────
export function isTooSimilar(q1, q2, threshold = 0.6) {
  const words1  = getSignificantWords(q1);
  const words2  = getSignificantWords(q2);
  const smaller = Math.min(words1.size, words2.size);
  if (smaller === 0) return false;
  let overlap = 0;
  for (const w of words1) { if (words2.has(w)) overlap++; }
  return (overlap / smaller) >= threshold;
}

// ─── Helper: filter out similar questions, keeping first unique ───
export function deduplicateQuestions(questions, limit) {
  const picked = [];
  for (const q of questions) {
    if (picked.length >= limit) break;
    const isDuplicate = picked.some(p => isTooSimilar(p.question, q.question));
    if (!isDuplicate) picked.push(q);
  }
  return picked;
}

// ─── Helper: check candidate against existing for similarity ──────
export function isQuestionDuplicate(newQuestion, existingSignificantWords) {
  const newWords = getSignificantWords(newQuestion);
  return existingSignificantWords.some(({ words }) => {
    const smaller = Math.min(words.size, newWords.size);
    if (smaller === 0) return false;
    let overlap = 0;
    for (const w of newWords) { if (words.has(w)) overlap++; }
    return (overlap / smaller) >= 0.6;
  });
}

