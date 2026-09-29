'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const ADMIN_EMAIL = 'admin@school.com'
const ADMIN_PASSWORD = 'Admin@123456'

export async function seedAdminAccount() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false, error: 'Unauthorized' }

  try {
    const result = await auth.api.signUpEmail({
      body: { name: 'مدير النظام', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      headers: await headers(),
    })
    if (result?.user) return { ok: true, email: ADMIN_EMAIL }
    return { ok: false, error: 'تعذر إنشاء حساب المدير' }
  } catch (error) {
    console.error('[v0] Admin seed failed', error)
    return { ok: false, error: 'تعذر إنشاء حساب المدير أو أنه موجود مسبقًا' }
  }
}

export { ADMIN_EMAIL }
