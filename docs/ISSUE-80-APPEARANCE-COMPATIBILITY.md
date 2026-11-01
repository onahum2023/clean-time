# Issue #80 — appearance compatibility design (before implementation)

Baseline: latest main `b0fd4ba`, including merged Welcome #79 and navigation/Home
#78. This document precedes theme/onboarding/shared-screen code changes.

## Preference contract

Keep `cleantime-he-appearance` and its current three fields unchanged:

| Existing preference | Preservation rule |
| --- | --- |
| `background` | All nine identifiers remain: default, sage, sand, mist, lavender, rose, peach, sky, stone. A non-default background explicitly overrides the palette's canvas color. `default` uses the selected palette's canvas; with the original palette it is exactly the existing default. No stored value is remapped. |
| `font` | Assistant, Arial, serif, Tahoma and Verdana retain their identifiers and fallback stacks. Assistant stays self-hosted. |
| `accent` | Profile, teal, sky, plum, olive and rose retain their meanings. The profile option continues to follow any of the six existing recovery colors, including indigo. Explicit device accents retain precedence. Choosing a palette never resets an accent, background or font. |
| Custom/local adjustments | Existing selectors and profile-color overrides remain authoritative. No theme selection writes their storage or recovery profile. Unknown fields in existing appearance storage are left untouched by the new theme subsystem. No new photo/color upload schema is introduced. |

Use a separate additive local key, `cleantime-he-visual-theme`, holding only
`{palette, mode}`. Palettes: original, forest, rainy, sunny. Brightness modes:
system, light, dark. Palette and brightness are independent, avoiding duplicate
"light theme" and "dark theme" choices. Palettes coordinate canvas, cards,
foreground, secondary text, outlines and soft surfaces around the person's
existing accent. Original/system remain the defaults for existing and new users;
new users get no background image. No automatic migration/write occurs on read.

## Precedence, reset and failure behavior

1. Original palette preserves existing base light/dark colors. Other palettes
   are explicit opt-in choices inspired by the approved Welcome/reference.
2. System mode follows `prefers-color-scheme` live; an explicit light/dark choice
   takes precedence using the existing `data-theme` presentation hook.
3. Non-default legacy background and font/accent selections stay in effect.
   Reset appearance explicitly restores original/system plus the existing
   default/Assistant/profile settings. It never clears recovery records.
4. Early, synchronous, self-hosted preference loading applies attributes before
   CSS paints. Invalid/missing new records fall back to original/system;
   storage failure previews the choice and shows the existing unsaved-status
   message. Reads do not rewrite any existing key or timestamp.
5. New theme writes contain only the two bounded UI values. They never call
   recovery `save()`, stamp `updatedAt`, upload, sync, encrypt or export recovery
   content. Existing auth, keys, backup and recovery schemas remain unchanged.
6. Returning to the old app leaves the original appearance settings usable;
   the old app simply ignores the new key. No destructive downgrade migration.

## Validation required before integrated UAT

- Every legacy background/font/accent and all six recovery colors, both modes,
  remains readable and retains saved values across theme changes/reloads.
- Original/default Welcome remains matched to the approved baseline. Other
  palettes change colors consistently without editing Welcome copy/layout.
- Text/button/status contrast >=4.5:1; focus >=3:1. Include actual theme tiles,
  selected navigation and mixed palette/background overrides.
- No first-frame theme mismatch, external image/font/network addition or change
  to recovery bytes, encrypted uploads, portable export or account behavior.
- Keyboard/radio selection, 200% text/reflow, RTL/LTR, 320/390px mobile and
  1024/1440px desktop; offline theme selection/reload and cache upgrades.

## Delivery boundary

One Draft PR for #80, referencing #76/#77, with internal commits for themes,
onboarding and shared screens. No separate theme/screen approval stops. Complete
all regression evidence and deployed screenshots, then stop for integrated owner
UAT. Backend integration is deferred. No Nora review, merge or Production release.
