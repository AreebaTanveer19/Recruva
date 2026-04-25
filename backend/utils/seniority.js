/**
 * Seniority utilities — Fix #6
 *
 * Parses job title to extract seniority level, then maps that to:
 *   - A difficulty distribution (how many easy/medium/hard out of 15 total)
 *   - A prose context string injected into the LLM prompt so question depth
 *     is calibrated to the candidate level rather than being generic.
 *
 * Why this matters: a "Junior React Developer" and "Senior React Developer"
 * should never get the same interview questions. Seniority is the single most
 * important axis for calibrating difficulty.
 */

/**
 * Extracts seniority level from a job title string.
 * Returns: "junior" | "mid" | "senior" | "lead"
 * Defaults to "mid" when no signal is detected.
 */
function extractSeniority(jobTitle = "") {
  const t = jobTitle.toLowerCase();
  if (/\b(lead|principal|staff|architect)\b/.test(t) || t.includes("head of")) return "lead";
  if (/\bsenior\b/.test(t) || /\bsr\b/.test(t))                                return "senior";
  if (/\b(junior|jr|entry|associate|intern)\b/.test(t))                        return "junior";
  return "mid";
}

/**
 * Maps seniority to easy/medium/hard counts that always sum to 15.
 *
 * junior → more easy:   fundamentals dominate, very few hard
 * mid    → balanced:    practical application focus
 * senior → more hard:   design, trade-offs, scalability
 * lead   → mostly hard: architecture, strategy, cross-team decisions
 */
function getDifficultyDistribution(seniority) {
  switch (seniority) {
    case "junior": return { easy: 7, medium: 6, hard: 2 };
    case "mid":    return { easy: 4, medium: 7, hard: 4 };
    case "senior": return { easy: 2, medium: 5, hard: 8 };
    case "lead":   return { easy: 1, medium: 4, hard: 10 };
    default:       return { easy: 4, medium: 7, hard: 4 };
  }
}

/**
 * Returns prose injected into the LLM generation prompt to calibrate
 * question depth. Without this, the LLM produces generic mid-level questions
 * regardless of whether the role is junior or lead.
 */
function getSeniorityPromptContext(seniority) {
  switch (seniority) {
    case "junior":
      return "The candidate is a junior developer. Focus on fundamentals, basic syntax, and simple problem-solving. Avoid system design, production architecture, or trade-off questions entirely.";
    case "mid":
      return "The candidate is a mid-level developer. Expect practical experience, code quality awareness, debugging skills, and introductory system design concepts.";
    case "senior":
      return "The candidate is a senior developer. Focus on system design, performance trade-offs, scalability patterns, code review judgment, and team mentoring scenarios.";
    case "lead":
      return "The candidate is a tech lead or principal architect. Focus on large-scale distributed systems, cross-team technical decisions, engineering culture, make-or-buy trade-offs, and long-term technical strategy.";
    default:
      return "";
  }
}

module.exports = { extractSeniority, getDifficultyDistribution, getSeniorityPromptContext };
