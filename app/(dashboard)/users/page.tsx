import { db } from "@/db"
import { users, branches, employees } from "@/db/schema"
import { asc, eq } from "drizzle-orm"
import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateUserForm } from "./create-user-form"
import { ToggleUserButton } from "./toggle-user-button"

export default async function UsersPage() {
  const session = await requireRole(["admin"]).catch(() => null)
  if (!session) redirect("/dashboard")
  const [rows, branchRows, employeeRows] = await Promise.all([
    db.select({id:users.id,fullName:users.fullName,email:users.email,role:users.role,branchId:users.branchId,isActive:users.isActive,createdAt:users.createdAt,branchName:branches.name})
      .from(users).leftJoin(branches,eq(users.branchId,branches.id)).orderBy(asc(users.fullName)),
    db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.status,"active")).orderBy(asc(branches.name)),
    db.select({id:employees.id,fullName:employees.fullName,employeeCode:employees.employeeCode,branchId:employees.branchId,userId:employees.userId}).from(employees).where(eq(employees.isArchived,false)).orderBy(asc(employees.fullName)),
  ])
  return <div dir="rtl" className="space-y-6">
    <div><h1 className="text-xl font-bold">المستخدمون والحسابات</h1><p className="text-sm text-zinc-500">المدير ينشئ الحساب ويحدد الفرع والدور. كل حساب غير إداري يرى فرعه فقط.</p></div>
    <CreateUserForm branches={branchRows} employees={employeeRows.filter(e=>!e.userId)} />
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[900px] text-right text-sm">
        <thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الاسم</th><th className="px-4 py-3">البريد</th><th className="px-4 py-3">الدور</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">الحالة</th><th className="px-4 py-3">إجراء</th></tr></thead>
        <tbody>{rows.map(u=><tr key={u.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{u.fullName}</td><td className="px-4 py-3">{u.email}</td><td className="px-4 py-3">{u.role}</td><td className="px-4 py-3">{u.branchName ?? "كل الفروع"}</td><td className="px-4 py-3">{u.isActive ? "نشط" : "موقوف"}</td><td className="px-4 py-3"><ToggleUserButton id={u.id} active={u.isActive} /></td></tr>)}</tbody>
      </table>
    </div>
  </div>
}