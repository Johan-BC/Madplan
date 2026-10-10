// Tjekker at retter.md stadig kan læses af appen og overholder reglerne.
// Køres af workflowen "Hent inspiration" før der committes: node tools/check.js
const fs = require("fs");
const { execSync } = require("child_process");

const Engine = new Function(fs.readFileSync("engine.js", "utf8") + ";return Engine;")();
const now = Engine.parse(fs.readFileSync("retter.md", "utf8"));
let before = [];
try { before = Engine.parse(execSync("git show HEAD:retter.md", { encoding: "utf8" })); } catch (e) {}

const changed = f => { try { execSync(`git diff --quiet HEAD -- ${f}`); return false; } catch (e) { return true; } };
const errs = [];

if (now.length < before.length) errs.push(`Antal retter faldt fra ${before.length} til ${now.length}.`);
const ids = new Set();
for (const r of now) {
  if (ids.has(r.id)) errs.push(`Dublet: ${r.name}`);
  ids.add(r.id);
  if (!r.cuisine || !r.active) errs.push(`${r.name}: mangler køkken eller tid i den fede linje.`);
  if (r.active > 30) errs.push(`${r.name}: ${r.active} min aktiv tid - max 30.`);
  if (r.protShown < 35) errs.push(`${r.name}: ${r.protShown} g protein - min. 35.`);
  if (!r.items.length) errs.push(`${r.name}: ingen ingredienser.`);
  if (r.steps.length < 2) errs.push(`${r.name}: for få trin.`);
  const unknown = r.items.filter(i => i.order === 999).map(i => i.key);
  if (unknown.length) errs.push(`${r.name}: ukendte ingredienser til indkøbslisten: ${unknown.join(", ")} - tilføj dem i DICT i engine.js.`);
}
try { JSON.parse(fs.readFileSync("inspiration.json", "utf8")); } catch (e) { errs.push("inspiration.json er ikke gyldig JSON."); }
if (changed("engine.js") && !changed("sw.js")) errs.push("engine.js er ændret - hæv CACHE i sw.js, ellers får telefonen ikke den nye udgave.");

if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
console.log(`OK: ${now.length} retter (${now.length - before.length >= 0 ? "+" : ""}${now.length - before.length}).`);
