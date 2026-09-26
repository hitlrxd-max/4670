"use server"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { branches, auditLogs } from "@/db/schema"
import { requireRole } from "@/lib/auth"

const branchSchema = z.object({
  name: z.string().min(2, "اسم الفرع مطلوب"),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export type BranchActionState = {
  error?: string
  success?: string
}

export async function createBranchAction(
  _prev: BranchActionState,
  formData: FormData
): Promise<BranchActionState> {
  try {
    const session = await requireRole(["admin"])

    const parsed = branchSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      phone: formData.get("phone") || undefined,
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" }
    }

    const [branch] = await db
      .insert(branches)
      .values({
        name: parsed.data.name,
        address: parsed.data.address,
        phone: parsed.data.phone,
        status: "active",
      })
      .returning()

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "create",
      entityType: "branch",
      entityId: branch.id,
      description: `قام ${session.fullName} بإضافة فرع جديد: ${branch.name}`,
    })

    revalidatePath("/branches")
    return { success: "تم إضافة الفرع بنجاح" }
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return { error: "لا تملك صلاحية تنفيذ هذه العملية" }
    }
    return { error: "تعذر حفظ الفرع، حاول مرة أخرى" }
  }
}

export async function updateBranchAction(
  _prev: BranchActionState,
  formData: FormData
): Promise<BranchActionState> {
  try {
    const session = await requireRole(["admin"])
    const id = Number(formData.get("id"))
    if (!id) return { error: "معرف الفرع غير صحيح" }

    const parsed = branchSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      phone: formData.get("phone") || undefined,
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" }
    }

    await db
      .update(branches)
      .set({
        name: parsed.data.name,
        address: parsed.data.address,
        phone: parsed.data.phone,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, id))

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "update",
      entityType: "branch",
      entityId: id,
      description: `قام ${session.fullName} بتعديل بيانات الفرع رقم ${id}`,
    })

    revalidatePath("/branches")
    return { success: "تم تحديث الفرع بنجاح" }
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return { error: "لا تملك صلاحية تنفيذ هذه العملية" }
    }
    return { error: "تعذر تحديث الفرع" }
  }
}

export async function toggleBranchStatusAction(id: number, currentStatus: string) {
  const session = await requireRole(["admin"])
  const newStatus = currentStatus === "active" ? "inactive" : "active"

  await db
    .update(branches)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(branches.id, id))

  await db.insert(auditLogs).values({
    userId: session.userId,
    action: newStatus === "active" ? "activate" : "deactivate",
    entityType: "branch",
    entityId: id,
    description: `قام ${session.fullName} بتغيير حالة الفرع رقم ${id} إلى ${newStatus}`,
  })

  revalidatePath("/branches")
}
