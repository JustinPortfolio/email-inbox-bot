/**
 * Pure, deterministic email classification by keyword rules.
 *
 * Deliberately rule-based rather than an LLM call: it's free, instant,
 * fully testable, and good enough for routing a small inbox into buckets.
 * `draftReply.ts` is where an LLM call would make more sense (freeform
 * text generation), and this module is designed to hand it a category.
 */

export type EmailCategory = "support" | "sales" | "billing" | "spam" | "other";

export interface ClassifiableEmail {
  subject: string;
  body: string;
  fromAddress: string;
}

interface Rule {
  category: EmailCategory;
  keywords: string[];
  weight: number;
}

const RULES: Rule[] = [
  {
    category: "billing",
    keywords: ["invoice", "receipt", "refund", "charge", "billing", "payment failed", "subscription"],
    weight: 3,
  },
  {
    category: "support",
    keywords: ["not working", "broken", "error", "bug", "issue", "help", "can't log in", "cannot log in", "reset password"],
    weight: 2,
  },
  {
    category: "sales",
    keywords: ["pricing", "quote", "demo", "trial", "upgrade", "interested in", "purchase", "enterprise plan"],
    weight: 2,
  },
  {
    category: "spam",
    keywords: ["unsubscribe", "limited time offer", "act now", "click here", "you've won", "you have won", "crypto giveaway"],
    weight: 4,
  },
];

const SPAMMY_DOMAINS = ["mailinator.com", "tempmail.com", "guerrillamail.com"];

function countMatches(haystack: string, keywords: string[]): number {
  const lower = haystack.toLowerCase();
  return keywords.reduce((count, kw) => (lower.includes(kw.toLowerCase()) ? count + 1 : count), 0);
}

export function classifyEmail(email: ClassifiableEmail): EmailCategory {
  const text = `${email.subject}\n${email.body}`;
  const domain = email.fromAddress.split("@")[1]?.toLowerCase() ?? "";

  if (SPAMMY_DOMAINS.includes(domain)) {
    return "spam";
  }

  let bestCategory: EmailCategory = "other";
  let bestScore = 0;

  for (const rule of RULES) {
    const matches = countMatches(text, rule.keywords);
    const score = matches * rule.weight;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = rule.category;
    }
  }

  return bestCategory;
}

