# Track B appearance

Issue #80 adds optional coordinated palettes and brightness in a separate local
key while retaining the legacy contract below. See the
[pre-implementation compatibility design](ISSUE-80-APPEARANCE-COMPATIBILITY.md)
and [integrated UAT gallery/checklist](ISSUE-80-INTEGRATED-UAT.md).

Nine curated backgrounds, five font stacks, and five optional device-local accent
overrides retain the existing background/Assistant/profile accent as defaults.
All choices preview immediately; reset restores all three preferences. Existing
appearance records without an accent normalize to the profile color. Preferences
never stamp/sync/export recovery content and do not require an account.

Assistant remains self-hosted under its existing OFL license. Arial, Times New
Roman, Tahoma and Verdana are system font requests, not redistributed font files;
available glyphs depend on the device and readable fallbacks are explicit. No
remote font/CDN dependency was added. Native device inspection remains necessary.

`appearance-palette-qa.js` evaluates all 990 background/font/accent/light-dark
combinations (including all six profile colors) for 4.5:1 body, muted, button, status and error contrast and 3:1 focus contrast. It
also checks persistence, reset, unchanged recovery bytes and 360px Hebrew layout.
The prior appearance/feedback suite remains required. System-font rendering and
physical-device preferences need manual UAT; technical contrast is not font UAT.
