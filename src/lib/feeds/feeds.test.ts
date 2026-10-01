import { describe, expect, it } from 'vitest';
import { isFresh, parseRss } from './index';

describe('parseRss', () => {
  it('reads title, link and date from RSS 2.0 items', () => {
    const xml = `<rss><channel><item><title><![CDATA[The Skill Flywheel]]></title><link>https://blog.kevinhyde.com/posts/skill-flywheel</link><pubDate>Wed, 08 Apr 2026 00:00:00 GMT</pubDate></item></channel></rss>`;
    expect(parseRss(xml)).toEqual([
      {
        title: 'The Skill Flywheel',
        url: 'https://blog.kevinhyde.com/posts/skill-flywheel',
        date: 'Wed, 08 Apr 2026 00:00:00 GMT',
        description: undefined,
      },
    ]);
  });
});

describe('isFresh', () => {
  const now = new Date('2026-10-01');
  it('is fresh within the window', () => {
    expect(isFresh([{ title: 'a', date: '2026-08-01' }], 180, now)).toBe(true);
  });
  it('goes stale after the window', () => {
    expect(isFresh([{ title: 'a', date: '2025-11-01' }], 180, now)).toBe(false);
  });
  it('treats undated feeds as not fresh', () => {
    expect(isFresh([{ title: 'a' }], 180, now)).toBe(false);
  });
});
