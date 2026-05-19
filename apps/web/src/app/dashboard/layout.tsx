import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role as string | undefined
  const isClient = role === 'CLIENT'

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  const cookieStore = await cookies()
  const activeBizId = cookieStore.get('biz')?.value
  const business = businesses?.find(b => b.id === activeBizId) ?? businesses?.[0] ?? null

  return (
    <DashboardShell
      businesses={businesses ?? []}
      business={business}
      userEmail={user.email ?? ''}
      isClient={isClient}
    >
      {children}
    </DashboardShell>
  )
}
