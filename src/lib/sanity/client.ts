import { createClient, type SanityClient } from '@sanity/client';

/**
 * Same Sanity project the old Next.js site uses. Content is fetched at build
 * time only; nothing talks to Sanity from the browser.
 *
 * Without SANITY_PROJECT_ID the client is null and every query returns [],
 * so the site still builds (with empty feeds) on a fresh checkout.
 */
const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;

export const sanity: SanityClient | null = projectId
  ? createClient({
      projectId,
      dataset: (import.meta.env.SANITY_DATASET as string | undefined) ?? 'production',
      apiVersion: '2025-01-01',
      useCdn: true,
      token: import.meta.env.SANITY_READ_TOKEN as string | undefined,
    })
  : null;

export async function query<T>(groq: string, params: Record<string, unknown> = {}): Promise<T[]> {
  if (!sanity) {
    console.warn('[sanity] SANITY_PROJECT_ID not set; returning no results.');
    return [];
  }
  return sanity.fetch<T[]>(groq, params);
}
