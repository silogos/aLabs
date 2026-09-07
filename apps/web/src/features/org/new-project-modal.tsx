"use client";

/** New project modal — shared by the org overview (primary CTA) and the
 *  org projects table. Slug is derived from the name; key is editable
 *  (uppercase, 2–10 chars); validation and uniqueness live in the API. */
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { IconPicker } from "@/components/ui/icon-picker";
import { hueFor, projColor } from "@/components/nav-data";
import { workspaceService } from "@/services/workspace";
import { useApp } from "@/providers/app-provider";
import { qk } from "@/lib/query-keys";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const keyFromName = (s: string) => {
  const words = s.trim().split(/\s+/).filter(Boolean);
  const raw = words.length > 1 ? words.map((w) => w[0]).join("") : (words[0] ?? "");
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "";
};

export function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { org, toast } = useApp();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setKey("");
      setDescription("");
      setIcon("");
      setSaving(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const slug = useMemo(() => slugify(name) || "untitled", [name]);
  const keyDirty = key.trim().length > 0;
  const finalKey = (keyDirty ? key : keyFromName(name)).toUpperCase();
  const valid = name.trim().length > 0 && /^[A-Z0-9]{2,10}$/.test(finalKey);

  const create = async () => {
    if (!org || !valid) return;
    setSaving(true);
    try {
      const p = await workspaceService.createProject(org.id, {
        name: name.trim(),
        slug: slugify(name.trim()) || "untitled",
        key: finalKey,
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
      });
      await qc.invalidateQueries({ queryKey: qk.projects(org.id) });
      toast(`Created ${p.name}`);
      onClose();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal title="New project" onClose={onClose} onBackdrop={onClose} width={460} data-od-id="new-project-modal">
      <div className="mb" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label className="flab">Name</label>
          <input
            className="fld"
            autoFocus
            value={name}
            placeholder="e.g. Mobile app revamp"
            onChange={(e) => setName(e.target.value)}
          />
          {name.trim() && (
            <div className="tiny faint mono" style={{ marginTop: 5 }}>
              /{org?.slug}/{slug}
            </div>
          )}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label className="flab">Key</label>
            <input
              className="fld mono"
              value={keyDirty ? key : finalKey}
              placeholder="MAR"
              maxLength={10}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
            />
            <div className="tiny faint" style={{ marginTop: 5 }}>
              2–10 letters/numbers, unique in this organization
            </div>
          </div>
          <div style={{ width: 86 }}>
            <label className="flab">Icon</label>
            <IconPicker
              value={icon || undefined}
              fallback="＋"
              color={icon ? projColor(hueFor(icon)) : "color-mix(in oklab, var(--fg) 10%, transparent)"}
              size={32}
              radius={9}
              onChange={(v) => setIcon(v ?? "")}
              title="Choose an icon"
            />
          </div>
        </div>
        <div>
          <label className="flab">Description</label>
          <textarea
            className="fld"
            rows={3}
            value={description}
            placeholder="What is this project about? (optional)"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 2 }}>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            disabled={!valid || saving}
            onClick={() => void create()}
            data-od-id="new-project-submit"
          >
            {saving ? "Creating…" : "Create project"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
