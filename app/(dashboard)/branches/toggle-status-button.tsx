"use client"

import { useTransition } from "react"
import { toggleBranchStatusAction } from "@/lib/actions/branch-actions"

export function ToggleStatusButton({ id, status }: { id: number; status: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleBranchStatusAction(id, status))}
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
    >
      {isPending ? "..." : status === "active" ? "تعطيل" : "تفعيل"}
    </button>
  )
}
