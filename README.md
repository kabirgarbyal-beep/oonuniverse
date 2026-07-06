# ऊनीverse — Don't Yawn, Just Yarn

Premium handcrafted crochet creations made with love in Haldwani, India.

## Deployment

This is a **pure static site** — no build step required.

### Cloudflare Pages

1. Drag and drop the repo root into Cloudflare Pages
2. Or connect your GitHub repo and set:
   - **Build command:** (empty)
   - **Output directory:** `/` (root)

### Local Preview

Just open `index.html` in your browser. No server needed.

## Structure

```
├── index.html          # Homepage
├── shop.html           # Shop catalog
├── product.html        # Single product view
├── custom.html         # Custom orders / Loom Studio
├── gallery.html        # Pinterest-style gallery
├── about.html          # Our story
├── contact.html        # Contact form
├── 404.html            # Custom 404 page
├── _redirects          # Cloudflare Pages clean URLs
├── css/                # Stylesheets
├── js/                 # JavaScript modules
└── assets/             # Images and icons
```

## Tech Stack

- HTML5
- CSS3 (custom utility classes)
- Vanilla JavaScript (no frameworks)
- Google Fonts (Cormorant Garamond, DM Sans, Manrope)
