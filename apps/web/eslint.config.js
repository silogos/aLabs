import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

export default [
  ...coreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      // warn-only until the dead-code cleanup pass promotes it back to error
      "@typescript-eslint/no-unused-vars": "warn",
      // react-hooks v6 compiler-derived rules — pre-existing patterns in the
      // popover hook, hydration effects, and Date.now() in render; adopting
      // them is out of scope for this pure-restructure PR
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/use-memo": "off",
    },
  },

  /* ---- architecture boundaries ---- */

  // fetch lives in one place: only services may import the http wrapper
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/services/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/http"],
              message: "Only src/services/* may talk HTTP — add or extend a service instead.",
            },
          ],
        },
      ],
    },
  },

  // app chrome is feature-blind: components/ never reaches into features/
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features"],
              message:
                "App chrome must stay feature-blind — mount feature overlays from the route layer (app/(app)/layout.tsx), not from components/.",
            },
          ],
        },
      ],
    },
  },

  // services are leaves: pure transport, no UI/feature/state dependencies
  {
    files: ["src/services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/components/*", "@/providers/*", "@/hooks/*"],
              message: "Services are the transport layer — they must not depend on the UI.",
            },
          ],
        },
      ],
    },
  },

  // web computes no schema types itself: @pmin/core owns them (web's zod is
  // v4, core's is v3 — a local z.input silently resolves to unknown)
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "zod",
              message:
                "Import input types from @pmin/core (or add them there) — computing z.input locally against core's zod v3 schemas yields unknown.",
            },
          ],
        },
      ],
    },
  },

  {
    ignores: [".next/**", "next-env.d.ts", "uploads/**"],
  },
];
