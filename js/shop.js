/* ═══════════════════════════════════════════════════════════════════════════
   SHOP — Product Rendering, Filtering, Search, Sort, Categories
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── STATE ──────────────────────────────────────────────────────────────── */

let currentCategory = 'all'
let currentSort = 'recommended'
let searchQuery = ''

/* ── CATEGORY LABELS ─────────────────────────────────────────────────────── */

const categoryLabels = {
  bags: 'Bags',
  plushies: 'Plushies',
  flowers: 'Eternal Flowers',
  keychains: 'Keychains',
  accessories: 'Accessories',
  coasters: 'Coasters',
  homedecor: 'Home Decor',
  wearables: 'Wearables'
}

/* ── RENDER PRODUCT CARDS ────────────────────────────────────────────────── */

function renderProductCards() {
  const grid = $('#product-grid')
  if (!grid || !window.products) return

  grid.innerHTML = ''
  const wishlistArr = store.get('wishlist', [])
  const productKeys = Object.keys(window.products)

  productKeys.forEach((key, index) => {
    const p = window.products[key]
    const isWishlisted = wishlistArr.includes(p.id)

    const card = document.createElement('div')
    card.className = 'group relative bg-[#FFF7F1] rounded-3xl p-4 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-[#70411B]/5 overflow-hidden flex flex-col justify-between product-card'
    card.dataset.productId = p.id
    card.dataset.category = p.category
    card.dataset.price = p.price
    card.dataset.rating = p.rating
    card.dataset.name = p.name.toLowerCase()
    card.dataset.tagline = (p.tagline || '').toLowerCase()
    card.dataset.description = (p.description || '').toLowerCase()
    card.setAttribute('data-aos', 'fade-up')
    card.setAttribute('data-aos-delay', String(Math.min(index * 100, 900)))

    const reviewCount = p.reviews ? p.reviews.length : 0
    const imgExt = p.image.split('.').pop()
    const webpSrc = p.image.replace('.' + imgExt, '.webp')
    const stockTag = p.stockStatus !== 'In Stock'
      ? `<span class="absolute top-6 right-6 z-25 px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-md ${p.stockStatus === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-800'}">${p.stockStatus}</span>`
      : ''

    card.innerHTML = `
      <div class="absolute inset-2 border border-dashed border-[#70411B]/15 rounded-2xl pointer-events-none group-hover:border-[#9A5B2A]/30 transition-colors duration-500"></div>
      <span class="absolute top-6 left-6 z-25 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#70411B] uppercase bg-[#FFF7F1]/80 backdrop-blur-sm border border-[#70411B]/15 rounded-md">${categoryLabels[p.category] || p.category}</span>
      ${stockTag}
      <div class="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F4E9E1] mb-5">
        <picture><source srcset="${webpSrc}" type="image/webp"><img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" referrerpolicy="no-referrer" width="1024" height="1024" loading="lazy"/></picture>
        <div class="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center gap-3">
          <button class="p-3 bg-[#FFF7F1] hover:bg-[#DFA8B4] hover:text-white text-[#70411B] rounded-full shadow-md hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer quick-view-btn" data-product-id="${p.id}" title="View">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="p-3 bg-[#FFF7F1] hover:bg-[#70411B] hover:text-white text-[#70411B] rounded-full shadow-md hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer add-to-cart" data-product-id="${p.id}" title="Cart">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
        <button class="absolute bottom-4 right-4 z-20 p-2.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer add-to-wishlist ${isWishlisted ? 'bg-[#DFA8B4] text-white' : 'bg-[#FFF7F1]/90 hover:bg-[#FFF7F1] text-[#70411B]'}" data-product-id="${p.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          <svg class="w-4 h-4 ${isWishlisted ? 'fill-current' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.5-1.5 2.5-3.5 2.5-5.5A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 2.5 8.5c0 2 1 3.5 2.5 5.5L12 22l7-8Z"/></svg>
        </button>
      </div>
      <div class="px-1 flex flex-col justify-between flex-grow">
        <div>
          <h3 class="font-serif text-lg font-bold text-[#70411B] tracking-wide mb-1 leading-tight group-hover:text-[#9A5B2A] transition-colors duration-300">${p.name}</h3>
          <p class="font-sans text-xs text-[#70411B]/75 italic mb-3 line-clamp-1">${p.tagline || ''}</p>
        </div>
        <div class="flex items-center justify-between mt-auto pt-3 border-t border-[#70411B]/10">
          <span class="font-serif text-lg font-bold text-[#70411B]">${formatPrice(p.price)}</span>
          <button class="px-4 py-2 bg-[#DFA8B4] text-white text-[10px] font-bold tracking-wider rounded-xl hover:bg-[#c9899f] hover:shadow-lg hover:shadow-[#DFA8B4]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer add-to-cart" data-product-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `
    grid.appendChild(card)
  })

  updateProductCount()
}

/* ── PRODUCT COUNT ───────────────────────────────────────────────────────── */

function updateProductCount() {
  const countEl = $('#product-count')
  if (!countEl) return
  const grid = $('#product-grid')
  if (!grid) return
  const visible = $$('.product-card', grid).filter(c => c.style.display !== 'none').length
  const total = Object.keys(window.products).length
  if (searchQuery || currentCategory !== 'all') {
    countEl.textContent = `${visible} of ${total} products`
  } else {
    countEl.textContent = `${total} products`
  }
}

/* ── FILTER / SORT ───────────────────────────────────────────────────────── */

function initShop() {
  const searchInput = $('#shop-search')
  const searchBtn = $('#shop-search-btn')
  const sortBtn = $('#shop-sort-btn')
  const sortMenu = $('#shop-sort-menu')
  const sortInput = $('#shop-sort')
  const sortText = $('#sort-selected-text')

  if (searchInput) {
    on(searchInput, 'input', debounce(function () {
      searchQuery = this.value.toLowerCase().trim()
      filterProducts()
    }, 200))

    on(searchInput, 'keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        searchQuery = this.value.toLowerCase().trim()
        filterProducts()
      }
    })
  }

  if (searchBtn) {
    on(searchBtn, 'click', function () {
      if (searchInput) {
        searchQuery = searchInput.value.toLowerCase().trim()
        filterProducts()
      }
    })
  }

  /* Custom sort dropdown */
  if (sortBtn && sortMenu) {
    const filterRow = $('#shop-filter-row')

    on(sortBtn, 'click', function (e) {
      e.stopPropagation()
      const isOpen = !sortMenu.classList.contains('hidden')
      sortMenu.classList.toggle('hidden', isOpen)
      sortBtn.setAttribute('aria-expanded', String(!isOpen))
      const chevron = sortBtn.querySelector('svg')
      if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)'
      if (filterRow) filterRow.style.paddingBottom = isOpen ? '' : '12rem'
    })

    on(sortMenu, 'click', function (e) {
      const opt = e.target.closest('.sort-option')
      if (!opt) return
      const val = opt.dataset.value
      currentSort = val
      if (sortInput) sortInput.value = val
      if (sortText) sortText.textContent = opt.textContent
      $$('.sort-option', sortMenu).forEach(o => {
        o.style.color = 'rgba(112,65,27,0.7)'
        o.style.background = ''
        o.style.fontWeight = '500'
        o.removeAttribute('aria-selected')
      })
      opt.style.color = '#70411B'
      opt.style.background = '#F4E9E1'
      opt.style.fontWeight = '600'
      opt.setAttribute('aria-selected', 'true')
      sortMenu.classList.add('hidden')
      sortBtn.setAttribute('aria-expanded', 'false')
      const chevron = sortBtn.querySelector('svg')
      if (chevron) chevron.style.transform = ''
      if (filterRow) filterRow.style.paddingBottom = ''
      filterProducts()
    })

    on(document, 'click', function () {
      sortMenu.classList.add('hidden')
      sortBtn.setAttribute('aria-expanded', 'false')
      const chevron = sortBtn.querySelector('svg')
      if (chevron) chevron.style.transform = ''
      if (filterRow) filterRow.style.paddingBottom = ''
    })
  }

  delegate(document, '.category-filter', 'click', (_, btn) => {
    const cat = btn.dataset.category
    if (!cat) return
    currentCategory = cat

    $$('.category-filter').forEach(b => {
      if (b === btn) {
        b.style.background = '#70411B'
        b.style.color = '#fff'
        b.style.borderColor = '#70411B'
      } else {
        b.style.background = '#fff'
        b.style.color = 'rgba(112,65,27,0.8)'
        b.style.borderColor = 'rgba(112,65,27,0.15)'
      }
    })

    filterProducts()
  })
}

function filterProducts() {
  const grid = $('#product-grid')
  if (!grid) return

  const cards = $$('.product-card', grid)
  let visibleCount = 0

  cards.forEach(card => {
    const cat = card.dataset.category
    const name = card.dataset.name || ''
    const tagline = card.dataset.tagline || ''
    const description = card.dataset.description || ''

    const matchCategory = currentCategory === 'all' || cat === currentCategory
    const matchSearch = !searchQuery ||
      name.includes(searchQuery) ||
      tagline.includes(searchQuery) ||
      description.includes(searchQuery)

    if (matchCategory && matchSearch) {
      card.style.display = ''
      visibleCount++
    } else {
      card.style.display = 'none'
    }
  })

  /* Sort visible cards */
  const visibleCards = cards.filter(c => c.style.display !== 'none')
  visibleCards.sort((a, b) => {
    const pA = parseFloat(a.dataset.price) || 0
    const pB = parseFloat(b.dataset.price) || 0
    const rA = parseFloat(a.dataset.rating) || 0
    const rB = parseFloat(b.dataset.rating) || 0

    switch (currentSort) {
      case 'price-low': return pA - pB
      case 'price-high': return pB - pA
      case 'rating': return rB - rA
      default: return 0
    }
  })

  visibleCards.forEach(card => grid.appendChild(card))

  /* Empty state */
  let emptyState = $('#shop-empty')
  if (visibleCount === 0) {
    if (!emptyState) {
      emptyState = document.createElement('div')
      emptyState.id = 'shop-empty'
      emptyState.className = 'col-span-full py-20 text-center'
      grid.appendChild(emptyState)
    }
    emptyState.style.display = ''
    emptyState.innerHTML = `
      <div class="text-5xl mb-4">🧸</div>
      <h3 class="font-serif text-xl font-bold text-[#70411B] mb-2">We searched high and low...</h3>
      <p class="text-xs text-[#70411B]/60 max-w-xs mx-auto mb-1">No matches found${searchQuery ? ' for "<strong>' + searchQuery + '</strong>"' : ''}</p>
      ${searchQuery ? '<button class="mt-4 px-4 py-2 text-xs font-bold text-[#9A5B2A] hover:text-[#70411B] transition-colors cursor-pointer" onclick="document.getElementById(\'shop-search\').value=\'\';searchQuery=\'\';filterProducts()">Clear Search</button>' : ''}
      <p class="text-[10px] text-[#70411B]/40 font-sans mt-3">Try a different category or search term</p>`
  } else {
    if (emptyState) emptyState.style.display = 'none'
  }

  updateProductCount()
}

/* ── INIT ────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  if ($('#shop-search') || $('#product-grid')) {
    renderProductCards()
    initShop()
  }
})

/* ── Export ──────────────────────────────────────────────────────────────── */

window.renderProductCards = renderProductCards
window.filterProducts = filterProducts
window.categoryLabels = categoryLabels
