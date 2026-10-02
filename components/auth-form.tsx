'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      const result = mode === 'sign-in' ? await signIn.email({ email: String(form.get('email')), password: String(form.get('password')) }) : await signUp.email({ email: String(form.get('email')), password: String(form.get('password')), name: String(form.get('name')) })
      if (result.error) { setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.'); return }
      router.push('/'); router.refresh()
    } catch (error) {
      console.error('[v0] Authentication request failed', error)
      setError('تعذر تسجيل الدخول حاليًا. حاول مرة أخرى.')
    } finally {
      setPending(false)
    }
  }
  return <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/70 bg-white/95 p-8 shadow-2xl backdrop-blur-sm" dir="rtl"><div><p className="text-sm font-bold text-[#159a93]">ضياء المستقبل</p><h1 className="mt-2 text-2xl font-extrabold text-[#1b365f]">{mode === 'sign-in' ? 'تسجيل الدخول' : 'إنشاء حساب إداري'}</h1></div>{mode === 'sign-up' && <label className="flex flex-col gap-2 text-sm font-semibold">الاسم<input name="name" required className="rounded-xl border border-[#cbd5e1] bg-white p-3 text-black placeholder:text-slate-400 focus:border-[#159a93] focus:outline-none focus:ring-2 focus:ring-[#159a93]/20" /></label>}<label className="flex flex-col gap-2 text-sm font-semibold">البريد الإلكتروني<input name="email" type="email" required className="rounded-xl border border-[#cbd5e1] bg-white p-3 text-black placeholder:text-slate-400 focus:border-[#159a93] focus:outline-none focus:ring-2 focus:ring-[#159a93]/20" /></label><label className="flex flex-col gap-2 text-sm font-semibold">كلمة المرور<input name="password" type="password" minLength={8} required className="rounded-xl border border-[#cbd5e1] bg-white p-3 text-black placeholder:text-slate-400 focus:border-[#159a93] focus:outline-none focus:ring-2 focus:ring-[#159a93]/20" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={pending} className="rounded-xl bg-[#1b365f] p-3 font-bold text-white disabled:opacity-60">{pending ? 'جارٍ المعالجة...' : mode === 'sign-in' ? 'دخول' : 'إنشاء الحساب'}</button><a href={mode === 'sign-in' ? '/sign-up' : '/sign-in'} className="text-center text-sm font-semibold text-[#159a93]">{mode === 'sign-in' ? 'إنشاء حساب جديد' : 'لديك حساب؟ تسجيل الدخول'}</a></form>
}
