# requirements.md

# [기획 명세서] 파우치 - 링크 북마크 & 자료 재활용 MVP

## 1. 프로젝트 개요

- 프로젝트명: 파우치
- 한 줄 설명: 리서치 자료 링크를 저장하고, 핵심 정보와 태그를 함께 관리해 다시 찾고 활용하기 쉽게 만드는 북마크 서비스
- 타겟 사용자: 리서치를 자주 수행하며 온라인 자료를 반복적으로 탐색·저장·활용하는 사용자

## 2. 문제 정의

자료 저장 위치가 분산되어 있고 분류가 체계적이지 않으며, 링크만으로는 내용을 파악하기 어려워 리서치를 자주 하는 사용자는 기존에 저장한 자료를 활용하지 못하고 동일한 내용을 다시 검색한다.  
불필요한 반복 검색으로 시간이 낭비되어 업무·과제 수행의 효율성이 낮아진다.

## 3. MVP 핵심 목표

링크 저장 시 제목, 설명, 썸네일 등 기본 메타데이터를 함께 저장하고, 사용자가 태그·폴더·메모를 통해 자료를 쉽게 다시 찾을 수 있도록 한다.

## 4. 1차 구현 범위

이번 단계에서는 AI와 OG 메타데이터 수집은 제외하고, 서비스의 기본 구조와 CRUD를 먼저 구현한다.

### 포함 기능

- 링크 등록
- 링크 목록 조회
- 링크 상세 조회
- 링크 수정
- 링크 삭제
- 폴더 생성 및 표시
- 태그 표시 영역
- Supabase 연동
- 기본 UI 구성

### 제외 기능

- AI 요약
- AI 핵심 문장 추출
- AI 태그 추천
- OG 메타데이터 자동 수집
- 자연어 검색
- 브라우저 확장 프로그램

## 5. 화면 요구사항

### 5-1. 자료 목록 화면 `/`

- 저장된 링크를 카드 리스트로 보여준다.
- 카드에는 다음 정보를 표시한다.
  - 썸네일 영역
  - 제목
  - URL 또는 사이트명
  - 콘텐츠 유형
  - 태그
  - 저장일
- 카드 클릭 시 상세 페이지로 이동한다.
- 카드에는 다음 액션이 있다.
  - 원문 보기
  - 수정
  - 삭제
- 상단에는 검색 입력창을 배치한다. 단, 1차에서는 UI만 구현한다.
- 좌측 또는 상단에는 폴더 필터 영역을 배치한다. 단, 1차에서는 더미 또는 기본 폴더만 표시한다.
- 우측 하단에는 새 링크 등록 버튼을 둔다.

### 5-2. 링크 등록 화면 `/links/new`

- URL 입력창을 제공한다.
- 메모 입력창을 제공한다.
- 폴더 선택 영역을 제공한다.
- 저장 버튼을 제공한다.
- 저장 시 bookmarks 테이블에 저장한다.
- 1차에서는 title을 `제목 없음`으로 저장해도 된다.

### 5-3. 상세 화면 `/links/[id]`

- 저장된 링크 정보를 상세히 보여준다.
- 표시 항목
  - 제목
  - URL
  - 설명
  - 메모
  - 콘텐츠 유형
  - 저장일
- 버튼
  - 원문 보기
  - 수정
  - 삭제

## 6. 데이터 모델

### bookmarks

- id: uuid
- url: text
- title: text
- description: text nullable
- thumbnail: text nullable
- site_name: text nullable
- author: text nullable
- published_at: timestamp nullable
- content_type: text nullable
- memo: text nullable
- folder_id: uuid nullable
- created_at: timestamp
- updated_at: timestamp

### folders

- id: uuid
- name: text
- created_at: timestamp

### tags

- id: uuid
- name: text
- created_at: timestamp

### bookmark_tags

- bookmark_id: uuid
- tag_id: uuid

## 7. 개발 원칙

- Next.js App Router 기반으로 구현한다.
- TypeScript를 사용한다.
- Tailwind CSS를 사용한다.
- Supabase 호출 로직은 service 계층으로 분리한다.
- 컴포넌트를 재사용 가능하게 분리한다.
- 에러 상태와 로딩 상태를 구현한다.