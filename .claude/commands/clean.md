---
description: Audit and sanitize all user-submitted input before it's rendered or stored
---

Escape and sanitize anything a user submits before it ever gets shown on the page.

Go through every Next.js API route under `app/api/**` that accepts a request body from a user (authenticated vendor, authenticated consumer, or anonymous public form like the inquiry endpoint). For each one:

1. **Free-text fields** (names, bios, notes, messages, addresses, etc.) — run them through `cleanText()` from `lib/sanitize.ts` (strips control characters, trims, caps length) before writing to the database. Add a reasonable max length per field if one doesn't already exist.
2. **URL fields** (avatar/cover images, social links, portfolio links, anything used in an `href` or `src`) — validate with `isSafeUrl()` from `lib/sanitize.ts` and reject the request with a 400 if a non-empty value isn't a safe `http`/`https` URL. This is the field type that plain React escaping does *not* protect — a `javascript:` URL still executes on click even though React escapes the surrounding text.
3. Confirm no `dangerouslySetInnerHTML` has been introduced anywhere (`grep -rn dangerouslySetInnerHTML app components`) — if one exists, treat it as a blocker and either remove it or sanitize the HTML with a real sanitizer before allowing it.
4. Re-run `npm run build` to confirm nothing broke, then report which routes/fields were touched.

Keep edits minimal and consistent with the existing pattern in each route file — don't introduce a new validation library, just extend the two helpers already in `lib/sanitize.ts`.
