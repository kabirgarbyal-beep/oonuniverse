/* ═══════════════════════════════════════════════════════════════════════════
   CART — State, Actions, UI, Checkout, Wishlist
   All ecommerce logic matching React source exactly.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── STATE ──────────────────────────────────────────────────────────────── */

let cart = []
let wishlist = []
let appliedCoupon = null
let checkoutStep = 'cart'
let checkoutData = { name: '', email: '', phone: '', address: '' }

try {
  cart = store.get('cart', []) || []
  wishlist = store.get('wishlist', []) || []
  appliedCoupon = store.get('coupon', null)
  checkoutData = store.get('checkout', checkoutData)
} catch (e) {
  cart = []
  wishlist = []
}

/* ── CONSTANTS ──────────────────────────────────────────────────────────── */

const WHATSAPP_NUMBER = '919876543210'
const PACKAGING_FEE = 2.50

/* ── CART ACTIONS ────────────────────────────────────────────────────────── */

/**
 * Add item to cart.
 * @param {string} id - Product ID
 * @param {number} qty - Quantity (default 1)
 * @param {string} color - Selected color variant name (optional)
 */
function cartAdd(id, qty = 1, color = '') {
  const existing = cart.find(i => i.id === id && i.color === color)
  if (existing) {
    existing.qty += qty
  } else {
    cart.push({ id, qty, color })
  }
  saveCart()
  updateCartUI()
  updateWishlistButtons()
  showToast(id, 'added to cart!')
}

/**
 * Remove item from cart by ID.
 */
function cartRemove(id) {
  cart = cart.filter(i => i.id !== id)
  saveCart()
  updateCartUI()
}

/**
 * Update quantity of a cart item. Replaces qty absolutely.
 */
function cartSetQty(id, qty) {
  const item = cart.find(i => i.id === id)
  if (!item) return
  item.qty = Math.max(1, qty)
  saveCart()
  updateCartUI()
}

/**
 * Update quantity by delta (+/-).
 */
function cartUpdateQty(id, delta) {
  const item = cart.find(i => i.id === id)
  if (!item) return
  item.qty = Math.max(1, item.qty + delta)
  saveCart()
  updateCartUI()
}

/**
 * Total number of items (sum of quantities).
 */
function cartCount() {
  return cart.reduce((s, i) => s + i.qty, 0)
}

/**
 * Subtotal before discount.
 */
function cartSubtotal() {
  return cart.reduce((s, i) => s + (products[i.id]?.price || 0) * i.qty, 0)
}

/**
 * Packaging fee.
 */
function getPackagingFee() {
  return cart.length > 0 ? PACKAGING_FEE : 0
}

/**
 * Clear entire cart.
 */
function cartClear() {
  cart = []
  saveCart()
  updateCartUI()
}

function saveCart() {
  store.set('cart', cart)
}

/* ── WISHLIST ACTIONS ────────────────────────────────────────────────────── */

/**
 * Toggle product in wishlist.
 */
function wishlistToggle(id) {
  const idx = wishlist.indexOf(id)
  if (idx > -1) {
    wishlist.splice(idx, 1)
    showToast(products[id]?.name || 'Item', 'removed from wishlist')
  } else {
    wishlist.push(id)
    showToast(products[id]?.name || 'Item', 'added to wishlist!')
  }
  store.set('wishlist', wishlist)
  updateWishlistUI()
  updateWishlistButtons()
}

/**
 * Check if product is in wishlist.
 */
function wishlistHas(id) {
  return wishlist.indexOf(id) > -1
}

/**
 * Move item from wishlist to cart.
 */
function moveToCartFromWishlist(id) {
  if (!products[id]) return
  const color = products[id].colorVariants?.[0]?.name || ''
  cartAdd(id, 1, color)
  wishlistToggle(id)
}

/**
 * Move item from cart to wishlist.
 */
function moveToWishlistFromCart(id) {
  if (!wishlistHas(id)) {
    wishlist.push(id)
    store.set('wishlist', wishlist)
  }
  cartRemove(id)
  showToast(products[id]?.name || 'Item', 'moved to wishlist')
}

/* ── COUPON FUNCTIONS ────────────────────────────────────────────────────── */

function applyCoupon(code) {
  const c = COUPONS[code.toUpperCase()]
  if (!c) {
    showToast(code, 'is not a valid coupon')
    return false
  }
  appliedCoupon = code.toUpperCase()
  store.set('coupon', appliedCoupon)
  updateCartUI()
  showToast(appliedCoupon, 'applied! ' + (c.type === 'fixed' ? formatPrice(c.discount) + ' off' : c.discount + '% off'))
  return true
}

function removeCoupon() {
  appliedCoupon = null
  store.remove('coupon')
  updateCartUI()
}

function getDiscount() {
  if (!appliedCoupon) return 0
  const c = COUPONS[appliedCoupon]
  if (!c) return 0
  const total = cartSubtotal()
  if (total < (c.minAmount || 0)) return 0
  if (c.type === 'fixed') return Math.min(c.discount, total)
  return Math.round(total * c.discount / 100)
}

/**
 * Final total after discount + packaging.
 */
function cartFinalTotal() {
  return Math.max(0, cartSubtotal() - getDiscount() + getPackagingFee())
}

/* ── WHATSAPP CHECKOUT ───────────────────────────────────────────────────── */

function buildWhatsAppOrderMessage() {
  let msg = '🛒 *New Order from ऊनीverse*\n\n'

  cart.forEach((item, i) => {
    const p = products[item.id]
    if (!p) return
    msg += `${i + 1}. *${p.name}*`
    if (item.color) msg += ` (${item.color})`
    msg += `\n   Qty: ${item.qty} × ${formatPrice(p.price)}`
    msg += `\n   Subtotal: ${formatPrice(p.price * item.qty)}\n\n`
  })

  const subtotal = cartSubtotal()
  const discount = getDiscount()
  const packaging = getPackagingFee()
  const total = cartFinalTotal()

  msg += '─────────────\n'
  msg += `*Cart Subtotal: ${formatPrice(subtotal)}*\n`
  if (discount > 0) msg += `15% Member Discount: -${formatPrice(discount)}\n`
  if (packaging > 0) msg += `Botanical Pack fee: +${formatPrice(packaging)}\n`
  msg += `*Total Estimate: ${formatPrice(total)}*\n\n`

  if (checkoutData.name) msg += `*Name:* ${checkoutData.name}\n`
  if (checkoutData.email) msg += `*Email:* ${checkoutData.email}\n`
  if (checkoutData.phone) msg += `*Phone:* ${checkoutData.phone}\n`
  if (checkoutData.address) msg += `*Address:* ${checkoutData.address}\n`

  msg += `\n🙏 Thank you for your order! We'll respond within 24 hours.`

  return msg
}

function sendWhatsAppCheckout() {
  const msg = buildWhatsAppOrderMessage()
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}

/* ── CHECKOUT STEP FUNCTIONS ─────────────────────────────────────────────── */

function setCheckoutStep(step) {
  checkoutStep = step
  updateCartUI()
}

function submitCheckout() {
  checkoutData.name = $('#checkout-name')?.value?.trim() || ''
  checkoutData.email = $('#checkout-email')?.value?.trim() || ''
  checkoutData.phone = $('#checkout-phone')?.value?.trim() || ''
  checkoutData.address = $('#checkout-address')?.value?.trim() || ''

  if (!checkoutData.name || !checkoutData.email || !checkoutData.address) {
    showToast('Please fill name, email, and address', '')
    return
  }

  store.set('checkout', checkoutData)
  sendWhatsAppCheckout()
  setCheckoutStep('success')
  cartClear()
}

/* ── CART DRAWER UI ──────────────────────────────────────────────────────── */

function updateCartUI() {
  /* Badge count */
  const badge = $('#cart-btn .absolute.-top-1')
  if (badge) {
    const count = cartCount()
    badge.textContent = count
    badge.style.display = count > 0 ? 'flex' : 'none'
    if (count > 0) {
      badge.classList.remove('badge-pop')
      void badge.offsetWidth
      badge.classList.add('badge-pop')
      if (badge._animTimer) clearTimeout(badge._animTimer)
      badge._animTimer = setTimeout(() => { badge.classList.remove('badge-pop') }, 600)
    }
  }

  /* Cart button bump glow */
  const cartBtn = $('#cart-btn')
  if (cartBtn) {
    cartBtn.style.boxShadow = '0 0 15px rgba(223,168,180,0.6), 0 0 30px rgba(223,168,180,0.3)'
    cartBtn.style.transform = 'scale(1.15)'
    if (cartBtn._animTimer) clearTimeout(cartBtn._animTimer)
    cartBtn._animTimer = setTimeout(() => {
      cartBtn.style.boxShadow = ''
      cartBtn.style.transform = ''
    }, 500)
  }

  const container = $('#cart-items')
  const footer = $('#cart-footer')
  const headerTitle = $('#cart-drawer .drawer-title')
  if (!container) return

  /* Update header text based on step */
  if (headerTitle) {
    if (checkoutStep === 'cart') headerTitle.textContent = '🧶 Your Cozy Cart'
    else if (checkoutStep === 'checkout') headerTitle.textContent = '🧶 Delivery Details'
    else if (checkoutStep === 'success') headerTitle.textContent = '🧶 Order Stitched!'
  }

  /* ── Empty Cart ── */
  if (cart.length === 0 && checkoutStep !== 'success') {
    checkoutStep = 'cart'
    container.innerHTML = `
      <div id="cart-empty" class="flex flex-col items-center justify-center h-full text-center py-12 px-6 cart-empty-animate">
        <div class="text-6xl mb-4">🧸</div>
        <p class="text-[#70411B]/50 font-serif text-lg">Your cart is feeling drafty...</p>
        <p class="text-xs text-[#70411B]/60 max-w-[240px] leading-relaxed mt-1 mb-6">No crochet cuteness here yet! Fill it with custom plushies, flower bouquets, or shoulder bags.</p>
        <a href="shop.html" class="inline-flex items-center gap-2 px-6 py-3 bg-[#70411B] text-white text-xs font-bold rounded-xl hover:bg-[#9A5B2A] transition-all">Browse Shop</a>
      </div>`
    if (footer) footer.classList.add('hidden')
    return
  }

  if (footer) footer.classList.remove('hidden')

  /* ── Success Step ── */
  if (checkoutStep === 'success') {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center py-12 px-6">
        <div class="w-20 h-20 rounded-full bg-[#A9C1A5]/25 border border-[#A9C1A5]/40 flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-[#A9C1A5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <h4 class="font-serif text-2xl font-bold text-[#70411B] mb-3">Order Stitched with Love!</h4>
        <p class="text-xs text-[#70411B]/70 leading-relaxed max-w-xs mb-6">
          Thank you, <span class="font-bold">${checkoutData.name || 'Friend'}</span>! Your order has been placed successfully. A cozy confirmation receipt has been sent to <span class="font-semibold text-[#9A5B2A]">${checkoutData.email || 'you'}</span>.
        </p>
        <div class="p-4 bg-[#FFF7F1] border border-[#70411B]/10 rounded-2xl w-full max-w-xs text-left mb-6">
          <span class="text-[10px] uppercase font-bold tracking-wider text-[#9A5B2A]">Shipping Timeline</span>
          <h5 class="font-serif font-bold text-[#70411B] text-sm mt-1">Arrival in 5 - 10 Business Days</h5>
          <p class="text-[11px] text-[#70411B]/70 mt-1">Our crochet studio is spinning your creations immediately. All items are packed in eco-friendly boxes containing soft dried lavender stems.</p>
        </div>
        <button style="background-color:#DFA8B4" class="px-8 py-4 text-white text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer" onmouseover="this.style.backgroundColor='#c9919e'" onmouseout="this.style.backgroundColor='#DFA8B4'" onclick="setCheckoutStep('cart'); updateCartUI(); closeDrawer('#cart-drawer')">Continue Exploring Oouniverse</button>
      </div>`
    if (footer) footer.classList.add('hidden')
    return
  }

  /* ── Cart Items List ── */
  if (checkoutStep === 'cart') {
    container.innerHTML = cart.map(item => {
      const p = products[item.id]
      if (!p) return ''
      const lineTotal = p.price * item.qty
      return `
        <div class="relative p-4 bg-white rounded-2xl border border-[#70411B]/5 shadow-sm flex gap-4 cart-item-animate" data-product-id="${item.id}">
          <div class="absolute inset-1.5 border border-dashed border-[#70411B]/5 rounded-xl pointer-events-none"></div>
          <div class="w-16 h-16 rounded-xl overflow-hidden bg-[#F4E9E1] relative shrink-0">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
          </div>
          <div class="flex-grow flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between">
                <span class="font-serif text-sm font-bold text-[#70411B] line-clamp-1 pr-4 block">${p.name}</span>
                <button class="text-[#70411B]/40 hover:text-red-500 transition-colors p-1 cart-remove-btn" data-product-id="${item.id}" title="Remove">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              ${item.color ? `<span class="text-[10px] bg-[#F4E9E1] text-[#70411B] px-1.5 py-0.5 rounded font-medium">Color: ${item.color}</span>` : ''}
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#70411B]/5">
              <div class="flex items-center gap-0 border border-[#70411B]/15 rounded-lg px-2 bg-[#FFF7F1]/30">
                <button class="text-xs font-bold w-4 text-center cursor-pointer text-[#70411B] cart-qty-btn" data-product-id="${item.id}" data-delta="-1">-</button>
                <span class="font-mono text-xs font-bold w-6 text-center text-[#70411B]">${item.qty}</span>
                <button class="text-xs font-bold w-4 text-center cursor-pointer text-[#70411B] cart-qty-btn" data-product-id="${item.id}" data-delta="1">+</button>
              </div>
              <div class="flex items-center gap-3">
                <button class="text-xs text-[#70411B]/50 hover:text-[#DFA8B4] transition-colors flex items-center gap-0.5 cursor-pointer move-to-wishlist-btn" data-product-id="${item.id}" title="Move to Wishlist">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
                <span class="font-serif text-sm font-bold text-[#70411B]">${formatPrice(lineTotal)}</span>
              </div>
            </div>
          </div>
        </div>`
    }).join('')

    /* Stagger-animate cart items */
    const items = container.querySelectorAll('[data-product-id]')
    items.forEach((item, i) => {
      item.style.animationDelay = (i * 0.06) + 's'
    })

    /* ── Footer: Coupon + Totals + Checkout ── */
    const d = getDiscount()
    const sub = cartSubtotal()
    const pkg = getPackagingFee()
    const total = cartFinalTotal()

    footer.innerHTML = `
      <div class="px-6 pb-3 cart-footer-animate">
        ${appliedCoupon ? `
        <div id="coupon-applied" class="flex items-center justify-between bg-[#A9C1A5]/10 border border-[#A9C1A5]/20 rounded-lg px-3 py-2 mb-3">
          <span class="text-[10px] font-bold text-[#70411B] flex items-center gap-1">
            <svg class="w-3 h-3 text-[#A9C1A5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            Coupon: <span class="coupon-code text-[#9A5B2A]">${appliedCoupon}</span>
            (${COUPONS[appliedCoupon]?.type === 'fixed' ? formatPrice(COUPONS[appliedCoupon].discount) + ' off' : (COUPONS[appliedCoupon]?.discount || 0) + '% off'})
          </span>
          <button class="text-red-400 hover:text-red-600 text-xs font-bold cursor-pointer" onclick="removeCoupon()">Remove</button>
        </div>` : ''}
        <div class="flex items-end gap-2 mb-3">
          <div class="flex-1 relative">
            <span class="absolute left-0 bottom-2.5" style="color:rgba(112,65,27,0.3)">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            </span>
            <input type="text" id="coupon-input" placeholder="YARNLOVE for 15% off..." style="width:100%;background:transparent;border:0;border-bottom:1px solid rgba(112,65,27,0.2);outline:none;padding-left:20px;padding-right:0;padding-top:8px;padding-bottom:8px;font-size:10px;color:#70411B;font-weight:500;transition:border-color 0.3s;text-transform:uppercase" onfocus="this.style.borderColor='#70411B'" onblur="this.style.borderColor='rgba(112,65,27,0.2)'" />
          </div>
          <button style="padding:8px 12px;background:transparent;color:#70411B;font-size:10px;font-weight:700;border:0;border-bottom:2px solid rgba(112,65,27,0.3);cursor:pointer;transition:border-color 0.3s" onmouseover="this.style.borderColor='#70411B'" onmouseout="this.style.borderColor='rgba(112,65,27,0.3)'" onclick="var v=$('#coupon-input'); if(v&&v.value.trim())applyCoupon(v.value.trim()); else showToast('Enter a coupon code','')">Apply</button>
        </div>
      </div>
      <div class="border-t border-[#70411B]/10 px-6 pt-4 pb-5 space-y-2 cart-footer-animate">
        <div class="flex justify-between text-xs font-semibold text-[#70411B]/70"><span>Cart Subtotal</span><span class="font-mono font-bold">${formatPrice(sub)}</span></div>
        <div id="cart-discount" class="flex justify-between text-xs font-semibold text-[#A9C1A5]" style="display:${d > 0 ? 'flex' : 'none'}"><span>${COUPONS[appliedCoupon]?.discount || 0}% Member Discount</span><span class="font-mono">-${formatPrice(d)}</span></div>
        ${pkg > 0 ? `<div class="flex justify-between text-xs font-semibold text-[#70411B]/70"><span class="flex items-center gap-1"><svg class="w-3.5 h-3.5 text-[#DFA8B4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>Botanical Pack fee</span><span class="font-mono font-bold">${formatPrice(pkg)}</span></div>` : ''}
        <div class="flex justify-between text-sm font-serif font-bold text-[#70411B] pt-2 border-t border-[#70411B]/10"><span>Total Estimate</span><span>${formatPrice(total)}</span></div>
        <button style="background-color:#DFA8B4" class="w-full py-3.5 text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-3" onmouseover="this.style.backgroundColor='#c9919e'" onmouseout="this.style.backgroundColor='#DFA8B4'" onclick="setCheckoutStep('checkout')">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          <span>Proceed to Checkout</span>
        </button>
        <button style="background-color:#25D366" class="w-full py-3 text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer" onmouseover="this.style.backgroundColor='#20BD5A'" onmouseout="this.style.backgroundColor='#25D366'" onclick="submitWhatsAppCheckout()">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span>Order on WhatsApp</span>
        </button>
      </div>`
    return
  }

  /* ── Checkout Details Step ── */
  if (checkoutStep === 'checkout') {
    container.innerHTML = `
      <div class="p-6 space-y-5">
        <p class="text-xs text-[#70411B]/70 leading-relaxed mb-4">Please provide your delivery information. We knit every order with love, infused with raw botanicals, packed safely.</p>
        <div class="space-y-4">
          <div><label class="text-[10px] font-bold text-[#70411B] uppercase tracking-wider block mb-1">Full Name *</label><input type="text" id="checkout-name" value="${checkoutData.name}" placeholder="e.g. Blossom Peterson" class="w-full bg-white border-2 border-[#70411B]/15 focus:border-[#70411B] outline-none rounded-xl px-4 py-3 text-sm text-[#70411B]" /></div>
          <div><label class="text-[10px] font-bold text-[#70411B] uppercase tracking-wider block mb-1">Email Address *</label><input type="email" id="checkout-email" value="${checkoutData.email}" placeholder="e.g. blossom@cozy.com" class="w-full bg-white border-2 border-[#70411B]/15 focus:border-[#70411B] outline-none rounded-xl px-4 py-3 text-sm text-[#70411B]" /></div>
          <div><label class="text-[10px] font-bold text-[#70411B] uppercase tracking-wider block mb-1">WhatsApp Number (Optional)</label><input type="tel" id="checkout-phone" value="${checkoutData.phone}" placeholder="For custom updates & order tracking" class="w-full bg-white border-2 border-[#70411B]/15 focus:border-[#70411B] outline-none rounded-xl px-4 py-3 text-sm text-[#70411B]" /></div>
          <div><label class="text-[10px] font-bold text-[#70411B] uppercase tracking-wider block mb-1">Shipping Address *</label><textarea id="checkout-address" rows="3" placeholder="Street, City, Postal Code, Country" class="w-full bg-white border-2 border-[#70411B]/15 focus:border-[#70411B] outline-none rounded-xl px-4 py-3 text-sm text-[#70411B] resize-none">${checkoutData.address}</textarea></div>
        </div>
      </div>`
    footer.innerHTML = `
      <div class="px-6 pb-6 space-y-3">
        <div class="flex justify-between items-center text-xs font-serif font-bold text-[#70411B] mb-2">
          <span>Total Amount due</span>
          <span>${formatPrice(cartFinalTotal())}</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button class="py-3 bg-[#F4E9E1] hover:bg-[#F4E9E1]/80 text-[#70411B] font-semibold text-xs rounded-xl cursor-pointer" onclick="setCheckoutStep('cart')">Back to Cart</button>
          <button class="py-3 bg-[#70411B] hover:bg-[#9A5B2A] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1" onclick="submitCheckout()">
            <span>Complete Order</span>
          </button>
        </div>
      </div>`
    return
  }
}

function submitWhatsAppCheckout() {
  checkoutData.name = 'WhatsApp Guest'
  checkoutData.phone = ''
  checkoutData.address = ''
  sendWhatsAppCheckout()
  cartClear()
  closeDrawer('#cart-drawer')
}

/* ── COLOR HELPER ────────────────────────────────────────────────────────── */

function getHexForColor(colorName) {
  for (const p of Object.values(products)) {
    if (p.colorVariants) {
      const found = p.colorVariants.find(c => c.name === colorName)
      if (found) return found.hex
    }
  }
  return '#F4E9E1'
}

/* ── WISHLIST DRAWER UI ──────────────────────────────────────────────────── */

function updateWishlistUI() {
  const container = $('#wishlist-items')
  if (!container) return

  /* Badge count */
  const badge = $('#wishlist-btn .absolute.-top-1')
  if (badge) {
    const count = wishlist.length
    const wasEmpty = badge.style.display === 'none'
    badge.textContent = count
    badge.style.display = count > 0 ? 'flex' : 'none'
    if (count > 0 && wasEmpty) {
      badge.classList.remove('badge-pop')
      void badge.offsetWidth
      badge.classList.add('badge-pop')
      if (badge._animTimer) clearTimeout(badge._animTimer)
      badge._animTimer = setTimeout(() => { badge.classList.remove('badge-pop') }, 600)
    }
  }

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div id="wishlist-empty" class="flex flex-col items-center justify-center h-full text-center py-12 px-6">
        <div class="text-6xl mb-4">🧺</div>
        <p class="text-[#70411B]/50 font-serif text-lg">Your Wishlist is empty</p>
        <p class="text-xs text-[#70411B]/40 font-sans mt-1 mb-6">Save your favorite crochet treasures here!</p>
        <a href="shop.html" class="inline-flex items-center gap-2 px-6 py-3 bg-[#70411B] text-white text-xs font-bold rounded-xl hover:bg-[#9A5B2A] transition-all">Browse Shop</a>
      </div>`
    return
  }

  container.innerHTML = wishlist.map(id => {
    const p = products[id]
    if (!p) return ''
    return `
      <div class="relative p-4 bg-white rounded-2xl border border-[#70411B]/5 shadow-sm flex gap-4" data-product-id="${id}">
        <div class="w-16 h-16 rounded-xl overflow-hidden bg-[#F4E9E1] shrink-0">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>
        <div class="flex-grow flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <span class="font-serif text-sm font-bold text-[#70411B] line-clamp-1 pr-2 block">${p.name}</span>
              <span class="text-[10px] text-[#70411B]/50 font-sans">${p.category}</span>
            </div>
            <button class="text-[#70411B]/40 hover:text-red-500 transition-colors p-1 wishlist-remove-btn" data-product-id="${id}" title="Remove">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="font-serif text-sm font-bold text-[#70411B]">${formatPrice(p.price)}</span>
            <button class="text-[10px] font-bold text-[#9A5B2A] hover:text-[#70411B] transition-colors cursor-pointer move-to-cart-btn" data-product-id="${id}">Move to Cart →</button>
          </div>
        </div>
      </div>`
  }).join('')
}

/* ── WISHLIST BUTTON STATES ──────────────────────────────────────────────── */

function updateWishlistButtons() {
  $$('.add-to-wishlist').forEach(btn => {
    const id = btn.dataset.productId
    if (!id) return
    const svg = btn.querySelector('svg path')
    if (wishlistHas(id)) {
      btn.classList.add('bg-[#DFA8B4]', 'text-white')
      btn.classList.remove('bg-[#FFF7F1]/90', 'text-[#70411B]')
      if (svg) svg.setAttribute('fill', 'currentColor')
      btn.title = 'Remove from Wishlist'
    } else {
      btn.classList.remove('bg-[#DFA8B4]', 'text-white')
      btn.classList.add('bg-[#FFF7F1]/90', 'text-[#70411B]')
      if (svg) svg.setAttribute('fill', 'none')
      btn.title = 'Add to Wishlist'
    }
  })
}

/* ── TOAST ────────────────────────────────────────────────────────────────── */

function showToast(item, action) {
  const toast = $('#cart-toast')
  const msg = $('#cart-toast-msg')
  if (!toast || !msg) return

  const productName = products[item]?.name
  if (productName) {
    msg.textContent = productName + ' ' + action
  } else if (action) {
    msg.textContent = item + ' ' + action
  } else {
    msg.textContent = item
  }
  toast.classList.add('show')
  clearTimeout(toast._hide)
  toast._hide = setTimeout(() => toast.classList.remove('show'), 2500)
}

/* ── DRAWER TOGGLES ──────────────────────────────────────────────────────── */

function openDrawer(id) {
  const panel = $(id)
  const overlay = $(id.replace('drawer', 'overlay'))
  if (panel) panel.classList.add('open')
  if (overlay) overlay.classList.add('open')
  document.body.style.overflow = 'hidden'

  /* Animate drawer header */
  const header = panel?.querySelector('.drawer-header')
  if (header) {
    header.classList.remove('cart-header-animate')
    void header.offsetWidth
    header.classList.add('cart-header-animate')
  }

  /* Stagger-animate existing cart items */
  if (id === '#cart-drawer') {
    const items = panel?.querySelectorAll('#cart-items > [data-product-id]')
    if (items) {
      items.forEach((item, i) => {
        item.classList.remove('cart-item-animate')
        item.style.animationDelay = (i * 0.06) + 's'
        void item.offsetWidth
        item.classList.add('cart-item-animate')
      })
    }
    /* Animate footer */
    const footer = panel?.querySelector('#cart-footer')
    if (footer && !footer.classList.contains('hidden')) {
      footer.classList.remove('cart-footer-animate')
      void footer.offsetWidth
      footer.classList.add('cart-footer-animate')
    }
  }

  /* Animate wishlist items */
  if (id === '#wishlist-drawer') {
    const items = panel?.querySelectorAll('#wishlist-items > [data-product-id]')
    if (items) {
      items.forEach((item, i) => {
        item.classList.remove('cart-item-animate')
        item.style.animationDelay = (i * 0.06) + 's'
        void item.offsetWidth
        item.classList.add('cart-item-animate')
      })
    }
  }
}

function closeDrawer(id) {
  const panel = $(id)
  const overlay = $(id.replace('drawer', 'overlay'))
  if (panel) panel.classList.remove('open')
  if (overlay) overlay.classList.remove('open')
  document.body.style.overflow = ''
}

/* ── INIT CART / WISHLIST ────────────────────────────────────────────────── */

function initCartWishlist() {
  updateCartUI()
  updateWishlistUI()
  updateWishlistButtons()

  /* Cart button */
  on($('#cart-btn'), 'click', () => openDrawer('#cart-drawer'))
  on($('#cart-drawer-close'), 'click', () => closeDrawer('#cart-drawer'))
  on($('#cart-overlay'), 'click', () => closeDrawer('#cart-drawer'))

  /* Wishlist button */
  on($('#wishlist-btn'), 'click', () => { openDrawer('#wishlist-drawer'); updateWishlistUI() })
  on($('#wishlist-drawer-close'), 'click', () => closeDrawer('#wishlist-drawer'))
  on($('#wishlist-overlay'), 'click', () => closeDrawer('#wishlist-drawer'))

  /* Add to cart (event delegation) */
  delegate(document, '.add-to-cart', 'click', (_, btn) => {
    const id = btn.dataset.productId
    if (id) cartAdd(id)
  })

  /* Wishlist toggle (event delegation) */
  delegate(document, '.add-to-wishlist', 'click', (_, btn) => {
    const id = btn.dataset.productId
    if (id) wishlistToggle(id)
  })

  /* Cart quantity buttons */
  delegate(document, '.cart-qty-btn', 'click', (_, btn) => {
    const id = btn.dataset.productId
    const delta = parseInt(btn.dataset.delta)
    if (id && !isNaN(delta)) cartUpdateQty(id, delta)
  })

  /* Cart remove buttons */
  delegate(document, '.cart-remove-btn', 'click', (_, btn) => {
    const id = btn.dataset.productId
    if (id) cartRemove(id)
  })

  /* Per-item move to wishlist buttons */
  delegate(document, '.move-to-wishlist-btn', 'click', (_, btn) => {
    const id = btn.dataset.productId
    if (id) moveToWishlistFromCart(id)
  })

  /* Wishlist remove buttons */
  delegate(document, '.wishlist-remove-btn', 'click', (_, btn) => {
    const id = btn.dataset.productId
    if (id) wishlistToggle(id)
  })

  /* Move to cart from wishlist */
  delegate(document, '.move-to-cart-btn', 'click', (_, btn) => {
    const id = btn.dataset.productId
    if (id) moveToCartFromWishlist(id)
  })
}

/* ── Export to window ────────────────────────────────────────────────────── */

window.cartAdd = cartAdd
window.cartRemove = cartRemove
window.cartSetQty = cartSetQty
window.cartUpdateQty = cartUpdateQty
window.cartCount = cartCount
window.cartSubtotal = cartSubtotal
window.cartFinalTotal = cartFinalTotal
window.cartClear = cartClear
window.wishlistToggle = wishlistToggle
window.wishlistHas = wishlistHas
window.moveToCartFromWishlist = moveToCartFromWishlist
window.moveToWishlistFromCart = moveToWishlistFromCart
window.updateCartUI = updateCartUI
window.updateWishlistUI = updateWishlistUI
window.updateWishlistButtons = updateWishlistButtons
window.showToast = showToast
window.openDrawer = openDrawer
window.closeDrawer = closeDrawer
window.initCartWishlist = initCartWishlist
window.applyCoupon = applyCoupon
window.removeCoupon = removeCoupon
window.setCheckoutStep = setCheckoutStep
window.submitCheckout = submitCheckout
window.submitWhatsAppCheckout = submitWhatsAppCheckout
window.sendWhatsAppCheckout = sendWhatsAppCheckout
window.getHexForColor = getHexForColor
