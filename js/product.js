/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT DETAIL PAGE — Populate, Variants, Quantity, Add to Cart, Related
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── STATE ──────────────────────────────────────────────────────────────── */

let productPageQty = 1
let productPageColor = ''

/* ── INIT PRODUCT PAGE ───────────────────────────────────────────────────── */

function initProduct() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get('id') || 'p-2'
  const p = products[productId]
  if (!p) return

  productPageQty = 1
  productPageColor = p.colorVariants?.[0]?.name || ''

  /* Page title */
  document.title = p.name + ' — ऊनीverse'

  /* Breadcrumb */
  const breadcrumbName = $('#product-breadcrumb-name')
  if (breadcrumbName) breadcrumbName.textContent = p.name

  /* Main image */
  const mainImg = $('#product-main-image')
  if (mainImg) {
    mainImg.src = p.image
    mainImg.alt = p.name
  }

  /* Badge */
  const badge = $('#product-badge')
  if (badge) {
    if (p.stockStatus === 'Pre-Order') {
      badge.textContent = 'Pre-Order'
      badge.className = 'px-3 py-1 bg-[#DFA8B4]/15 text-[#9A5B2A] text-[10px] font-bold rounded-full border border-[#DFA8B4]/30'
      badge.style.display = ''
    } else if (p.isBestSeller) {
      badge.textContent = 'Bestseller'
      badge.className = 'px-3 py-1 bg-[#A9C1A5]/15 text-[#5A8F5A] text-[10px] font-bold rounded-full border border-[#A9C1A5]/30'
      badge.style.display = ''
    } else {
      badge.style.display = 'none'
    }
  }

  /* Wishlist button */
  const wishBtn = $('#product-wishlist-btn')
  if (wishBtn) {
    wishBtn.dataset.productId = productId
    if (typeof wishlistHas === 'function' && wishlistHas(productId)) {
      wishBtn.classList.add('bg-[#DFA8B4]', 'text-white')
    }
  }
  const wishBtn2 = $('#add-to-wishlist-btn')
  if (wishBtn2) {
    wishBtn2.dataset.productId = productId
    if (typeof wishlistHas === 'function' && wishlistHas(productId)) {
      wishBtn2.classList.add('bg-[#DFA8B4]/10', 'border-[#DFA8B4]')
    }
  }

  /* Thumbnails */
  const thumbsContainer = $('#product-thumbnails')
  if (thumbsContainer && p.secondaryImages) {
    const allImages = [p.image, ...(p.secondaryImages || [])]
    const uniqueImages = allImages.filter((img, i) => allImages.indexOf(img) === i)
    thumbsContainer.innerHTML = uniqueImages.map((img, i) => {
      const imgExt = img.split('.').pop()
      const webpSrc = img.replace('.' + imgExt, '.webp')
      return `
        <button class="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 ${i === 0 ? 'border-[#70411B]' : 'border-transparent'} hover:border-[#70411B]/30 bg-[#F4E9E1] cursor-pointer transition-all duration-300 thumb-btn" data-img="${img}">
          <picture><source srcset="${webpSrc}" type="image/webp"><img src="${img}" alt="" class="w-full h-full object-cover" referrerpolicy="no-referrer" width="1024" height="1024" loading="lazy"/></picture>
        </button>`
    }).join('')
    thumbsContainer.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const imgSrc = this.dataset.img
        if (!imgSrc || !mainImg) return
        mainImg.src = imgSrc
        thumbsContainer.querySelectorAll('.thumb-btn').forEach(b => {
          b.classList.remove('border-[#70411B]')
          b.classList.add('border-transparent')
        })
        this.classList.remove('border-transparent')
        this.classList.add('border-[#70411B]')
      })
    })
  }

  /* Category */
  const catEl = $('#product-category')
  if (catEl) catEl.textContent = (categoryLabels?.[p.category] || p.category)

  /* Product Name */
  const nameEl = $('#product-name')
  if (nameEl) nameEl.textContent = p.name

  /* Rating */
  const ratingStars = $('#product-rating-stars')
  const ratingCount = $('#product-rating-count')
  if (ratingStars) {
    const r = p.rating || 5
    const full = Math.floor(r)
    let stars = ''
    for (let i = 0; i < 5; i++) stars += i < full ? '\u2605' : '\u2606'
    ratingStars.innerHTML = stars
  }
  if (ratingCount && p.reviews) {
    ratingCount.textContent = `(${p.reviews.length} reviews)`
  }

  /* Price */
  const priceEl = $('#product-price')
  if (priceEl) priceEl.textContent = formatPrice(p.price)

  /* Description */
  const descEl = $('#product-description')
  if (descEl) descEl.textContent = p.description || ''

  /* Color Swatches */
  const swatchContainer = $('#product-swatches')
  const colorLabel = $('#selected-color-name')
  if (swatchContainer && p.colorVariants && p.colorVariants.length) {
    swatchContainer.innerHTML = p.colorVariants.map((c, i) =>
      `<button class="w-7 h-7 rounded-full border-2 cursor-pointer transition-all hover:scale-110 product-color-swatch ${i === 0 ? 'border-[#70411B] scale-110' : 'border-transparent'}" data-color="${c.name}" style="background-color:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`
    ).join('')
    if (colorLabel) colorLabel.textContent = p.colorVariants[0]?.name || ''
    swatchContainer.querySelectorAll('.product-color-swatch').forEach(sw => {
      sw.addEventListener('click', function() {
        swatchContainer.querySelectorAll('.product-color-swatch').forEach(s => {
          s.classList.remove('border-[#70411B]', 'scale-110')
          s.classList.add('border-transparent')
        })
        this.classList.remove('border-transparent')
        this.classList.add('border-[#70411B]', 'scale-110')
        productPageColor = this.dataset.color || ''
        if (colorLabel) colorLabel.textContent = productPageColor
      })
    })
  }

  /* Quantity Controls */
  const qtyMinus = $('#qty-minus')
  const qtyPlus = $('#qty-plus')
  const qtyDisplay = $('#qty-display')
  if (qtyMinus && qtyPlus && qtyDisplay) {
    qtyMinus.addEventListener('click', () => {
      productPageQty = Math.max(1, productPageQty - 1)
      qtyDisplay.textContent = productPageQty
      updateProductCartButton(p)
    })
    qtyPlus.addEventListener('click', () => {
      productPageQty++
      qtyDisplay.textContent = productPageQty
      updateProductCartButton(p)
    })
  }

  /* Add to Cart button */
  const addBtn = $('#add-to-cart-btn')
  if (addBtn) {
    addBtn.dataset.productId = productId
    updateProductCartButton(p)
    addBtn.addEventListener('click', () => {
      cartAdd(productId, productPageQty, productPageColor)
    })
  }

  /* Materials */
  const materialsList = $('#product-materials')
  if (materialsList && p.materials) {
    materialsList.innerHTML = p.materials.map(m => `<li class="flex items-start gap-2 text-xs text-[#70411B]/70 font-sans"><span class="w-1 h-1 rounded-full bg-[#DFA8B4] mt-2 shrink-0"></span><span>${m}</span></li>`).join('')
  }

  /* Care Instructions */
  const careList = $('#product-care')
  if (careList && p.careInstructions) {
    careList.innerHTML = p.careInstructions.map(c => `<li class="flex items-start gap-2 text-xs text-[#70411B]/70 font-sans"><span class="w-1 h-1 rounded-full bg-[#A9C1A5] mt-2 shrink-0"></span><span>${c}</span></li>`).join('')
  }

  /* Size */
  const sizeEl = $('#product-size')
  if (sizeEl && p.size) {
    sizeEl.innerHTML = 'Size: <span class="font-semibold text-[#70411B]">' + p.size + '</span>'
    sizeEl.style.display = ''
  }

  /* Stock badge */
  const stockEl = $('#product-stock')
  if (stockEl && p.stockStatus) {
    const colors = { 'In Stock': 'text-[#5A8F5A]', 'Low Stock': 'text-amber-700', 'Pre-Order': 'text-[#9A5B2A]' }
    stockEl.textContent = p.stockStatus
    stockEl.className = 'text-[10px] font-bold ' + (colors[p.stockStatus] || 'text-[#5A8F5A]')
  }

  /* Tab switching */
  initProductTabs(p)

  /* Related Products */
  renderRelatedProducts(p, productId)

  /* Share buttons */
  initShareButtons(p)
}

/* ── UPDATE CART BUTTON TEXT ──────────────────────────────────────────────── */

function updateProductCartButton(p) {
  const addBtn = $('#add-to-cart-btn')
  if (!addBtn) return
  const total = p.price * productPageQty
  addBtn.innerHTML = `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    <span>Add to Cart — ${formatPrice(total)}</span>`
}

/* ── TABS ────────────────────────────────────────────────────────────────── */

function initProductTabs(p) {
  const tabs = $$('.product-tab')
  const content = $('#product-tab-content')
  if (!tabs.length || !content) return

  const tabData = {
    description: `<p>${p.description || 'Premium handcrafted crochet made with love in Haldwani using organic cotton yarns.'}</p>${p.size ? `<p class="mt-3 font-semibold text-[#70411B]">Size: ${p.size}</p>` : ''}`,
    story: p.story ? `<p class="italic">${p.story}</p>` : '<p class="text-[#70411B]/50">Story coming soon.</p>',
    materials: `<div class="space-y-3"><div><h4 class="font-bold text-[#70411B] mb-1.5">Materials</h4><ul class="space-y-1">${(p.materials || []).map(m => `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-[#DFA8B4] mt-2 shrink-0"></span><span>${m}</span></li>`).join('')}</ul></div><div><h4 class="font-bold text-[#70411B] mb-1.5">Care Instructions</h4><ul class="space-y-1">${(p.careInstructions || []).map(c => `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-[#A9C1A5] mt-2 shrink-0"></span><span>${c}</span></li>`).join('')}</ul></div></div>`,
    reviews: (p.reviews || []).length ? p.reviews.map(r => `<div class="border-b border-[#70411B]/5 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0"><div class="flex items-center gap-2 mb-1.5"><span class="text-lg">${r.avatar || '✨'}</span><span class="text-xs font-bold text-[#70411B]">${r.author}</span><span class="text-[10px] text-[#70411B]/40">${r.date}</span></div><div class="flex text-amber-500 text-xs mb-1">${renderStarsSmall(r.rating)}</div><p class="text-xs text-[#70411B]/70 leading-relaxed">${r.comment}</p></div>`).join('') : '<p class="text-xs text-[#70411B]/50">No reviews yet.</p>'
  }

  content.innerHTML = tabData.description

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => {
        t.classList.remove('active', 'text-[#70411B]', 'border-b-2', 'border-[#70411B]')
        t.classList.add('text-[#70411B]/50', 'border-b-2', 'border-transparent')
      })
      this.classList.add('active', 'text-[#70411B]', 'border-b-2', 'border-[#70411B]')
      this.classList.remove('text-[#70411B]/50', 'border-transparent')
      const key = this.dataset.tab
      if (tabData[key]) content.innerHTML = tabData[key]
    })
  })
}

function renderStarsSmall(rating) {
  const full = Math.floor(rating)
  let html = ''
  for (let i = 0; i < 5; i++) html += i < full ? '<span class="text-amber-500">&#9733;</span>' : '<span class="text-amber-300/40">&#9733;</span>'
  return html
}

/* ── RELATED PRODUCTS ────────────────────────────────────────────────────── */

function renderRelatedProducts(p, productId) {
  const grid = $('#related-products-grid')
  if (!grid) return

  const related = Object.values(products)
    .filter(x => x.id !== productId && x.category === p.category)
    .slice(0, 4)

  if (!related.length) {
    grid.innerHTML = '<p class="text-xs text-[#70411B]/50 col-span-full">No related products.</p>'
    return
  }

  grid.innerHTML = related.map(x => {
    const imgExt = x.image.split('.').pop()
    const webpSrc = x.image.replace('.' + imgExt, '.webp')
    return `
      <a href="product.html?id=${x.id}" class="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-[#70411B]/5 relative flex flex-col product-card" data-product-id="${x.id}">
        <div class="relative aspect-square overflow-hidden bg-[#F4E9E1]">
          <picture><source srcset="${webpSrc}" type="image/webp"><img src="${x.image}" alt="${x.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer" width="1024" height="1024" loading="lazy"/></picture>
        </div>
        <div class="p-5 flex flex-col items-start flex-grow">
          <span class="text-[10px] font-sans font-bold tracking-[0.15em] text-[#DFA8B4] uppercase mb-1.5">${categoryLabels?.[x.category] || x.category}</span>
          <h3 class="font-serif text-sm font-bold text-[#70411B] mb-1 leading-tight">${x.name}</h3>
          <div class="flex items-center justify-between w-full mt-auto pt-3 border-t border-[#70411B]/5">
            <span class="font-serif text-sm font-bold text-[#70411B]">${formatPrice(x.price)}</span>
            <div class="flex items-center gap-1 text-[#9A5B2A] text-xs"><span>&#9733;</span><span>${x.rating.toFixed(1)}</span></div>
          </div>
        </div>
      </a>`
  }).join('')
}

/* ── SHARE BUTTONS ───────────────────────────────────────────────────────── */

function initShareButtons(p) {
  $$('.share-product-btn').forEach(btn => {
    const platform = btn.dataset.platform
    const url = window.location.href
    if (platform === 'instagram') {
      btn.addEventListener('click', () => window.open('https://instagram.com/oouni_verse/', '_blank'))
    } else if (platform === 'whatsapp') {
      btn.addEventListener('click', () => window.open('https://wa.me/?text=' + encodeURIComponent('Check out ' + p.name + ' at ' + url), '_blank'))
    } else if (platform === 'copy') {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => showToast('Link copied!', ''))
      })
    }
  })
}

/* ── INIT ────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  if ($('#product-main-image') || $('#add-to-cart-btn')) {
    initProduct()
  }
})

/* ── Export ──────────────────────────────────────────────────────────────── */

window.initProduct = initProduct
window.productPageQty = productPageQty
