import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { config } from "./config.js";

export interface FetchedEmail {
  uid: number;
  subject: string;
  body: string;
  fromAddress: string;
  fromName: string | null;
}

export async function fetchUnseenEmails(): Promise<FetchedEmail[]> {
  const client = new ImapFlow({
    host: config.imap.host,
    port: config.imap.port,
    secure: true,
    auth: { user: config.imap.user, pass: config.imap.password },
    logger: false,
  });

  const results: FetchedEmail[] = [];

  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      for await (const message of client.fetch({ seen: false }, { source: true, uid: true })) {
        if (!message.source) continue;
        const parsed = await simpleParser(message.source);
        results.push({
          uid: message.uid,
          subject: parsed.subject ?? "(no subject)",
          body: parsed.text ?? "",
          fromAddress: parsed.from?.value[0]?.address ?? "unknown@unknown",
          fromName: parsed.from?.value[0]?.name ?? null,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return results;
}

