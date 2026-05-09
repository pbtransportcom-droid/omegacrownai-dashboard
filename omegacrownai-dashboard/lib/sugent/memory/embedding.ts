export async function embed(text: string): Promise<number[]> {
  return fakeEmbedding(text);
}

export function fakeEmbedding(text: string, size = 64): number[] {
  const vector = Array.from({ length: size }, () => 0);
  const input = String(text || "").toLowerCase();

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const index = code % size;
    vector[index] += ((code % 31) + 1) / 31;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

export function cosine(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
