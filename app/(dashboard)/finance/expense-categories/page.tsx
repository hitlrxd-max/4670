import {db} from "@/db"
import {expenseCategories} from "@/db/schema"
import {asc} from "drizzle-orm"
import {requireRole} from "@/lib/auth"
import {redirect} from "next/navigation"
import {createExpenseCategoryAction} from "@/lib/actions/expense-category-actions"

export default async function ExpenseCategoriesPage(){
 const s=await requireRole(["admin","finance"]).catch(()=>null);if(!s)redirect("/dashboard")
 const rows=await db.select().from(expenseCategories).orderBy(asc(expenseCategories.name))
 return <div dir="rtl" className="space-y-5"><div><h1 className="text-xl font-bold">تصنيفات المصروفات</h1><p className="text-sm text-zinc-500">إضافة التصنيفات التي تستخدمها الإدارة المالية.</p></div><form action={createExpenseCategoryAction} className="flex max-w-xl gap-2 rounded-xl border bg-white p-4"><input name="name" required placeholder="مثال: كهرباء، قرطاسية، صيانة" className="flex-1 rounded-md border px-3 py-2 text-sm"/><button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">إضافة</button></form><div className="rounded-xl border bg-white">{rows.map(r=><div key={r.id} className="border-b px-4 py-3 last:border-0">{r.name}</div>)}</div></div>
}