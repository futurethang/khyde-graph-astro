import { query } from './client';

/**
 * The existing dataset uses one generic `post` type. A reference to a category
 * document decides what kind of post it is. These ids come from the old
 * site's cms-utils/ (devkev-next).
 */
export const CATEGORIES = {
  books: 'a259b5b4-06e2-4b52-b51e-bcf2fbde4cae',
  articles: 'fa4789b8-cbc5-4630-84ed-00b51d86a785',
  blog: '67d6d041-f7f9-48d2-a56e-747c29b917b3',
  samples: '45be0681-18a8-485c-95d3-325682e24033',
  art: 'e8c8597a-b53b-4afc-b50b-de5f3b527f04',
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export interface SanityPost {
  _id: string;
  title: string;
  slug?: { current: string };
  publishedAt?: string;
  _createdAt: string;
  author?: string;
  description?: string;
  url?: string;
  link?: string;
  mainImage?: unknown;
  body?: unknown[];
  tags?: { title: string }[];
}

const POST_FIELDS = `
  _id, _createdAt, publishedAt, title, slug, author, description, url, link,
  mainImage, body, "tags": tags[]->{ title }
`;

export function postsInCategory(category: CategoryKey, limit = 100): Promise<SanityPost[]> {
  return query<SanityPost>(
    `*[_type == "post" && references($cat)] | order(coalesce(publishedAt, _createdAt) desc) [0...$limit] { ${POST_FIELDS} }`,
    { cat: CATEGORIES[category], limit },
  );
}

export async function postBySlug(slug: string): Promise<SanityPost | undefined> {
  const [post] = await query<SanityPost>(`*[_type == "post" && slug.current == $slug][0...1] { ${POST_FIELDS} }`, { slug });
  return post;
}
