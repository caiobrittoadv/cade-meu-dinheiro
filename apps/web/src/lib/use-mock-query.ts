"use client";

import { useEffect, useState } from "react";

export interface MockQueryResult<T> {
  data: T;
  loading: boolean;
}

/**
 * Simula o formato { data, loading } de uma chamada real à API (ver
 * lib/api-client.ts). Quando a integração real entrar, cada uso deste hook
 * é substituído por um fetch de fato (React Query/SWR ou useEffect próprio)
 * mantendo o mesmo shape de retorno — as telas não precisam mudar.
 */
export function useMockQuery<T>(data: T, delayMs = 350): MockQueryResult<T> {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  return { data, loading };
}
