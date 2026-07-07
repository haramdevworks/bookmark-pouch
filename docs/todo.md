# TODO

## 1차 - 프로젝트 셋업

- [x] Next.js 프로젝트 생성
- [x] 기본 UI 구현
- [x] Mock CRUD
- [x] database/schema.sql 생성
- [x] .env.local 준비

---

## 2차 - Supabase 연동

- [x] Supabase 프로젝트 생성
- [x] Supabase SQL Editor에서 `database/schema.sql` 실행 (RLS 정책 포함)
- [x] `.env.local`에 Supabase URL, Publishable Key 입력
- [x] `@supabase/supabase-js` 설치
- [x] `lib/supabase.ts` 생성 (프로젝트에 `src/` 디렉터리가 없어 루트 `lib/`에 생성)
- [x] Mock Service Layer를 Supabase 호출로 교체 (bookmarks/folders/tags/bookmark_tags)
- [x] 실제 DB 기준 링크 등록/조회/수정/삭제/폴더 생성 테스트 완료

---

## 3차 - OG 메타데이터

- [x] URL 입력(blur) 시 OG 메타데이터 가져오기
- [x] 제목 자동 입력 (등록 화면, 수정 가능)
- [x] 설명 자동 입력 (등록 화면, 수정 가능)
- [x] 썸네일 자동 입력 (등록 화면 미리보기 + 카드/상세 반영)
- [x] 사이트명 자동 입력
- [x] 콘텐츠 유형 자동 분류 (기사/블로그/GitHub/영상/논문/기타)
- [x] 실패/부분 실패/timeout/차단 시에도 저장 가능하도록 예외 처리

---

## 4차 - AI

- [x] Gemini API 연동 (`@google/genai`, 서버 전용, Service Layer에서만 호출)
- [x] 3줄 요약 생성
- [x] 핵심 문장 생성 (5000자 상한으로 크롤링한 본문에서 그대로 발췌, 1~2개)
- [x] 추천 태그 5개 생성
- [x] 신규 저장 시에만 호출 (수정/조회 시 재호출하지 않음)
- [x] 저장 → 백그라운드(메타데이터 → 원문 크롤링 → AI 분석) → UPDATE 방식으로 구현
- [x] 원문은 AI 분석에만 쓰고 저장하지 않음 (`@mozilla/readability` + `linkedom`)
- [x] 크롤링/AI 실패 시 조용히 title+description 기반으로 폴백, 북마크 저장은 항상 성공

---

## 5차 - 검색

- [x] 제목 / 설명 / URL / 사이트명 검색
- [x] 콘텐츠 유형 검색
- [x] 메모 검색
- [x] AI 요약 검색
- [x] 핵심 문장(quotes) 검색
- [x] AI 추천 태그(ai_tags) 검색
- [x] 검색어 비면 전체 목록, 결과 없으면 Empty State, 검색 중 Loading 표시

---

## 6차 - UI 개선

- [ ] 애니메이션
- [ ] Empty State
- [ ] Loading
- [ ] Error 처리
- [ ] 모바일 대응