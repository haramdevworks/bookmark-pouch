# Step 05 - Search Improvement

## 역할

당신은 Senior Full Stack Engineer입니다.

프로젝트 루트의 아래 문서를 먼저 읽고 작업을 시작해주세요.

- docs/requirements.md
- docs/design-guide.md
- docs/github-info.md
- docs/todo.md

이번 단계에서는 **검색 기능만 구현**합니다.

---

# 목표

저장된 북마크를 사용자가 다시 쉽게 찾을 수 있도록 검색 기능을 구현합니다.

검색 대상은 기존 메타데이터뿐 아니라 4차에서 생성된 AI 데이터까지 포함합니다.

---

# 전제 조건

- Supabase CRUD 완료
- OG 메타데이터 자동 수집 완료
- Gemini AI 요약/핵심 문장/추천 태그 저장 완료

---

# 검색 대상

아래 필드를 대상으로 검색합니다.

- title
- description
- url
- site_name
- memo
- content_type
- summary
- quotes
- ai_tags

---

# 구현 범위

## 1. 검색창 동작 구현

현재 목록 화면에 있는 검색창 UI를 실제 검색 기능과 연결해주세요.

사용자가 검색어를 입력하면 북마크 목록이 검색 결과로 필터링되어야 합니다.

---

## 2. 검색 방식

Supabase 기준으로 검색해주세요.

가능하면 아래 방식으로 구현합니다.

- title / description / url / site_name / memo / content_type / summary는 `ilike` 기반 검색
- quotes / ai_tags는 배열 필드이므로 텍스트 검색이 가능하도록 적절히 처리

복잡한 전문 검색이나 벡터 검색은 구현하지 않습니다.

---

## 3. UX

- 검색어 입력 후 Enter 또는 검색 버튼 클릭 시 검색 실행
- 검색어가 비어 있으면 전체 목록 표시
- 검색 결과가 없으면 Empty State 표시
- 검색 중 Loading 상태 표시
- 검색어 유지

---

# 구현하지 않을 것

이번 단계에서는 아래 기능은 구현하지 않습니다.

- 자연어 검색
- 벡터 검색
- RAG
- 유사 자료 추천
- AI 재분석
- 정렬 고도화
- 로그인
- 공유 기능

---

# 검증

아래 검색어로 테스트해주세요.

- 제목 일부
- 사이트명
- 콘텐츠 유형
- 메모
- AI 요약에만 있는 단어
- 핵심 문장에만 있는 단어
- AI 추천 태그

---

# 완료 후 보고

작업 완료 후 아래 내용을 알려주세요.

1. 생성한 파일
2. 수정한 파일
3. 검색 구현 방식
4. 검색 대상 필드
5. 테스트 결과
6. 한계점
7. 다음 단계 제안

주의:

- 기존 CRUD, OG, AI 기능을 깨뜨리지 마세요.
- 검색 기능 외 다른 기능은 추가하지 마세요.
- lint, build, TypeScript 타입 체크를 모두 수행해주세요.