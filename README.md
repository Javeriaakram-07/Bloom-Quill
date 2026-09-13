# Bloom & Quill 🌹

A vintage, sketchbook-styled florist website - built with plain HTML, CSS, and JavaScript
(no frameworks, no backend). Made for Web Technologies Assignment 01.

**Owner:** Javeria Akram
**Contact:** javeriaakrm259@gmail.com

## Folder structure
```
bloom-quill/
├── index.html        Home
├── about.html         About / studio story + doodle pad
├── blooms.html         Products + bouquet builder
├── sketchbook.html    Gallery + lightbox + care notes accordion
├── contact.html       Contact form + ink preview
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/            (local images if you swap out the unsplash placeholders)
```

## JavaScript features (for viva)
1. Custom cursor (dot + trailing ring) that reacts on hover
2. Rose SVG that draws itself in on page load (stroke-dashoffset animation)
3. Ambient falling petals on `<canvas>`
4. Scroll-triggered reveal animations (IntersectionObserver) + ink-stroke divider
5. Responsive hamburger nav
6. Bouquet builder - add/remove items, live running total, auto-generated note,
   state persisted with `sessionStorage`
7. Product + gallery filtering by category/season
8. Sketchbook lightbox with keyboard navigation (Esc / ← / →)
9. Accordion for care notes
10. Doodle pad - draw with the mouse/touch on `<canvas>`, change ink colour, clear, save as PNG
11. Contact form - real-time validation (name/email/message) + live "written in ink" preview

## Running it locally
No build step needed. Either:
- Open `index.html` directly in a browser, or
- Serve it locally: `python3 -m http.server` from this folder, then visit `localhost:8000`


