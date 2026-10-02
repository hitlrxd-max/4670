"use client"

import { useActionState } from "react"
import { loginAction, type LoginState } from "@/lib/actions/auth-actions"

const initialState: LoginState = {}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-8">
      {/* Full-screen login background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Readability overlay */}
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-md sm:max-w-md">
        <h1 className="mb-1 text-center text-2xl font-bold text-zinc-900">
          نظام إدارة المدرسة
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">تسجيل الدخول للمتابعة</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 bg-white/95 px-3 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              placeholder="admin@school.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 bg-white/95 px-3 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-zinc-900 px-3 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </main>
  )
}
