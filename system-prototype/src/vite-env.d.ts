/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 전체 주소. 비우면 "/api/v1" (개발 서버 proxy 사용) */
  readonly VITE_API_BASE_URL?: string;
  /** 개발 서버가 /api 요청을 넘길 백엔드 주소. 기본 http://localhost:8080 */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
