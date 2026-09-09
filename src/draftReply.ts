import type { EmailCategory } from "./classify.js";

export interface DraftReplyInput {
  category: EmailCategory;
  senderName: string | null;
  subject: string;
}

export interface DraftReply {
  subject: string;
  body: string;
  autoDraftEligible: boolean;
}

const TEMPLATES: Record<EmailCategory, { body: (name: string) => string; autoDraftEligible: boolean }> = {
  support: {
    body: (name) =>
      `Hi ${name},\n\nThanks for flagging this - sorry for the trouble. I'm looking into it now and will follow up with an update shortly. If you can share a screenshot or the exact steps that led to the issue, that'll help me track it down faster.\n\nBest,\nSupport`,
    autoDraftEligible: true,
  },
  sales: {
    body: (name) =>
      `Hi ${name},\n\nThanks for your interest! I'd love to walk you through pricing and see if it's a good fit. Do you have 15 minutes this week for a quick call?\n\nBest,\nSales`,
    autoDraftEligible: true,
  },
  billing: {
    body: (name) =>
      `Hi ${name},\n\nThanks for reaching out about your billing question. I'm pulling up your account now and will get back to you with details shortly.\n\nBest,\nBilling`,
    autoDraftEligible: false,
  },
  spam: {
    body: () => "",
    autoDraftEligible: false,
  },
  other: {
    body: (name) =>
      `Hi ${name},\n\nThanks for your email - I've received it and will get back to you soon.\n\nBest`,
    autoDraftEligible: false,
  },
};

function subjectPrefix(subject: string): string {
  return subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;
}

export function draftReply(input: DraftReplyInput): DraftReply {
  const template = TEMPLATES[input.category];
  const name = input.senderName?.trim() || "there";

  return {
    subject: subjectPrefix(input.subject),
    body: template.body(name),
    autoDraftEligible: template.autoDraftEligible,
  };
}

