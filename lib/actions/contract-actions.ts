"use server"
import {db} from "@/db"
import {sql} from "drizzle-orm"
import {revalidatePath} from "next/cache"
import {requireRole,branchScope} from "@/lib/auth"
export async function createContractAction(formData:FormData){const s=await requireRole(["admin","hr"]);const employeeId=Number(formData.get("employeeId"));const scope=branchScope(s);const er=await db.execute(sql`SELECT branch_id FROM employees WHERE id=${employeeId} AND is_archived=false LIMIT 1`) as unknown as Array<{branch_id:number}>;if(!er[0]||(scope!==null&&er[0].branch_id!==scope))throw new Error("FORBIDDEN");await db.execute(sql`INSERT INTO employee_contracts (employee_id,contract_number,contract_type,start_date,end_date,salary,status,notes) VALUES (${employeeId},${String(formData.get("contractNumber"))},${String(formData.get("contractType")||"")||null},${String(formData.get("startDate"))},${String(formData.get("endDate")||"")||null},${Number(formData.get("salary")||0)||null},'active',${String(formData.get("notes")||"")||null})`);revalidatePath("/hr/contracts")}
