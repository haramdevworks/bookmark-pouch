# Step 01 - Project Setup

## 역할

당신은 Senior Full Stack Engineer입니다.

프로젝트 루트의 아래 문서를 먼저 읽고 작업을 시작해주세요.

- docs/requirements.md
- docs/design-guide.md
- docs/github-info.md
- docs/todo.md

이번 단계에서는 **todo.md의 1차 범위만 구현**합니다.

---

# 목표

링크 북마크 서비스의 기본 프로젝트 구조를 생성합니다.

이번 단계에서는 실제 Supabase 연결이나 AI 기능은 구현하지 않습니다.

---

# 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

---

# 프로젝트 생성

아래 항목을 모두 생성해주세요.

- Next.js 프로젝트
- TypeScript
- Tailwind CSS
- shadcn/ui
- App Router
- 기본 레이아웃
- 공통 컴포넌트 구조
- Service Layer
- Type 정의

---

# 생성해야 하는 파일

## 환경변수

프로젝트 루트에 아래 파일을 생성해주세요.

```text
.env.local
.env.example
```

내용은 아래처럼 비워둡니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`.gitignore`에는 반드시 `.env.local`을 추가해주세요.

---

## Database

아래 파일을 생성해주세요.

```text
database/schema.sql
```

Supabase에서 실행 가능한 완전한 SQL DDL을 작성해주세요.

채팅창에는 SQL을 출력하지 않습니다.

---

# 구현 범위

## 구현

- 프로젝트 구조
- 공통 레이아웃
- 목록 페이지
- 등록 페이지
- 상세 페이지
- 컴포넌트 분리
- 타입 정의
- Service Layer
- CRUD 구조

## 구현하지 않는 것

- Supabase 실제 연결
- OG 메타데이터
- AI
- 검색
- 로그인
- 배포

---

# UI

docs/design-guide.md를 반드시 따릅니다.

Notion + Readwise 스타일의 미니멀한 UI를 구현해주세요.

---

# 코드 스타일

- TypeScript strict
- 재사용 가능한 컴포넌트
- Service Layer 분리
- 유지보수가 쉬운 구조

---

# 완료 후

작업이 끝나면 아래 내용을 알려주세요.

1. 생성된 폴더 구조
2. 생성된 주요 파일
3. 다음 단계에서 해야 할 작업