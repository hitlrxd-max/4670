"use server"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { expenseCategories } from "@/db/schema"
import { requireRole } from "@/lib/auth"

const schema=z.object({name:z.string().trim().min(2,"اسم التصنيف مطلوب").max(255)})
export async function createExpenseCategoryAction(formData:FormData){
 await requireRole(["admin","finance"])
 const data=schema.parse({name:formData.get("name")})
 const [dup]=await db.select({id:expenseCategories.id}).from(expenseCategories).where(eq(expenseCategories.name,data.name)).limit(1)
 if(dup)return
 await db.insert(expenseCategories).values({name:data.name})
 revalidatePath("/finance/expenses");revalidatePath("/finance/expense-categories")
}