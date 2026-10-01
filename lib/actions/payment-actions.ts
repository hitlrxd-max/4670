"use server"

import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { payments, invoices, students, studentFees, discounts, branches, academicYears, auditLogs } from "@/db/schema"
import { branchScope, requireRole } from "@/lib/auth"

const schema = z.object({
  studentId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive("قيمة الدفعة يجب أن تكون أكبر من صفر"),
  paymentMethod: z.enum(["cash","bank_transfer","card","check","other"]),
  paymentDate: z.string().min(1),
  notes: z.string().trim().optional(),
})

export type PaymentActionState = { error?: string; success?: string; invoiceNumber?: string }

function makeNumber(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3,"0")}`
}

export async function createPaymentAction(_prev: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  try {
    const data = schema.parse(Object.fromEntries(formData.entries()))
    const session = await requireRole(["admin","finance"])
    const [student] = await db.select().from(students).where(eq(students.id, data.studentId)).limit(1)
    if (!student || student.isArchived) return { error: "الطالب غير موجود أو مؤرشف" }
    const scope = branchScope(session)
    if (scope !== null && scope !== student.branchId) return { error: "لا تملك صلاحية هذا الفرع" }

    const [fee] = await db.select().from(studentFees)
      .where(and(eq(studentFees.studentId, student.id), eq(studentFees.academicYearId, student.academicYearId))).limit(1)
    if (!fee) return { error: "لم يتم تحديد رسوم لهذا الطالب بعد" }

    const discountRows = await db.select({ amount: discounts.amount }).from(discounts).where(eq(discounts.studentFeeId, fee.id))
    const paymentRows = await db.select({ amount: payments.amount }).from(payments).where(and(eq(payments.studentId, student.id), eq(payments.academicYearId, student.academicYearId), eq(payments.isArchived, false)))
    const totalFees = Number(fee.totalFees)
    const discountAmount = discountRows.reduce((sum: number, row: { amount: string }) => sum + Number(row.amount), 0)
    const paidBefore = paymentRows.reduce((sum: number, row: { amount: string }) => sum + Number(row.amount), 0)
    const remainingBefore = Math.max(0, totalFees - discountAmount - paidBefore)
    if (data.amount > remainingBefore) return { error: `قيمة الدفعة أكبر من المتبقي (${remainingBefore.toFixed(2)})` }

    const operationNumber = makeNumber("PAY")
    const invoiceNumber = makeNumber("INV")
    const [payment] = await db.insert(payments).values({
      operationNumber, studentId: student.id, academicYearId: student.academicYearId,
      branchId: student.branchId, amount: data.amount.toFixed(2), paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate, notes: data.notes || null, employeeId: session.userId,
    }).returning()

    const remainingAmount = Math.max(0, remainingBefore - data.amount)
    await db.insert(invoices).values({
      invoiceNumber, paymentId: payment.id, studentId: student.id, branchId: student.branchId,
      academicYearId: student.academicYearId, totalFees: totalFees.toFixed(2),
      discountAmount: discountAmount.toFixed(2), paidAmount: data.amount.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2), employeeId: session.userId,
    })

    await db.insert(auditLogs).values({
      userId: session.userId, action: "create", entityType: "payment", entityId: payment.id,
      description: `قام ${session.fullName} بتسجيل دفعة ${data.amount.toFixed(2)} للطالب ${student.fullName}`,
    })
    revalidatePath("/finance/payments"); revalidatePath("/finance/invoices"); revalidatePath("/finance/fees"); revalidatePath("/dashboard")
    return { success: "تم تسجيل الدفعة وإصدار الفاتورة", invoiceNumber }
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.issues[0]?.message ?? "بيانات غير صحيحة" }
    if (err instanceof Error && err.message === "FORBIDDEN") return { error: "لا تملك صلاحية تنفيذ هذه العملية" }
    return { error: "تعذر تسجيل الدفعة" }
  }
}
