'use client'

import { useState, useTransition } from 'react'
import { createBranch, createEmployee, createExpense, createStudent, listBranches, listEmployees, listExpenses, listStudents } from '@/app/actions/school'

const emptyStudent = { fullName: '', registrationNumber: '', branchId: '', academicYearId: '', grade: '', className: '', guardianName: '', guardianPhone: '', address: '', notes: '' }

export function AdminWorkspace() {
  const [tab, setTab] = useState('students')
  const [students, setStudents] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [form, setForm] = useState<any>(emptyStudent)
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  function refresh() { startTransition(async () => { const [s, b, e, x] = await Promise.all([listStudents(), listBranches(), listEmployees(), listExpenses()]); setStudents(s); setBranches(b); setEmployees(e); setExpenses(x) }) }
  function submit(event: React.FormEvent) { event.preventDefault(); setMessage(''); startTransition(async () => { let result: any; if (tab === 'students') result = await createStudent(form); if (tab === 'branches') result = await createBranch(form); if (tab === 'employees') result = await createEmployee(form); if (tab === 'expenses') result = await createExpense(form); setMessage(result?.ok ? 'تم الحفظ بنجاح' : result?.error || 'تعذر الحفظ'); if (result?.ok) { setForm(tab === 'students' ? emptyStudent : {}); refresh() } }) }
  const labels: Record<string, string> = { students: 'إدارة الطلاب', branches: 'إدارة الفروع', employees: 'المعلمون والموظفون', expenses: 'المصروفات' }
  const rows = tab === 'students' ? students : tab === 'branches' ? branches : tab === 'employees' ? employees : expenses
  return <section className="mt-6 rounded-2xl border border-[#e8edf3] bg-white p-5 sm:p-6">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#203b64]">مركز إدارة البيانات</h2><p className="mt-1 text-xs text-[#8b98aa]">أدخل بيانات المدرسة يدويًا، وتحفظ مباشرة في Neon.</p></div><button onClick={refresh} className="rounded-xl border border-[#dfe7ef] px-4 py-2 text-xs font-bold text-[#159a93]">تحديث البيانات</button></div>
    <div className="mb-6 flex flex-wrap gap-2">{Object.entries(labels).map(([key, label]) => <button key={key} onClick={() => { setTab(key); setForm(key === 'students' ? emptyStudent : {}); setMessage('') }} className={`rounded-xl px-4 py-2 text-xs font-bold ${tab === key ? 'bg-[#159a93] text-white' : 'bg-[#f4f8fa] text-[#6d7d92]'}`}>{label}</button>)}</div>
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-[#f8fafc] p-4 sm:grid-cols-2 lg:grid-cols-4">
      {tab === 'students' && <><Field label="اسم الطالب" value={form.fullName} onChange={(v) => setForm({...form, fullName:v})} required /><Field label="رقم القيد" value={form.registrationNumber} onChange={(v) => setForm({...form, registrationNumber:v})} required /><Field label="رقم الجلوس" value={form.seatNumber} onChange={(v) => setForm({...form, seatNumber:v})} /><Field label="الصف" value={form.grade} onChange={(v) => setForm({...form, grade:v})} /><Field label="الفصل" value={form.className} onChange={(v) => setForm({...form, className:v})} /><Field label="ولي الأمر" value={form.guardianName} onChange={(v) => setForm({...form, guardianName:v})} /><Field label="هاتف ولي الأمر" value={form.guardianPhone} onChange={(v) => setForm({...form, guardianPhone:v})} /><Select label="الفرع" value={form.branchId} options={branches.map(b => [b.id,b.name])} onChange={(v) => setForm({...form, branchId:v})} /></>}
      {tab === 'branches' && <><Field label="اسم الفرع" value={form.name} onChange={(v) => setForm({...form, name:v})} required /><Field label="رمز الفرع" value={form.code} onChange={(v) => setForm({...form, code:v})} required /><Field label="العنوان" value={form.address} onChange={(v) => setForm({...form, address:v})} /><Field label="الهاتف" value={form.phone} onChange={(v) => setForm({...form, phone:v})} /></>}
      {tab === 'employees' && <><Field label="الاسم" value={form.fullName} onChange={(v) => setForm({...form, fullName:v})} required /><Field label="الوظيفة" value={form.jobTitle} onChange={(v) => setForm({...form, jobTitle:v})} /><Field label="الهاتف" value={form.phone} onChange={(v) => setForm({...form, phone:v})} /><Field label="المادة / الفصول" value={form.notes} onChange={(v) => setForm({...form, notes:v})} /></>}
      {tab === 'expenses' && <><Field label="نوع المصروف" value={form.title} onChange={(v) => setForm({...form, title:v})} required /><Field label="المبلغ" type="number" value={form.amount} onChange={(v) => setForm({...form, amount:v})} required /><Field label="التاريخ" type="date" value={form.expenseDate} onChange={(v) => setForm({...form, expenseDate:v})} /><Field label="ملاحظات" value={form.category} onChange={(v) => setForm({...form, category:v})} /></>}
      <button disabled={pending} className="rounded-xl bg-[#159a93] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{pending ? 'جارٍ الحفظ...' : 'حفظ البيانات'}</button>
    </form>
    {message && <p className="mt-3 rounded-xl bg-[#edf9f3] px-4 py-3 text-xs font-bold text-[#25875f]">{message}</p>}
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-right text-xs"><thead><tr className="border-b border-[#edf0f4] text-[#8a97aa]"><th className="p-3">الاسم / البيان</th><th className="p-3">التفاصيل</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.id || i} className="border-b border-[#f2f4f7] text-[#344b6b]"><td className="p-3 font-bold">{row.fullName || row.name || row.title || '—'}</td><td className="p-3">{row.registrationNumber || row.code || row.jobTitle || (row.amount ? `${row.amount} ر.س` : '—')}</td><td className="p-3">{row.status || (row.isActive ? 'نشط' : 'غير نشط')}</td><td className="p-3">{String(row.createdAt || row.expenseDate || '').slice(0,10) || '—'}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-10 text-center text-sm font-semibold text-[#9aa6b5]">لم تتم إضافة أي بيانات بعد</p>}</div>
  </section>
}
function Field({ label, value, onChange, type='text', required=false }: any) { return <label className="flex flex-col gap-1.5 text-xs font-bold text-[#52647c]"><span>{label}{required && ' *'}</span><input required={required} type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="rounded-xl border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#159a93]" /></label> }
function Select({ label, value, options, onChange }: any) { return <label className="flex flex-col gap-1.5 text-xs font-bold text-[#52647c]"><span>{label}</span><select value={value || ''} onChange={e => onChange(e.target.value)} className="rounded-xl border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm font-normal"><option value="">اختر الفرع</option>{options.map((o: any) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</select></label> }
