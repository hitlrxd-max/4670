import { SchoolDashboard } from '@/components/school-dashboard'
import { getDashboardData } from '@/lib/dashboard-data'

export default async function Page() {
  const data = await getDashboardData()
  return <SchoolDashboard data={data} />
}
