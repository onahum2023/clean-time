# Gentle date updates and quiet milestones (#25, #26)

Changing an existing recovery start date or effective clock time now asks for explicit confirmation in neutral Hebrew. It explains that journal, plans, gratitude, inventory and links remain. Cancel changes no stored field/timestamp; accepting changes only the chosen profile fields and normal sync timestamp. A failed local write keeps the previous in-memory state and displays the existing storage warning. Registered updates continue through the unchanged whole-state encrypted sync path.

Milestones are optional, off by default, enabled in Settings with a device-local checkbox. Home quietly shows the last reached milestone and its calendar date. No celebration, reminder, competition, persisted achievement list or analytics. Thresholds: 30/60/90 calendar days, 6/9/12/18 calendar months, yearly from year two. Local clock time is preserved; month ends and Feb 29 anniversaries clamp to the last valid day. Derivation uses the existing chosen recovery date/time.

Focused synthetic Chromium checks: recovery-flow 27 + registered upgrade 56 + sync 8 = **91**, zero failures. Tests cover confirmation/cancel, all historical and unknown fields, reload, write failure, no-pressure opt-in, leap/month-end anniversaries and DST/calendar-day behavior in Jerusalem, New York and Auckland. The registered suite acknowledges confirmation and verifies the complete updated encrypted payload retains history. Full-regression totals and exact Preview identity are recorded in the PR after execution.

No production records, schema, authentication settings or crypto format changes. Physical-device acceptance and live staging lifecycle are separate. Refs #37; original issues remain open until accepted.
