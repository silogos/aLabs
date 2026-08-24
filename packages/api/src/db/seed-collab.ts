/** Demo seed: the collaboration half — activity feed (incl. the reports-view
 *  history backfill), notifications, the six demo meetings with action
 *  items, and the seven demo agreements. Every section is guarded, so
 *  re-seeding never duplicates rows. */
import * as meetingRepo from "./meeting-repo";
import * as agreementRepo from "./agreement-repo";
import * as notificationRepo from "./notification-repo";
import * as activityRepo from "./activity-repo";
import type { TaskWithMeta } from "./task-repo";
import type { SeedCtx } from "./seed-shared";

/** `fresh` = first seed (the docs half found nothing) — gates the
 *  first-seed-only activity + notification rows. */
export async function seedCollab(ctx: SeedCtx, parents: TaskWithMeta[], fresh: boolean): Promise<void> {
  const { atlas, usersByShort } = ctx;

  /* ---------------- Activity feed ---------------- */
  if (fresh) {
    const activity = (
      kind: "move" | "doc" | "com" | "done" | "mile",
      actor: keyof SeedCtx["usersByShort"],
      target: string,
      whenLabel: string,
      minutesAgo: number,
    ) =>
      activityRepo.insertActivity({
        projectId: atlas.id,
        kind,
        actorId: usersByShort[actor].id,
        target,
        whenLabel,
        occurredAt: new Date(Date.now() - minutesAgo * 60_000),
      });
    await activity("move", "mk", "ATL-101", "12 minutes ago", 12);
    await activity("doc", "jb", "Design System v1", "38 minutes ago", 38);
    await activity("com", "dp", "ATL-103", "1 hour ago", 60);
    await activity("done", "sr", "ATL-112", "2 hours ago", 120);
    await activity("mile", "ay", "Security hardening", "3 hours ago", 180);
    await activity("done", "lc", "ATL-113", "5 hours ago", 300);
  }

  /* Activity history for the reports view — additive, only while the feed is
   * still the bare first-seed set, so re-seeding never duplicates rows. */
  if ((await activityRepo.listActivity(atlas.id)).length <= 6) {
    const hist = (
      kind: "move" | "doc" | "com" | "done" | "mile",
      actor: keyof SeedCtx["usersByShort"],
      target: string,
      daysAgo: number,
    ) =>
      activityRepo.insertActivity({
        projectId: atlas.id,
        kind,
        actorId: usersByShort[actor].id,
        target,
        whenLabel: `${daysAgo}d ago`,
        occurredAt: new Date(Date.now() - daysAgo * 864e5 - Math.round(Math.random() * 8 * 3600_000)),
      });
    const rows: Parameters<typeof hist>[] = [
      ["done", "mk", "ATL-101", 1], ["com", "lc", "ATL-102", 1], ["move", "ay", "ATL-108", 1],
      ["doc", "jb", "Design System v1", 2], ["done", "dp", "ATL-104", 2], ["com", "sr", "ATL-112", 2],
      ["done", "lc", "ATL-106", 3], ["move", "mk", "ATL-105", 3], ["doc", "ay", "Northwind SOW", 3],
      ["done", "jb", "ATL-109", 4], ["com", "dp", "ATL-103", 4], ["mile", "ay", "v2.0 Beta release", 4],
      ["done", "sr", "ATL-110", 5], ["doc", "lc", "Data model v3", 5], ["com", "mk", "ATL-101", 5],
      ["done", "dp", "ATL-111", 6], ["move", "jb", "ATL-107", 6], ["com", "ay", "ATL-101", 6],
      ["done", "mk", "ATL-113", 6], ["doc", "sr", "Test plan", 6],
    ];
    for (const r of rows) await hist(r[0], r[1], r[2], r[3]);
  }

  /* ---------------- Notifications ---------------- */
  if (fresh) {
    const aisha = usersByShort.ay;
    await notificationRepo.insertNotification({
      userId: aisha.id,
      type: "mention",
      title: "Marco mentioned you on ATL-101",
      body: "Can you review the PKCE verifier before EOD?",
      link: "/tasks/101",
    });
    await notificationRepo.insertNotification({
      userId: aisha.id,
      type: "due",
      title: "ATL-116 is due today",
      body: "Backlog grooming: triage queue",
      link: "/tasks/116",
    });
  }

  /* ---------------- Meetings + action items ---------------- */
  // mirrors the prototype's six demo meetings; scheduled relative to runtime
  // today so the Upcoming/Past split always has content on both sides.
  if ((await meetingRepo.listMeetings(atlas.id)).length === 0) {
    const at = (offset: number, h: number, m = 0) =>
      new Date(`${ctx.dayIso(offset)}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`);
    const ids = (...shorts: (keyof SeedCtx["usersByShort"])[]) => shorts.map((s) => usersByShort[s].id);
    const action = (
      meetingId: string,
      description: string,
      who: keyof SeedCtx["usersByShort"],
      dueOffset: number | null,
      opts: { done?: boolean; taskId?: string } = {},
    ) =>
      meetingRepo
        .insertActionItem({
          meetingId,
          description,
          assigneeId: usersByShort[who].id,
          dueDate: dueOffset === null ? null : new Date(`${ctx.dayIso(dueOffset)}T00:00:00.000Z`),
          taskId: opts.taskId,
        })
        .then((item) =>
          opts.done ? meetingRepo.patchActionItem(item.id, { done: true }) : undefined,
        );

    const ssoTask = parents.find((t) => t.title === "Implement OAuth2 SSO flow");

    const ssoSync = await meetingRepo.insertMeeting({
      projectId: atlas.id,
      title: "SSO design sync",
      type: "planning",
      scheduledAt: at(1, 10, 0),
      duration: 45,
      location: "Zoom · alabs.demos/sso",
      participantIds: ids("mk", "lc", "dp", "ay"),
      agenda: [
        "Walk the SSO sign-in & sign-out flows (10m)",
        "PKCE vs. client-secret decision (10m)",
        "Audit-log write path and immutability (15m)",
        "Feature-flag rollout plan (10m)",
      ],
      notes:
        "Settled on PKCE for every public client; confidential server-side apps keep a client secret. " +
        "The audit log will use an append-only table with a per-row hash chain — no in-place updates, ever. " +
        "Blocker: IdP sandbox credentials are still with Ops — Marco chasing today.",
    });
    await action(ssoSync.id, "Provision the IdP sandbox environment", "mk", 2, {
      taskId: ssoTask?.id,
    });
    await action(ssoSync.id, "Draft the PKCE flow diagram for the wiki", "lc", 3);
    await action(ssoSync.id, "Confirm the feature-flag name with stakeholders", "ay", 0, { done: true });

    await meetingRepo.insertMeeting({
      projectId: atlas.id,
      title: "Daily standup",
      type: "standup",
      scheduledAt: at(1, 9, 15),
      duration: 15,
      location: "Recurring · #engineering",
      participantIds: ids("ay", "mk", "lc", "dp", "sr"),
      agenda: ["Round-robin: yesterday · today · blockers (15m)"],
      notes: "Notes are captured live during the standup and posted to #engineering.",
    });

    const clientDemo = await meetingRepo.insertMeeting({
      projectId: atlas.id,
      title: "Client demo — v2.0 beta preview",
      type: "client",
      scheduledAt: at(5, 14, 0),
      duration: 60,
      location: "Google Meet · shared with Northwind",
      participantIds: ids("ay", "mk", "jb"),
      agenda: [
        "Sprint 13–14 recap (10m)",
        "Live demo: SSO sign-in + audit log (25m)",
        "Design System v1 components (10m)",
        "Q&A and beta feedback (15m)",
      ],
      notes:
        "Aisha drives the demo, Marco owns the audit-log deep-dive, Jonas walks the new component library. " +
        "Demo script is locked — no ad-hoc features.",
    });
    await action(clientDemo.id, "Polish the demo dataset on staging", "dp", 4);
    await action(clientDemo.id, "Prepare the beta feedback intake form", "ay", 4);

    const sprint14 = await meetingRepo.insertMeeting({
      projectId: atlas.id,
      title: "Sprint 14 planning",
      type: "planning",
      scheduledAt: at(-11, 13, 0),
      duration: 90,
      location: "Conference room B",
      participantIds: ids("ay", "mk", "lc", "dp", "sr", "jb"),
      agenda: [
        "Review Sprint 13 outcomes (15m)",
        "Capacity check (10m)",
        "Pull SSO + audit-log scope into the sprint (45m)",
        "Lock the sprint goal and exit criteria (20m)",
      ],
      notes:
        "Goal locked: ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. " +
        "Client-portal scaffolding stays visible but read-only. 52 points committed across 23 issues.",
    });
    await action(sprint14.id, "Break ATL-101 into PKCE + token-refresh subtasks", "mk", -9, {
      done: true,
      taskId: ssoTask?.id,
    });
    await action(sprint14.id, "Write the audit-log ADR", "mk", -8, { done: true });
    await meetingRepo.patchMeeting(sprint14.id, { status: "completed" });

    const archReview = await meetingRepo.insertMeeting({
      projectId: atlas.id,
      title: "Audit-log architecture review",
      type: "review",
      scheduledAt: at(-7, 11, 0),
      duration: 60,
      location: "Zoom",
      participantIds: ids("mk", "lc", "dp"),
      agenda: [
        "Hash-chain vs. Merkle-tree trade-offs (20m)",
        "Retention and partitioning (15m)",
        "Read path for reporting (15m)",
        "Decisions & follow-ups (10m)",
      ],
      notes:
        "Settled on a simple forward hash-chain — cheaper to verify and good enough for the threat model. " +
        "Partition by month; reporting reads from a nightly materialized view.",
    });
    await action(archReview.id, "Spike: hash-chain verification query", "lc", -3, { done: true });
    await meetingRepo.patchMeeting(archReview.id, { status: "completed" });

    const grooming = await meetingRepo.insertMeeting({
      projectId: atlas.id,
      title: "Backlog grooming",
      type: "standup",
      scheduledAt: at(-4, 16, 0),
      duration: 30,
      location: "Recurring · #engineering",
      participantIds: ids("ay", "mk", "lc"),
      agenda: ["Triage the inbox queue"],
      notes: "Cancelled — merged into the Sprint 14 mid-sprint check-in.",
    });
    await meetingRepo.patchMeeting(grooming.id, { status: "cancelled" });
  }

  /* ---------------- Agreements ---------------- */
  // mirrors the prototype's seven demo agreements; term dates relative to
  // runtime today so Active / Pending / Expiring-soon all have content.
  if ((await agreementRepo.listAgreements(atlas.id)).length === 0) {
    const at = (offset: number) => new Date(`${ctx.dayIso(offset)}T12:00:00.000Z`);
    const lifecycle = (
      id: string,
      status: "draft" | "sent" | "accepted" | "rejected" | "expired",
      stamps: { sent?: number; signed?: number } = {},
    ) =>
      agreementRepo.patchAgreement(id, {
        status,
        ...(stamps.sent !== undefined ? { sentAt: at(stamps.sent) } : {}),
        ...(stamps.signed !== undefined ? { signedAt: at(stamps.signed) } : {}),
      });

    const msa = await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Master Services Agreement",
      type: "contract",
      counterparty: "Acme Corporation",
      value: 240000,
      currency: "USD",
      startDate: ctx.dayIso(-235),
      endDate: ctx.dayIso(130),
      ownerId: usersByShort.ay.id,
      terms:
        "Master terms governing all Atlas work — monthly net-15 billing, IP assignment on full payment, " +
        "mutual indemnification capped at fees paid in the prior 12 months, and a 30-day cure period for material breach.",
    });
    await lifecycle(msa.id, "accepted", { sent: -265, signed: -252 });

    const sow = await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Platform 2.0 Statement of Work",
      type: "sow",
      counterparty: "Acme Corporation",
      value: 180000,
      currency: "USD",
      startDate: ctx.dayIso(-150),
      endDate: ctx.dayIso(45),
      ownerId: usersByShort.ay.id,
      terms:
        "Fixed-fee SOW for the Atlas Platform 2.0 delivery across six monthly milestones. Acceptance criteria " +
        "defined per epic; any scope change requires a written amendment. GA cutoff drives the final milestone.",
    });
    await lifecycle(sow.id, "accepted", { sent: -172, signed: -170 });

    const nda = await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Mutual Non-Disclosure Agreement",
      type: "nda",
      counterparty: "Globex Industries",
      startDate: ctx.dayIso(-193),
      endDate: ctx.dayIso(537),
      ownerId: usersByShort.mk.id,
      terms:
        "Two-year mutual NDA covering evaluation of the analytics module for a potential Globex partnership. " +
        "Standard carve-outs for residual knowledge and independently developed IP; confidential info marked in writing.",
    });
    await lifecycle(nda.id, "accepted", { sent: -198, signed: -193 });

    const analytics = await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Analytics Module Statement of Work",
      type: "sow",
      counterparty: "Contoso Ltd",
      value: 96000,
      currency: "USD",
      ownerId: usersByShort.ay.id,
      terms:
        "Time-and-materials SOW for the reporting & analytics module — 480 hours over 12 weeks at the standard " +
        "rate card (Appendix A). Awaiting Contoso counter-signature; work blocked until accepted.",
    });
    await lifecycle(analytics.id, "sent", { sent: -6 });

    await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Mobile Companion App Proposal",
      type: "proposal",
      counterparty: "Initech",
      value: 54000,
      currency: "USD",
      ownerId: usersByShort.jb.id,
      terms:
        "Draft proposal for an iOS + Android companion app scoped off the Atlas API. Fixed price, 10-week build. " +
        "Scope, timeline, and rate pending internal review before sending to Initech.",
    });

    const migration = await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Data Migration SOW",
      type: "sow",
      counterparty: "Hooli",
      value: 32000,
      currency: "USD",
      startDate: ctx.dayIso(-269),
      endDate: ctx.dayIso(-176),
      ownerId: usersByShort.mk.id,
      terms:
        "One-off data migration from the Hooli legacy CRM — completed and accepted. Retained for audit; " +
        "no active obligations. Renewal not requested.",
    });
    await lifecycle(migration.id, "expired", { sent: -284, signed: -279 });

    const sla = await agreementRepo.insertAgreement({
      projectId: atlas.id,
      title: "Support & SLA Addendum",
      type: "contract",
      counterparty: "Acme Corporation",
      value: 48000,
      currency: "USD",
      startDate: ctx.dayIso(-359),
      endDate: ctx.dayIso(12),
      ownerId: usersByShort.mk.id,
      terms:
        "Annual support addendum — 99.9% uptime SLA, 4-hour P1 response, 50 support hours/month included. " +
        "Expires soon; renewal quote in flight.",
    });
    await lifecycle(sla.id, "accepted", { sent: -374, signed: -369 });
  }
}
