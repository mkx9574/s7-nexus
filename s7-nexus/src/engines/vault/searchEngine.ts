import { vaultDb, ChunkRecord } from '../../vault/io/db';
import { normalizeArabic } from './normalize';

export async function searchVault(query: string): Promise<ChunkRecord[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return []; // عدم البحث بأحرف مفردة لتجنب النتائج العشوائية

  const normalizedQuery = normalizeArabic(cleanQuery);
  const chunks = await vaultDb.chunks.toArray();

  const matched = chunks.filter((chunk) => {
    if (!chunk.text) return false;
    const normText = normalizeArabic(chunk.text);
    return normText.includes(normalizedQuery);
  });

  return matched;
}
