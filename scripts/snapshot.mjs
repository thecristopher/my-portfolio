// saves what the API serves right now into src/data/snapshot.json, so the page paints with real content before
// the API answers (Railway can take a few seconds to wake up). runs before every build and never fails one: if
// the API can't be reached, the snapshot already in the repo stays as it is
import { readFile, writeFile } from "node:fs/promises";

const SNAPSHOT = new URL("../src/data/snapshot.json", import.meta.url);
// the cache key RTK Query keeps each endpoint under, and where the API serves it
const ENDPOINTS = {
  getNavBar: "/navbar",
  getAbout: "/about",
  getProjects: "/projects",
  getSkills: "/skills",
  getContact: "/contact",
  getRepos: "/github/repos",
};

const apiUrl = process.env.VITE_API_URL;
const previous = JSON.parse(await readFile(SNAPSHOT, "utf8").catch(() => "{}"));

if (!apiUrl) {
  console.warn("snapshot: VITE_API_URL is not set, keeping the saved snapshot");
  process.exit(0);
}

const fetchJson = async (path) => {
  const response = await fetch(new URL(path, apiUrl), { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.json();
};

const next = { ...previous };
for (const [endpoint, path] of Object.entries(ENDPOINTS)) {
  try {
    next[endpoint] = await fetchJson(path);
  } catch (error) {
    console.warn(`snapshot: kept the saved ${endpoint}, ${error.message}`);
  }
}

await writeFile(SNAPSHOT, `${JSON.stringify(next, null, 2)}\n`);
console.log(`snapshot: saved ${Object.keys(next).length} endpoints`);
