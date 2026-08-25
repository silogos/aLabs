/** Left brand panel — ported from designs/auth/sign-in.html (Helix → aLabs). */
export function BrandPanel() {
  return (
    <aside className="brand-panel" aria-label="About aLabs">
      <div className="bp-head">
        <div className="logo">A</div>
        <div className="wm">
          <b>aLabs</b>
          <small>workspace</small>
        </div>
      </div>

      <div className="bp-body">
        <span className="bp-eyebrow">
          <span className="d"></span>aLabs · Atlas Platform
        </span>
        <h2 className="bp-headline">
          Plan, build, and ship — in <em>one workspace</em>.
        </h2>
        <p className="bp-sub">
          Project delivery for software teams. Tasks, docs, planning and reporting that stay in
          lock-step from kickoff to launch.
        </p>

        <ul className="bp-feats">
          <li>
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </span>
            <div>
              <b>Planning workspace</b>
              <small>Turn PRDs into scoped, ready-to-build tasks.</small>
            </div>
          </li>
          <li>
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M9 11l3 3 8-8" />
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
              </svg>
            </span>
            <div>
              <b>Real-time delivery</b>
              <small>Burndown, milestones, and client portals — always current.</small>
            </div>
          </li>
          <li>
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <b>Enterprise-grade security</b>
              <small>SAML/OIDC SSO, SCIM, audit logs and role-based access.</small>
            </div>
          </li>
        </ul>
      </div>

      <div className="bp-foot">
        <span className="cert">
          <span className="bd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </span>
          SOC 2 Type II
        </span>
        <span className="cert">
          <span className="bd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
          </span>
          ISO 27001
        </span>
        <span className="cert">
          <span className="bd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
            </svg>
          </span>
          GDPR
        </span>
      </div>
    </aside>
  );
}
