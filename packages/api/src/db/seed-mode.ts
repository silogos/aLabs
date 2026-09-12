/** Demo-seed gate. Demo data (Northwind users with a known password, demo
 *  orgs/projects/content) must never appear in a production database, so it
 *  seeds on by default outside production and off in production; SEED_DEMO
 *  forces it either way in any environment. */
export const demoSeedEnabled = (env: NodeJS.ProcessEnv = process.env): boolean => {
  const flag = env.SEED_DEMO?.trim().toLowerCase();
  if (flag !== undefined && flag !== "") return flag === "1" || flag === "true" || flag === "yes";
  return env.NODE_ENV !== "production";
};
