import nodemailer from "nodemailer";
import { config } from "./config.js";
import { fetchUnseenEmails } from "./imapClient.js";
import { classifyEmail } from "./classify.js";
import { draftReply } from "./draftReply.js";

async function main() {
  const emails = await fetchUnseenEmails();
  console.log(`Fetched ${emails.length} unseen email(s).`);

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: { user: config.smtp.user, pass: config.smtp.password },
  });

  for (const email of emails) {
    const category = classifyEmail({
      subject: email.subject,
      body: email.body,
      fromAddress: email.fromAddress,
    });

    if (category === "spam") {
      console.log(`[spam] "${email.subject}" from ${email.fromAddress} - skipped`);
      continue;
    }

    const draft = draftReply({
      category,
      senderName: email.fromName,
      subject: email.subject,
    });

    console.log(`[${category}] "${email.subject}" from ${email.fromAddress}`);
    console.log(`  --> draft reply:\n${draft.body.split("\n").map((l) => "      " + l).join("\n")}`);

    if (config.autoSendEnabled && draft.autoDraftEligible) {
      await transporter.sendMail({
        from: config.smtp.user,
        to: email.fromAddress,
        subject: draft.subject,
        text: draft.body,
      });
      console.log("  --> sent.");
    } else {
      console.log("  --> AUTO_SEND_ENABLED is off (or category requires manual review): draft logged only.");
    }
  }
}

main().catch((err) => {
  console.error("email-inbox-bot failed:", err);
  process.exitCode = 1;
});

