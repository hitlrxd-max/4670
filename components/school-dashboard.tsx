'use client'

import { useState } from 'react'
import { AdminWorkspace } from '@/components/admin-workspace'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%B4%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D8%AF%D8%B1%D8%B3%D8%A9%20777714-xPI9NIGKnhtaaU6rxraz42qykN3YmC.jpg'

const navItems = [
  { label: 'نظرة عامة', icon: LayoutDashboard, active: true },
  { label: 'الطلاب', icon: GraduationCap },
  { label: 'المعلمون والموظفون', icon: Users },
  { label: 'الفروع والمراحل', icon: BookOpen },
  { label: 'الحضور والغياب', icon: ClipboardCheck },
  { label: 'المالية والفواتير', icon: WalletCards },
  { label: 'التقارير', icon: FileText },
]

const stats = [
  { label: 'إجمالي الطلاب', key: 'studentCount', icon: GraduationCap, tone: 'teal' },
  { label: 'الفروع النشطة', key: 'branchCount', icon: BookOpen, tone: 'blue' },
  { label: 'الحضور اليوم', value: 'لا توجد بيانات', icon: ClipboardCheck, tone: 'green' },
  { label: 'المبالغ المحصلة', value: 'لا توجد بيانات', icon: CircleDollarSign, tone: 'orange' },
]

const activities: { title: string; detail: string; time: string; type: string }[] = []

const attendance: number[] = []

export function SchoolDashboard({ data }: { data: { studentCount: number; branchCount: number } }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('نظرة عامة')

  return (
    <div dir="rtl" className="min-h-screen bg-[#f6f8fb] text-[#172b4d]">
      <aside className={`fixed inset-y-0 right-0 z-40 flex w-[274px] flex-col border-l border-[#e6ebf2] bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-[92px] items-center gap-3 border-b border-[#edf0f5] px-7">
          <img src={logoUrl} alt="شعار مدرسة ضياء المستقبل" className="size-12 rounded-xl object-cover" />
          <div>
            <p className="text-[15px] font-extrabold text-[#163c73]">ضياء المستقبل</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#8592a6]">نظام الإدارة المدرسية</p>
          </div>
          <button aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} className="mr-auto rounded-lg p-2 text-[#8a97aa] hover:bg-[#f3f6fa] lg:hidden"><X /></button>
        </div>
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.14em] text-[#a3adbd]">القائمة الرئيسية</p>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeView === item.label
              return <button key={item.label} onClick={() => { setActiveView(item.label); setSidebarOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] font-semibold transition-colors ${active ? 'bg-[#e9f7f6] text-[#159a93]' : 'text-[#64748b] hover:bg-[#f7f9fb] hover:text-[#163c73]'}`}><Icon className="size-[18px]" /><span>{item.label}</span>{active && <span className="mr-auto size-1.5 rounded-full bg-[#21b6aa]" />}</button>
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-[#f6f9fc] p-4">
            <div className="mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-[#1cad9f]" /><span className="text-xs font-bold text-[#41516a]">حساب آمن ومفعل</span></div>
            <p className="text-[11px] leading-5 text-[#8a97aa]">بيانات المدرسة محمية ومحدثة تلقائياً.</p>
          </div>
        </div>
      </aside>
      {sidebarOpen && <button aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#10213d]/30 lg:hidden" />}

      <div className="lg:pr-[274px]">
        <header className="flex h-[92px] items-center justify-between border-b border-[#e7ecf2] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3"><button aria-label="فتح القائمة" onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-[#5f6f85] hover:bg-[#f4f7fa] lg:hidden"><Menu /></button><div><p className="text-xs font-medium text-[#8b98aa]">لوحة بيانات المدرسة</p><h1 className="mt-1 text-xl font-extrabold text-[#173968]">مرحباً بك، مدير المدرسة</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-5"><button aria-label="البحث" className="hidden rounded-xl p-2.5 text-[#8290a4] hover:bg-[#f5f8fb] sm:block"><Search className="size-[19px]" /></button><button aria-label="الإشعارات" className="relative rounded-xl p-2.5 text-[#8290a4] hover:bg-[#f5f8fb]"><Bell className="size-[19px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ef8354] ring-2 ring-white" /></button><div className="h-8 w-px bg-[#e9edf3]" /><button className="flex items-center gap-2"><span className="hidden text-right sm:block"><span className="block text-xs font-bold text-[#263d60]">عبدالله السالم</span><span className="block pt-0.5 text-[10px] text-[#96a1b0]">مدير النظام</span></span><span className="flex size-9 items-center justify-center rounded-xl bg-[#e8f6f5] text-sm font-bold text-[#159a93]">ع</span><ChevronDown className="hidden size-4 text-[#96a1b0] sm:block" /></button></div>
        </header>

        <main className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><AdminWorkspace />
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-sm font-medium text-[#8b98aa]">نظرة شاملة على أداء المدرسة</p><h2 className="text-2xl font-extrabold text-[#173968]">لوحة التحكم</h2></div><button className="flex items-center gap-2 rounded-xl bg-[#159a93] px-4 py-2.5 text-xs font-bold text-white shadow-[0_5px_14px_rgba(21,154,147,0.18)] transition hover:bg-[#12877f]"><Plus className="size-4" />إضافة سجل جديد</button></div>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => { const Icon = stat.icon; const value = 'key' in stat && stat.key ? String(data[stat.key as keyof typeof data] ?? 0) : stat.value; return <article key={stat.label} className="rounded-2xl border border-[#e8edf3] bg-white p-5 shadow-[0_3px_12px_rgba(35,58,88,0.025)]"><div className="mb-5 flex items-start justify-between"><span className={`flex size-10 items-center justify-center rounded-xl ${stat.tone === 'teal' ? 'bg-[#e9f7f6] text-[#159a93]' : stat.tone === 'blue' ? 'bg-[#edf4fd] text-[#4789d6]' : stat.tone === 'green' ? 'bg-[#eef9f0] text-[#58aa69]' : 'bg-[#fff4e9] text-[#e99551]'}`}><Icon className="size-5" /></span></div><p className="mb-1 text-xs font-medium text-[#8491a4]">{stat.label}</p><p className="text-[22px] font-extrabold tracking-tight text-[#1b365f]">{value}</p><p className="mt-2 text-[10px] font-medium text-[#a0abba]">مصدر البيانات: Neon</p></article> })}
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
            <article className="rounded-2xl border border-[#e8edf3] bg-white p-5 sm:p-6"><div className="mb-7 flex items-center justify-between"><div><h3 className="text-sm font-extrabold text-[#203b64]">نسبة الحضور والغياب</h3><p className="mt-1 text-[11px] text-[#95a0af]">متاب��ة الحضور خلال هذا الأسبوع</p></div><button className="rounded-lg border border-[#e6ebf1] px-3 py-2 text-[10px] font-bold text-[#718096]">هذا الأسبوع <ChevronDown className="mr-1 inline size-3" /></button></div><div className="flex h-[190px] items-end gap-3 border-b border-[#edf0f4] px-1 pb-0 sm:gap-6">{attendance.map((value, index) => <div key={value + index} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-[#8592a5]">{value}%</span><div className="relative flex h-[135px] w-full max-w-10 items-end overflow-hidden rounded-t-lg bg-[#edf8f7]"><div className="w-full rounded-t-lg bg-[#39b8ae]" style={{ height: `${value}%` }} /></div><span className="translate-y-5 text-[10px] font-medium text-[#a0abba]">{['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجم��ة'][index]}</span></div>)}</div><div className="mt-9 flex items-center justify-between"><div><p className="text-[10px] text-[#98a3b2]">متوسط الحضور</p><p className="mt-1 text-lg font-extrabold text-[#203b64]">لا توجد بيانات</p></div><div className="flex items-center gap-5 text-[10px] font-medium text-[#8491a4]"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#39b8ae]" />حاضر</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#e8eff4]" />غياب</span></div></div></article>
            <article className="rounded-2xl border border-[#e8edf3] bg-white p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h3 className="text-sm font-extrabold text-[#203b64]">التوزيع حسب المرحلة</h3><p className="mt-1 text-[11px] text-[#95a0af]">أعداد الطلاب المسجلين</p></div><button aria-label="المزيد" className="text-[#9aa6b6]"><MoreHorizontal className="size-5" /></button></div><div className="flex items-center gap-6"><div className="flex min-h-[142px] flex-1 items-center justify-center rounded-2xl bg-[#fafbfd] text-sm font-semibold text-[#9aa6b5]">لا توجد بيانات</div></div></article>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_1fr]"><article className="rounded-2xl border border-[#e8edf3] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-extrabold text-[#203b64]">آخر العمليات</h3><p className="mt-1 text-[11px] text-[#95a0af]">أحدث التحديثات في النظام</p></div><button className="text-[11px] font-bold text-[#159a93]">عرض الكل</button></div><div className="flex flex-col">{activities.map((activity) => <div key={activity.title} className="flex items-center gap-3 border-t border-[#f0f3f6] py-3.5"><span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${activity.type === 'student' ? 'bg-[#edf4fd] text-[#4789d6]' : activity.type === 'invoice' ? 'bg-[#fff4e9] text-[#e99551]' : activity.type === 'leave' ? 'bg-[#eef9f0] text-[#58aa69]' : 'bg-[#f2efff] text-[#8773ce]'}`}>{activity.type === 'student' ? <UserRound className="size-4" /> : activity.type === 'invoice' ? <CircleDollarSign className="size-4" /> : activity.type === 'leave' ? <CalendarDays className="size-4" /> : <FileText className="size-4" />}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#344b6b]">{activity.title}</p><p className="mt-1 truncate text-[10px] text-[#98a4b4]">{activity.detail}</p></div><span className="shrink-0 text-[10px] text-[#a3adba]">{activity.time}</span></div>)}</div></article><article className="rounded-2xl border border-[#e8edf3] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-extrabold text-[#203b64]">مواعيد اليوم</h3><p className="mt-1 text-[11px] text-[#95a0af]">الأحد، 27 سبتمبر</p></div><button className="rounded-lg p-2 text-[#9aa6b6] hover:bg-[#f5f8fb]"><CalendarDays className="size-4" /></button></div><div className="flex flex-col gap-3"><Schedule time="08:00" title="الطابور الصباحي" subtitle="الساحة الرئيسية" color="border-[#42b8ad]" /><Schedule time="10:30" title="اجتماع الهيئة التعليمية" subtitle="قاعة الاجتماعات" color="border-[#f2b365]" /><Schedule time="12:00" title="استقبال أولياء الأمور" subtitle="مكتب الإدارة" color="border-[#76a8dc]" /></div><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1f8f7] py-2.5 text-[11px] font-bold text-[#159a93] hover:bg-[#e7f4f2]">عرض التقويم الكامل <ChevronDown className="size-3 -rotate-90" /></button></article></section>
        </main>
      </div>
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) { return <div className="flex items-center gap-2.5 text-[10px] text-[#718096]"><i className={`size-2.5 rounded-full ${color}`} /><span className="min-w-[112px]">{label}</span><strong className="text-xs font-bold text-[#344b6b]">{value}</strong></div> }
function Schedule({ time, title, subtitle, color }: { time: string; title: string; subtitle: string; color: string }) { return <div className={`flex items-center gap-3 rounded-xl border-r-[3px] bg-[#fafbfd] px-3 py-3 ${color}`}><span className="w-10 text-center text-[10px] font-bold text-[#8794a7]">{time}</span><div className="h-7 w-px bg-[#e7edf2]" /><div><p className="text-xs font-bold text-[#3b5272]">{title}</p><p className="mt-1 text-[10px] text-[#9aa6b5]">{subtitle}</p></div></div> }

export { logoUrl }
