import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export default async function SignInPage() { const session = await auth.api.getSession({ headers: await headers() }); if (session?.user) redirect('/'); return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8fb] p-6"><video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline aria-hidden="true"><source src="/login-bg.mp4" type="video/mp4" /></video><div className="absolute inset-0 bg-slate-950/45" aria-hidden="true" /><div className="relative z-10 w-full"><AuthForm mode="sign-in" /></div></main> }
