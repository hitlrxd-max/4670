import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await requireRole(["admin"]).catch(() => null)
  if (!session) redirect("/dashboard")

  return (
    <section dir="rtl" className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">إعدادات النظام</h1>
        <p className="mt-1 text-sm text-zinc-500">معلومات الاتصال والحساب الحالي. إعدادات النظام الحساسة محفوظة في بيئة Vercel.</p>
      </header>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">الحساب الحالي</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-zinc-500">الاسم</dt><dd className="mt-1 font-medium">{session.fullName}</dd></div>
          <div><dt className="text-sm text-zinc-500">البريد الإلكتروني</dt><dd className="mt-1 font-medium">{session.email}</dd></div>
          <div><dt className="text-sm text-zinc-500">الدور</dt><dd className="mt-1 font-medium">مدير النظام</dd></div>
          <div><dt className="text-sm text-zinc-500">نطاق الفروع</dt><dd className="mt-1 font-medium">جميع الفروع</dd></div>
        </dl>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        يتم ضبط DATABASE_URL وBETTER_AUTH_SECRET من متغيرات البيئة، ولا يتم عرض قيمها داخل التطبيق.
      </div>
    </section>
  )
}
