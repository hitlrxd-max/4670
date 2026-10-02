"use server"
import { db } from "@/db"
import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireRole, branchScope } from "@/lib/auth"

export async function createInventoryItemAction(formData:FormData){
 const s=await requireRole(["admin","finance"]);const branchId=Number(formData.get("branchId"));const scope=branchScope(s);if(scope!==null&&scope!==branchId)throw new Error("FORBIDDEN")
 await db.execute(sql`INSERT INTO inventory_items (branch_id,name,sku,category,unit,quantity,min_quantity,unit_cost,notes) VALUES (${branchId},${String(formData.get("name"))},${String(formData.get("sku")||"")||null},${String(formData.get("category")||"")||null},${String(formData.get("unit")||"قطعة")},${Number(formData.get("quantity")||0)},${Number(formData.get("minQuantity")||0)},${Number(formData.get("unitCost")||0)},${String(formData.get("notes")||"")||null})`)
 revalidatePath("/finance/inventory")
}
export async function addInventoryTransactionAction(formData:FormData){
 const s=await requireRole(["admin","finance"]);const itemId=Number(formData.get("itemId"));const qty=Number(formData.get("quantity"));const type=String(formData.get("transactionType"));if(!itemId||qty<=0||!["in","out"].includes(type))throw new Error("بيانات الجرد غير صحيحة")
 const rows=await db.execute(sql`SELECT id,branch_id,quantity FROM inventory_items WHERE id=${itemId} AND is_archived=false LIMIT 1`) as unknown as Array<{id:number;branch_id:number;quantity:string}>
 const item=rows[0];const scope=branchScope(s);if(!item||(scope!==null&&item.branch_id!==scope))throw new Error("FORBIDDEN");const next=Number(item.quantity)+(type==="in"?qty:-qty);if(next<0)throw new Error("الكمية غير كافية")
 await db.execute(sql`UPDATE inventory_items SET quantity=${next},updated_at=NOW() WHERE id=${itemId}`)
 await db.execute(sql`INSERT INTO inventory_transactions (item_id,branch_id,transaction_type,quantity,unit_cost,transaction_date,reference,notes,created_by) VALUES (${itemId},${item.branch_id},${type},${qty},${Number(formData.get("unitCost")||0)},${String(formData.get("date"))},${String(formData.get("reference")||"")||null},${String(formData.get("notes")||"")||null},${s.userId})`)
 revalidatePath("/finance/inventory")
}
export async function archiveInventoryItemAction(formData:FormData){const s=await requireRole(["admin","finance"]);const id=Number(formData.get("id"));const rows=await db.execute(sql`SELECT branch_id FROM inventory_items WHERE id=${id}`) as unknown as Array<{branch_id:number}>;const scope=branchScope(s);if(!rows[0]||(scope!==null&&rows[0].branch_id!==scope))throw new Error("FORBIDDEN");await db.execute(sql`UPDATE inventory_items SET is_archived=true,updated_at=NOW() WHERE id=${id}`);revalidatePath("/finance/inventory")}
