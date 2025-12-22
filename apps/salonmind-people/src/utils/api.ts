interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export function unwrapApiResponse<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload && payload.data) {
    return payload.data;
  }
  return payload as T;
}
