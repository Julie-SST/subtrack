import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function getBuildId() {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.COMMIT_REF;
  if (fromEnv && /^[a-f0-9]{7,40}$/i.test(fromEnv.trim())) {
    return `subtrack-${fromEnv.trim().slice(0, 7)}`;
  }
  if (fromEnv && fromEnv.length >= 7) {
    return `subtrack-${fromEnv.trim().slice(0, 7)}`;
  }

  try {
    const sha = execSync("git rev-parse --short HEAD", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (sha) return `subtrack-${sha}`;
  } catch {
    // not a git repo or git missing
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  return `subtrack-${pkg.version}-${Date.now()}`;
}

const buildId = getBuildId();
const template = readFileSync(join(root, "scripts/sw.template.js"), "utf8");
if (!template.includes("__SW_BUILD_ID__")) {
  console.error("[generate-sw] sw.template.js missing __SW_BUILD_ID__ placeholder");
  process.exit(1);
}

const out = template.replaceAll("__SW_BUILD_ID__", buildId);
writeFileSync(join(root, "public/sw.js"), out, "utf8");
console.log(`[generate-sw] wrote public/sw.js with VERSION=${buildId}`);
