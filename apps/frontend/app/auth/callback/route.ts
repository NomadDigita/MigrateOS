import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const destination = next?.startsWith("/") ? next : "/dashboard";
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || !code) {
    return NextResponse.redirect(new URL("/?auth=configuration", requestUrl.origin));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return (
          request.headers
            .get("cookie")
            ?.split("; ")
            .map((part) => {
              const index = part.indexOf("=");
              return { name: part.slice(0, index), value: part.slice(index + 1) };
            }) ?? []
        );
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/?auth=failed", requestUrl.origin));
  }
  return response;
}
