'use client'

export function InvoicePrint({ invoice }: { invoice: { invoiceNumber: string; studentName: string; branch?: string; grade?: string; academicYear?: string; total: number; discount: number; net: number; paid: number; remaining: number; paidAt?: string; method?: string } }) {
  return <div className="invoice-print grid grid-cols-2 gap-5 bg-white p-8 text-right text-sm" dir="rtl">{[0,1].map(copy => <section key={copy} className="border border-slate-300 p-6"><h1 className="mb-5 text-xl font-bold">إيصال رسوم مدرسية</h1><dl className="grid grid-cols-2 gap-3"><dt>رقم الفاتورة</dt><dd>{invoice.invoiceNumber}</dd><dt>الطالب</dt><dd>{invoice.studentName}</dd><dt>الفرع</dt><dd>{invoice.branch || '—'}</dd><dt>الصف والسنة</dt><dd>{invoice.grade || '—'} / {invoice.academicYear || '—'}</dd><dt>إجمالي الرسوم</dt><dd>{invoice.total} ر.س</dd><dt>الخصم</dt><dd>{invoice.discount} ر.س</dd><dt>الصافي</dt><dd>{invoice.net} ر.س</dd><dt>المدفوع</dt><dd>{invoice.paid} ر.س</dd><dt>المتبقي</dt><dd>{invoice.remaining} ر.س</dd><dt>تاريخ الدفع</dt><dd>{invoice.paidAt || '—'}</dd><dt>طريقة الدفع</dt><dd>{invoice.method || '—'}</dd></dl></section>)}</div>
}

export function printInvoice() { window.print() }
