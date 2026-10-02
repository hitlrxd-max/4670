import { db } from "@/db"
import { documents } from "@/db/schema"
import { desc } from "drizzle-orm"
import { requireRole } from "@/lib/auth"
import { createDocumentAction, archiveDocumentAction } from "@/lib/actions/document-actions"
import { redirect } from "next/navigation"

export default async function DocumentsPage(){
 const s=await requireRole(["admin","hr"]).catch(()=>null); if(!s) redirect("/dashboard")
 const rows=await db.select().from(documents).orderBy(desc(documents.createdAt))
 return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold">المستندات</h1><p className="text-sm text-zinc-500">حفظ بيانات المستند وروابط الملفات.</p></div>
 <form action={createDocumentAction} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-5"><input name="fileName" required placeholder="اسم الملف" className="rounded-md border px-3 py-2 text-sm"/><input name="fileUrl" required placeholder="رابط الملف" className="rounded-md border px-3 py-2 text-sm"/><input name="fileType" placeholder="النوع" className="rounded-md border px-3 py-2 text-sm"/><input name="entityType" placeholder="مرتبط بـ" className="rounded-md border px-3 py-2 text-sm"/><input name="entityId" type="number" placeholder="رقم السجل" className="rounded-md border px-3 py-2 text-sm"/><button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white md:col-span-5">حفظ المستند</button></form>
 <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الملف</th><th className="px-4 py-3">النوع</th><th className="px-4 py-3">الرابط</th><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">إجراء</th></tr></thead><tbody>{rows.filter(r=>!r.isArchived).map(r=><tr key={r.id} className="border-b"><td className="px-4 py-3 font-medium">{r.fileName}</td><td className="px-4 py-3">{r.fileType??"—"}</td><td className="px-4 py-3"><a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">فتح</a></td><td className="px-4 py-3">{r.createdAt.toLocaleDateString("ar-LY")}</td><td className="px-4 py-3"><form action={archiveDocumentAction}><input type="hidden" name="id" value={r.id}/><button className="rounded border px-2 py-1 text-xs">أرشفة</button></form></td></tr>)}</tbody></table></div></div>
}