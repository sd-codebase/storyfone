# Storyfone Thumbnail Generation Prompts

Prompts for AI image generation (Midjourney / DALL-E / Ideogram) that align with the app's dark crimson theme.

---

## App Color Reference

| Role           | Hex                    | Use                      |
| -------------- | ---------------------- | ------------------------ |
| Background     | `#0A0A0A`              | Deep black base          |
| Primary red    | `#DC2626`              | Accent highlights, glow  |
| Dark red       | `#991B1B` / `#7F1D1D`  | Shadows, gradients       |
| Bright red     | `#FF4444`              | Focal point pops         |
| Warm muted     | `#6B5858` / `#9A8A8A`  | Secondary tones          |
| Light warm     | `#F5F0F0`              | Title text if overlaid   |
| Star orange    | `#FF6B35`              | Warm accent alternative  |

---

## Book Thumbnail (3:4 Portrait)

```
Audiobook cover art for "[BOOK TITLE]", [GENRE] genre.
[Brief scene/mood description from the book].
Dark moody aesthetic with deep blacks (#0A0A0A), rich crimson red (#DC2626) accents,
and warm brown undertones. Cinematic lighting with red glow highlights.
Minimal text, bold typography if any. Portrait orientation 3:4 ratio.
Style: editorial illustration, dark romance book cover aesthetic,
high contrast, atmospheric, professional audiobook artwork.
--ar 3:4
```

### Example

```
Audiobook cover art for "Crimson Whispers", dark romance genre.
A woman silhouetted against rain-streaked window, city lights beyond.
Dark moody aesthetic with deep blacks (#0A0A0A), rich crimson red (#DC2626) accents,
and warm brown undertones. Cinematic lighting with red glow highlights.
Minimal text, bold typography if any. Portrait orientation 3:4 ratio.
Style: editorial illustration, dark romance book cover aesthetic,
high contrast, atmospheric, professional audiobook artwork.
--ar 3:4
```

---

## Chapter Thumbnail (16:9 Landscape)

```
Chapter illustration for "[CHAPTER TITLE]" from audiobook "[BOOK TITLE]".
[Brief scene description for this chapter].
Minimalist composition, dark background (#0A0A0A to #1A0505 gradient),
single crimson (#DC2626) accent element, warm muted tones (#6B5858, #9A8A8A).
Abstract/symbolic representation. Horizontal 16:9 ratio.
Style: moody editorial art, cinematic still, atmospheric,
subtle red glow, audiobook chapter card aesthetic.
--ar 16:9
```

### Example

```
Chapter illustration for "The First Letter" from audiobook "Crimson Whispers".
A sealed envelope on a dark wooden table, a single red candle casting warm light.
Minimalist composition, dark background (#0A0A0A to #1A0505 gradient),
single crimson (#DC2626) accent element, warm muted tones (#6B5858, #9A8A8A).
Abstract/symbolic representation. Horizontal 16:9 ratio.
Style: moody editorial art, cinematic still, atmospheric,
subtle red glow, audiobook chapter card aesthetic.
--ar 16:9
```

---

## Tips

- Replace `[BRACKETED TEXT]` with actual book/chapter details
- Keep scene descriptions to 1-2 sentences for best results
- The red-on-dark palette matches the app's card backgrounds: dark mode `#1A1212`, light mode `#FFFFFF`
- For adult content books, lean heavier on shadow and silhouette
- For non-adult/fantasy books, allow slightly more color variation while keeping the red accent
