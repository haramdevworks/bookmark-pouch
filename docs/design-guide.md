# Design Guide

# 프로젝트명

파우치 (BolPocket)

---

# 디자인 키워드

- Simple
- Warm
- Calm
- Minimal
- Productivity
- Archive
- Knowledge

한눈에 많은 정보를 읽기 쉬운 UI를 목표로 한다.

생산성 도구처럼 보이되,
딱딱하지 않고 따뜻한 분위기를 가진다.

Notion과 Readwise의 중간 느낌을 지향한다.

---

# 레퍼런스

- Notion
- Readwise Reader
- Raindrop.io
- Arc Browser
- Linear

---

# 컬러

## Background

#F8F7F4

---

## Surface

#FFFFFF

---

## Primary

#F4C542

노란색은 강조 요소에만 사용한다.

절대 큰 면적으로 사용하지 않는다.

---

## Secondary

#F6E7B0

---

## Border

#ECE9E3

---

## Title

#2F2F2F

---

## Description

#6E6E73

---

## Tag

Background

#FFF5CF

Text

#8A6400

---

# Layout

Desktop 기준

좌측

240px Sidebar

우측

Fluid Layout

최대폭

1200px

---

전체 Padding

32px

---

Card Gap

20px

---

# Sidebar

배경

White

노란색 배경 사용하지 않는다.

선택된 메뉴만 Primary 컬러 사용

폴더와 태그는 Accordion 형태

Hover 제공

---

# Search

높이

40px

Radius

16px

좌측 Search Icon

Placeholder

"제목, 태그, 메모 검색"

---

# Add Button

우측 하단

Primary 컬러

Rounded Full

높이

36px

Hover Animation

Shadow 추가

---

# Bookmark Card

Radius

20px

Border

1px Solid

Shadow

아주 약하게

Hover

- 살짝 확대
- Shadow 증가

Transition

200ms

---

카드 구조

좌측

썸네일

220 × 140

16:10

---

우측

제목

Description

Tag

Footer

---

Title

최대 2줄

Bold

20px

---

Description

최대 2줄

Overflow 처리

---

Footer

Folder

Site

Date

Icon 사용

---

# Thumbnail

이미지가 없으면

Placeholder 아이콘 표시

회색 Background

---

# Tag

Pill 형태

높이

24px

Radius

9999px

Padding

12px

여러 개 표시 가능

Wrap 지원

---

# Typography

Font

Pretendard Variable

---

H1

20

700

---

Title

16

700

---

Body

13

400

---

Caption

11

400

---

(2026-07 업데이트: 전체적으로 폰트/버튼이 커 보인다는 피드백에 따라 가장 큰 텍스트를 20px로 낮추고 전 단계 크기를 비례해 축소했다. 버튼 높이도 44px → 36px로 줄였다.)

---

# Motion

Hover

200ms Ease

Card Lift

Button Lift

Sidebar Hover

Dropdown Fade

---

# Empty State

귀여운 다람쥐 일러스트

"아직 저장한 링크가 없습니다."

추가하기 버튼 제공

---

# 아이콘

Lucide Icons 사용

Folder

Tag

Globe

Calendar

External Link

Search

Plus

More Horizontal

Trash

Edit

Copy

---

# 디자인 원칙

- 여백을 충분히 사용한다.
- 한 화면에 너무 많은 정보를 넣지 않는다.
- 카드 하나만 봐도 내용을 이해할 수 있도록 한다.
- 노란색은 강조 요소에만 사용한다.
- 정보 계층을 명확하게 표현한다.
- 전체적으로 Notion보다 조금 따뜻한 느낌을 유지한다.