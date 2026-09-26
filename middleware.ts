import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE = "school_session"
const PUBLIC_PATHS = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/_next")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(SESSION_COOKIE)
    return response
  }
}

export const config = {
  matcher: ["/((?!api/public|_next/static|_next/image|favicon.ico).*)"],
}
