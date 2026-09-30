import { db } from "@/db"
import { academicYears } from "@/db/schema"
import { desc } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AcademicYearForm } from "./year-form"
import { ActivateYearButton } from "./activate-button"

export default async function AcademicYearsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "admin") {
    return <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">هذه الصفحة متاحة فقط للمدير.</div>
  }

  const years = await db.select().from(academicYears).orderBy(desc(academicYears.name))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">السنوات الدراسية</h1>
        <p className="text-sm text-zinc-500">إدارة السنوات وتحديد السنة النشطة للنظام</p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4"><AcademicYearForm /></div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500">
            <tr><th className="px-4 py-3">السنة</th><th className="px-4 py-3">البداية</th><th className="px-4 py-3">النهاية</th><th className="px-4 py-3">الحالة</th><th className="px-4 py-3">إجراء</th></tr>
          </thead>
          <tbody>
            {years.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">لا توجد سنوات دراسية</td></tr>}
            {years.map((year) => (
              <tr key={year.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{year.name}</td>
                <td className="px-4 py-3">{year.startDate ?? "—"}</td>
                <td className="px-4 py-3">{year.endDate ?? "—"}</td>
                <td className="px-4 py-3">{year.isActive ? <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">نشطة</span> : <span className="text-xs text-zinc-400">غير نشطة</span>}</td>
                <td className="px-4 py-3">{!year.isActive && <ActivateYearButton id={year.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
