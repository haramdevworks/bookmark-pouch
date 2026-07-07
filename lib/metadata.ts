import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";

const MIN_ARTICLE_TEXT_LENGTH = 200;

const NEWS_DOMAINS = [
  "yna.co.kr",
  "chosun.com",
  "joongang.co.kr",
  "donga.com",
  "hani.co.kr",
  "khan.co.kr",
  "mk.co.kr",
  "hankyung.com",
];

const BLOG_DOMAINS = [
  "brunch.co.kr",
  "velog.io",
  "medium.com",
  "tistory.com",
  "blog.naver.com",
  "blogspot.com",
];

const VIDEO_DOMAINS = ["youtube.com", "youtu.be"];

const PAPER_DOMAINS = ["arxiv.org"];

function matchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * 도메인을 기반으로 콘텐츠 유형을 분류한다.
 * 페이지를 가져오지 못해도 URL만으로 항상 값을 계산할 수 있다.
 */
export function classifyContentType(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, "");

  if (matchesDomain(host, "github.com")) return "GitHub";
  if (VIDEO_DOMAINS.some((domain) => matchesDomain(host, domain))) return "영상";
  if (PAPER_DOMAINS.some((domain) => matchesDomain(host, domain))) return "논문";
  if (BLOG_DOMAINS.some((domain) => matchesDomain(host, domain))) return "블로그";
  if (host.startsWith("news.") || host.includes(".news.") || NEWS_DOMAINS.some((domain) => matchesDomain(host, domain))) {
    return "기사";
  }

  return "기타";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .trim();
}

/**
 * <meta property="..." content="..."> 형태를 속성 순서에 상관없이 파싱한다.
 * 외부 라이브러리 없이 정규식만으로 처리한다.
 */
function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const metaTagPattern = /<meta\b[^>]*>/gi;

  for (const tag of html.match(metaTagPattern) ?? []) {
    const key = tag.match(/(?:property|name)\s*=\s*(["'])((?:(?!\1).)+)\1/i)?.[2];
    const value = tag.match(/content\s*=\s*(["'])((?:(?!\1).)*)\1/i)?.[2];

    if (key && value !== undefined && !(key.toLowerCase() in tags)) {
      tags[key.toLowerCase()] = decodeHtmlEntities(value);
    }
  }

  return tags;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1]) || null : null;
}

function resolveUrl(value: string | undefined, baseUrl: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

export interface ParsedHtmlMetadata {
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  siteName: string | null;
  author: string | null;
  publishedAt: string | null;
}

/**
 * HTML 문자열에서 Open Graph 태그를 우선 사용하고, 없으면 표준 메타 태그로 대체한다.
 * 일부 항목만 있어도 있는 값만 채우고 나머지는 null로 둔다.
 */
export function parseHtmlMetadata(html: string, baseUrl: string): ParsedHtmlMetadata {
  const meta = extractMetaTags(html);

  return {
    title: meta["og:title"] || extractTitleTag(html) || null,
    description: meta["og:description"] || meta["description"] || null,
    thumbnail: resolveUrl(meta["og:image"] || meta["twitter:image"], baseUrl),
    siteName: meta["og:site_name"] || null,
    author: meta["article:author"] || meta["author"] || null,
    publishedAt: meta["article:published_time"] || null,
  };
}

/**
 * Firefox Reader View와 같은 알고리즘(Readability)으로 본문만 뽑아낸다.
 * 이 텍스트는 어디에도 저장하지 않고 AI 분석 프롬프트에 한 번 쓰인 뒤 버려진다.
 * 실패하거나 프로필/목록 페이지처럼 본문이라 보기엔 너무 짧으면 null을 반환하고,
 * 호출부는 title/description 기반으로 조용히 대체한다.
 */
export function extractArticleText(html: string): string | null {
  try {
    const { document } = parseHTML(html);
    const article = new Readability(document).parse();
    const text = article?.textContent?.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

    if (!text || text.length < MIN_ARTICLE_TEXT_LENGTH) {
      return null;
    }

    return text;
  } catch {
    return null;
  }
}
