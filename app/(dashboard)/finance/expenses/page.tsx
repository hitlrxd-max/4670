import { db } from "@/db"
import { branches, expenseCategories, expenses } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ExpenseForm } from "./expense-form"

export default async function ExpensesPage(){
 const session=await getSession();if(!session)redirect("/login")
 if(!["admin","finance"].includes(session.role))redirect("/dashboard")
 const scope=branchScope(session)
 const [categories,branchRows,rows]=await Promise.all([
  db.select({id:expenseCategories.id,name:expenseCategories.name}).from(expenseCategories).orderBy(expenseCategories.name),
  scope===null?db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.status,"active")).orderBy(branches.name):db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.id,scope)),
  scope===null?db.select({id:expenses.id,description:expenses.description,amount:expenses.amount,expenseDate:expenses.expenseDate,paymentMethod:expenses.paymentMethod,categoryName:expenseCategories.name,branchName:branches.name}).from(expenses).leftJoin(expenseCategories,eq(expenses.categoryId,expenseCategories.id)).leftJoin(branches,eq(expenses.branchId,branches.id)).where(eq(expenses.isArchived,false)).orderBy(desc(expenses.createdAt))
  :db.select({id:expenses.id,description:expenses.description,amount:expenses.amount,expenseDate:expenses.expenseDate,paymentMethod:expenses.paymentMethod,categoryName:expenseCategories.name,branchName:branches.name}).from(expenses).leftJoin(expenseCategories,eq(expenses.categoryId,expenseCategories.id)).leftJoin(branches,eq(expenses.branchId,branches.id)).where(eq(expenses.branchId,scope)).orderBy(desc(expenses.createdAt))
 ])
 return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold">المصروفات</h1><p className="text-sm text-zinc-500">كل مصروف مرتبط بفرع وتصنيف وطريقة دفع.</p></div><ExpenseForm branches={branchRows} categories={categories}/><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[850px] text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الوصف</th><th className="px-4 py-3">التصنيف</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">المبلغ</th><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">طريقة الدفع</th></tr></thead><tbody>{rows.length===0?<tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">لا توجد مصروفات</td></tr>:rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{r.description}</td><td className="px-4 py-3">{r.categoryName??"—"}</td><td className="px-4 py-3">{r.branchName??"—"}</td><td className="px-4 py-3">{Number(r.amount).toFixed(2)}</td><td className="px-4 py-3">{r.expenseDate}</td><td className="px-4 py-3">{r.paymentMethod}</td></tr>)}</tbody></table></div></div>
}