# Step 02 - Supabase Integration

## 역할

당신은 Senior Full Stack Engineer입니다.

프로젝트 루트의 아래 문서를 먼저 읽고 작업을 시작해주세요.

- docs/requirements.md
- docs/design-guide.md
- docs/github-info.md
- docs/todo.md

이번 단계에서는 **2차 Supabase 연동만 진행**합니다.

---

# 목표

1차에서 Mock 데이터로 동작하던 링크 북마크 CRUD를 실제 Supabase 데이터베이스와 연결합니다.

이번 단계의 목표는 다음과 같습니다.

- Supabase 클라이언트 설정
- 기존 Mock Service Layer를 Supabase 호출로 교체
- bookmarks / folders / tags / bookmark_tags 테이블 연동
- 목록 / 등록 / 상세 / 수정 / 삭제 기능을 실제 DB 기준으로 동작하게 만들기

---

# 전제 조건

Supabase 프로젝트는 이미 생성되어 있습니다.

프로젝트 루트에는 아래 파일이 이미 존재합니다.

```text
.env.local
.env.example
database/schema.sql
```

`.env.local`에는 사용자가 직접 아래 값을 입력할 예정입니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

절대 임의 값을 넣지 마세요.

---

# 작업 범위

## 1. 패키지 설치

`@supabase/supabase-js`가 설치되어 있지 않다면 설치해주세요.

불필요한 라이브러리는 추가하지 마세요.

---

## 2. Supabase 클라이언트 생성

아래 파일을 생성하거나 수정해주세요.

```text
src/lib/supabase.ts
```

요구사항:

- `.env.local`의 환경변수를 사용합니다.
- 하드코딩하지 않습니다.
- 환경변수가 비어 있을 때 개발자가 원인을 알 수 있도록 에러 메시지를 명확히 작성합니다.

---

## 3. schema.sql 검토

아래 파일을 검토해주세요.

```text
database/schema.sql
```

확인할 것:

- Supabase SQL Editor에서 실행 가능한 SQL인지
- bookmarks, folders, tags, bookmark_tags 테이블이 모두 포함되어 있는지
- 외래키 관계가 올바른지
- created_at, updated_at 기본값이 적절한지
- RLS 정책이 필요한 경우 최소한의 정책이 포함되어 있는지

주의:

- SQL 코드를 채팅창에 출력하지 마세요.
- 수정이 필요하면 `database/schema.sql` 파일에만 반영해주세요.

---

# Service Layer 교체

1차에서 Mock 데이터로 구현된 service 파일 내부를 Supabase 호출로 교체해주세요.

대상 파일:

```text
src/services/bookmarkService.ts
src/services/folderService.ts
src/services/tagService.ts
```

기존 함수명과 반환 타입은 최대한 유지해주세요.

컴포넌트에서 직접 Supabase를 호출하지 말고, 반드시 service 계층을 통해 호출하도록 유지해주세요.

---

# 구현해야 하는 기능

## bookmarks

- 전체 목록 조회
- id 기준 상세 조회
- 새 링크 등록
- 링크 수정
- 링크 삭제

## folders

- 전체 폴더 조회
- 새 폴더 생성

## tags

- 전체 태그 조회
- 북마크별 태그 조회
- 태그 생성
- bookmark_tags 연결

---

# 화면 연결

기존 화면이 실제 Supabase 데이터 기준으로 동작하도록 연결해주세요.

대상 화면:

```text
/
 /links/new
 /links/[id]
 /links/[id]/edit
```

확인할 동작:

- 링크 등록 후 목록에 표시됨
- 목록에서 상세 페이지 이동 가능
- 상세 페이지에서 실제 데이터 표시
- 수정 후 변경 내용 반영
- 삭제 후 목록에서 제거
- 폴더 생성 후 사이드바에 표시

---

# 상태 처리

아래 상태를 유지하거나 보완해주세요.

- 로딩 상태
- 빈 목록 상태
- 저장 실패
- 수정 실패
- 삭제 실패
- 데이터 조회 실패

에러가 발생하면 사용자가 이해할 수 있는 메시지를 보여주세요.

---

# 이번 단계에서 구현하지 않을 것

아래 기능은 구현하지 마세요.

- OG 메타데이터 자동 수집
- AI 요약
- AI 핵심 문장 추출
- AI 태그 추천
- Gemini API
- OpenAI API
- 검색 개선
- 로그인
- 회원가입
- 배포 설정

---

# 검증

작업 후 아래를 직접 확인해주세요.

```bash
npm run lint
npm run build
npx tsc --noEmit
```

가능하면 브라우저에서 아래 흐름도 확인해주세요.

1. 링크 등록
2. 목록 조회
3. 상세 조회
4. 수정
5. 삭제
6. 폴더 생성

---

# 완료 후 보고

작업이 끝나면 아래 내용을 정리해서 알려주세요.

1. 변경한 주요 파일
2. 설치한 패키지
3. Supabase에서 사용자가 직접 해야 하는 작업
4. `.env.local`에 입력해야 하는 값
5. 실제 DB 연동 테스트 결과
6. 다음 단계에서 진행할 작업

주의:

- SQL 전문은 채팅창에 출력하지 마세요.
- 필요한 SQL은 `database/schema.sql` 파일에만 유지해주세요.