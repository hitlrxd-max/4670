import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"

const roles=[
 {name:"مدير النظام",role:"admin",scope:"كل الفروع",permissions:"كل الأقسام + إنشاء الحسابات + الصلاحيات + الفروع"},
 {name:"المالية",role:"finance",scope:"فرع المستخدم",permissions:"الأقساط، المدفوعات، الفواتير، الخصومات، المصروفات، التقارير"},
 {name:"شؤون الطلاب",role:"student_affairs",scope:"فرع المستخدم",permissions:"الطلاب وحضور الطلاب"},
 {name:"الموارد البشرية",role:"hr",scope:"فرع المستخدم",permissions:"الموظفون، المعلمون، المواد، الفصول، الجداول"},
 {name:"الأرشيف",role:"archive",scope:"فرع المستخدم",permissions:"الوارد، الصادر، القرارات، المراسلات، البحث"},
]
export default async function PermissionsPage(){
 const s=await requireRole(["admin"]).catch(()=>null);if(!s)redirect("/dashboard")
 return <div dir="rtl" className="space-y-5"><div><h1 className="text-xl font-bold">الصلاحيات</h1><p className="text-sm text-zinc-500">الصلاحيات مرتبطة بالدور والفرع، ويتم التحقق منها على الخادم وليس فقط بإخفاء الأزرار.</p></div><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[850px] text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الدور</th><th className="px-4 py-3">المعرف</th><th className="px-4 py-3">النطاق</th><th className="px-4 py-3">الصلاحيات</th></tr></thead><tbody>{roles.map(r=><tr key={r.role} className="border-b last:border-0"><td className="px-4 py-3 font-semibold">{r.name}</td><td className="px-4 py-3">{r.role}</td><td className="px-4 py-3">{r.scope}</td><td className="px-4 py-3">{r.permissions}</td></tr>)}</tbody></table></div></div>
}