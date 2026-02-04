import { type NextRequest, NextResponse } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { createServerClient } from "@supabase/ssr"
import { geolocation } from "@vercel/functions"
import { User } from "@supabase/supabase-js"

const MAINTENANCE_MODE = false

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr", "de", "es", "it", "pt", "vi", "hi", "ja", "zh", "yo"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
})

async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              httpOnly: false,
            })
          })
        },
      },
    },
  )

  let user: User | null = null
  let error: unknown = null

  try {
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))

    const result = (await Promise.race([authPromise, timeoutPromise])) as any
    user = result.data?.user || null
    error = result.error
  } catch (authError: any) {
    if (
      authError?.message?.includes('Unexpected token') ||
      authError?.message?.includes('is not valid JSON') ||
      authError?.originalError?.message?.includes('Unexpected token') ||
      authError?.originalError?.message?.includes('is not valid JSON')
    ) {
      console.error("[Proxy] Supabase API returned non-JSON response:", authError)
      user = null
      error = new Error("Authentication service temporarily unavailable")
    } else {
      console.warn("Auth check failed:", authError)
      user = null
      error = authError
    }
  }

  if (user && !error) {
    response.headers.set("x-user-id", user.id)
    response.headers.set("x-user-email", user.email || "")
    response.headers.set("x-auth-status", "authenticated")
  } else {
    response.headers.set("x-auth-status", "unauthenticated")
    if (error) {
      response.headers.set("x-auth-error", (error as any).message || "Unknown error")
    }
  }

  return { response, user, error }
}

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const isPublicApi =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/whop") ||
    pathname.startsWith("/api/og") ||
    pathname.startsWith("/api/cron");

  if (
    pathname.startsWith("/_next/") ||
    (pathname.startsWith("/api/") && isPublicApi) ||
    pathname.includes(".") ||
    pathname.includes("/videos/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes("/opengraph-image") ||
    pathname.includes("/twitter-image") ||
    pathname.includes("/icon")
  ) {
    return NextResponse.next()
  }


  const response = I18nMiddleware(req)


  const { response: authResponse, user, error } = await updateSession(req)

  if (pathname.includes("/embed")) {
    response.headers.delete('X-Frame-Options');

    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const isLocalFile = origin === 'null' || referer?.startsWith('file://') || (!origin && !referer);
    const isDev = process.env.NODE_ENV === 'development';

    console.log('Embed request debug:', { origin, referer, isLocalFile, nodeEnv: process.env.NODE_ENV, pathname });

    if (isLocalFile) {
      response.headers.delete('Content-Security-Policy');
      return response;
    }

    if (isDev) {
      response.headers.delete('Content-Security-Policy');
      return response;
    }

    const allowedOrigins = [
      "'self'",
      "https://*.qunt-edge.vercel.app",
      "https://*.beta.qunt-edge.vercel.app",
      "http://localhost:*",
      "http://127.0.0.1:*",
      "file:",
      "https://thortradecopier.com",
      "https://app.thortradecopier.com",
    ].join(" ");

    response.headers.set('Content-Security-Policy',
      `frame-ancestors ${allowedOrigins}; ` +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' https://vercel.live; " +
      "font-src 'self' data:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );

    return response;
  }

  authResponse.headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  authResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as any,
    })
  })

  if (MAINTENANCE_MODE && !pathname.includes("/maintenance") && pathname.includes("/dashboard")) {
    return NextResponse.redirect(new URL("/maintenance", req.url))
  }

  if (pathname.includes("/admin")) {
    if (!user || error) {
      const authUrl = new URL("/authentication", req.url)
      authUrl.searchParams.set("error", "admin_access_required")
      return NextResponse.redirect(authUrl)
    }

    if (user.id !== process.env.ADMIN_USER_ID) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (!user || error) {
    const isPublicRoute = !pathname.includes("/dashboard")
    if (!isPublicRoute) {
      const encodedSearchParams = `${pathname.substring(1)}${req.nextUrl.search}`
      const authUrl = new URL("/authentication", req.url)

      if (encodedSearchParams) {
        authUrl.searchParams.append("next", encodedSearchParams)
      }

      if (error) {
        authUrl.searchParams.set("auth_error", "session_invalid")
      }

      return NextResponse.redirect(authUrl)
    }
  } else {
    if (pathname.includes("/authentication")) {
      const nextParam = req.nextUrl.searchParams.get("next")
      const redirectUrl = nextParam ? `/${nextParam}` : "/dashboard"
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
  }

  try {
    const geo = geolocation(req)

    if (geo.country) {
      response.headers.set("x-user-country", geo.country)
      response.cookies.set("user-country", geo.country, {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }

    if (geo.city) {
      response.headers.set("x-user-city", encodeURIComponent(geo.city))
    }

    if (geo.countryRegion) {
      response.headers.set("x-user-region", encodeURIComponent(geo.countryRegion))
    }
  } catch (geoError) {
    const country = req.headers.get("x-vercel-ip-country")
    const city = req.headers.get("x-vercel-ip-city")
    const region = req.headers.get("x-vercel-ip-country-region")

    if (country) {
      response.headers.set("x-user-country", country)
      response.cookies.set("user-country", country, {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }
    if (city) response.headers.set("x-user-city", encodeURIComponent(city))
    if (region) response.headers.set("x-user-region", encodeURIComponent(region))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|mp4|webm|gif|html|webp)$).*)",
  ],
}
