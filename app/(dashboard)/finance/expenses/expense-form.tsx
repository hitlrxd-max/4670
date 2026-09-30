"use client"

import { useActionState } from "react"
import { createExpenseAction,type ExpenseActionState } from "@/lib/actions/expense-actions"

export function ExpenseForm({branches,categories}:{branches:Array<{id:number,name:string}>,categories:Array<{id:number,name:string}>}){
 const[state,action,pending]=useActionState<ExpenseActionState,FormData>(createExpenseAction,{})
 return <form action={action} className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3">
  <input name="description" required placeholder="وصف المصروف" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="amount" type="number" step="0.01" min="0.01" required placeholder="المبلغ" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="expenseDate" type="date" required className="rounded-md border px-3 py-2 text-sm"/>
  <select name="branchId" required className="rounded-md border px-3 py-2 text-sm">{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
  <select name="categoryId" className="rounded-md border px-3 py-2 text-sm"><option value="">بدون تصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
  <select name="paymentMethod" className="rounded-md border px-3 py-2 text-sm"><option value="cash">نقدي</option><option value="bank_transfer">تحويل مصرفي</option><option value="card">بطاقة</option><option value="check">صك</option><option value="other">أخرى</option></select>
  <input name="notes" placeholder="ملاحظات" className="rounded-md border px-3 py-2 text-sm md:col-span-2"/>
  <button disabled={pending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">{pending?"جارٍ الحفظ…":"تسجيل المصروف"}</button>
  {state.error&&<p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}{state.success&&<p className="text-sm text-green-600 md:col-span-2">{state.success}</p>}
 </form>
}