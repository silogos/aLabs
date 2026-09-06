import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Runs before every test file's imports — pg.ts reads DATABASE_URL at module
 * load, so this must come first. Points at the dedicated test database
 * (never the dev database) unless TEST_DATABASE_URL overrides it.
 */
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://alabs:alabs@localhost:5432/alabs_test";
// forgot-password only returns resetPath outside production
process.env.NODE_ENV = "test";
// keep file-upload tests off the repo's working tree
process.env.UPLOADS_DIR ??= join(tmpdir(), "pmin-api-test-uploads");
