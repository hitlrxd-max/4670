"use client"

import { useActionState } from "react"
import { updateStudentAction, type StudentActionState } from "@/lib/actions/student-actions"
import Link from "next/link"

const initialState: StudentActionState = {}

export function StudentEditForm({ student, branches, years, initialFees }: {
  student: {
    id:number; fullName:string; enrollmentNumber:string; seatNumber:string|null; branchId:number; academicYearId:number
    stage:string|null; grade:string|null; classroom:string|null; birthDate:string|null; gender:string|null
    guardianName:string|null; guardianPhone:string|null; address:string|null; notes:string|null
  }
  branches: Array<{id:number;name:string}>
  years: Array<{id:number;name:string;isActive:boolean}>
  initialFees: string
}) {
  const [state, action, pending] = useActionState(updateStudentAction.bind(null, student.id), initialState)
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold">تعديل بيانات الطالب</h1><p className="text-sm text-zinc-500">{student.fullName}</p></div>
        <Link href="/students" className="rounded-md border px-3 py-2 text-sm">رجوع</Link>
      </div>
      <form action={action} className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2">
        <Field label="اسم الطالب" name="fullName" required defaultValue={student.fullName} />
        <Field label="رقم القيد" name="enrollmentNumber" required defaultValue={student.enrollmentNumber} />
        <Field label="رقم الجلوس" name="seatNumber" defaultValue={student.seatNumber ?? ""} />
        <Select label="الفرع" name="branchId" required defaultValue={student.branchId} options={branches.map(b => [b.id,b.name])} />
        <Select label="السنة الدراسية" name="academicYearId" required defaultValue={student.academicYearId} options={years.map(y => [y.id,y.name+(y.isActive?" (نشطة)":"")])} />
        <Field label="المرحلة" name="stage" defaultValue={student.stage ?? ""} />
        <Field label="الصف" name="grade" defaultValue={student.grade ?? ""} />
        <Field label="الفصل" name="classroom" defaultValue={student.classroom ?? ""} />
        <Field label="تاريخ الميلاد" name="birthDate" type="date" defaultValue={student.birthDate ?? ""} />
        <Select label="الجنس" name="gender" defaultValue={student.gender ?? ""} options={[[ "male","ذكر" ],[ "female","أنثى" ]]} />
        <Field label="اسم ولي الأمر" name="guardianName" defaultValue={student.guardianName ?? ""} />
        <Field label="هاتف ولي الأمر" name="guardianPhone" defaultValue={student.guardianPhone ?? ""} />
        <Field label="العنوان" name="address" defaultValue={student.address ?? ""} />
        <Field label="إجمالي الرسوم" name="totalFees" type="number" step="0.01" defaultValue={initialFees} />
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">ملاحظات</label><textarea name="notes" rows={3} defaultValue={student.notes ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" /></div>
        {state.error && <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="md:col-span-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>}
        <button disabled={pending} className="md:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
      </form>
    </div>
  )
}

function Field({label,name,required,type="text",step,defaultValue}:{label:string;name:string;required?:boolean;type?:string;step?:string;defaultValue?:string}) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><input name={name} required={required} type={type} step={step} defaultValue={defaultValue} className="w-full rounded-md border px-3 py-2 text-sm" /></div>
}
function Select({label,name,required,options,defaultValue}:{label:string;name:string;required?:boolean;options:Array<[number|string,string]>;defaultValue?:number|string}) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><select name={name} required={required} defaultValue={defaultValue ?? ""} className="w-full rounded-md border px-3 py-2 text-sm"><option value="" disabled={required}>اختر...</option>{options.map(([v,t])=><option key={String(v)} value={v}>{t}</option>)}</select></div>
}
