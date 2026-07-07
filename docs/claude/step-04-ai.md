# Step 04 - Gemini AI Integration

## 역할

당신은 Senior Full Stack Engineer입니다.

프로젝트 루트의 아래 문서를 먼저 읽고 작업을 시작해주세요.

- docs/requirements.md
- docs/design-guide.md
- docs/github-info.md
- docs/todo.md

이번 단계에서는 **Gemini AI 연동만 구현**합니다.

---

# 목표

사용자가 링크를 저장할 때
OG 메타데이터를 기반으로 Gemini를 호출하여
자료를 더 쉽게 재활용할 수 있는 정보를 생성합니다.

이번 단계에서는 AI 생성 및 저장까지만 구현합니다.

검색 기능은 구현하지 않습니다.

---

# 전제 조건

- Supabase CRUD 완료
- OG 메타데이터 자동 수집 완료

---

# 환경변수

프로젝트 루트의

.env.local

에

```env
GEMINI_API_KEY=
```

를 사용합니다.

API Key는 절대 하드코딩하지 않습니다.

클라이언트에서 Gemini를 직접 호출하지 않습니다.

반드시 서버에서만 호출합니다.

---

# 패키지

필요하다면

@google/genai

를 설치해주세요.

다른 AI 라이브러리는 사용하지 않습니다.

---

# 구현 목표

북마크 저장 시

OG 메타데이터

↓

Gemini 호출

↓

AI 결과 생성

↓

Supabase 저장

---

# AI 입력

가능한 정보를 모두 사용해주세요.

우선순위

1.

제목

2.

설명

3.

사이트명

4.

콘텐츠 유형

---

# AI 출력

아래 JSON 형식을 반드시 유지해주세요.

```json
{
  "summary": "3줄 요약",

  "quotes": [
    "핵심 문장 1",
    "핵심 문장 2",
    "핵심 문장 3"
  ],

  "tags": [
    "태그1",
    "태그2",
    "태그3",
    "태그4",
    "태그5"
  ]
}
```

JSON 외의 텍스트는 절대 반환하지 않습니다.

---

# DB

bookmark에 아래 필드를 추가해주세요.

summary

quotes

ai_tags

필요하다면

database/schema.sql도 함께 수정해주세요.

기존 데이터는 깨지지 않아야 합니다.

---

# Service Layer

새 파일

services/aiService.ts

를 생성해주세요.

Gemini 호출은 모두

Service Layer에서만 수행합니다.

컴포넌트에서 직접 호출하지 않습니다.

---

# 저장 흐름

사용자

↓

URL 입력

↓

OG 메타데이터

↓

저장 버튼

↓

Gemini 호출

↓

AI 결과 생성

↓

Supabase 저장

↓

목록으로 이동

---

# UI

등록 화면에서는

AI 생성 중

Loading 표시

예)

"AI가 자료를 분석하고 있습니다..."

생성이 끝난 후 저장합니다.

---

# 예외 처리

Gemini 호출 실패

↓

북마크는 저장

↓

AI 데이터는 null

↓

사용자에게

"AI 분석에 실패했습니다."

표시

서비스 이용은 계속 가능합니다.

---

# 구현하지 않을 것

- AI 채팅
- RAG
- 벡터검색
- AI 검색
- 자연어 검색
- AI 추천

---

# 테스트

가능하면

브런치

Velog

GitHub

Medium

기사

각 1개씩 테스트해주세요.

---

# 완료 후 보고

1.

생성한 파일

2.

수정한 파일

3.

Gemini Prompt

4.

AI 출력 예시

5.

테스트 결과

6.

토큰 절약을 위해 적용한 방법

7.

다음 단계 제안

---

주의

반드시

lint

build

TypeScript

검사 후 제출해주세요.