/* ── ACCORDION (FAQ) ────────────────────────────────────────────────────── */

function initAccordion() {
  delegate(document, '.faq-question', 'click', (_, btn) => {
    const item = btn.closest('.faq-item')
    if (!item) return

    const isOpen = item.classList.contains('open')
    const answer = item.querySelector('.faq-answer')
    if (!answer) return

    $$('.faq-item.open').forEach(el => {
      if (el !== item) {
        el.classList.remove('open')
        const a = el.querySelector('.faq-answer')
        if (a) a.style.maxHeight = '0'
      }
    })

    if (isOpen) {
      item.classList.remove('open')
      btn.setAttribute('aria-expanded', 'false')
      answer.style.maxHeight = '0'
    } else {
      item.classList.add('open')
      btn.setAttribute('aria-expanded', 'true')
      answer.style.maxHeight = answer.scrollHeight + 'px'
    }
  })
}

/* ── PRODUCT MODAL ──────────────────────────────────────────────────────── */

// Global modal state
let currentModalProductId = null
let currentModalQty = 1
let currentModalColor = ''

function initProductModal() {
  const modal = $('#product-modal')
  const close = $('#product-modal-close')
  const content = $('#product-modal-content')
  if (!modal || !close || !content) return

  /* Qty controls inside modal (registered once) */
  delegate(modal, '.modal-qty-btn', 'click', (_, btn) => {
    const delta = parseInt(btn.dataset.delta)
    const qtyEl = $('#modal-qty')
    if (!qtyEl) return
    let qty = parseInt(qtyEl.textContent) || 1
    qty = Math.max(1, qty + delta)
    qtyEl.textContent = qty
    currentModalQty = qty
    /* Update button price */
    const addBtn = $('#modal-add-btn')
    const p = products[currentModalProductId]
    if (addBtn && p) {
      addBtn.querySelector('span').textContent = 'Add to Cart — ' + formatPrice(p.price * qty)
    }
  })

  /* Add to cart from modal (registered once) */
  delegate(modal, '.add-to-cart-modal, .add-to-cart', 'click', (_, btn) => {
    const id = currentModalProductId
    const qty = currentModalQty || 1
    const color = currentModalColor || ''
    cartAdd(id, qty, color)
    closeModal()
  })

  function starsHTML(rating) {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    let html = ''
    for (let i = 0; i < 5; i++) {
      if (i < full) html += '<span class="text-amber-500 text-sm">&#9733;</span>'
      else if (i === full && half) html += '<span class="text-amber-500 text-sm">&#9734;</span>'
      else html += '<span class="text-amber-300/40 text-sm">&#9733;</span>'
    }
    return html
  }

  function stockBadge(status) {
    const map = { 'In Stock': 'bg-[#A9C1A5]/20 text-[#5A8F5A] border-[#A9C1A5]/30', 'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200', 'Pre-Order': 'bg-[#DFA8B4]/15 text-[#9A5B2A] border-[#DFA8B4]/30' }
    return `<span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${map[status] || map['In Stock']}">${status || 'In Stock'}</span>`
  }

    function openModal(productId) {
      const p = products[productId]
      if (!p) return
      currentModalProductId = productId
      currentModalQty = 1
      currentModalColor = p.colorVariants?.[0]?.name || ''

    const rating = p.rating || 5
    const revs = p.reviews || []
    const secImgs = p.secondaryImages || [p.image]

    const colors = p.colorVariants && p.colorVariants.length
      ? p.colorVariants.map((c, i) => `<button class="w-7 h-7 rounded-full border-2 ${i === 0 ? 'border-[#70411B]' : 'border-transparent'} hover:border-[#70411B]/50 transition-all cursor-pointer color-swatch" data-color="${c.name}" style="background-color:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`).join('')
      : '<span class="text-xs text-[#70411B]/50">Standard</span>'

    const thumbnails = secImgs.map((img, i) => `
      <button class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-[#70411B]' : 'border-transparent'} hover:border-[#70411B]/30 bg-[#F4E9E1] cursor-pointer transition-all modal-thumb" data-img="${img}">
        <img src="${img}" alt="" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
      </button>`).join('')

    const reviewsHTML = revs.length ? revs.map(r => `
      <div class="border-b border-[#70411B]/5 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-lg">${r.avatar}</span>
          <span class="text-xs font-bold text-[#70411B]">${r.author}</span>
          <span class="text-[10px] text-[#70411B]/40">${r.date}</span>
        </div>
        <div class="flex text-amber-500 text-xs mb-1">${starsHTML(r.rating)}</div>
        <p class="text-xs text-[#70411B]/70 leading-relaxed">${r.comment}</p>
      </div>`).join('') : '<p class="text-xs text-[#70411B]/50">No reviews yet.</p>'

    /* Related products */
    const related = Object.values(products)
      .filter(x => x.id !== productId && x.category === p.category)
      .slice(0, 4)
    const relatedHTML = related.length ? related.map(x => `
      <div class="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#70411B]/5 cursor-pointer product-card" data-product-id="${x.id}">
        <div class="aspect-square overflow-hidden bg-[#F4E9E1]">
          <img src="${x.image}" alt="${x.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer" />
        </div>
        <div class="p-3">
          <h4 class="font-serif text-xs font-bold text-[#70411B] truncate">${x.name}</h4>
          <span class="text-xs font-bold text-[#70411B]">${formatPrice(x.price)}</span>
        </div>
      </div>`).join('') : '<p class="text-xs text-[#70411B]/50">No related products.</p>'

    const materialsList = p.materials ? p.materials.map(m => `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-[#DFA8B4] mt-2 shrink-0"></span><span>${m}</span></li>`).join('') : '<li class="text-[#70411B]/50">Not specified</li>'
    const careList = p.careInstructions ? p.careInstructions.map(c => `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-[#A9C1A5] mt-2 shrink-0"></span><span>${c}</span></li>`).join('') : '<li class="text-[#70411B]/50">Not specified</li>'

    content.innerHTML = `
      <div class="px-6 pb-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div class="lg:col-span-6 flex flex-col gap-4">
            <div class="aspect-square w-full rounded-[24px] overflow-hidden bg-[#F4E9E1] border border-[#70411B]/5" id="modal-main-img-container">
              <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer" id="modal-main-img" />
            </div>
            <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-none" id="modal-thumbnails">${thumbnails}</div>
          </div>
          <div class="lg:col-span-6 flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] font-bold tracking-widest text-[#9A5B2A] uppercase">${p.category}</span>
              ${stockBadge(p.stockStatus)}
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-[#70411B] tracking-wide mb-2 leading-tight">${p.name}</h2>
            ${p.tagline ? `<p class="text-xs text-[#70411B]/60 font-medium mb-3 italic">&ldquo;${p.tagline}&rdquo;</p>` : ''}
            <div class="flex items-center gap-2 mb-4 text-sm">
              <div class="flex">${starsHTML(rating)}</div>
              <span class="font-bold text-[#70411B]">${rating.toFixed(1)}</span>
              <span class="text-[#70411B]/50 font-medium">(${revs.length || 0} reviews)</span>
            </div>
            <p class="text-3xl font-serif mb-4 text-[#70411B]">${formatPrice(p.price)}</p>

            <!-- Description + Story -->
            <div class="mb-5">
              <div class="flex gap-4 border-b border-[#70411B]/10 text-xs font-bold" id="modal-tabs">
                <button class="modal-tab active pb-2 text-[#70411B] border-b-2 border-[#70411B]" data-tab="desc">Description</button>
                <button class="modal-tab pb-2 text-[#70411B]/50 hover:text-[#70411B] border-b-2 border-transparent" data-tab="story">Story</button>
                <button class="modal-tab pb-2 text-[#70411B]/50 hover:text-[#70411B] border-b-2 border-transparent" data-tab="care">Materials & Care</button>
                <button class="modal-tab pb-2 text-[#70411B]/50 hover:text-[#70411B] border-b-2 border-transparent" data-tab="reviews">Reviews</button>
              </div>
              <div class="mt-4 text-xs text-[#70411B]/75 leading-relaxed max-h-48 overflow-y-auto" id="modal-tab-content">
                <p>${p.description || 'Premium handcrafted crochet made with love in Haldwani using organic cotton yarns.'}</p>
                ${p.size ? `<p class="mt-3 font-semibold text-[#70411B]">Size: ${p.size}</p>` : ''}
              </div>
            </div>

            <!-- Color Swatches -->
            <div class="mb-5">
              <h3 class="text-[10px] font-bold tracking-wider text-[#70411B] uppercase mb-2">Color: <span class="font-semibold text-[#9A5B2A]" id="modal-selected-color">${p.colorVariants?.[0]?.name || 'Standard'}</span></h3>
              <div class="flex gap-2.5 flex-wrap">${colors}</div>
            </div>

            <!-- Qty + Add to Cart -->
            <div class="bg-[#FFF7F1] pt-4 border-t border-[#70411B]/5 mt-auto">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div class="flex items-center justify-between border-2 border-[#70411B]/15 rounded-xl px-4 py-2 bg-white sm:w-32">
                  <button class="text-lg font-bold text-[#70411B] hover:text-[#9A5B2A] w-6 text-center cursor-pointer modal-qty-btn" data-delta="-1">-</button>
                  <span class="font-mono font-bold w-8 text-center text-[#70411B]" id="modal-qty">1</span>
                  <button class="text-lg font-bold text-[#70411B] hover:text-[#9A5B2A] w-6 text-center cursor-pointer modal-qty-btn" data-delta="1">+</button>
                </div>
                <button style="background: linear-gradient(to right, #DFA8B4, #c9899f); box-shadow: 0 4px 15px rgba(223,168,180,0.3); color: #fff;" onmouseover="this.style.background='linear-gradient(to right, #c9899f, #DFA8B4)'; this.style.boxShadow='0 8px 25px rgba(223,168,180,0.5)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='linear-gradient(to right, #DFA8B4, #c9899f)'; this.style.boxShadow='0 4px 15px rgba(223,168,180,0.3)'; this.style.transform='translateY(0)'" class="flex-grow py-4 font-bold tracking-wide rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer add-to-cart-modal" data-product-id="${productId}" id="modal-add-btn">
                  <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span>Add to Cart — ${formatPrice(p.price)}</span>
                </button>
              </div>
              <div class="mt-3.5 p-3 rounded-xl bg-[#A9C1A5]/25 border border-[#A9C1A5]/40 text-[#70411B] text-xs font-semibold flex items-center gap-2 justify-center">
                <svg class="w-4 h-4 text-[#A9C1A5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 1-6 6 6 6 0 0 1-6-6c0-3.3 2.7-6 6-6s6 2.7 6 6Z"/><path d="M12 14v8"/><path d="M8 22h8"/></svg>
                <span>Free shipping across India &#x2022; Made to order in 10&ndash;15 days</span>
              </div>
            </div>
          </div>
        </div>

        ${related.length ? `<div class="mt-12 pt-8 border-t border-[#70411B]/10"><h3 class="font-serif text-lg font-bold text-[#70411B] mb-5">You May Also Love</h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${relatedHTML}</div></div>` : ''}
      </div>`

    modal.classList.add('open')
    if (!modal._isOpen) {
      modal._isOpen = true
      modal._scrollY = window.scrollY
      document.body.style.top = -modal._scrollY + 'px'
      document.body.style.position = 'fixed'
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    }
    /* Scroll modal content back to top when navigating between products */
    content.scrollTop = 0
    modal.scrollTop = 0

    /* Tab switching */
    const tabs = modal.querySelectorAll('.modal-tab')
    const tabContent = modal.querySelector('#modal-tab-content')
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => { t.classList.remove('active', 'text-[#70411B]', 'border-[#70411B]'); t.classList.add('text-[#70411B]/50', 'border-transparent') })
        this.classList.add('active', 'text-[#70411B]', 'border-[#70411B]')
        this.classList.remove('text-[#70411B]/50', 'border-transparent')
        const t = this.dataset.tab
        if (t === 'desc') tabContent.innerHTML = `<p>${p.description || 'Premium handcrafted crochet made with love in Haldwani.'}</p>${p.size ? `<p class="mt-3 font-semibold text-[#70411B]">Size: ${p.size}</p>` : ''}`
        else if (t === 'story') tabContent.innerHTML = p.story ? `<p>${p.story}</p>` : '<p class="text-[#70411B]/50">Story coming soon.</p>'
        else if (t === 'care') tabContent.innerHTML = `<div class="space-y-3"><div><h4 class="font-bold text-[#70411B] mb-1.5">Materials</h4><ul class="space-y-1">${materialsList}</ul></div><div><h4 class="font-bold text-[#70411B] mb-1.5">Care Instructions</h4><ul class="space-y-1">${careList}</ul></div></div>`
        else if (t === 'reviews') tabContent.innerHTML = reviewsHTML
      })
    })

    /* Thumbnail switching — handled by animations.js crossfade */
    /* Color swatch switching */
    modal.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', function() {
        modal.querySelectorAll('.color-swatch').forEach(s => { s.className = s.className.replace(/border-\[\#70411B\]/g, 'border-transparent') })
        this.className = this.className.replace(/border-transparent/g, 'border-[#70411B]')
        const label = modal.querySelector('#modal-selected-color')
        if (label && this.title) label.textContent = this.title
        currentModalColor = this.title || ''
      })
    })
  }

  function closeModal() {
    modal.classList.remove('open')
    modal._isOpen = false
    const scrollY = modal._scrollY || 0
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    window.scrollTo(0, scrollY)
  }

  on(close, 'click', closeModal)
  on(document, 'keydown', e => { if (e.key === 'Escape') closeModal() })
  on(modal, 'click', e => { if (e.target === modal || e.target.closest('.product-modal-backdrop')) closeModal() })

  /* Open modal from product card click (including related cards inside modal) */
  delegate(document, '.product-card', 'click', (e, card) => {
    if (e.target.closest('.add-to-cart') || e.target.closest('.add-to-wishlist')) return
    const id = card.dataset.productId
    if (id) openModal(id)
  })
}

/* ── GALLERY LIGHTBOX ────────────────────────────────────────────────────── */

function initGalleryLightbox() {
  const gallery = $('.gallery-item, [class*="columns-"]')
  if (!gallery) return

  let activeLightbox = null

  function closeActiveLightbox() {
    if (!activeLightbox) return
    activeLightbox.classList.remove('open')
    setTimeout(() => { if (activeLightbox?.parentNode) activeLightbox.remove() }, 400)
    document.body.style.overflow = ''
    activeLightbox = null
  }

  on(document, 'keydown', function(e) {
    if (e.key === 'Escape') closeActiveLightbox()
  })

  delegate(document, '.gallery-item', 'click', (_, item) => {
    const img = item.querySelector('img')
    const title = item.querySelector('.font-serif.font-bold')?.textContent || 'Gallery'
    const desc = item.querySelector('.text-xs.text-\\[#70411B\\]')?.textContent || ''
    const src = img?.getAttribute('src') || ''

    const lightbox = document.createElement('div')
    lightbox.className = 'lightbox open'
    lightbox.innerHTML = `
      <div class="lightbox-backdrop" id="lightbox-close"></div>
      <div class="lightbox-content">
        <button id="lightbox-close-btn" class="absolute top-5 right-5 z-30 p-2 rounded-full bg-white border border-[#70411B]/15 text-[#70411B] hover:bg-[#70411B] hover:text-white transition-colors cursor-pointer">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div class="aspect-[4/3] w-full overflow-hidden bg-[#F4E9E1]">
          <img src="${src}" alt="${title}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>
        <div class="p-6 md:p-8 text-left">
          <h3 class="font-serif text-2xl font-bold text-[#70411B] tracking-wide mb-2">${title}</h3>
          <p class="text-sm text-[#70411B]/80 leading-relaxed">${desc}</p>
        </div>
      </div>`
    document.body.appendChild(lightbox)
    document.body.style.overflow = 'hidden'
    activeLightbox = lightbox

    const backdrop = lightbox.querySelector('#lightbox-close')
    if (backdrop) on(backdrop, 'click', closeActiveLightbox)
    const closeBtn = lightbox.querySelector('#lightbox-close-btn')
    if (closeBtn) on(closeBtn, 'click', closeActiveLightbox)
  })
}

/* ── LOOM STUDIO CUSTOMIZER ────────────────────────────────────────────── */

function initLoomStudio() {
  const playground = $('#playground-render')
  if (!playground) return

  window.customBase = 'Coaster'
  window.customColor = '#F7D8DE'
  window.customColorName = 'Peach Sorbet'
  window.customAccessory = 'Flower Crown'
  window.customLabel = ''

  const basePrices = { 'Coaster': 450, 'Octo Plushie': 750, 'Hair Bow': 350 }

  function setAllColors(hex) {
    /* Coaster */
    const coaster = $('#render-coaster')
    if (coaster) coaster.style.backgroundColor = hex
    /* Octopus head + tentacles */
    const octoHead = $('#octo-head')
    if (octoHead) octoHead.style.backgroundColor = hex
    $$('.octo-tentacle').forEach(t => t.style.backgroundColor = hex)
    /* Hair bow parts */
    const bowL = $('#bow-left'), bowR = $('#bow-right'), bowC = $('#bow-center')
    const bowTL = $('#bow-tail-l'), bowTR = $('#bow-tail-r')
    if (bowL) bowL.style.backgroundColor = hex
    if (bowR) bowR.style.backgroundColor = hex
    if (bowC) bowC.style.backgroundColor = hex
    if (bowTL) bowTL.style.backgroundColor = hex
    if (bowTR) bowTR.style.backgroundColor = hex
  }

  function updatePreview() {
    const base = window.customBase
    const hex = window.customColor
    const acc = window.customAccessory

    /* Show correct render, hide others */
    const coasterEl = $('#render-coaster')
    const octoEl = $('#render-octopus')
    const bowEl = $('#render-hairbow')
    if (coasterEl) coasterEl.classList.toggle('hidden', base !== 'Coaster')
    if (octoEl) octoEl.classList.toggle('hidden', base !== 'Octo Plushie')
    if (bowEl) bowEl.classList.toggle('hidden', base !== 'Hair Bow')

    /* Apply color to all visible elements */
    setAllColors(hex)

    /* Coaster accessory */
    const coasterAcc = $('#coaster-accessory')
    if (coasterAcc) {
      coasterAcc.classList.toggle('hidden', acc === 'None')
      if (acc === 'Flower Crown') coasterAcc.innerHTML = '&#x1F338;'
      else if (acc === 'Cosy Scarf') coasterAcc.innerHTML = '&#x1F9E3;'
      else if (acc === 'Mini Satin Bow') coasterAcc.innerHTML = '&#x1F380;'
    }

    /* Octopus accessory */
    const octoAcc = $('#octo-accessory')
    if (octoAcc) {
      octoAcc.classList.toggle('hidden', acc === 'None')
      if (acc === 'Flower Crown') octoAcc.innerHTML = '&#x1F338;'
      else if (acc === 'Cosy Scarf') octoAcc.innerHTML = '&#x1F9E3;'
      else if (acc === 'Mini Satin Bow') octoAcc.innerHTML = '&#x1F380;'
    }

    /* Hair bow accessory */
    const bowAcc = $('#bow-accessory')
    if (bowAcc) {
      bowAcc.classList.toggle('hidden', acc === 'None')
      if (acc === 'Flower Crown') bowAcc.innerHTML = '&#x1F338;'
      else if (acc === 'Cosy Scarf') bowAcc.innerHTML = '&#x1F9E3;'
      else if (acc === 'Mini Satin Bow') bowAcc.innerHTML = '&#x1F380;'
    }

    /* Label on coaster */
    const coasterLabel = $('#coaster-label')
    if (coasterLabel && base === 'Coaster') {
      coasterLabel.textContent = window.customLabel || '\u2615\uFE0F'
    }

    /* Label on octopus */
    const octoLabel = $('#octo-label')
    const octoLabelText = $('#octo-label-text')
    if (octoLabel && base === 'Octo Plushie') {
      if (window.customLabel) {
        octoLabel.classList.remove('hidden')
        if (octoLabelText) octoLabelText.textContent = window.customLabel
      } else {
        octoLabel.classList.add('hidden')
      }
    }

    /* Label on hair bow */
    const bowLabel = $('#bow-label')
    const bowLabelText = $('#bow-label-text')
    if (bowLabel && base === 'Hair Bow') {
      if (window.customLabel) {
        bowLabel.classList.remove('hidden')
        if (bowLabelText) bowLabelText.textContent = window.customLabel
      } else {
        bowLabel.classList.add('hidden')
      }
    }

    /* Update price */
    let price = basePrices[base] || 450
    if (acc && acc !== 'None') price += 100
    if (window.customLabel) price += 120
    const priceEl = $('#price-display')
    if (priceEl) priceEl.textContent = '\u20B9' + price
  }

  /* Base selection */
  delegate(document, '.base-btn', 'click', (_, btn) => {
    window.customBase = btn.dataset.base
    $$('.base-btn').forEach(b => {
      const active = b.dataset.base === window.customBase
      b.style.borderColor = active ? '#70411B' : 'rgba(112,65,27,0.1)'
      b.style.backgroundColor = active ? 'rgba(112,65,27,0.05)' : ''
      b.style.color = active ? '#70411B' : 'rgba(112,65,27,0.6)'
    })
    updatePreview()
  })

  /* Color selection */
  delegate(document, '.color-btn', 'click', (_, btn) => {
    window.customColor = btn.dataset.hex
    window.customColorName = btn.dataset.color
    $$('.color-btn').forEach(b => {
      const active = b.dataset.hex === window.customColor
      b.style.borderColor = active ? '#70411B' : 'transparent'
      const check = b.querySelector('svg')
      if (check) check.style.display = active ? '' : 'none'
    })
    const colorNameDisplay = $('#color-name-display')
    if (colorNameDisplay) colorNameDisplay.textContent = window.customColorName
    updatePreview()
  })

  /* Accessory selection */
  delegate(document, '.acc-btn', 'click', (_, btn) => {
    window.customAccessory = btn.dataset.accessory
    $$('.acc-btn').forEach(b => {
      const active = b.dataset.accessory === window.customAccessory
      b.style.borderColor = active ? '#70411B' : 'rgba(112,65,27,0.1)'
      b.style.backgroundColor = active ? 'rgba(112,65,27,0.05)' : ''
      b.style.color = active ? '#70411B' : 'rgba(112,65,27,0.5)'
    })
    updatePreview()
  })

  /* Text label input */
  const labelInput = $('#text-label-input')
  if (labelInput) {
    on(labelInput, 'input', function () {
      window.customLabel = this.value.trim().toUpperCase()
      updatePreview()
    })
  }

  /* Initial highlight for base */
  $$('.base-btn').forEach(b => {
    const active = b.dataset.base === window.customBase
    b.style.borderColor = active ? '#70411B' : 'rgba(112,65,27,0.1)'
    b.style.backgroundColor = active ? 'rgba(112,65,27,0.05)' : ''
    b.style.color = active ? '#70411B' : 'rgba(112,65,27,0.6)'
  })

  /* Initial highlight for color */
  $$('.color-btn').forEach(b => {
    const active = b.dataset.hex === window.customColor
    b.style.borderColor = active ? '#70411B' : 'transparent'
    const check = b.querySelector('svg')
    if (check) check.style.display = active ? '' : 'none'
  })

  /* Initial highlight for accessory */
  $$('.acc-btn').forEach(b => {
    const active = b.dataset.accessory === window.customAccessory
    b.style.borderColor = active ? '#70411B' : 'rgba(112,65,27,0.1)'
    b.style.backgroundColor = active ? 'rgba(112,65,27,0.05)' : ''
    b.style.color = active ? '#70411B' : 'rgba(112,65,27,0.5)'
  })

  updatePreview()
}

/* ── MOBILE MENU ─────────────────────────────────────────────────────────── */

function initMobileMenu() {
  const toggle = $('#mobile-menu-toggle')
  const menu = $('#mobile-menu')
  if (!toggle || !menu) return

  on(toggle, 'click', () => {
    const isOpen = menu.classList.contains('open')
    if (isOpen) {
      menu.classList.remove('open')
      document.body.style.overflow = ''
    } else {
      menu.classList.add('open')
      document.body.style.overflow = 'hidden'
      /* Stagger menu items */
      menu.querySelectorAll('a').forEach((link, i) => {
        link.style.opacity = '0'
        link.style.transform = 'translateX(-20px)'
        link.style.transition = `opacity 0.4s ease-out ${i * 0.08 + 0.2}s, transform 0.4s ease-out ${i * 0.08 + 0.2}s`
        requestAnimationFrame(() => {
          link.style.opacity = '1'
          link.style.transform = 'translateX(0)'
        })
      })
    }
  })

  $$('#mobile-menu a').forEach(link => {
    on(link, 'click', () => {
      menu.classList.remove('open')
      document.body.style.overflow = ''
    })
  })
}

/* ── GALLERY LIKE TOGGLE ─────────────────────────────────────────────────── */

function initGalleryLikes() {
  delegate(document, '.gallery-like-btn', 'click', (_, btn) => {
    const countEl = btn.querySelector('.like-count')
    const heart = btn.querySelector('svg')
    if (!countEl) return

    let count = parseInt(countEl.textContent) || 0
    const isLiked = btn.dataset.liked === 'true'
    if (isLiked) {
      count--
      btn.dataset.liked = 'false'
      btn.style.color = ''
      if (heart) heart.style.fill = 'none'
    } else {
      count++
      btn.dataset.liked = 'true'
      btn.style.color = '#DFA8B4'
      if (heart) heart.style.fill = 'currentColor'
    }
    countEl.textContent = count
  })
}

/* ── PAGE TRANSITIONS ───────────────────────────────────────────────────── */

function initPageTransitions() {
  const root = $('#root')
  if (!root) return

  /* Intercept internal links for exit animation */
  on(document, 'click', function(e) {
    const link = e.target && typeof e.target.closest === 'function' ? e.target.closest('a[href]') : null
    if (!link) return
    if (e.defaultPrevented) return

    const href = link.getAttribute('href')
    if (!href) return

    /* Skip if modifier keys pressed (open in new tab) */
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return

    /* Only handle internal page-to-page navigation */
    const isHash = href.startsWith('#')
    const isExternal = href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')
    if (isHash || isExternal) return

    /* Skip download links or external targets */
    if (link.hasAttribute('download') || link.target === '_blank') return

    e.preventDefault()

    root.classList.add('page-exit')

    /* Navigate after exit animation completes */
    const duration = 420
    const start = performance.now()
    function poll() {
      if (performance.now() - start >= duration) {
        window.location.href = href
      } else {
        requestAnimationFrame(poll)
      }
    }
    requestAnimationFrame(poll)
  })
}

/* ── INITIALIZE ALL ──────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  initAnimations()
  initCartWishlist()
  initAccordion()
  initProductModal()
  initGalleryLightbox()
  initLoomStudio()
  initMobileMenu()
  initGalleryLikes()
  initPageTransitions()
})
