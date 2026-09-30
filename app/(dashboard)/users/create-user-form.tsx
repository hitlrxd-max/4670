"use client"

import { useActionState } from "react"
import { createUserAction, type UserActionState } from "@/lib/actions/user-actions"

export function CreateUserForm({branches,employees}:{branches:Array<{id:number,name:string}>,employees:Array<{id:number,fullName:string,employeeCode:string,branchId:number}>}) {
 const [state,action,pending]=useActionState<UserActionState,FormData>(createUserAction,{})
 return <form action={action} className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3">
  <div className="md:col-span-3 font-semibold">إنشاء حساب جديد</div>
  <input name="fullName" required placeholder="اسم الموظف/المستخدم" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="email" type="email" required placeholder="البريد الإلكتروني" className="rounded-md border px-3 py-2 text-sm"/>
  <input name="password" type="password" minLength={8} required placeholder="كلمة المرور (8 أحرف على الأقل)" className="rounded-md border px-3 py-2 text-sm"/>
  <select name="role" className="rounded-md border px-3 py-2 text-sm"><option value="finance">مالية</option><option value="student_affairs">شؤون طلاب</option><option value="hr">موارد بشرية</option><option value="archive">أرشيف</option><option value="admin">مدير</option></select>
  <select name="branchId" className="rounded-md border px-3 py-2 text-sm"><option value="">اختر الفرع (مطلوب لغير المدير)</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
  <select name="employeeId" className="rounded-md border px-3 py-2 text-sm"><option value="">بدون ربط بموظف</option>{employees.map(e=><option key={e.id} value={e.id}>{e.fullName} — {e.employeeCode}</option>)}</select>
  <button disabled={pending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending?"جارٍ الإنشاء…":"إنشاء الحساب"}</button>
  {state.error&&<p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}{state.success&&<p className="text-sm text-green-600 md:col-span-2">{state.success}</p>}
 </form>
}