import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../db"
import { users, academicYears } from "../db/schema"
import { eq } from "drizzle-orm"

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@school.com"
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345"

  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await db.insert(users).values({
      fullName: "مدير النظام",
      email: adminEmail,
      passwordHash,
      role: "admin",
      branchId: null,
      isActive: true,
    })
    console.log("✅ تم إنشاء حساب المدير:")
    console.log(`   البريد: ${adminEmail}`)
    console.log(`   كلمة المرور: ${adminPassword}`)
    console.log("⚠️  غيّر كلمة المرور فورًا بعد أول تسجيل دخول.")
  } else {
    console.log("ℹ️  حساب المدير موجود مسبقًا، تم تخطي الإنشاء.")
  }

  const currentYear = new Date().getFullYear()
  const yearName = `${currentYear}/${currentYear + 1}`
  const existingYear = await db
    .select()
    .from(academicYears)
    .where(eq(academicYears.name, yearName))
    .limit(1)

  if (existingYear.length === 0) {
    await db.insert(academicYears).values({
      name: yearName,
      isActive: true,
    })
    console.log(`✅ تم إنشاء السنة الدراسية الافتراضية: ${yearName}`)
  } else {
    console.log("ℹ️  السنة الدراسية موجودة مسبقًا، تم تخطي الإنشاء.")
  }

  process.exit(0)
}

main().catch((err) => {
  console.error("❌ فشل تنفيذ الـ Seed:", err)
  process.exit(1)
})
