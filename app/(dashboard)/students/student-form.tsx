"use client"

import { useActionState } from "react"
import { createStudentAction, type StudentActionState } from "@/lib/actions/student-actions"

const initialState: StudentActionState = {}

export function StudentForm({ branches, years }: { branches: Array<{id:number;name:string}>; years: Array<{id:number;name:string;isActive:boolean}> }) {
  const [state, action, pending] = useActionState(createStudentAction, initialState)
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div><h1 className="text-lg font-bold">إضافة طالب</h1><p className="text-sm text-zinc-500">يتم حفظ البيانات مباشرة في قاعدة بيانات Neon.</p></div>
      <form action={action} className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2">
        <Field label="اسم الطالب" name="fullName" required />
        <Field label="رقم القيد" name="enrollmentNumber" required />
        <Field label="رقم الجلوس" name="seatNumber" />
        <Select label="الفرع" name="branchId" required options={branches.map(b => [b.id,b.name])} />
        <Select label="السنة الدراسية" name="academicYearId" required options={years.map(y => [y.id,y.name+(y.isActive?" (نشطة)":"")])} />
        <Field label="المرحلة" name="stage" />
        <Field label="الصف" name="grade" />
        <Field label="الفصل" name="classroom" />
        <Field label="تاريخ الميلاد" name="birthDate" type="date" />
        <Select label="الجنس" name="gender" options={[[ "male","ذكر" ],[ "female","أنثى" ]]} />
        <Field label="اسم ولي الأمر" name="guardianName" />
        <Field label="هاتف ولي الأمر" name="guardianPhone" />
        <Field label="العنوان" name="address" />
        <Field label="إجمالي الرسوم" name="totalFees" type="number" step="0.01" />
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">ملاحظات</label><textarea name="notes" rows={3} className="w-full rounded-md border px-3 py-2 text-sm" /></div>
        {state.error && <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="md:col-span-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>}
        <button disabled={pending} className="md:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending ? "جاري الحفظ..." : "حفظ الطالب"}</button>
      </form>
    </div>
  )
}

function Field({label,name,required,type="text",step}:{label:string;name:string;required?:boolean;type?:string;step?:string}) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><input name={name} required={required} type={type} step={step} className="w-full rounded-md border px-3 py-2 text-sm" /></div>
}
function Select({label,name,required,options}:{label:string;name:string;required?:boolean;options:Array<[number|string,string]>}) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><select name={name} required={required} defaultValue="" className="w-full rounded-md border px-3 py-2 text-sm"><option value="" disabled={required}>اختر...</option>{options.map(([v,t])=><option key={String(v)} value={v}>{t}</option>)}</select></div>
}
