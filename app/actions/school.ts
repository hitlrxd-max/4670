'use server'

import { requireSession } from '@/lib/auth'
import { and, asc, desc, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { academicYears, attendance, auditLogs, branches, documents, employees, expenses, invoices, students } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

const studentInput = z.object({ fullName: z.string().trim().min(2), registrationNumber: z.string().trim().min(1), seatNumber: z.string().trim().optional(), branchId: z.string().uuid().optional().or(z.literal('')), academicYearId: z.string().uuid().optional().or(z.literal('')), grade: z.string().trim().optional(), className: z.string().trim().optional(), guardianName: z.string().trim().optional(), guardianPhone: z.string().trim().optional(), address: z.string().trim().optional(), notes: z.string().trim().optional(), status: z.enum(['active', 'archived']).default('active') })
const branchInput = z.object({ name: z.string().trim().min(2), code: z.string().trim().min(1), address: z.string().trim().optional(), phone: z.string().trim().optional() })
const yearInput = z.object({ name: z.string().trim().min(4), startsOn: z.string().optional(), endsOn: z.string().optional() })
const employeeInput = z.object({ fullName: z.string().trim().min(2), jobTitle: z.string().trim().min(2), phone: z.string().trim().optional(), notes: z.string().trim().optional() })
const expenseInput = z.object({ title: z.string().trim().min(2), amount: z.coerce.number().positive(), expenseDate: z.string().optional(), category: z.string().trim().optional() })
const invoiceInput = z.object({ invoiceNumber: z.string().trim().min(2), amount: z.coerce.number().positive(), dueDate: z.string().optional(), status: z.enum(['pending', 'paid', 'overdue']).default('pending') })
const attendanceInput = z.object({ studentId: z.string().uuid(), attendanceDate: z.string().min(8), status: z.enum(['present', 'absent', 'late']), note: z.string().trim().optional() })
const documentInput = z.object({ title: z.string().trim().min(2), category: z.string().trim().optional(), fileUrl: z.string().url().optional().or(z.literal('')) })

export async function listBranches() { await requireSession(); return db.select().from(branches).where(eq(branches.isActive, true)).orderBy(asc(branches.name)) }
export async function listAcademicYears() { await requireSession(); return db.select().from(academicYears).orderBy(desc(academicYears.createdAt)) }
export async function listStudents(query = '') { await requireSession(); return db.select().from(students).where(query ? and(eq(students.status, 'active'), ilike(students.fullName, `%${query}%`)) : eq(students.status, 'active')).orderBy(asc(students.fullName)) }
export async function listEmployees() { await requireSession(); return db.select().from(employees).orderBy(asc(employees.fullName)) }
export async function listExpenses() { await requireSession(); return db.select().from(expenses).orderBy(desc(expenses.createdAt)) }
export async function listInvoices() { await requireSession(); return db.select().from(invoices).orderBy(desc(invoices.createdAt)) }
export async function listAttendance() { await requireSession(); return db.select().from(attendance).orderBy(desc(attendance.attendanceDate)) }
export async function listDocuments() { await requireSession(); return db.select().from(documents).orderBy(desc(documents.createdAt)) }

export async function createStudent(input: unknown) { await requireSession(); const parsed = studentInput.safeParse(input); if (!parsed.success) return { ok:false, error:'يرجى مراجعة بيانات الطالب' }; try { const [student] = await db.insert(students).values({...parsed.data, branchId: parsed.data.branchId || null, academicYearId: parsed.data.academicYearId || null}).returning(); await db.insert(auditLogs).values({action:'create',entityType:'student',entityId:student.id,metadata:{registrationNumber:student.registrationNumber}}); revalidatePath('/'); return {ok:true,student} } catch { return {ok:false,error:'تعذر حفظ الطالب. قد يكون رقم التسجيل مستخدماً.'} } }
export async function createBranch(input: unknown) { await requireSession(); const parsed=branchInput.safeParse(input); if(!parsed.success)return {ok:false,error:'اسم الفرع والرمز مطلوبان'}; try { const [row]=await db.insert(branches).values(parsed.data).returning(); await db.insert(auditLogs).values({action:'create',entityType:'branch',entityId:row.id}); revalidatePath('/'); return {ok:true,row} } catch { return {ok:false,error:'تعذر حفظ الفرع. قد يكون الاسم أو الرمز مستخدماً.'} } }
export async function createAcademicYear(input: unknown) { await requireSession(); const parsed=yearInput.safeParse(input); if(!parsed.success)return {ok:false,error:'اسم السنة الدراسية مطلوب'}; const [row]=await db.insert(academicYears).values({...parsed.data, startsOn:parsed.data.startsOn || null, endsOn:parsed.data.endsOn || null}).returning(); revalidatePath('/'); return {ok:true,row} }
export async function createEmployee(input: unknown) { await requireSession(); const parsed=employeeInput.safeParse(input); if(!parsed.success)return {ok:false,error:'الاسم والوظيفة مطلوبان'}; const [row]=await db.insert(employees).values(parsed.data).returning(); await db.insert(auditLogs).values({action:'create',entityType:'employee',entityId:row.id}); revalidatePath('/'); return {ok:true,row} }
export async function createExpense(input: unknown) { await requireSession(); const parsed=expenseInput.safeParse(input); if(!parsed.success)return {ok:false,error:'نوع المصروف والمبلغ الموجب مطلوبان'}; const [row]=await db.insert(expenses).values({...parsed.data, amount:Math.round(parsed.data.amount), expenseDate:parsed.data.expenseDate || null}).returning(); await db.insert(auditLogs).values({action:'create',entityType:'expense',entityId:row.id}); revalidatePath('/'); return {ok:true,row} }
export async function createInvoice(input: unknown) { await requireSession(); const parsed=invoiceInput.safeParse(input); if(!parsed.success)return {ok:false,error:'رقم الفاتورة والمبلغ مطلوبان'}; try { const [row]=await db.insert(invoices).values({...parsed.data, amount:Math.round(parsed.data.amount), dueDate:parsed.data.dueDate || null}).returning(); revalidatePath('/'); return {ok:true,row} } catch { return {ok:false,error:'تعذر حفظ الفاتورة. قد يكون الرقم مستخدماً.'} } }
export async function createAttendance(input: unknown) { await requireSession(); const parsed=attendanceInput.safeParse(input); if(!parsed.success)return {ok:false,error:'اختر الطالب والتاريخ والحالة'}; const [row]=await db.insert(attendance).values(parsed.data).returning(); revalidatePath('/'); return {ok:true,row} }
export async function createDocument(input: unknown) { await requireSession(); const parsed=documentInput.safeParse(input); if(!parsed.success)return {ok:false,error:'عنوان المستند مطلوب ورابطه يجب أن يكون صحيحاً'}; const [row]=await db.insert(documents).values({...parsed.data, fileUrl:parsed.data.fileUrl || null}).returning(); revalidatePath('/'); return {ok:true,row} }
export async function archiveStudent(id: string) { await requireSession(); if (!z.string().uuid().safeParse(id).success)return {ok:false,error:'معرّف غير صالح'}; await db.update(students).set({status:'archived',updatedAt:new Date()}).where(eq(students.id,id)); await db.insert(auditLogs).values({action:'archive',entityType:'student',entityId:id}); revalidatePath('/'); return {ok:true} }

export type SchoolActionResult = { ok: boolean; error?: string; row?: unknown; student?: unknown }
