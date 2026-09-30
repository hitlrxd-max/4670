import { db } from "@/db"
import { academicYears, branches } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StudentForm } from "../student-form"

export default async function NewStudentPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  const scope = branchScope(session)
  const [branchesRows, years] = await Promise.all([
    scope === null ? db.select().from(branches).where(eq(branches.status, "active")) : db.select().from(branches).where(eq(branches.id, scope)),
    db.select().from(academicYears).orderBy(desc(academicYears.name)),
  ])
  return <StudentForm branches={branchesRows} years={years} />
}
