import {db} from "@/db"
import {branches,expenses,payments} from "@/db/schema"
import {eq,sum} from "drizzle-orm"
import {getSession,branchScope} from "@/lib/auth"
import {redirect} from "next/navigation"

export default async function FinanceReportsPage(){
 const session=await getSession();if(!session)redirect("/login")
 if(!["admin","finance"].includes(session.role))redirect("/dashboard")
 const scope=branchScope(session)
 const [incomeRows,expenseRows]=await Promise.all([
  scope===null?db.select({branchId:payments.branchId,total:sum(payments.amount)}).from(payments).where(eq(payments.isArchived,false)).groupBy(payments.branchId)
  :db.select({branchId:payments.branchId,total:sum(payments.amount)}).from(payments).where(eq(payments.branchId,scope)).groupBy(payments.branchId),
  scope===null?db.select({branchId:expenses.branchId,total:sum(expenses.amount)}).from(expenses).where(eq(expenses.isArchived,false)).groupBy(expenses.branchId)
  :db.select({branchId:expenses.branchId,total:sum(expenses.amount)}).from(expenses).where(eq(expenses.branchId,scope)).groupBy(expenses.branchId)
 ])
 const branchIds=[...new Set([...incomeRows.map(x=>x.branchId),...expenseRows.map(x=>x.branchId)])]
 const branchRows=branchIds.length?await db.select({id:branches.id,name:branches.name}).from(branches):[]
 const income=new Map(incomeRows.map(x=>[x.branchId,Number(x.total||0)]));const out=new Map(expenseRows.map(x=>[x.branchId,Number(x.total||0)]))
 const totalIncome=incomeRows.reduce((s,x)=>s+Number(x.total||0),0),totalExpense=expenseRows.reduce((s,x)=>s+Number(x.total||0),0)
 return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold">التقارير المالية</h1><p className="text-sm text-zinc-500">إجمالي المدفوعات والمصروفات وصافي الحركة حسب الفرع.</p></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-zinc-500">الإيرادات</p><p className="mt-2 text-2xl font-bold">{totalIncome.toFixed(2)}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-zinc-500">المصروفات</p><p className="mt-2 text-2xl font-bold">{totalExpense.toFixed(2)}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-zinc-500">الصافي</p><p className="mt-2 text-2xl font-bold">{(totalIncome-totalExpense).toFixed(2)}</p></div></div><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">الإيرادات</th><th className="px-4 py-3">المصروفات</th><th className="px-4 py-3">الصافي</th></tr></thead><tbody>{branchRows.map(b=>{const i=income.get(b.id)||0,e=out.get(b.id)||0;return <tr key={b.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{b.name}</td><td className="px-4 py-3">{i.toFixed(2)}</td><td className="px-4 py-3">{e.toFixed(2)}</td><td className="px-4 py-3 font-semibold">{(i-e).toFixed(2)}</td></tr>})}</tbody></table></div></div>
}