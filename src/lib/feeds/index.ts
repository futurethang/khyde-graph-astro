import type { Feed } from '../graph/schema';
import { postsInCategory } from '../sanity/queries';

/**
 * Build-time feeds for graph nodes. Every source fails soft: a network or
 * parse error logs a warning and yields [], so an outlet being down never
 * breaks the build.
 */

export interface FeedItem {
  title: string;
  url?: string;
  date?: string;
  description?: string;
}

export interface ResolvedFeed {
  items: FeedItem[];
  /** False when the newest item is older than the feed's freshForDays. */
  fresh: boolean;
}

export async function resolveFeed(feed: Feed, now = new Date()): Promise<ResolvedFeed> {
  let items: FeedItem[] = [];
  try {
    if (feed.source === 'sanity') items = await fromSanity(feed.category, feed.limit);
    else if (feed.source === 'tech-apps') items = await fromTechApps(feed.url, feed.limit);
    else items = await fromRss(feed.url, feed.limit);
  } catch (err) {
    console.warn(`[feeds] ${feed.source} failed: ${(err as Error).message}`);
  }
  return { items, fresh: isFresh(items, feed.freshForDays, now) };
}

export function isFresh(items: FeedItem[], days: number, now = new Date()): boolean {
  const newest = items.map((i) => (i.date ? Date.parse(i.date) : NaN)).filter(Number.isFinite).sort((a, b) => b - a)[0];
  if (newest === undefined) return false;
  return now.getTime() - newest <= days * 864e5;
}

async function fromSanity(category: Parameters<typeof postsInCategory>[0], limit: number): Promise<FeedItem[]> {
  const posts = await postsInCategory(category, limit);
  return posts.map((p) => ({
    title: p.title,
    url: p.url ?? p.link,
    date: p.publishedAt ?? p._createdAt,
    description: p.description,
  }));
}

/**
 * tech.kevinhyde.com/apps.json does not exist yet; adding it is a task in
 * docs/phases/4-pages-and-content.md. Expected shape:
 * [{ "title", "description", "url", "date", "tags": [], "status": "live" | "wip" }]
 */
async function fromTechApps(url: string, limit: number): Promise<FeedItem[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const apps = (await res.json()) as { title: string; description?: string; url?: string; date?: string }[];
  return apps
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, limit)
    .map((a) => ({ title: a.title, url: a.url, date: a.date, description: a.description }));
}

/**
 * blog.kevinhyde.com has no feed yet (rss.xml 404s); adding @astrojs/rss
 * there is a phase 4 task. Minimal parser: RSS 2.0 <item> title/link/pubDate.
 */
async function fromRss(url: string, limit: number): Promise<FeedItem[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return parseRss(await res.text()).slice(0, limit);
}

export function parseRss(xml: string): FeedItem[] {
  const tag = (block: string, name: string) =>
    block.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`))?.[1]?.trim();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, block = '']) => ({
    title: tag(block, 'title') ?? 'Untitled',
    url: tag(block, 'link'),
    date: tag(block, 'pubDate'),
    description: tag(block, 'description'),
  }));
}
