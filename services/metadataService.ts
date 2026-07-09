import { classifyContentType, extractArticleText, parseHtmlMetadata } from "@/lib/metadata";

const FETCH_TIMEOUT_MS = 6000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface FetchedMetadata {
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  siteName: string | null;
  author: string | null;
  publishedAt: string | null;
  contentType: string;
}

export interface FetchMetadataResult {
  ok: boolean;
  metadata: FetchedMetadata;
  /**
   * Readability로 추출한 본문 텍스트. AI 분석에만 임시로 쓰이며 DB에는 절대
   * 저장하지 않는다 (applyFetchedMetadata에는 전달하지 않는다).
   */
  articleText: string | null;
}

function emptyMetadata(contentType: string): FetchedMetadata {
  return {
    title: null,
    description: null,
    thumbnail: null,
    siteName: null,
    author: null,
    publishedAt: null,
    contentType,
  };
}

/**
 * URL에서 Open Graph 메타데이터를 가져온다.
 * Open Graph가 없는 사이트, 접근 차단, 잘못된 URL, timeout 등 어떤 경우에도
 * 예외를 던지지 않고 { ok: false, metadata } 형태로 반환한다.
 * 콘텐츠 유형은 페이지 접근 성공 여부와 무관하게 URL만으로 항상 계산된다.
 */
export async function fetchUrlMetadata(rawUrl: string): Promise<FetchMetadataResult> {
  console.log(`[fetchUrlMetadata] 시작: ${rawUrl}`);
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false, metadata: emptyMetadata("기타"), articleText: null };
  }

  const contentType = classifyContentType(url.hostname);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.log(`[fetchUrlMetadata] Response not ok: ${response.status} for ${url.toString()}`);
      return { ok: false, metadata: emptyMetadata(contentType), articleText: null };
    }

    const html = await response.text();
    const parsed = parseHtmlMetadata(html, response.url || url.toString());
    const articleText = extractArticleText(html);

    console.log(`[fetchUrlMetadata] Success for ${url.toString()}`, {
      title: parsed.title,
      description: parsed.description?.substring(0, 50),
      hasArticleText: !!articleText,
    });

    return {
      ok: true,
      metadata: { ...parsed, contentType },
      articleText,
    };
  } catch (error) {
    console.log(`[fetchUrlMetadata] Error for ${url.toString()}:`, error instanceof Error ? error.message : error);
    return { ok: false, metadata: emptyMetadata(contentType), articleText: null };
  }
}
