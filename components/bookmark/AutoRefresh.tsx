"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 10; // 최대 약 30초 후 자동으로 멈춘다.

/**
 * 신규 저장 직후 백그라운드에서 메타데이터/AI 분석이 끝나기 전까지는
 * 목록 화면이 갱신될 계기가 없다 (사용자가 아무것도 안 하면 계속 "제목 없음").
 * active가 true인 동안 주기적으로 router.refresh()를 호출해 최신 데이터를 반영하고,
 * 더 이상 "제목 없음"이 없으면(active=false) 자동으로 멈춘다.
 */
export function AutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    attemptsRef.current = 0;
    const interval = setInterval(() => {
      attemptsRef.current += 1;
      router.refresh();
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [active, router]);

  return null;
}
