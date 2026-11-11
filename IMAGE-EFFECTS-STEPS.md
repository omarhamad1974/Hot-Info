# Image effects: color overlay and SVG shape (2-Nov, build 02-Nov-a)

Every picture you can upload in the admin can now get a **color overlay** and/or an **SVG shape (mask)**.

## Where
| Picture | Admin place | Shows on the website |
|---|---|---|
| Slide photo | Carousel > open a slide | Home page carousel |
| News photo | News > open an article | News card, the opened article, the Related news slider |
| Team photo | Team > open a member | Team card slider (About page) |
| Section photo background | Sections > open a section > Background: Photo | Behind that whole section |

Open the picture's **Image effects: color overlay and shape** box (under the photo field). It has a live preview.
One setting per picture: the news card, the article and the related-news thumbnail always match.

## Color overlay
- **Type**: None, **Matt** (one flat color) or **Gradient** (fades from one color to another).
- **Color**: pick one of your **brand palette** colors, a site color, one of your own colors, or **Other color...** for any color.
- **Intensity (opacity)**: 0 to 100%. Matt has one slider. Gradient has an intensity at the start and at the end, a second color, and a **direction** (8 directions, or center to edges). Example: Dark at 80% fading to Dark at 0% (the default gradient) gives the usual "dark at the bottom so the title is readable" look.

## Shape (SVG mask)
- Choose from 17 built-in shapes: circle, soft square, hexagon, 3 blobs, arch, leaf, cut corners, 2 waves, 2 curves, 2 diagonals, slanted sides. The first (crossed) box removes the shape.
- **Upload my own SVG**: the file is cleaned (scripts removed), saved to `assets/mask-....svg`, and appears as one of "your shapes" for every other picture. Use a **filled** shape: filled parts show the picture, empty or transparent parts hide it. The SVG needs a size (a `viewBox`, or `width` and `height`); max 200 KB.
- **Fit**: *Whole shape, keep its proportions*, *Fill the frame, keep proportions* (edges may be cut) or *Stretch to the frame* (good for waves and diagonals meant to follow the frame's edge). Built-in frame-style shapes (arch, waves, diagonals...) start on Stretch; the others on Whole shape.
- **Cut the shape out (invert)**: the picture shows outside the shape instead of inside.

## Sections
- The old **Darken the photo** slider is replaced by the overlay. Sections that used it are converted automatically (a matt overlay in the Dark color, same strength) the next time you open the Sections tab and save.
- A shape on a section masks only the **background**; the text stays fully visible. Outside the shape the page's normal background shows.
- **Text color** (Automatic) now looks at the overlay: light text when the overlay is strong (40% or more) and dark; otherwise dark text. Override it with the Text color drop-down when needed.

## Good to know
- Nothing changes for pictures with no effect: they are drawn exactly as before.
- Saved in `app-data.json` next to the picture as `imageFx` (`theme.sections.<section>.imageFx` for sections). `node scripts/validate.js` checks it (colors, intensity, shape names, uploaded SVG exists).
- Arabic mode: pictures and effects are shared with English; nothing to translate.
- Not included because they have no photo: the service cards, the Patents / Trademarks / Translation page cards, the logo, and the Directory pictures.
- No SQL to run.

## Files changed
`theme.js` (the effects engine, `KFX`), `admin.html`, `index.html`, `about.html`, `scripts/validate.js`, `README.md`, `ADMIN-IMPROVEMENTS.md`. New: this file. Upload all of them.

## Mask size, feather and rotation (added later)
Under the shape buttons (once a shape is chosen) there are three sliders:
- **Shape size** 10 to 300% (100 = as before). Turns the shape bigger or smaller around its centre. Parts pushed outside the frame are cut off.
- **Edge feather (softness)** 0 to 100 (0 = sharp). Blurs the edge so the picture fades out softly. The blur is relative to the shape, so it looks the same on any screen size.
- **Rotation** -180 to 180 degrees, around the centre of the shape. Looks best with fit "Whole shape" (with "Stretch to the frame" a rotated shape is also stretched).
A button resets the three. Works for the built-in shapes and for your uploaded SVGs (an uploaded SVG is read once from assets/ the first time a page needs it, so for a moment it may show without the rotation or feather, then updates itself). "Cut the shape out (invert)" works with all three.
Saved in the picture's imageFx as mask.size, mask.feather, mask.rotate (only when not the default); `node scripts/validate.js` checks the ranges.
Files: theme.js, admin.html, scripts/validate.js. No SQL.

## Behind the cut-away parts (shape mask on a section photo)
Admin > Sections > a section with a Photo background > Style > **Behind the cut-away parts**.
- **Transparent** (default): the hidden parts of a masked photo show the page behind the section. Before, a section with light text got a dark fill that showed through.
- Or choose a brand / site / custom color to fill the hidden parts.
- Only used when the photo has a shape mask. Without a mask a section with light text still gets the dark background as before.
- With light text on a masked section and a light page behind, choose a dark color here so the text stays readable.
Saved in `theme.sections.<section>.maskBg` (a color: `#rrggbb`, `brand:N`, `role:name` or `custom:id`). No SQL. Files: theme.js, admin.html, scripts/validate.js.

## Shadow: drop, cast and extruded (Phase 18 P7)
Open the picture's **Image effects** box > **Shadow (3D look)** > **Type**.
| Type | What you see |
|---|---|
| **Drop shadow** | A soft shadow behind the picture, offset in the light direction. It follows the shape's outline. |
| **Cast shadow (lies on the floor)** | The shape's silhouette lying on the floor behind the picture: flipped at its foot, leaning away from the light, fading and softening with distance. This is the one that gives the real 3D look. |
| **Extruded edge (thick slab)** | A solid edge on the side away from the light, like a thick slab. |

Controls: **Shadow color** (brand palette, site color, your own or any color), **Light direction** (0 = right, 90 = down, 180 = left; the cast shadow leans left or right with it), **Length / Thickness / Distance**, **Softness** and **Strength** (drop and cast only; the extruded edge is always solid).
- It works with every built-in shape, your own SVG shapes, and also with no shape (the shadow then follows the picture's rectangle).
- It follows the shape's size, rotation, feather and invert settings, because the shadow uses the same mask.
- All sizes are a share of the picture's width, so it looks the same on a phone and on a desktop.
- **Room for the shadow**: the shadow falls outside the picture's frame. Where a card or slide crops its picture (news card, carousel), the shadow is cut at the edge. Choose a shape and lower **Shape size** (for example 70-85%) so the shadow has room inside the frame.
- **Section photo backgrounds**: a shadow needs a shape on the section. The shadow falls on the page behind the section, so keep "Behind the cut-away parts" on **Transparent**.
- Saved in `imageFx.shadow = {type, color, angle, length, blur, opacity}` (blur and opacity are not saved for the extruded edge). `node scripts/validate.js` checks the type, the color and the ranges. No SQL.
- Pictures without a shadow are drawn exactly as before.
- Files: theme.js, admin.html, scripts/validate.js, IMAGE-EFFECTS-STEPS.md, README.md.
