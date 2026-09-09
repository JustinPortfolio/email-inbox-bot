import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  imap: {
    host: required("IMAP_HOST"),
    port: Number(process.env.IMAP_PORT ?? 993),
    user: required("IMAP_USER"),
    password: required("IMAP_PASSWORD"),
  },
  smtp: {
    host: required("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT ?? 587),
    user: required("SMTP_USER"),
    password: required("SMTP_PASSWORD"),
  },
  autoSendEnabled: process.env.AUTO_SEND_ENABLED === "true",
};

