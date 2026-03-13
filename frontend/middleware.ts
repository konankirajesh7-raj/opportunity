import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip middleware if Supabase env vars are not set (e.g. during build)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes the session if needed and sets cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ["/dashboard", "/extract", "/profile", "/community"];
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r)
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and visiting login page, redirect to dashboard
  if (user && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/extract/:path*",
    "/profile/:path*",
    "/community/:path*",
    "/login",
  ],
};
