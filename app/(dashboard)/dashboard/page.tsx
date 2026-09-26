import { db } from "@/db"
import { branches, users, students } from "@/db/schema"
import { count, eq } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const [branchCountRow] = await db.select({ value: count() }).from(branches)
  const [userCountRow] = await db.select({ value: count() }).from(users)

  let studentCountRow = { value: 0 }
  try {
    const [row] = await db
      .select({ value: count() })
      .from(students)
      .where(eq(students.isArchived, false))
    studentCountRow = row
  } catch {
    // students table exists but may be empty; safe default
  }

  const cards = [
    { label: "عدد الفروع", value: branchCountRow?.value ?? 0 },
    { label: "عدد المستخدمين", value: userCountRow?.value ?? 0 },
    { label: "عدد الطلاب", value: studentCountRow?.value ?? 0 },
  ]

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-zinc-900">لوحة التحكم</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">{card.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        هذه الأرقام محسوبة مباشرة من قاعدة بيانات Neon، وستتحدث تلقائيًا مع كل عملية إضافة.
      </p>
    </div>
  )
}
