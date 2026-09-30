"use client"

import { useActionState, useEffect, useRef } from "react"
import { createAcademicYearAction, type AcademicYearState } from "@/lib/actions/academic-year-actions"

const initialState: AcademicYearState = {}

export function AcademicYearForm() {
  const [state, action, pending] = useActionState(createAcademicYearAction, initialState)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => { if (state.success) ref.current?.reset() }, [state.success])
  return (
    <form ref={ref} action={action} className="grid gap-3 md:grid-cols-4">
      <input name="name" placeholder="2026/2027" required className="rounded-md border px-3 py-2 text-sm" />
      <input name="startDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="endDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <button disabled={pending} className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">{pending ? "جاري الحفظ..." : "إضافة سنة"}</button>
      {state.error && <p className="md:col-span-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="md:col-span-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>}
    </form>
  )
}
