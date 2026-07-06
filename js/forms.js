/* ── FORM VALIDATION ENGINE ─────────────────────────────────────────────── */

const rules = {
  required: v => (v || '').trim() !== '' || 'This field is required',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
  min: n => v => (v || '').length >= n || `Minimum ${n} characters`,
  max: n => v => (v || '').length <= n || `Maximum ${n} characters`,
  phone: v => /^[\d\s+\-()]{7,15}$/.test(v) || 'Enter a valid phone number',
}

function validateField(input) {
  const val = input.value
  const errors = []
  const rawRules = input.dataset.rules
  if (!rawRules) return errors
  rawRules.split(',').forEach(rule => {
    const trimmed = rule.trim()
    if (trimmed === 'required') {
      const err = rules.required(val)
      if (err !== true) errors.push(err)
    } else if (trimmed.startsWith('min:')) {
      const min = parseInt(trimmed.split(':')[1]) || 0
      const err = rules.min(min)(val)
      if (err !== true) errors.push(err)
    } else if (trimmed.startsWith('max:')) {
      const max = parseInt(trimmed.split(':')[1]) || Infinity
      const err = rules.max(max)(val)
      if (err !== true) errors.push(err)
    } else if (trimmed === 'email') {
      const err = rules.email(val)
      if (err !== true) errors.push(err)
    } else if (trimmed === 'phone') {
      const err = rules.phone(val)
      if (err !== true) errors.push(err)
    }
  })
  return errors
}

function showFieldError(input, errors) {
  const container = input.closest('.field-group') || input.parentElement
  let errEl = container.querySelector('.field-error')
  if (errors.length === 0) {
    if (errEl) errEl.remove()
    input.classList.remove('field-invalid')
    return true
  }
  if (!errEl) {
    errEl = document.createElement('span')
    errEl.className = 'field-error text-[10px] text-red-500 font-sans mt-1 block'
    container.appendChild(errEl)
  }
  errEl.textContent = errors[0]
  input.classList.add('field-invalid')
  return false
}

function validateForm(form) {
  let valid = true
  form.querySelectorAll('[data-rules]').forEach(input => {
    const errors = validateField(input)
    if (!showFieldError(input, errors)) valid = false
  })
  return valid
}

function clearForm(form) {
  form.reset()
  form.querySelectorAll('.field-error').forEach(el => el.remove())
  form.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'))
}

/* ── WHATSAPP INTEGRATION ──────────────────────────────────────────────── */

function sendToWhatsapp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

function formatOrderMessage(items, total) {
  let msg = '🛒 *New Order from ऊनीverse*\n\n'
  items.forEach((item, i) => {
    const p = products[item.id]
    if (!p) return
    msg += `${i + 1}. *${p.name}*`
    if (item.color) msg += ` (${item.color})`
    msg += `\n   Qty: ${item.qty} × ${formatPrice(p.price)}`
    msg += `\n   Subtotal: ${formatPrice(p.price * item.qty)}\n\n`
  })
  msg += `─────────────\n*Total: ${formatPrice(total)}*\n`
  msg += `\n🙏 Thank you for your order! We'll respond within 24 hours.`
  return msg
}

function formatContactMessage(name, email, phone, subject, message) {
  return `Hello *Oouniverse*! \uD83E\uDDF6 I am reaching out to you from your website.\n\u2022 *Name*: ${name}\n\u2022 *Email*: ${email}\n\u2022 *Phone*: ${phone || 'Not provided'}\n\u2022 *Subject*: ${subject}\n\u2022 *Message*: ${message}`
}

function formatNewsletterMessage(email) {
  return `📰 *New Newsletter Subscription*\n\n*Email:* ${email}\n\n🙏 From ऊनीverse newsletter signup.`
}

function formatCustomOrderMessage(name, message, design) {
  return `🎨 *New Custom Order Request*\n\n*Name:* ${name}\n*Design:* ${design || 'N/A'}\n*Message:* ${message}\n\n🙏 From ऊनीverse custom order form.`
}

/* ── FORM HANDLERS ──────────────────────────────────────────────────────── */

function initContactForm() {
  const form = $('#contact-form')
  if (!form) return

  on(form, 'submit', e => {
    e.preventDefault()
    if (!validateForm(form)) return

    const data = new FormData(form)
    const name = data.get('name') || ''
    const email = data.get('email') || ''
    const phone = data.get('phone') || ''
    const subject = data.get('subject') || 'General Inquiry'
    const message = data.get('message') || ''

    const msg = formatContactMessage(name, email, phone, subject, message)
    sendToWhatsapp(msg)

    clearForm(form)

    /* Show inline success message matching React */
    const successEl = document.getElementById('contact-success')
    if (successEl) {
      successEl.classList.remove('hidden')
      successEl.style.display = 'flex'
      setTimeout(() => {
        successEl.classList.add('hidden')
        successEl.style.display = ''
      }, 4000)
    }
  })
}

function initNewsletterForm() {
  const form = $('#newsletter-form')
  if (!form) return

  on(form, 'submit', e => {
    e.preventDefault()
    const input = form.querySelector('[type="email"]')
    if (!input) return
    input.dataset.rules = 'required,email'
    const errors = validateField(input)
    if (!showFieldError(input, errors)) return

    const email = input.value.trim()

    /* Save to LocalStorage */
    const subs = store.get('newsletter', [])
    if (!subs.includes(email)) {
      subs.push(email)
      store.set('newsletter', subs)
    }

    input.value = ''
    showToast('Subscribed! Welcome to the ऊनीverse.')
  })
}

function initCustomOrderForm() {
  const form = $('#custom-inquiry-form, #inquiry-form')
  if (!form) return

  on(form, 'submit', e => {
    e.preventDefault()
    if (!validateForm(form)) return

    const data = new FormData(form)
    const name = data.get('name') || ''
    const message = data.get('message') || ''
    const design = data.get('design') || `${window.customBase || 'Not set'} | ${window.customColor || 'Not set'} | Accessories: ${(window.customAccessories || []).join(', ') || 'None'}`

    const msg = formatCustomOrderMessage(name, message, design)
    sendToWhatsapp(msg)

    clearForm(form)
    showToast('Inquiry sent! We\'ll get back within 24h.')
  })
}

function initWishlistForm() {
  /* Wishlist is managed client-side via localStorage */
}

/* ── INIT ────────────────────────────────────────────────────────────────── */

function initForms() {
  initContactForm()
  initNewsletterForm()
  initCustomOrderForm()
}

document.addEventListener('DOMContentLoaded', function() {
  initForms()
})
