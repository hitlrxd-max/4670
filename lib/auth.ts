import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const SESSION_COOKIE = "school_session"
const alg = "HS256"

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to your environment variables.")
  }
  return new TextEncoder().encode(secret)
}

export type SessionPayload = {
  userId: number
  email: string
  fullName: string
  role: "admin" | "finance" | "student_affairs" | "hr" | "archive"
  branchId: number | null
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Server-side permission check. Every server action / route handler
 * that performs a sensitive operation MUST call this (or requireRole)
 * -- hiding buttons on the client is NOT sufficient.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error("UNAUTHENTICATED")
  }
  return session
}

export async function requireRole(
  allowedRoles: SessionPayload["role"][]
): Promise<SessionPayload> {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.role) && session.role !== "admin") {
    throw new Error("FORBIDDEN")
  }
  return session
}

/**
 * Returns the branch filter a user is allowed to see.
 * Admins see everything (null = no filter). Everyone else is
 * restricted to their own branch.
 */
export function branchScope(session: SessionPayload): number | null {
  if (session.role === "admin") return null
  return session.branchId
}
