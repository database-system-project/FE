import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "./client";

/**
 * 화면에서 목록을 불러올 때 쓰는 공통 훅.
 * const { data, loading, error, reload } = useApi(() => receptionApi.queue(), []);
 * deps가 바뀌면 다시 불러오고, 등록·취소 뒤에는 reload()를 부른다.
 */
export function useApi<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadRef = useRef(load);
  loadRef.current = load;
  const seq = useRef(0);

  const reload = useCallback(async () => {
    const mine = ++seq.current; // 늦게 도착한 이전 응답이 최신 결과를 덮지 않게
    setLoading(true);
    try {
      const result = await loadRef.current();
      if (mine === seq.current) {
        setData(result);
        setError("");
      }
    } catch (e) {
      if (mine === seq.current) setError(errorMessage(e));
    } finally {
      if (mine === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload };
}

/** 오류를 화면에 띄울 문구로 바꾼다 */
export function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.message;
  return "알 수 없는 오류가 발생했습니다.";
}
