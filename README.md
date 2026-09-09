# Email Inbox Bot

A small IMAP bot that reads unread emails, classifies them (support / sales / billing / spam / other), and drafts a reply. Built as a focused utility rather than a full app - the interesting part is the classification and drafting logic, which is pure and fully unit tested.

## How it works

1. Connects to an IMAP mailbox and fetches unseen messages (`src/imapClient.ts`)
2. Classifies each one with a deterministic, keyword-weighted rule set (`src/classify.ts`) - rule-based rather than an LLM call, since it's free, instant, and fully testable
3. Generates a draft reply from a template for that category, personalized with the sender's name (`src/draftReply.ts`)
4. Logs the draft; only sends automatically if AUTO_SEND_ENABLED=true, and only for categories marked auto-draft-eligible (billing and uncategorized mail always require a human to review first)

## Why split it this way

The IMAP/SMTP code (`imapClient.ts`, `index.ts`) does real network I/O and isn't practical to unit test without a live mailbox. The classification and drafting logic is pure - no I/O, same input always gives the same output - so it's split out and covered by tests instead of only being exercised by hand.

## Tech stack

TypeScript - Node.js - imapflow - nodemailer - Vitest

## Running it

```bash
npm install
cp .env.example .env
npm run dev
```

Fill in IMAP_HOST/IMAP_USER/IMAP_PASSWORD and SMTP_HOST/SMTP_USER/SMTP_PASSWORD in .env first.

## Testing

```bash
npm run test
```

Covers the classification rules and the reply-drafting logic (subject prefixing, name fallback, which categories are safe to auto-send).

## Status

A working single-purpose utility, not a production mail client - no retry/backoff on IMAP errors yet, and the classifier is intentionally simple keyword matching rather than an LLM call.
