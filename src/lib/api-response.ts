import { NextResponse } from "next/server";

export type ApiPayload<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export function ok<T>(data: T, status = 200): NextResponse<ApiPayload<T>> {
  return NextResponse.json<ApiPayload<T>>(
    { data, error: null, status },
    { status },
  );
}

export function fail(
  error: string,
  status = 400,
): NextResponse<ApiPayload<never>> {
  return NextResponse.json<ApiPayload<never>>(
    { data: null, error, status },
    { status },
  );
}
