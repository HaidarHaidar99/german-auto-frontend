const fs = require("fs");
const path = require("path");

const enAdminPath = path.join(__dirname, "../src/i18n/locales/en/admin.json");
const enAdmin = require(enAdminPath);

const adminPagesPath = path.join(__dirname, "../src/pages/admin");
const adminComponentsPath = path.join(__dirname, "../src/components/admin");

const regex = /t\("([^"]+)",\s*(?:\{[^}]*defaultValue:\s*"([^"]+)"[^}]*\}|"(.*?)")\)/g;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith(".jsx")) {
      const content = fs.readFileSync(fullPath, "utf8");
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        if (key.includes(":")) continue; // Skip explicit namespaces like cars:details
        if (!enAdmin[key]) {
          console.log(`Missing key: ${key}`);
          // We will just add the key with a placeholder for now to see what's missing
          enAdmin[key] = "TODO_TRANSLATE_" + (match[2] || match[3]);
        }
      }
    }
  }
}

scanDir(adminPagesPath);
scanDir(adminComponentsPath);

fs.writeFileSync(enAdminPath, JSON.stringify(enAdmin, null, 2), "utf8");
console.log("Done checking translations.");
