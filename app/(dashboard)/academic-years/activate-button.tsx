"use client"

import { useTransition } from "react"
import { activateAcademicYearAction } from "@/lib/actions/academic-year-actions"

export function ActivateYearButton({ id }: { id: number }) {
  const [pending, start] = useTransition()
  return <button disabled={pending} onClick={() => start(() => activateAcademicYearAction(id))} className="rounded-md border px-3 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50">{pending ? "..." : "تفعيل"}</button>
}
