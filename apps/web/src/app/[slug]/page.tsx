import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NovuLogo from '@/components/NovuLogo'
import BusinessPageClient from '@/components/BusinessPageClient'

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) notFound()

  const [
    { data: services },
    { data: products },
    { data: staff },
    { data: locations },
  ] = await Promise.all([
    supabase.from('services').select('*').eq('business_id', business.id).eq('is_active', true).order('created_at'),
    supabase.from('products').select('*').eq('business_id', business.id).eq('is_active', true).order('created_at'),
    supabase.from('staff').select('*').eq('business_id', business.id).eq('is_active', true).order('created_at'),
    supabase.from('locations').select('*').eq('business_id', business.id).eq('is_active', true),
  ])

  const location = locations?.[0] ?? null

  return (
    <div className="bg-[#080706] text-[#fafaf9] min-h-dvh">

      {/* Navbar */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav className="flex items-center justify-between max-w-2xl mx-auto px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.10] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Link href="/" className="flex items-center gap-2">
            <NovuLogo height={20} wordmark />
          </Link>
          <Link
            href={`/productos?biz=${business.id}`}
            className="px-3.5 py-1.5 text-[12px] bg-amber-500 hover:bg-amber-400 text-[#080706] font-semibold rounded-full transition-colors"
          >
            Mi marketplace
          </Link>
        </nav>
      </header>

      <BusinessPageClient
        business={{ id: business.id, name: business.name, description: business.description, phone: business.phone, logo_url: business.logo_url ?? null }}
        services={services ?? []}
        products={products ?? []}
        staff={staff ?? []}
        location={location ? { address: location.address, city: location.city, hours: location.hours ?? {} } : null}
      />

      {/* Footer */}
      <footer className="pb-10 pt-4 flex flex-col items-center gap-1.5 border-t border-white/[0.05]">
        <Link href="/" className="opacity-40 hover:opacity-70 transition-opacity">
          <NovuLogo height={18} wordmark />
        </Link>
        <p className="text-white/15 text-[11px]">Impulsado por Gestai · IA para tu negocio</p>
      </footer>
    </div>
  )
}
