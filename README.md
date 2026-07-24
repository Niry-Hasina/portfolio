# Niry Hasina Randriamihamina — Portfolio

Personal portfolio website for **Niry Hasina Randriamihamina**, Senior Digital Product Designer & AI-Augmented Creative based in Dubai, UAE.

Live at **[niry-hasina.com](https://www.niry-hasina.com)**

## Stack

Pure HTML · Vanilla CSS · Vanilla JavaScript — no build step, no dependencies.

## Structure

```
.
├── index.html                      # Home page
├── about.html                      # Background & experience
├── robots.txt                      # Crawler directives
├── .gitignore
├── README.md
│
├── assets/
│   ├── css/
│   │   └── style.css               # Design system & all styles
│   ├── js/
│   │   ├── components.js           # Shared nav, mobile menu & footer (injected dynamically)
│   │   └── main.js                 # Scroll progress bar & reveal animations
│   └── images/
│       └── niry-hasina.jpg         # Portrait photo
│
└── work/
    ├── index.html                  # Work listing page
    ├── motogp.html                 # Case study: MotoGP sponsorship identity
    ├── payment.html                # Case study: Trading platform design system
    └── gonashop.html               # Case study: M•GonaShop e-commerce
```

## Deployment — GitHub Pages

1. Go to **Settings → Pages**.
2. Set source to **Deploy from a branch → main → / (root)**.
3. Enable **Enforce HTTPS** in the same settings panel.
4. Save — the site will be live at the custom domain configured in `CNAME`.

## Local preview

Open `index.html` in a browser, or use any static server for full path support:

```bash
# Python (built-in)
python -m http.server 8080

# Node (npx)
npx serve .
```

> **Note**: Opening HTML files directly with `file://` works for most features,
> but the dynamic nav/footer injection relies on `document.currentScript.src`,
> which requires a local server for full reliability across all page depths.
