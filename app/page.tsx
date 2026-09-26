import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { SchoolDashboard } from '@/components/school-dashboard'
import { getDashboardData } from '@/lib/dashboard-data'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const data = await getDashboardData()
  return <SchoolDashboard data={data} />
}
