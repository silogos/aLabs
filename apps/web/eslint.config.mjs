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
  {
    ignores: [".next/**", "next-env.d.ts", "uploads/**"],
  },
];
