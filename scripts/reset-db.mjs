// Deletes data/db.json so the site re-seeds itself with demo content on next request.
import fs from "node:fs";
import path from "node:path";
const file = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "db.json");
if (fs.existsSync(file)) {
  fs.rmSync(file);
  console.log("Removed", file, "— demo content will be re-created on the next request.");
} else console.log("No database found — it will be created on the next request.");
