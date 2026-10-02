"use server"
import { db } from "@/db"
import { documents, auditLogs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"

export async function createDocumentAction(formData:FormData){
 const s=await requireRole(["admin","hr"]);const fileName=String(formData.get("fileName")||"").trim();const fileUrl=String(formData.get("fileUrl")||"").trim();if(!fileName||!fileUrl)throw new Error("بيانات المستند ناقصة")
 const entityId=Number(formData.get("entityId"))||null
 const [r]=await db.insert(documents).values({fileName,fileUrl,fileType:String(formData.get("fileType")||"").trim()||null,entityType:String(formData.get("entityType")||"").trim()||null,entityId,uploadedBy:s.userId}).returning({id:documents.id})
 await db.insert(auditLogs).values({userId:s.userId,action:"create",entityType:"document",entityId:r.id,description:"تمت إضافة مستند"});revalidatePath("/hr/documents")
}
export async function archiveDocumentAction(formData:FormData){await requireRole(["admin","hr"]);const id=Number(formData.get("id"));await db.update(documents).set({isArchived:true}).where(eq(documents.id,id));revalidatePath("/hr/documents")}
