"use client"

import { useActionState } from "react"
import { createPaymentAction,type PaymentActionState } from "@/lib/actions/payment-actions"

const initialState:PaymentActionState={}
export function PaymentForm({students}:{students:Array<{id:number;fullName:string}>}){
 const [state,action,pending]=useActionState(createPaymentAction,initialState)
 return <form action={action} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4">
  <select name="studentId" required defaultValue="" className="rounded-md border px-3 py-2 text-sm"><option value="" disabled>اختر الطالب</option>{students.map(s=><option key={s.id} value={s.id}>{s.fullName}</option>)}</select>
  <input name="amount" type="number" step="0.01" min="0.01" required placeholder="المبلغ" className="rounded-md border px-3 py-2 text-sm"/>
  <select name="paymentMethod" defaultValue="cash" className="rounded-md border px-3 py-2 text-sm"><option value="cash">نقدي</option><option value="bank_transfer">تحويل مصرفي</option><option value="card">بطاقة</option><option value="check">صك</option><option value="other">أخرى</option></select>
  <input name="paymentDate" type="date" required defaultValue={new Date().toISOString().slice(0,10)} className="rounded-md border px-3 py-2 text-sm"/>
  <input name="notes" placeholder="ملاحظات" className="rounded-md border px-3 py-2 text-sm md:col-span-3"/>
  <button disabled={pending} className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{pending?"جاري التسجيل...":"تسجيل الدفعة"}</button>
  {state.error&&<p className="md:col-span-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
  {state.success&&<p className="md:col-span-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}{state.invoiceNumber&&` — رقم الفاتورة: ${state.invoiceNumber}`}</p>}
 </form>
}
