import { GoogleGenAI, Type } from "@google/genai";
import { updateBookmarkAiInsights } from "./bookmarkService";

const MODEL = "gemini-2.5-flash";
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_ARTICLE_TEXT_LENGTH = 5000;

export interface AiInsightInput {
  title: string;
  description: string | null;
  siteName: string | null;
  contentType: string | null;
  /**
   * Readability로 크롤링한 본문 텍스트(있으면). AI 프롬프트에만 쓰이고
   * 어디에도 저장하지 않는다 — 이 값을 DB에 쓰는 코드가 있으면 안 된다.
   */
  articleText?: string | null;
}

export interface AiInsights {
  summary: string;
  quotes: string[];
  tags: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "자료 내용을 정리한 한국어 3줄 요약",
    },
    quotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "다시 찾아볼 때 도움이 되는 핵심 문장 1~2개",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "자료를 분류하기 좋은 추천 태그 5개",
    },
  },
  required: ["summary", "quotes", "tags"],
};

const SYSTEM_INSTRUCTION =
  "당신은 사용자가 저장한 링크 자료를 나중에 다시 활용하기 쉽도록 정리해주는 도우미입니다. " +
  "주어진 정보(제목/본문 또는 설명/사이트명/콘텐츠 유형)만 근거로 삼아 한국어로 3줄 요약, 핵심 문장 1~2개, 추천 태그 5개를 작성하세요. " +
  "'본문'이 주어진 경우 핵심 문장은 반드시 본문에 실제로 있는 문장을 그대로(의역하지 않고 글자 그대로) 발췌하세요. " +
  "'본문'이 없다면 주어진 제목/설명 안에서만 핵심 문장을 뽑으세요. " +
  "주어진 정보에 없는 내용은 지어내지 마세요. 정보가 부족하면 알 수 있는 범위 안에서만 간결하게 작성하세요.";

function buildPrompt(input: AiInsightInput): string {
  const lines: string[] = [`제목: ${input.title}`];

  if (input.articleText) {
    lines.push(`본문: ${input.articleText.slice(0, MAX_ARTICLE_TEXT_LENGTH)}`);
  } else if (input.description) {
    lines.push(`설명: ${input.description.slice(0, MAX_DESCRIPTION_LENGTH)}`);
  }
  if (input.siteName) {
    lines.push(`사이트명: ${input.siteName}`);
  }
  if (input.contentType) {
    lines.push(`콘텐츠 유형: ${input.contentType}`);
  }

  return lines.join("\n");
}

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * 크롤링한 본문(있으면) 또는 메타데이터만으로 3줄 요약 / 핵심 문장 1~2개 / 추천 태그 5개를 생성한다.
 * API Key 누락, 네트워크 오류, 응답 형식 오류 등 어떤 이유로든 실패하면
 * 예외를 던지지 않고 null을 반환한다.
 */
export async function generateBookmarkInsights(input: AiInsightInput): Promise<AiInsights | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: buildPrompt(input),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        // 단순 추출/요약 작업이라 확장 사고(thinking)가 필요 없어 토큰 절약을 위해 비활성화한다.
        thinkingConfig: { thinkingBudget: 0 },
        // 요약 3줄 + 문장 1~2개 + 태그 5개는 분량이 작아 상한을 낮게 잡아 과다 생성을 막는다.
        maxOutputTokens: 512,
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as Partial<AiInsights>;

    if (typeof parsed.summary !== "string" || !Array.isArray(parsed.quotes) || !Array.isArray(parsed.tags)) {
      return null;
    }

    const summary = parsed.summary.trim();
    if (!summary) return null;

    return {
      summary,
      quotes: parsed.quotes.filter((quote): quote is string => typeof quote === "string" && quote.trim().length > 0).slice(0, 2),
      tags: parsed.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0).slice(0, 5),
    };
  } catch {
    return null;
  }
}

/**
 * 신규 북마크 저장 직후에만 호출된다 (백그라운드 실행 전용).
 * 조회/수정 시에는 다시 호출하지 않는다.
 * Gemini 호출이나 저장이 실패해도 예외를 던지지 않는다 — 이미 사용자에게는
 * 북마크 저장 응답이 전달된 뒤이므로, 실패는 조용히 무시하고 summary는 null로 남는다.
 */
export async function analyzeAndSaveBookmark(bookmark: AiInsightInput & { id: string }, userId: string): Promise<void> {
  const insights = await generateBookmarkInsights(bookmark);
  if (!insights) return;

  try {
    await updateBookmarkAiInsights(bookmark.id, userId, {
      summary: insights.summary,
      quotes: insights.quotes,
      aiTags: insights.tags,
    });
  } catch {
    // 백그라운드 작업이므로 실패해도 사용자 흐름에는 영향을 주지 않는다.
  }
}
