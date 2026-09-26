import { db } from "@/db"
import { branches } from "@/db/schema"
import { desc } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BranchForm } from "./branch-form"
import { ToggleStatusButton } from "./toggle-status-button"

export default async function BranchesPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "admin") {
    return (
      <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
        هذه الصفحة متاحة فقط للمدير.
      </div>
    )
  }

  const allBranches = await db.select().from(branches).orderBy(desc(branches.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-lg font-bold text-zinc-900">إدارة الفروع</h1>
        <p className="text-sm text-zinc-500">إضافة وتعديل وتعطيل فروع المدرسة</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <BranchForm />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">العنوان</th>
              <th className="px-4 py-3 font-medium">الهاتف</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {allBranches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  لا توجد فروع مضافة بعد
                </td>
              </tr>
            )}
            {allBranches.map((branch) => (
              <tr key={branch.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-800">{branch.name}</td>
                <td className="px-4 py-3 text-zinc-600">{branch.address ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{branch.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      branch.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {branch.status === "active" ? "نشط" : "معطل"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ToggleStatusButton id={branch.id} status={branch.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
