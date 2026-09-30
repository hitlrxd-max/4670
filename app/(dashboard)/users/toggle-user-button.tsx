"use client"

import { toggleUserAction } from "@/lib/actions/user-actions"
import { useTransition } from "react"

export function ToggleUserButton({id,active}:{id:number,active:boolean}) {
 const [pending,start]=useTransition()
 return <button disabled={pending} onClick={()=>start(async()=>{try{await toggleUserAction(id)}catch{}})} className="rounded border px-2 py-1 text-xs">{active?"إيقاف الحساب":"تفعيل الحساب"}</button>
}