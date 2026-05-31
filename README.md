# Project Threshold — Gathering the Evidence

Interactive homepage with a full-bleed background image and responsive neon hotspot overlays.

## Setup

1. **Add the homepage background image**

   Place the image at:
   ```
   public/images/homepage-bg.jpg
   ```
   The HTML references this path. Any JPEG, PNG, or WebP will work — update the `src` in `public/index.html` if you use a different filename.

2. **Open the site**

   No build step required. Open `public/index.html` directly in a browser, or serve with any static server:
   ```bash
   npx serve public
   # or
   python3 -m http.server 8080 --directory public
   ```

## Hotspot map

Each hotspot is an `<a>` absolutely positioned as **percentages** of the hero container so it scales at every viewport size.

| Hotspot | Colour | Action |
|---|---|---|
| Login (top-left panel) | Green | Opens Login modal |
| Settings (top-right panel) | Cyan | Opens Settings modal |
| Report an Experience (centre CTA) | Yellow + pulse | Opens Report modal |
| Overlapping Reports (left-mid) | Green | Opens Overlapping Reports modal |
| Encounter Reports (right-mid) | Magenta | Opens Encounter Reports modal |
| Fear & Intimidation Reports (left-lower) | Cyan | Opens Fear modal |
| Lessons / Integrated Reports (right-lower) | Orange | Opens Lessons modal |
| Explore the Theory (centre-low CTA) | Cyan + pulse | Opens Theory modal |
| Evidence & Encounters (bottom-left) | Green | Opens Evidence modal |
| Neutralizing Fear Techniques (bottom-centre) | Magenta + pulse | Opens modal |
| Community Forum (bottom-right) | Cyan | Opens Forum modal |

## Customising hotspots

Position is set inline: `style="left:%; top:%; width:%; height:%;"`. Adjust after adding your image.

- **Colour classes:** `hotspot--cyan` `hotspot--green` `hotspot--yellow` `hotspot--magenta` `hotspot--orange`
- **Pulse animation:** add `hotspot--pulse`
- **Tooltip:** `data-tip="…"`
- **Modal content:** `MODAL_DATA` object in `public/js/homepage.js`
