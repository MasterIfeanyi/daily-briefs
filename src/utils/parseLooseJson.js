export function parseLooseJson(text) {
  // 1. Clean up any wrapping markdown code blocks safely on a single line
  const sanitized = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    // Attempt standard direct parse first
    return JSON.parse(sanitized);
  } catch (initialError) {
    // If it fails due to background noise/rambling, track backwards from the end
    // to isolate the final standalone JSON object block
    let depth = 0;
    const endIndex = sanitized.lastIndexOf('}');
    let startIndex = -1;

    if (endIndex !== -1) {
      for (let i = endIndex; i >= 0; i--) {
        if (sanitized[i] === '}') {
          depth++;
        }
        if (sanitized[i] === '{') {
          depth--;
        }
        
        if (depth === 0) {
          startIndex = i;
          break;
        }
      }
    }

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonCandidate = sanitized.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (innerError) {
        console.error("Failed parsing extracted block:", jsonCandidate);
        throw new Error(`JSON Extraction failed: ${innerError.message}. Original error: ${initialError.message}`);
      }
    }

    throw new Error(`No structured object block found in text response. Original error: ${initialError.message}`);
  }
}