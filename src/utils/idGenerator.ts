let counter = 0;

/** Generate a simple unique ID (no external dependency at runtime). */
export function generateId(): string {
  counter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}-${counter}`;
}