"use client"
import {useActionState} from "react"
import {createDiscountAction,type DiscountActionState} from "@/lib/actions/discount-actions"
const initialState:DiscountActionState={}
export function DiscountForm({students}:{students:Array<{id:number;fullName:string}>}){
 const[state,action,pending]=useActionState(createDiscountAction,initialState)
 return <form action={action} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4"><select name="studentId" required defaultValue="" className="rounded-md border px-3 py-2 text-sm"><option value="" disabled>اختر الطالب</option>{students.map(s=><option key={s.id} value={s.id}>{s.fullName}</option>)}</select><input name="amount" type="number" min="0.01" step="0.01" required placeholder="قيمة الخصم" className="rounded-md border px-3 py-2 text-sm"/><input name="reason" placeholder="سبب الخصم" className="rounded-md border px-3 py-2 text-sm"/><button disabled={pending} className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50">{pending?"جاري الحفظ...":"تسجيل الخصم"}</button>{state.error&&<p className="md:col-span-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}{state.success&&<p className="md:col-span-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>}</form>
}
