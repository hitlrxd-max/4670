import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logoutAction } from "@/lib/actions/auth-actions"

const MENU = [
  { title: "لوحة التحكم", href: "/dashboard" },
  { title: "الطلاب", items: [{ title: "جميع الطلاب", href: "/students" }, { title: "إضافة طالب", href: "/students/new" }, { title: "السنوات الدراسية", href: "/academic-years" }] },
  { title: "المالية", items: [{ title: "الأقساط", href: "/finance/fees" }, { title: "المدفوعات", href: "/finance/payments" }, { title: "الفواتير", href: "/finance/invoices" }, { title: "الخصومات", href: "/finance/discounts" }, { title: "المصروفات", href: "/finance/expenses" }, { title: "تصنيفات المصروفات", href: "/finance/expense-categories" }, { title: "التقارير", href: "/finance/reports" }] },
  { title: "الحضور", items: [{ title: "حضور الطلاب", href: "/attendance/students" }, { title: "تقارير الغياب", href: "/attendance/reports" }, { title: "حضور الموظفين", href: "/attendance/employees" }] },
  { title: "الموظفون", items: [{ title: "الموظفون", href: "/hr/employees" }, { title: "المعلمون", href: "/hr/teachers" }, { title: "المواد", href: "/hr/subjects" }, { title: "الفصول", href: "/hr/classes" }, { title: "الجداول", href: "/hr/schedules" }, { title: "المستندات", href: "/hr/documents" }] },
  { title: "الأرشيف", items: [{ title: "الصادر", href: "/archive/outgoing" }, { title: "الوارد", href: "/archive/incoming" }, { title: "القرارات", href: "/archive/decisions" }, { title: "المراسلات", href: "/archive/correspondence" }, { title: "البحث", href: "/archive/search" }] },
  { title: "الإدارة", items: [{ title: "الفروع", href: "/branches" }, { title: "المستخدمون والحسابات", href: "/users" }, { title: "الصلاحيات", href: "/permissions" }, { title: "الإعدادات", href: "/settings" }] },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")
  const scopeLabel = session.branchId ? "فرع #" + session.branchId : "كل الفروع"
  return <div dir="rtl" className="flex min-h-screen bg-zinc-50">
    <aside className="hidden w-64 shrink-0 border-l border-zinc-200 bg-white p-4 md:block">
      <div className="mb-6 px-2"><p className="text-sm font-bold text-zinc-900">نظام إدارة المدرسة</p><p className="text-xs text-zinc-500">{session.fullName}</p><p className="text-xs text-zinc-400">{session.role} • {scopeLabel}</p></div>
      <nav className="space-y-4 text-sm">{MENU.map(section => <div key={section.title}>{("href" in section) ? <a href={section.href} className="block rounded-md px-2 py-1.5 font-medium text-zinc-800 hover:bg-zinc-100">{section.title}</a> : <div><p className="px-2 py-1 text-xs font-semibold text-zinc-400">{section.title}</p>{section.items?.map(item => <a key={item.href} href={item.href} className="block rounded-md px-2 py-1.5 text-zinc-700 hover:bg-zinc-100">{item.title}</a>)}</div>}</div>)}</nav>
      <form action={logoutAction} className="mt-6 px-2"><button type="submit" className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100">تسجيل الخروج</button></form>
    </aside>
    <div className="flex-1"><div className="flex items-center justify-between border-b border-zinc-200 bg-white p-4 md:hidden"><p className="text-sm font-bold">نظام إدارة المدرسة</p><form action={logoutAction}><button type="submit" className="text-xs text-zinc-500 underline">خروج</button></form></div><main className="p-4 md:p-6">{children}</main></div>
  </div>
}