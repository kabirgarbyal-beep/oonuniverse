/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATIONS — Vanilla JS replacements for Framer Motion / React Spring
   All spring configs match React source exactly.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── CUSTOM CURSOR ─────────────────────────────────────────────────────── */

function initCursor() {
  if (window.innerWidth < 768) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ring = $('#cursor-ring')
  const dot = $('#cursor-dot')
  const hoverRing = $('#cursor-hover-ring')
  if (!ring || !dot) return

  /* Hide system cursor everywhere */
  document.body.style.cursor = 'none'
  document.querySelectorAll('a, button, [role="button"], input, textarea, select, label, [onclick]').forEach(el => {
    el.style.cursor = 'none'
  })

  /* State */
  let mouseX = window.innerWidth / 2
  let mouseY = window.innerHeight / 2
  let ringX = mouseX
  let ringY = mouseY
  let dotX = mouseX
  let dotY = mouseY
  let hovered = null
  let lastTime = performance.now()

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now

    /* Ring follows mouse — fast lerp (feels snappy) */
    ringX += (mouseX - ringX) * Math.min(18 * dt, 1)
    ringY += (mouseY - ringY) * Math.min(18 * dt, 1)

    /* Dot follows RING — slower lerp, always stays inside the ring */
    dotX += (ringX - dotX) * Math.min(8 * dt, 1)
    dotY += (ringY - dotY) * Math.min(8 * dt, 1)

    ring.style.left = ringX + 'px'
    ring.style.top = ringY + 'px'
    dot.style.left = dotX + 'px'
    dot.style.top = dotY + 'px'
    if (hoverRing) {
      hoverRing.style.left = ringX + 'px'
      hoverRing.style.top = ringY + 'px'
    }

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  /* Mousemove — show + track */
  on(document, 'mousemove', e => {
    mouseX = e.clientX
    mouseY = e.clientY
    ring.style.opacity = '1'
    dot.style.opacity = '1'
  })

  on(document, 'mouseleave', () => {
    ring.style.opacity = '0'
    dot.style.opacity = '0'
    if (hoverRing) hoverRing.style.opacity = '0'
  })
  on(document, 'mouseenter', () => {
    ring.style.opacity = '1'
    dot.style.opacity = '1'
  })

  /* ── Hover: ANY interactive element (use mouseover/mouseout — they bubble) ── */
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, [role="button"], .product-card, .gallery-item, .group, input, textarea, select')
    if (!el) return
    if (el.closest('.lightbox, .product-modal-overlay')) {
      hovered = 'lightbox'
    } else if (el.closest('.product-card')) {
      hovered = 'plushie'
    } else if (el.closest('.gallery-item, [id="gallery-grid"]')) {
      hovered = 'gallery'
    } else {
      hovered = 'button'
    }
    const scale = hovered === 'plushie' ? 2.2 : hovered === 'gallery' ? 2.0 : hovered === 'lightbox' ? 1.8 : 1.6
    ring.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
    ring.style.transform = 'translate(-50%, -50%) scale(' + scale + ') rotate(180deg)'
    if (hoverRing) {
      hoverRing.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s, border-color 0.25s'
      hoverRing.style.transform = 'translate(-50%, -50%) scale(' + (scale * 2) + ')'
      hoverRing.style.opacity = '0.7'
      hoverRing.style.borderColor = hovered === 'plushie' ? '#9A5B2A' : '#DFA8B4'
    }
  })

  document.addEventListener('mouseout', e => {
    const el = e.target.closest('a, button, [role="button"], .product-card, .gallery-item, .group, input, textarea, select')
    if (!el) return
    const related = e.relatedTarget
    if (related && el.contains(related)) return
    hovered = null
    ring.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
    ring.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)'
    if (hoverRing) {
      hoverRing.style.transform = 'translate(-50%, -50%) scale(1)'
      hoverRing.style.opacity = '0'
    }
  })
}

/* ── PRELOADER (Loader.tsx) ────────────────────────────────────────────── */
/* React exit: opacity 0, y -20, duration 0.8s, ease [0.76, 0, 0.24, 1] */

function initPreloader() {
  const preloader = $('#preloader')
  if (!preloader) return

  const bar = preloader.querySelector('.h-full')
  const label = preloader.querySelector('.font-serif.italic')
  if (!bar || !label) return

  let percent = 0
  const messages = [
    'Spinning cozy fibers...', 'Dyeing with organic pigments...',
    'Knitting stitches...', 'Adding love & warmth...',
    'Wrapping with care...'
  ]

  function update() {
    percent += 1
    if (percent > 100) percent = 100
    bar.style.width = percent + '%'
    const idx = Math.min(Math.floor(percent / 25), messages.length - 1)
    label.textContent = messages[idx] + ' ' + Math.round(percent) + '%'

    if (percent < 100) {
      setTimeout(update, 20)
    } else {
      setTimeout(() => {
        /* Match React exit: opacity 0, y -20, 0.8s, ease [0.76, 0, 0.24, 1] */
        preloader.style.transition = 'opacity 0.8s cubic-bezier(0.76, 0, 0.24, 1), transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)'
        preloader.style.opacity = '0'
        preloader.style.transform = 'translateY(-20px)'
        preloader.style.pointerEvents = 'none'
        document.body.classList.remove('preloader-active')
        setTimeout(() => { preloader.style.display = 'none' }, 800)
        document.body.style.overflow = ''
        initAOS()
      }, 400)
    }
  }

  /* Brand title entrance: opacity [0→1], y [15→0], delay 0.2s, duration 0.6s */
  const brandTitle = preloader.querySelector('.font-serif.text-5xl, .font-display, h1')
  if (brandTitle) {
    brandTitle.style.opacity = '0'
    brandTitle.style.transform = 'translateY(15px)'
    setTimeout(() => {
      brandTitle.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
      brandTitle.style.opacity = '1'
      brandTitle.style.transform = 'translateY(0)'
    }, 200)
  }

  document.body.style.overflow = 'hidden'
  update()
}

/* ── AOS SCROLL REVEAL (IntersectionObserver) ─────────────────────────── */
/* React: whileInView, viewport={{ once: true, margin: "-50px" }} */

function initAOS() {
  const els = $$('[data-aos]')
  if (!els.length) return

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate')
        obs.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  els.forEach(el => obs.observe(el))
}

/* ── HERO PARALLAX (mouse-driven) ────────────────────────────────────── */
/* React: style={{ x: mousePosition.x * factor, y: mousePosition.y * factor }} */

function initHero() {
  const hero = $('#hero')
  if (!hero) return

  /* ── Entrance Animations (matching React stagger timing) ── */

  /* Tagline pill: opacity 0→1, scale 0.8→1, 0.6s ease-out */
  const tagline = hero.querySelector('.inline-flex.items-center.gap-2.px-4')
  if (tagline) {
    tagline.style.opacity = '0'
    tagline.style.transform = 'scale(0.8)'
    tagline.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    requestAnimationFrame(() => {
      tagline.style.opacity = '1'
      tagline.style.transform = 'scale(1)'
    })
  }

  /* Title word stagger: y 100%→0, rotate 4→0, 0.8s [0.215, 0.61, 0.355, 1], delay 0.2 + i*0.08 */
  const titleWords = hero.querySelectorAll('#hero h1.font-serif > span')
  if (titleWords.length) {
    titleWords.forEach((word, i) => {
      word.style.opacity = '0'
      word.style.transform = 'translateY(100%) rotate(4deg)'
      word.style.transition = `opacity 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) ${0.2 + i * 0.08}s, transform 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) ${0.2 + i * 0.08}s`
      requestAnimationFrame(() => {
        word.style.opacity = '1'
        word.style.transform = 'translateY(0) rotate(0deg)'
      })
    })
  }

  /* Subheading: opacity 0→1, y 15→0, delay 0.6s, 0.8s ease-out */
  const sub = hero.querySelector('p.max-w-lg')
  if (sub) {
    sub.style.opacity = '0'
    sub.style.transform = 'translateY(15px)'
    sub.style.transition = 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s'
    requestAnimationFrame(() => {
      sub.style.opacity = '1'
      sub.style.transform = 'translateY(0)'
    })
  }

  /* CTA buttons: opacity 0→1, y 15→0, delay 0.8s, 0.8s ease-out */
  const cta = hero.querySelector('.flex.flex-wrap.items-center.gap-4')
  if (cta) {
    cta.style.opacity = '0'
    cta.style.transform = 'translateY(15px)'
    cta.style.transition = 'opacity 0.8s ease-out 0.8s, transform 0.8s ease-out 0.8s'
    requestAnimationFrame(() => {
      cta.style.opacity = '1'
      cta.style.transform = 'translateY(0)'
    })
  }

  /* Floating cards spring entrance: React delays 0.4, 0.6, 0.8, 1.0 */
  const mainCard = hero.querySelector('.rounded-3xl.overflow-hidden.shadow-2xl')
  const plushCard = hero.querySelector('.rounded-2xl.overflow-hidden.shadow-xl')
  const flowerCard = hero.querySelectorAll('.rounded-2xl.overflow-hidden.shadow-xl')[1]
  const coasterCard = hero.querySelector('.rounded-full.overflow-hidden.shadow-md')
  const allCards = [mainCard, plushCard, flowerCard, coasterCard].filter(Boolean)

  const cardDelays = [0.4, 0.6, 0.8, 1.0]
  const offsets = ['scale(0.8)', 'translateX(50px)', 'translateX(-50px)', 'scale(0)']
  allCards.forEach((c, i) => {
    c.style.opacity = '0'
    c.style.transform = offsets[i] || 'scale(0.8)'
    c.style.transition = `opacity 1s cubic-bezier(0.76, 0, 0.24, 1) ${cardDelays[i] || 0.4}s, transform 1s cubic-bezier(0.76, 0, 0.24, 1) ${cardDelays[i] || 0.4}s`
    requestAnimationFrame(() => {
      c.style.opacity = '1'
      c.style.transform = ''
    })
  })

  /* ── Background Animations ── */

  /* Floating blobs: blob-anim-1 12s, blob-anim-2 15s */
  const blobs = hero.querySelectorAll('#hero .rounded-full.blur-3xl')
  blobs.forEach((b, i) => {
    const dur = i === 0 ? 12 : 15
    b.style.animation = i === 0 ? `blob-anim-1 ${dur}s ease-in-out infinite` : `blob-anim-2 ${dur}s ease-in-out infinite`
  })

  /* Floating particles: 6 + i*2 seconds each */
  const particles = hero.querySelectorAll('#hero .absolute.text-xl.select-none')
  particles.forEach((p, i) => {
    const dur = 6 + i * 2
    p.style.animation = `particle-float ${dur}s ease-in-out infinite`
  })

  /* ── Mouse Parallax (React: style={{ x: mousePosition.x * factor }}) ── */

  /* Smooth return transitions */
  allCards.forEach(c => {
    c.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  })
  blobs.forEach(b => {
    b.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  })
  particles.forEach(p => {
    p.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  })

  on(hero, 'mousemove', e => {
    const rect = hero.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    /* Remove return transitions during active movement for instant response */
    allCards.forEach(c => { c.style.transition = 'none' })
    blobs.forEach(b => { b.style.transition = 'none' })
    particles.forEach(p => { p.style.transition = 'none' })

    blobs.forEach((b, i) => {
      const factor = i === 0 ? 40 : -50
      b.style.transform = `translate(${x * factor}px, ${y * factor}px)`
    })

    /* Main card: x*25, y*25 + wobble */
    if (mainCard) mainCard.style.transform = `translate(${x * 25}px, ${y * 25}px) rotate(${x * 3}deg)`
    /* Plushies: x*-40, y*-40 + wobble */
    if (plushCard) plushCard.style.transform = `translate(${x * -40}px, ${y * -40}px) rotate(${y * -4}deg)`
    /* Bouquet: x*45, y*-25 + wobble */
    if (flowerCard) flowerCard.style.transform = `translate(${x * 45}px, ${y * -25}px) rotate(${x * 5}deg)`
    /* Coasters: x*-15, y*35 + wobble */
    if (coasterCard) coasterCard.style.transform = `translate(${x * -15}px, ${y * 35}px) rotate(${y * 3}deg)`

    particles.forEach((p, i) => {
      const factor = (i + 1) * -12
      p.style.transform = `translate(${x * factor}px, ${y * factor}px)`
    })
  })

  /* Smooth return to original positions when mouse leaves */
  on(hero, 'mouseleave', () => {
    allCards.forEach(c => {
      c.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      c.style.transform = ''
    })
    blobs.forEach(b => {
      b.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      b.style.transform = ''
    })
    particles.forEach(p => {
      p.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      p.style.transform = ''
    })
  })
}

/* ── PRODUCT CARD 3D TILT (ProductCard.tsx) ──────────────────────────── */
/* React: max tilt 12deg, transition 0.15s ease-out */

function initProductTilt() {
  $$('.product-card, [class*="rounded-3xl"][class*="overflow-hidden"][class*="shadow-sm"]').forEach(card => {
    if (!card.closest('#hero')) {
      on(card, 'mousemove', e => {
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        card.style.transform = `perspective(1000px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale3d(1.01, 1.01, 1.01)`
        card.style.transition = 'transform 0.15s ease-out'
      })
      on(card, 'mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
        card.style.transition = 'transform 0.4s ease-out'
      })
    }
  })
}

/* ── NAVBAR SCROLL BEHAVIOR (Navbar.tsx) ──────────────────────────────── */
/* React entrance: y -100→0, opacity 0→1, 0.8s [0.76, 0, 0.24, 1] */

function initNavbarScroll() {
  const navbar = $('#navbar')
  if (!navbar) return

  /* Entrance animation matching React */
  navbar.style.opacity = '0'
  navbar.style.transform = 'translateY(-100px)'
  navbar.style.transition = 'opacity 0.8s cubic-bezier(0.76, 0, 0.24, 1), transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)'
  requestAnimationFrame(() => {
    navbar.style.opacity = '1'
    navbar.style.transform = 'translateY(0)'
  })

  const threshold = 50
  let ticking = false

  on(window, 'scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > threshold) {
          navbar.style.backgroundColor = 'rgba(255, 247, 241, 0.9)'
          navbar.style.backdropFilter = 'blur(12px)'
          navbar.style.borderBottom = '1px solid rgba(112, 65, 27, 0.1)'
          navbar.style.boxShadow = 'var(--shadow-sm)'
        } else {
          navbar.style.backgroundColor = ''
          navbar.style.backdropFilter = ''
          navbar.style.borderBottom = ''
          navbar.style.boxShadow = ''
        }
        ticking = false
      })
      ticking = true
    }
  })
}

/* ── MODAL IMAGE CROSSFADE (ProductModal.tsx) ────────────────────────── */
/* React: initial opacity 0, blur 4px → animate opacity 1, blur 0, 0.4s */

function initModalImageCrossfade() {
  delegate(document, '.modal-thumb', 'click', (_, thumb) => {
    const mainImg = document.querySelector('#modal-main-img')
    if (!mainImg) return
    const newSrc = thumb.dataset.img
    if (!newSrc || mainImg.src.endsWith(newSrc)) return

    /* Crossfade: blur out, swap, blur in */
    mainImg.classList.add('crossfading')
    setTimeout(() => {
      mainImg.src = newSrc
      mainImg.classList.remove('crossfading')
    }, 200)

    /* Update active thumbnail border */
    document.querySelectorAll('.modal-thumb').forEach(t => {
      t.classList.remove('border-[#70411B]')
      t.classList.add('border-transparent')
    })
    thumb.classList.remove('border-transparent')
    thumb.classList.add('border-[#70411B]')
  })
}

/* ── FLOATING YARN BALL (Footer.tsx) ────────────────────────────────── */
/* React: rotate 360, 15s linear infinite */

function initYarnBall() {
  const ball = $('.footer-yarn-ball, .absolute.bottom-6.right-8 .text-4xl')
  if (ball) {
    ball.style.animation = 'spin-slow 15s linear infinite'
  }
}

/* ── INIT ALL ANIMATIONS ─────────────────────────────────────────────── */

function initAnimations() {
  initCursor()
  initPreloader()
  initNavbarScroll()
  initHero()
  initProductTilt()
  initYarnBall()
  initModalImageCrossfade()
}

/* ── Export to window for other modules ──────────────────────────────── */

window.initAnimations = initAnimations
window.initPreloader = initPreloader
window.initCustomCursor = initCursor

/* initAnimations() is called from main.js DOMContentLoaded */
