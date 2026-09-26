"use client"

import { useActionState, useRef, useEffect } from "react"
import { createBranchAction, type BranchActionState } from "@/lib/actions/branch-actions"

const initialState: BranchActionState = {}

export function BranchForm() {
  const [state, formAction, isPending] = useActionState(createBranchAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-4">
      <input
        name="name"
        placeholder="اسم الفرع"
        required
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="address"
        placeholder="العنوان"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="phone"
        placeholder="الهاتف"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "إضافة فرع"}
      </button>

      {state.error && (
        <p className="col-span-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="col-span-full rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}
    </form>
  )
}
