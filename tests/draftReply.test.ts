import { describe, it, expect } from "vitest";
import { draftReply } from "../src/draftReply.js";

describe("draftReply", () => {
  it("prefixes the subject with Re: when not already present", () => {
    const result = draftReply({ category: "support", senderName: "Sam", subject: "Login issue" });
    expect(result.subject).toBe("Re: Login issue");
  });

  it("does not double-prefix a subject that already has Re:", () => {
    const result = draftReply({ category: "support", senderName: "Sam", subject: "Re: Login issue" });
    expect(result.subject).toBe("Re: Login issue");
  });

  it("falls back to a generic greeting when no sender name is known", () => {
    const result = draftReply({ category: "sales", senderName: null, subject: "Pricing" });
    expect(result.body).toContain("Hi there,");
  });

  it("uses the sender's name when available", () => {
    const result = draftReply({ category: "sales", senderName: "Jordan", subject: "Pricing" });
    expect(result.body).toContain("Hi Jordan,");
  });

  it("marks support and sales as auto-draft eligible", () => {
    expect(draftReply({ category: "support", senderName: "A", subject: "x" }).autoDraftEligible).toBe(true);
    expect(draftReply({ category: "sales", senderName: "A", subject: "x" }).autoDraftEligible).toBe(true);
  });

  it("marks billing and other as requiring manual review", () => {
    expect(draftReply({ category: "billing", senderName: "A", subject: "x" }).autoDraftEligible).toBe(false);
    expect(draftReply({ category: "other", senderName: "A", subject: "x" }).autoDraftEligible).toBe(false);
  });

  it("returns an empty draft for spam", () => {
    const result = draftReply({ category: "spam", senderName: "A", subject: "x" });
    expect(result.body).toBe("");
    expect(result.autoDraftEligible).toBe(false);
  });
});

