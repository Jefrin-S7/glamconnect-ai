/**
 * Models sometimes wrap JSON output in markdown code fences even when
 * explicitly told not to. Stripping them here, once, keeps every AI
 * feature's parse function focused on shape validation rather than
 * re-implementing this same cleanup.
 */
export function parseJsonResponse(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
