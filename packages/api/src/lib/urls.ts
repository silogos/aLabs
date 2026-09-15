/** Web-app URL helpers — the API mounts in-process under /api but lives in
 *  its own origin when run standalone, so anything that builds a link for
 *  humans (invite accept links, OAuth redirects) goes through WEB_URL. */

export const webUrl = () => process.env.WEB_URL ?? "http://localhost:3000";

/** Invitee-facing accept link — the in-app stand-in for email delivery
 *  (admins copy it from the members page until a provider is picked). */
export const inviteUrl = (token: string) => `${webUrl()}/invite?token=${token}`;
