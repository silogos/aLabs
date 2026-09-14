"use client";

/** Member quick-view drawer over the members list — the same pattern as the
 *  task drawer: /{orgSlug}/members/{userId} mounts this drawer on top of the
 *  persistent directory backdrop. Built on DrawerKit; the three-dot menu
 *  carries "Open profile" which jumps to the full profile page. */
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApp, viewPath } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerMenu,
  DrawerMenuItem,
} from "@/components/ui/drawer-kit";
import { DetailList, DetailItem } from "@/components/ui/detail-list";

export function MemberDrawer() {
  const { org } = useApp();
  const router = useRouter();
  const params = useParams<{ orgSlug: string; userId: string }>();
  const userId = params?.userId;

  const { data: profile, isError } = useQuery({
    queryKey: qk.memberProfile(org?.id, userId),
    queryFn: () => workspaceService.memberProfile(org!.id, userId!),
    enabled: !!org && !!userId,
  });

  if (!org || !userId) return null;

  const close = () => router.push(`/${org.slug}/members`);
  const openProfile = () => router.push(`/${org.slug}/members/${userId}/profile`);

  if (!profile) {
    return (
      <Drawer label="Member details" onClose={close}>
        <DrawerHeader>
          <DrawerTitle>{isError ? "Member not found." : "Loading…"}</DrawerTitle>
        </DrawerHeader>
      </Drawer>
    );
  }

  return (
    <Drawer label={`${profile.user.name} — member details`} onClose={close}>
      <DrawerHeader>
        <DrawerTitle>
          <div className="dh-top">
            <Avatar user={profile.user} size="lg" />
          </div>
          <h3>{profile.user.name}</h3>
          <div className="tiny mono faint">{profile.user.email}</div>
        </DrawerTitle>
        <DrawerMenu label="Member actions">
          <DrawerMenuItem
            onClick={openProfile}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4,21c0,-4,4,-6,8,-6s8,2,8,6" />
              </svg>
            }
          >
            Open profile
          </DrawerMenuItem>
        </DrawerMenu>
      </DrawerHeader>
      <div className="db">
        <DetailList>
          <DetailItem label="Organization">{org.name}</DetailItem>
          <DetailItem label="Workspace role">
            <span className="chip muted">{profile.role.name}</span>
          </DetailItem>
          <DetailItem label="Status">
            <span className={`status ${profile.status === "active" ? "ok" : "neutral"}`}>
              <span className="d" />
              {profile.status}
            </span>
          </DetailItem>
          <DetailItem label="Joined">
            {profile.joinedAt ? dateShort(profile.joinedAt) : "—"}
          </DetailItem>
        </DetailList>

        <div className="panel-head" style={{ marginTop: 14, paddingLeft: 0, paddingRight: 0 }}>
          <h3>Projects</h3>
          <span className="muted">{profile.projects.length}</span>
        </div>
        <div>
          {profile.projects.map((p) => (
            <div
              key={p.id}
              className="mrow"
              style={{ alignItems: "center", gap: 10, cursor: "pointer", paddingLeft: 0, paddingRight: 0 }}
              onClick={() => router.push(viewPath("dashboard", org.slug, p.slug))}
            >
              <div style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{p.name}</div>
              <span className="chip muted">{p.role}</span>
            </div>
          ))}
          {profile.projects.length === 0 && (
            <div className="tiny faint">Not on any project in this workspace yet.</div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
