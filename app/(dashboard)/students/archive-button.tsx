"use client"

import { useTransition } from "react"
import { archiveStudentAction } from "@/lib/actions/student-actions"

export function ArchiveStudentButton({ id }: { id: number }) {
  const [pending, start] = useTransition()
  return <button disabled={pending} onClick={() => { if (confirm("هل تريد أرشفة هذا الطالب؟")) start(() => archiveStudentAction(id)) }} className="rounded border px-2 py-1 text-xs text-red-600 disabled:opacity-50">{pending ? "..." : "أرشفة"}</button>
}
