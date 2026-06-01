'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'
import type { Product } from '@/types/database'

type ProductForm = { name: string; brand: string; price: string; description: string; stock: string }
const EMPTY_FORM: ProductForm = { name: '', brand: '', price: '', description: '', stock: '' }

export default function MarketplacePage() {
  const supabase = createClient()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const activeBizId = getActiveBizId()
      const query = supabase.from('businesses').select('id').eq('owner_id', user.id)
      const { data: business } = activeBizId
        ? await query.eq('id', activeBizId).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!business) { setLoading(false); return }
      setBusinessId(business.id)
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      brand: p.brand ?? '',
      price: String(p.price),
      description: p.description ?? '',
      stock: String(p.stock ?? 0),
    })
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(p.image_url ?? null)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(null)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File, productId: string): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `${businessId}/${productId}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    if (!businessId || !form.name.trim() || !form.price) return
    setSaving(true)

    const payload: Record<string, unknown> = {
      business_id: businessId,
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      price: parseFloat(form.price),
      description: form.description.trim() || null,
      stock: parseInt(form.stock) || 0,
      is_active: true,
    }

    if (editingId) {
      // Subir imagen nueva si existe
      if (imageFile) {
        const url = await uploadImage(imageFile, editingId)
        if (url) payload.image_url = url
      }
      const { data } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
      if (data) setProducts((prev) => prev.map((p) => (p.id === editingId ? data : p)))
    } else {
      // Insertar primero para obtener el ID, luego subir imagen
      const { data } = await supabase.from('products').insert(payload).select().single()
      if (data) {
        let finalData = data
        if (imageFile) {
          const url = await uploadImage(imageFile, data.id)
          if (url) {
            const { data: updated } = await supabase
              .from('products').update({ image_url: url }).eq('id', data.id).select().single()
            if (updated) finalData = updated
          }
        }
        setProducts((prev) => [...prev, finalData])
      }
    }

    setSaving(false)
    cancelForm()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('products').update({ is_active: false }).eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  if (loading) return (
    <div className="px-8 py-8">
      <p className="text-white/30 text-[14px]">Cargando productos…</p>
    </div>
  )

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-6">
        <p className="text-[13px] text-blue-400/70 font-medium mb-0.5">Dashboard</p>
        <h1 className="text-[22px] font-semibold text-white">Marketplace</h1>
        <p className="text-[13px] text-white/35 mt-0.5">Productos publicados en el catálogo público.</p>
      </div>

      <div className="flex justify-end mb-5">
        {!showForm && (
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold transition-colors duration-150"
          >
            + Agregar producto
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 mb-6 space-y-4">
          <h3 className="text-[14px] font-semibold text-white">
            {editingId ? 'Editar producto' : 'Nuevo producto'}
          </h3>

          {/* Image upload */}
          <div>
            <label className="block text-[12px] text-white/40 mb-1.5">Imagen</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/[0.15] hover:border-blue-500/40 bg-white/[0.03] flex items-center justify-center cursor-pointer transition-colors duration-150 overflow-hidden shrink-0"
              >
                {imagePreview || currentImageUrl ? (
                  <img
                    src={imagePreview ?? currentImageUrl ?? ''}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white/20 text-[22px]">+</span>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] text-blue-400/70 hover:text-blue-400 transition-colors duration-150"
                >
                  {imagePreview || currentImageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                <p className="text-[11px] text-white/20 mt-0.5">JPG, PNG o WEBP · máx. 2MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Nombre *</label>
              <input
                type="text"
                placeholder="Ej. Pomada Fijadora"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Marca</label>
              <input
                type="text"
                placeholder="Ej. American Crew"
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Precio (CLP) *</label>
              <input
                type="number"
                placeholder="9990"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Stock</label>
              <input
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-white/40 mb-1.5">Descripción</label>
            <textarea
              placeholder="Descripción breve del producto…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.price}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40"
            >
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar'}
            </button>
            <button
              onClick={cancelForm}
              className="px-5 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-10 text-center">
          <p className="text-white/25 text-[14px]">Aún no hay productos publicados.</p>
          <p className="text-white/15 text-[12px] mt-1">Agrega productos para que aparezcan en el catálogo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl transition-colors duration-150"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[18px]">🧴</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-medium text-white truncate">{p.name}</p>
                  {p.brand && <span className="text-[11px] text-white/30 shrink-0">{p.brand}</span>}
                </div>
                <p className="text-[12px] text-white/35 truncate">
                  ${Number(p.price).toLocaleString('es-CL')}
                  {p.stock > 0 ? ` · ${p.stock} en stock` : ' · Sin stock'}
                  {p.description ? ` · ${p.description}` : ''}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEdit(p)}
                  className="px-3 py-1.5 rounded-lg text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-150"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="px-3 py-1.5 rounded-lg text-[12px] text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors duration-150 disabled:opacity-40"
                >
                  {deletingId === p.id ? '…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
