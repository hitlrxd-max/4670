"use client"

import { useActionState } from "react"
import { createEmployeeAction,type EmployeeActionState } from "@/lib/actions/employee-actions"

export function EmployeeForm({branches}:{branches:Array<{id:number,name:string}>}){
 const[state,action,pending]=useActionState<EmployeeActionState,FormData>(createEmployeeAction,{})
 return <form action={action} className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3">
  <div className="md:col-span-3 font-semibold">إضافة موظف</div>
  <input name="fullName" required placeholder="اسم الموظف" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="employeeCode" required placeholder="رقم الموظف" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="position" placeholder="الوظيفة" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="department" placeholder="القسم" className="rounded-md border px-3 py-2 text-sm"/>
  <select name="branchId" required className="rounded-md border px-3 py-2 text-sm">{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
  <input name="phone" placeholder="الهاتف" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="hireDate" type="date" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="qualifications" placeholder="المؤهلات" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="notes" placeholder="ملاحظات" className="rounded-md border px-3 py-2 text-sm md:col-span-2"/>
  <button disabled={pending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">{pending?"جارٍ الحفظ…":"إضافة الموظف"}</button>
  {state.error&&<p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}{state.success&&<p className="text-sm text-green-600 md:col-span-2">{state.success}</p>}
 </form>
}