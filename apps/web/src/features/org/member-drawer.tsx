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
          <div className="dh-top" style={{ alignItems: "center", gap: 8 }}>
            <Avatar user={profile.user} size="sm" />
            <span className="chip muted">{profile.role.name}</span>
            <span className={`status ${profile.status === "active" ? "ok" : "neutral"}`}>
              <span className="d" />
              {profile.status}
            </span>
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
        <div className="profile-row">
          <span className="k">Organization</span>
          <span className="v">{org.name}</span>
        </div>
        <div className="profile-row">
          <span className="k">Workspace role</span>
          <span className="v">{profile.role.name}</span>
        </div>
        <div className="profile-row">
          <span className="k">Joined</span>
          <span className="v">{profile.joinedAt ? dateShort(profile.joinedAt) : "—"}</span>
        </div>

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
