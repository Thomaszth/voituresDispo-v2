/// <reference types="vite/client" />
declare function fbq(
    action: string,
    event: string,
    params?: Record<string, unknown>
  ): void;
  declare function fbq(action: string, event: string): void;
  