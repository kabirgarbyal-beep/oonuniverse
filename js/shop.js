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
    card.className = 'group relative bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#DFA8B4]/20 transition-all duration-500 border border-[#70411B]/5 hover:-translate-y-2 flex flex-col justify-between product-card cursor-pointer'
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
      ? `<span class="absolute top-3 right-3 z-20 px-3 py-1.5 text-[9px] font-bold tracking-wider rounded-full ${p.stockStatus === 'Low Stock' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'}">${p.stockStatus}</span>`
      : ''

    card.innerHTML = `
      <div class="relative aspect-square w-full rounded-t-[20px] overflow-hidden bg-gradient-to-br from-[#F7D8DE]/40 via-[#F4E9E1] to-[#FFF7F1]">
        <picture><source srcset="${webpSrc}" type="image/webp"><img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" referrerpolicy="no-referrer" width="1024" height="1024" loading="lazy"/></picture>
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <button style="background: linear-gradient(135deg, #DFA8B4, #c9899f); box-shadow: 0 4px 15px rgba(223,168,180,0.4);" onmouseover="this.style.boxShadow='0 6px 20px rgba(223,168,180,0.6)'; this.style.transform='scale(1.1)'" onmouseout="this.style.boxShadow='0 4px 15px rgba(223,168,180,0.4)'; this.style.transform='scale(1)'" class="p-3 text-white rounded-full cursor-pointer quick-view-btn transition-all duration-300" data-product-id="${p.id}" title="Quick View">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button style="background: linear-gradient(135deg, #70411B, #9A5B2A); box-shadow: 0 4px 15px rgba(112,65,27,0.3);" onmouseover="this.style.boxShadow='0 6px 20px rgba(112,65,27,0.5)'; this.style.transform='scale(1.1)'" onmouseout="this.style.boxShadow='0 4px 15px rgba(112,65,27,0.3)'; this.style.transform='scale(1)'" class="p-3 text-white rounded-full cursor-pointer add-to-cart transition-all duration-300" data-product-id="${p.id}" title="Add to Cart">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
        <button onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" class="absolute bottom-3 right-3 z-20 p-2 rounded-full shadow-md transition-all duration-300 cursor-pointer add-to-wishlist ${isWishlisted ? 'bg-[#DFA8B4] text-white' : 'bg-white/90 hover:bg-white text-[#70411B]'}" data-product-id="${p.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          <svg class="w-4 h-4 ${isWishlisted ? 'fill-current' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.5-1.5 2.5-3.5 2.5-5.5A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 2.5 8.5c0 2 1 3.5 2.5 5.5L12 22l7-8Z"/></svg>
        </button>
        ${stockTag}
        <span class="absolute top-3 left-3 z-20 px-3 py-1.5 text-[9px] font-bold tracking-[0.15em] text-[#70411B] uppercase bg-white/80 backdrop-blur-sm rounded-full border border-[#70411B]/10">${categoryLabels[p.category] || p.category}</span>
        ${p.isBestSeller ? '<span class="absolute top-3 right-3 z-20 px-3 py-1.5 text-[9px] font-bold tracking-[0.15em] text-white uppercase rounded-full" style="background: linear-gradient(135deg, #DFA8B4, #c9899f); box-shadow: 0 2px 10px rgba(223,168,180,0.4);">Best Seller</span>' : ''}
      </div>
      <div class="p-5 flex flex-col flex-grow">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-serif text-base font-bold text-[#70411B] tracking-wide leading-snug group-hover:text-[#9A5B2A] transition-colors duration-300 line-clamp-2">${p.name}</h3>
          <div class="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full">
            <svg class="w-3 h-3 text-amber-500 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="text-[10px] font-bold text-[#70411B]">${p.rating}</span>
          </div>
        </div>
        <p class="font-sans text-[11px] text-[#70411B]/55 mb-4 line-clamp-2 leading-relaxed">${p.tagline || ''}</p>
        <div class="mt-auto pt-3 border-t border-[#70411B]/8">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-serif text-xl font-bold text-[#70411B]">${formatPrice(p.price)}</span>
              <span class="block text-[9px] text-[#70411B]/40 font-sans font-medium mt-0.5">${reviewCount} reviews</span>
            </div>
            <button style="background: linear-gradient(to right, #DFA8B4, #c9899f); box-shadow: 0 4px 15px rgba(223,168,180,0.3); color: #fff;" onmouseover="this.style.background='linear-gradient(to right, #c9899f, #DFA8B4)'; this.style.boxShadow='0 6px 20px rgba(223,168,180,0.5)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='linear-gradient(to right, #DFA8B4, #c9899f)'; this.style.boxShadow='0 4px 15px rgba(223,168,180,0.3)'; this.style.transform='translateY(0)'" class="px-4 py-2 text-[10px] font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer add-to-cart" data-product-id="${p.id}">Add to Cart</button>
          </div>
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
        o.style.color = 'rgba(112,65,27,0.6)'
        o.style.background = ''
        o.style.fontWeight = '500'
        const dot = o.querySelector('span')
        if (dot) { dot.style.background = '#F4E9E1' }
        o.removeAttribute('aria-selected')
      })
      opt.style.color = '#70411B'
      opt.style.background = 'linear-gradient(90deg, rgba(247,216,222,0.3), transparent)'
      opt.style.fontWeight = '600'
      const activeDot = opt.querySelector('span')
      if (activeDot) { activeDot.style.background = '#DFA8B4' }
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
        b.style.background = 'linear-gradient(135deg, #DFA8B4, #c9899f)'
        b.style.color = '#fff'
        b.style.borderColor = 'transparent'
        b.style.boxShadow = '0 4px 15px rgba(223,168,180,0.3)'
      } else {
        b.style.background = 'rgba(255,255,255,0.8)'
        b.style.color = 'rgba(112,65,27,0.7)'
        b.style.borderColor = 'rgba(112,65,27,0.1)'
        b.style.boxShadow = ''
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
