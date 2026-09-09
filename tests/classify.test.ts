import { describe, it, expect } from "vitest";
import { classifyEmail } from "../src/classify.js";

describe("classifyEmail", () => {
  it("classifies billing keywords", () => {
    const result = classifyEmail({
      subject: "Invoice #1042 payment failed",
      body: "Your recent charge could not be processed.",
      fromAddress: "billing@acme.com",
    });
    expect(result).toBe("billing");
  });

  it("classifies support keywords", () => {
    const result = classifyEmail({
      subject: "Login is broken",
      body: "I can't log in, I keep getting an error.",
      fromAddress: "user@example.com",
    });
    expect(result).toBe("support");
  });

  it("classifies sales keywords", () => {
    const result = classifyEmail({
      subject: "Interested in your enterprise plan",
      body: "Can you send pricing and set up a demo?",
      fromAddress: "prospect@bigco.com",
    });
    expect(result).toBe("sales");
  });

  it("classifies spam by keywords", () => {
    const result = classifyEmail({
      subject: "You've won a prize!",
      body: "Click here now, limited time offer, act now!",
      fromAddress: "promo@deals.com",
    });
    expect(result).toBe("spam");
  });

  it("classifies spam by sender domain regardless of body", () => {
    const result = classifyEmail({
      subject: "hello",
      body: "just checking in",
      fromAddress: "someone@mailinator.com",
    });
    expect(result).toBe("spam");
  });

  it("falls back to other when nothing matches", () => {
    const result = classifyEmail({
      subject: "Quick question",
      body: "What time works for you tomorrow?",
      fromAddress: "friend@example.com",
    });
    expect(result).toBe("other");
  });

  it("picks the highest-scoring category when multiple keywords appear", () => {
    const result = classifyEmail({
      subject: "Bug in the app",
      body: "This is broken and I need help, also curious about pricing sometime.",
      fromAddress: "user@example.com",
    });
    expect(result).toBe("support");
  });
});

