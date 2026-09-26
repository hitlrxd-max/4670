'use server'

import { requireSession } from '@/lib/auth'
import { and, asc, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auditLogs, branches, employees, expenses, students } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

const studentInput = z.object({ fullName: z.string().trim().min(2), registrationNumber: z.string().trim().min(1), seatNumber: z.string().trim().optional(), branchId: z.string().uuid().optional().or(z.literal('')), academicYearId: z.string().uuid().optional().or(z.literal('')), grade: z.string().trim().optional(), className: z.string().trim().optional(), guardianName: z.string().trim().optional(), guardianPhone: z.string().trim().optional(), address: z.string().trim().optional(), notes: z.string().trim().optional(), status: z.enum(['active', 'archived']).default('active') })
const branchInput = z.object({ name: z.string().trim().min(2), code: z.string().trim().min(1), address: z.string().trim().optional(), phone: z.string().trim().optional() })
const employeeInput = z.object({ fullName: z.string().trim().min(2), jobTitle: z.string().trim().min(2), phone: z.string().trim().optional(), notes: z.string().trim().optional() })
const expenseInput = z.object({ title: z.string().trim().min(2), amount: z.coerce.number().positive(), expenseDate: z.string().optional(), category: z.string().trim().optional() })

export async function listBranches() { await requireSession(); return db.select().from(branches).where(eq(branches.isActive, true)).orderBy(asc(branches.name)) }
export async function listStudents(query = '') { await requireSession(); return db.select().from(students).where(query ? and(eq(students.status, 'active'), ilike(students.fullName, `%${query}%`)) : eq(students.status, 'active')).orderBy(asc(students.fullName)) }
export async function listEmployees() { await requireSession(); return db.select().from(employees).orderBy(asc(employees.fullName)) }
export async function listExpenses() { await requireSession(); return db.select().from(expenses).orderBy(asc(expenses.createdAt)) }
export async function createStudent(input: unknown) { await requireSession(); const parsed = studentInput.safeParse(input); if (!parsed.success) return { ok:false, error:'يرجى مراجعة بيانات الطالب' }; try { const [student] = await db.insert(students).values({...parsed.data, branchId: parsed.data.branchId || null, academicYearId: parsed.data.academicYearId || null}).returning(); await db.insert(auditLogs).values({action:'create',entityType:'student',entityId:student.id,metadata:{registrationNumber:student.registrationNumber}}); revalidatePath('/'); return {ok:true,student} } catch { return {ok:false,error:'تعذر حفظ الطالب. قد يكون رقم التسجيل مستخدماً.'} } }
export async function createBranch(input: unknown) { await requireSession(); const parsed=branchInput.safeParse(input); if(!parsed.success)return {ok:false,error:'اسم الفرع والرمز مطلوبان'}; try { const [row]=await db.insert(branches).values(parsed.data).returning(); await db.insert(auditLogs).values({action:'create',entityType:'branch',entityId:row.id}); revalidatePath('/'); return {ok:true,row} } catch { return {ok:false,error:'تعذر حفظ الفرع. قد يكون الاسم أو الرمز مستخدماً.'} } }
export async function createEmployee(input: unknown) { await requireSession(); const parsed=employeeInput.safeParse(input); if(!parsed.success)return {ok:false,error:'الاسم والوظيفة مطلوبان'}; const [row]=await db.insert(employees).values(parsed.data).returning(); await db.insert(auditLogs).values({action:'create',entityType:'employee',entityId:row.id}); revalidatePath('/'); return {ok:true,row} }
export async function createExpense(input: unknown) { await requireSession(); const parsed=expenseInput.safeParse(input); if(!parsed.success)return {ok:false,error:'نوع المصروف والمبلغ الموجب مطلوبان'}; const [row]=await db.insert(expenses).values({...parsed.data, amount:Math.round(parsed.data.amount), expenseDate:parsed.data.expenseDate || null}).returning(); await db.insert(auditLogs).values({action:'create',entityType:'expense',entityId:row.id}); revalidatePath('/'); return {ok:true,row} }
export async function archiveStudent(id: string) { await requireSession(); if (!z.string().uuid().safeParse(id).success)return {ok:false,error:'معرّف غير صالح'}; await db.update(students).set({status:'archived',updatedAt:new Date()}).where(eq(students.id,id)); await db.insert(auditLogs).values({action:'archive',entityType:'student',entityId:id}); revalidatePath('/'); return {ok:true} }
