# Design System — Desktop UI

## 1. Design Philosophy

This design system is built for a modern, professional desktop interface intended for long working sessions. It favors controlled contrast, a clear typographic hierarchy, and a palette that stays comfortable on wide screens over several hours of use.

---

## 2. Color Palette

### 2.1 Primary Colors

| Role            | Name        | Hex       | Usage                                          |
| --------------- | ----------- | --------- | ---------------------------------------------- |
| Primary         | Deep Indigo | `#3B4CE0` | Primary buttons, active links, action elements |
| Primary — Hover | Dark Indigo | `#2E3BB8` | Hover/pressed state of primary elements        |
| Primary — Light | Pale Indigo | `#E5E8FC` | Light backgrounds, badges, selections          |

### 2.2 Secondary Colors

| Role              | Name           | Hex       | Usage                                            |
| ----------------- | -------------- | --------- | ------------------------------------------------ |
| Secondary         | Turquoise      | `#1BA8A0` | Secondary actions, graphic accents, active icons |
| Secondary — Hover | Dark Turquoise | `#158079` | Hover state of secondary elements                |
| Secondary — Light | Pale Turquoise | `#DAF3F1` | Subtle backgrounds, tags                         |

### 2.3 Accent Colors

| Role     | Name         | Hex       | Usage                                           |
| -------- | ------------ | --------- | ----------------------------------------------- |
| Accent 1 | Coral Orange | `#FF7A45` | One-off call-to-action, important notifications |
| Accent 2 | Amber Yellow | `#FFC145` | Soft alerts, highlights                         |

### 2.4 Neutral Colors (grayscale)

| Name        | Hex       | Usage                             |
| ----------- | --------- | --------------------------------- |
| Neutral 900 | `#111318` | Main text, headings               |
| Neutral 800 | `#242730` | Dark secondary text               |
| Neutral 600 | `#5B6070` | Tertiary text, placeholders       |
| Neutral 400 | `#9AA0AE` | Disabled icons, strong borders    |
| Neutral 200 | `#E1E4EA` | Borders, dividers                 |
| Neutral 100 | `#F2F4F7` | Card backgrounds, secondary areas |
| Neutral 50  | `#F9FAFB` | App's general background          |
| White       | `#FFFFFF` | Panel backgrounds, elevated cards |

### 2.5 Semantic Colors (states)

| State   | Name         | Hex       | Usage                              |
| ------- | ------------ | --------- | ---------------------------------- |
| Success | Mint Green   | `#2FB870` | Confirmations, validations         |
| Warning | Amber Orange | `#F2994A` | Warnings                           |
| Error   | Coral Red    | `#EB5757` | Errors, deletions, critical alerts |
| Info    | Sky Blue     | `#3E9CF0` | Informational messages, tooltips   |

### 2.6 Dark Mode (optional — recommended variant)

| Role                          | Hex       |
| ----------------------------- | --------- |
| Main background               | `#0F1115` |
| Secondary background (cards)  | `#1A1D24` |
| Borders                       | `#2A2E38` |
| Main text                     | `#F2F4F7` |
| Secondary text                | `#9AA0AE` |
| Primary (contrast-adjusted)   | `#6C7BF5` |
| Secondary (contrast-adjusted) | `#3FCFC6` |

---

## 3. Typography

### 3.1 Font for Headings and Major Elements

**Sora** (Google Fonts, free)

- Usage: headings (H1–H4), section titles, buttons, navigation labels, dashboard/key figures
- Geometric, modern character with strong legibility in bold on desktop
- Recommended weights: 600 (SemiBold) for headings, 700 (Bold) for strong accents

```css
font-family: "Sora", sans-serif;
```

| Element | Size | Weight | Line-height |
| ------- | ---- | ------ | ----------- |
| H1      | 32px | 700    | 1.2         |
| H2      | 24px | 600    | 1.25        |
| H3      | 20px | 600    | 1.3         |
| H4      | 16px | 600    | 1.35        |
| Button  | 14px | 600    | 1           |

### 3.2 Font for Long and Recurring Text

**Inter** (Google Fonts, free)

- Usage: paragraphs, descriptions, forms, tables, list content, help text
- Excellent legibility at small sizes, optimized for screens, extensive weight support

```css
font-family: "Inter", sans-serif;
```

| Element                  | Size | Weight | Line-height |
| ------------------------ | ---- | ------ | ----------- |
| Body text                | 14px | 400    | 1.6         |
| Body text (large)        | 16px | 400    | 1.6         |
| Secondary text / caption | 12px | 400    | 1.5         |
| Field label              | 13px | 500    | 1.4         |

### 3.3 Pairing

Sora (headings) + Inter (body) form a coherent duo: two geometric/humanist families close in tone but distinct enough to create a clear visual hierarchy without a style clash.

---

## 4. Spacing (4/8 base system)

| Token       | Value | Usage                                   |
| ----------- | ----- | --------------------------------------- |
| `space-xs`  | 4px   | Minimal internal spacing (icon/text)    |
| `space-sm`  | 8px   | Compact padding, between close elements |
| `space-md`  | 16px  | Standard component padding              |
| `space-lg`  | 24px  | Margins between sections                |
| `space-xl`  | 32px  | Margins between major blocks            |
| `space-2xl` | 48px  | Page margins, separation of large areas |

---

## 5. Border Radius

| Token         | Value | Usage                        |
| ------------- | ----- | ---------------------------- |
| `radius-sm`   | 4px   | Inputs, tags, small buttons  |
| `radius-md`   | 8px   | Cards, standard buttons      |
| `radius-lg`   | 12px  | Modals, panels               |
| `radius-full` | 999px | Avatars, round badges, pills |

---

## 6. Shadows (elevation)

| Token       | CSS Value                         | Usage                     |
| ----------- | --------------------------------- | ------------------------- |
| `shadow-sm` | `0 1px 2px rgba(17,19,24,0.06)`   | Resting cards             |
| `shadow-md` | `0 4px 12px rgba(17,19,24,0.10)`  | Hovered cards, dropdowns  |
| `shadow-lg` | `0 12px 32px rgba(17,19,24,0.16)` | Modals, floating popovers |

---

## 7. Quick Usage Rules

- **General background**: Neutral 50 (`#F9FAFB`)
- **Cards/panels**: White with `shadow-sm` and Neutral 200 border
- **Primary buttons**: Primary background, white text, `radius-md`
- **Secondary buttons**: transparent background, Neutral 200 border, Neutral 900 text
- **Links**: Primary color, underlined on hover
- **Main text**: Neutral 900 in Inter
- **Disabled text**: Neutral 400

---

## 8. Accessibility

- Minimum AA contrast (4.5:1) maintained between Neutral 900 and White/Neutral 50 backgrounds
- Never use Neutral 400 for text carrying critical information
- Semantic colors (success/error/warning) must always be paired with an icon or text label, never color alone
