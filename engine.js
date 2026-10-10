// Regelmotor: læser retter.md og bygger madplaner efter reglerne i madplan-skill'en.
const Engine = (() => {
  const DAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
  const GROUPS = { K: "Kød", G: "Grøntsager", M: "Mejeri", R: "Resten" };

  // Indkøbsordbog: første match vinder, så de specifikke står før de brede.
  // [mønster, navn i listen, gruppe, mærke]
  const DICT = [
    [/kyllingeoverlår/, "Kyllingeoverlår", "K"],
    [/kyllingebryst/, "Kyllingebryst", "K"],
    [/hakket kylling/, "Hakket kylling eller kalkun", "K"],
    [/kalkun/, "Hakket kalkun", "K"],
    [/hakket okse/, "Hakket oksekød 8-12%", "K"],
    [/hakket svin/, "Hakket svinekød 8-12%", "K"],
    [/tyndtskåret oksekød/, "Oksekød, tyndtskåret", "K"],
    [/oksestrimler/, "Oksestrimler", "K"],
    [/culotte|oksefilet|flanksteak|entrecote/, "Culotte", "K"],
    [/svinemørbrad|nakkefilet/, "Svinemørbrad eller nakkefilet", "K"],
    [/svinenakke/, "Svinenakke", "K"],
    [/svinekam|schnitzel/, "Svinekam", "K"],
    [/skinke|bacon/, "Skinke eller bacon", "K"],
    [/laksefilet/, "Laksefilet", "K"],
    [/rejer/, "Rå rejer", "K", "frost"],
    [/torsk/, "Torskefilet", "K"],
    [/tunbøf/, "Tunbøffer", "K"],

    [/^æg$/, "Æg", "M"],
    [/fast tofu/, "Fast tofu", "M"],
    [/blød tofu/, "Blød tofu", "M"],
    [/paneer/, "Paneer", "M"],
    [/tyrkisk yoghurt/, "Tyrkisk yoghurt 10%", "M"],
    [/skyr/, "Skyr", "M"],
    [/fløde/, "Piskefløde", "M"],
    [/smør/, "Smør", "M"],
    [/mozzarella/, "Revet mozzarella", "M"],

    // Resten-varer hvis navn ellers ville blive fanget af en grøntsag
    [/syltet ingefær/, "Syltet ingefær", "R"],
    [/tørrede/, "Tørrede chili", "R", "tjek"],
    [/kashmiri chili|chilipulver/, "Chilipulver", "R", "tjek"],
    [/chiliolie/, "Chiliolie", "R", "tjek"],
    [/chiliflager/, "Chiliflager", "R", "tjek"],
    [/chilipasta|sambal/, "Sambal oelek", "R", "tjek"],
    [/sweet chili/, "Sweet chili-sauce", "R", "tjek"],
    [/stødt koriander/, "Stødt koriander", "R", "tjek"],
    [/frossen spinat/, "Spinat", "R", "frost"],
    [/hakkede tomater/, "Hakkede tomater", "R"],
    [/tomatpuré/, "Tomatpuré", "R", "tjek"],
    [/kaffirlime/, "Kaffirlimeblade", "R", "frost"],
    [/kokosmælk/, "Kokosmælk", "R"],
    [/citrongræspasta/, "Citrongræspasta", "R"],

    [/hvidløg/, "Hvidløg", "G"],
    [/ingefær/, "Ingefær", "G"],
    [/galanga/, "Galanga", "G"],
    [/citrongræs/, "Citrongræs", "G"],
    [/rødløg/, "Rødløg", "G"],
    [/skalotteløg/, "Skalotteløg", "G"],
    [/forårsløg/, "Forårsløg", "G"],
    [/løg/, "Løg", "G"],
    [/grøn(ne)? chili/, "Grøn chili", "G"],
    [/chili/, "Rød chili", "G"],
    [/peberfrugt/, "Peberfrugt", "G"],
    [/broccoli/, "Broccoli", "G"],
    [/blomkål/, "Blomkål", "G"],
    [/spidskål/, "Spidskål", "G"],
    [/squash/, "Squash", "G"],
    [/aubergine/, "Aubergine", "G"],
    [/haricots/, "Haricots verts", "G"],
    [/sukkerærter/, "Sukkerærter", "G"],
    [/pak choi/, "Pak choi", "G"],
    [/agurk/, "Agurk", "G"],
    [/gulerød|gulerod/, "Gulerødder", "G"],
    [/cherrytomat/, "Cherrytomater", "G"],
    [/tomat/, "Tomater", "G"],
    [/spinat/, "Frisk spinat", "G"],
    [/bønnespirer/, "Bønnespirer", "G"],
    [/champignon|enoki|svampe/, "Champignon", "G"],
    [/brøndkarse|rucola/, "Brøndkarse eller rucola", "G"],
    [/salat/, "Salathoved", "G"],
    [/avocado/, "Avocado", "G"],
    [/sød kartoffel/, "Sød kartoffel", "G"],
    [/pære|æble/, "Pære", "G"],
    [/citron/, "Citron", "G"],
    [/lime/, "Lime", "G"],
    [/basilikum/, "Thaibasilikum", "G"],
    [/koriander/, "Koriander", "G"],
    [/mynte/, "Mynte", "G"],
    [/persille/, "Persille", "G"],

    [/jasminris/, "Jasminris", "R"],
    [/basmatiris/, "Basmatiris", "R"],
    [/sushiris/, "Sushiris", "R"],
    [/kogt kold ris/, "Ris, kogt dagen før", "R"],
    [/risnudler/, "Risnudler", "R"],
    [/ægnudler|soba/, "Ægnudler", "R"],
    [/naan/, "Naan", "R", "frost"],
    [/pita/, "Pitabrød", "R", "frost"],
    [/panko/, "Panko", "R"],
    [/kikærter/, "Kikærter", "R"],
    [/linser/, "Røde linser", "R"],
    [/edamame/, "Edamame", "R", "frost"],
    [/ærter/, "Ærter", "R", "frost"],
    [/peanutbutter/, "Peanutbutter", "R"],
    [/peanuts/, "Peanuts", "R"],
    [/cashew/, "Cashewnødder", "R"],
    [/sesamfrø/, "Sesamfrø", "R", "tjek"],
    [/tahin/, "Tahin", "R"],
    [/kimchi/, "Kimchi", "R"],
    [/risgryn/, "Ristede risgryn", "R"],
    [/sort bønne/, "Sort bønne-sauce", "R"],
    [/sorte bønner/, "Fermenterede sorte bønner", "R"],
    [/doubanjiang/, "Doubanjiang", "R"],
    [/laksapasta/, "Laksapasta", "R"],
    [/grøn karrypasta/, "Grøn karrypasta", "R", "tjek"],
    [/rød karrypasta/, "Rød karrypasta", "R", "tjek"],
    [/karrypasta/, "Karrypasta", "R", "tjek"],
    [/misopasta/, "Lys misopasta", "R"],
    [/soja/, "Sojasauce", "R", "tjek"],
    [/fiskesauce/, "Fiskesauce", "R", "tjek"],
    [/østerssauce/, "Østerssauce", "R", "tjek"],
    [/hoisin/, "Hoisinsauce", "R", "tjek"],
    [/kecap manis/, "Kecap manis", "R"],
    [/gochujang/, "Gochujang", "R", "tjek"],
    [/gochugaru/, "Gochugaru", "R", "tjek"],
    [/mirin/, "Mirin", "R", "tjek"],
    [/sake/, "Sake", "R"],
    [/shaoxing/, "Shaoxing-vin", "R"],
    [/sesamolie/, "Sesamolie", "R", "tjek"],
    [/honning/, "Honning", "R", "tjek"],
    [/riseddike/, "Riseddike", "R", "tjek"],
    [/sort eddike/, "Kinesisk sort eddike", "R", "tjek"],
    [/eddike/, "Vineddike", "R", "tjek"],
    [/majsstivelse/, "Majsstivelse", "R", "tjek"],
    [/farin/, "Brun farin", "R", "tjek"],
    [/dashi/, "Dashi", "R"],
    [/hønsebouillon/, "Hønsebouillon", "R", "tjek"],
    [/oksebouillon/, "Oksebouillon", "R", "tjek"],
    [/garam masala/, "Garam masala", "R", "tjek"],
    [/spidskommen/, "Spidskommen", "R", "tjek"],
    [/gurkemeje/, "Gurkemeje", "R", "tjek"],
    [/paprika/, "Paprika", "R", "tjek"],
    [/madras|karrypulver|karry$/, "Karrypulver", "R", "tjek"],
    [/tikka/, "Tikka masala-krydderi", "R", "tjek"],
    [/shawarma/, "Shawarma-krydderi", "R", "tjek"],
    [/sichuanpeber/, "Sichuanpeber", "R", "tjek"],
    [/femkrydderi/, "Femkrydderi", "R", "tjek"],
    [/kanel/, "Kanel", "R", "tjek"],
    [/nelliker/, "Nelliker", "R", "tjek"],
    [/sennepsfrø/, "Sennepsfrø", "R", "tjek"],
    [/sumak/, "Sumak", "R"],
    [/shichimi/, "Shichimi togarashi", "R"],
  ];
  // Basisvarer der altid står i skabet og ikke skal på listen
  const BASIS = /^(salt|olie|vand|sukker|mel)$|sort peber|peberkorn/;
  const DEFAULT_QTY = { Jasminris: [300, "g"], Basmatiris: [300, "g"], Sushiris: [300, "g"], Naan: [3, "stk"] };
  const AROMA = new Set(["Hvidløg", "Ingefær", "Galanga", "Citrongræs", "Løg", "Rødløg", "Skalotteløg", "Forårsløg",
    "Grøn chili", "Rød chili", "Citron", "Lime", "Thaibasilikum", "Koriander", "Mynte", "Persille"]);

  const QRE = /^(\d+(?:[.,]\d+)?(?:-\d+(?:[.,]\d+)?)?|½|\d+½)\s+(?:(?:stort|stor|store|små|lille)\s+)?(?:(g|kg|dl|l|spsk|tsk|ds|fed|cm|bdt|stk|stængler|pose)\s+)?(.+)$/;

  function num(s) {
    if (s === "½") return 0.5;
    if (/½$/.test(s)) return parseInt(s) + 0.5;
    const parts = s.replace(/,/g, ".").split("-");
    return parseFloat(parts[parts.length - 1]);
  }

  // Splitter på komma, men ikke inde i parenteser
  function splitTop(s, sep) {
    const out = []; let depth = 0, cur = "";
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (depth === 0 && s.startsWith(sep, i)) { out.push(cur); cur = ""; i += sep.length - 1; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(x => x.trim()).filter(Boolean);
  }

  function parseItem(raw) {
    let s = raw.replace(/\(.*?\)/g, "").replace(/^saft af\s+/i, "").replace(/\s+/g, " ").trim();
    let qty = null, unit = "stk", name = s;
    const m = s.match(QRE);
    if (m) { qty = num(m[1]); unit = m[2] || "stk"; name = m[3]; }
    if (unit === "kg") { qty *= 1000; unit = "g"; }
    if (unit === "l") { qty *= 10; unit = "dl"; }
    name = name.toLowerCase().split(/\s+eller\s+|\s\+\s/)[0].replace(/\s+(i|til)\s.*$/, "").replace(/^friske?\s+/, "").trim();
    if (BASIS.test(name)) return null;
    let hit = -1;
    for (let i = 0; i < DICT.length; i++) if (DICT[i][0].test(name)) { hit = i; break; }
    if (hit < 0) return { key: name.charAt(0).toUpperCase() + name.slice(1), group: "R", tag: null, order: 999, qty, unit };
    const d = DICT[hit];
    return { key: d[1], group: d[2], tag: d[3] || null, order: hit, qty, unit };
  }

  function parseIngredients(line) {
    const display = [], items = [];
    for (const part of splitTop(line, " · ")) {
      display.push(part);
      const lab = part.match(/^([a-zæøå ]+):\s*(.+)$/i);
      const subs = lab ? splitTop(lab[2], ", ") : [part];
      for (const s of subs) { const it = parseItem(s); if (it) items.push(it); }
    }
    return { display, items };
  }

  function slug(s) {
    return s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[æ]/g, "ae").replace(/[ø]/g, "oe").replace(/[å]/g, "aa")
      .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function parse(md) {
    const lines = md.split(/\r?\n/);
    const out = []; let section = null, cur = null, stage = 0;
    const done = () => { if (cur && cur.steps.length) out.push(finish(cur)); cur = null; };
    for (const ln of lines) {
      const l = ln.trim();
      if (l.startsWith("## ")) { done(); section = l.slice(3).trim(); if (/^tilbehør/i.test(section)) break; continue; }
      if (l.startsWith("### ")) { done(); cur = { name: l.slice(4).trim(), section, steps: [] }; stage = 1; continue; }
      if (!cur || !l) continue;
      if (stage === 1 && l.startsWith("**")) {
        const m = l.match(/^\*\*(.+?)\*\*\s*(.*)$/);
        const parts = m[1].split(" · ");
        cur.cuisine = parts[0].trim();
        cur.timeStr = (parts[1] || "").trim();
        const protPart = parts.slice(2).join(" · ");
        cur.prot = parseInt(protPart) || 0;
        cur.low = /\(lav\)/.test(protPart);
        const side = protPart.match(/servér (?:.*? af )?(\d.*?)(?: ved siden af|,)/);
        cur.sideRaw = side ? side[1].trim() : null;
        const tot = protPart.match(/lander den på (\d+) g/);
        cur.protShown = tot ? +tot[1] : cur.prot;
        cur.note = (m[2] || "").replace(/^-\s*/, "").trim();
        stage = 2; continue;
      }
      if (stage === 2) {
        // Valgfri kildelinje fra inspirationssider: _Inspiration: valdemarsro.dk_
        const src = l.match(/^_?inspiration:\s*(.+?)_?$/i);
        if (src) { cur.source = src[1].trim(); continue; }
        Object.assign(cur, parseIngredients(l)); stage = 3; continue;
      }
      if (stage === 3) {
        const s = l.match(/^\d+\.\s+(.*)$/);
        if (s) cur.steps.push(s[1]);
      }
    }
    done();
    // Konflikter fra noter som "ikke samme uge som tikka-traybake med kylling"
    out.forEach(r => r.conflicts = []);
    for (const r of out) {
      const m = (r.note || "").match(/ikke samme uge som\s+([^\s,]+)/i);
      if (m) { const w = m[1].toLowerCase(); out.forEach(o => { if (o !== r && o.name.toLowerCase().includes(w)) r.conflicts.push(o.id); }); }
    }
    for (const r of out) for (const c of r.conflicts) { const o = out.find(x => x.id === c); if (!o.conflicts.includes(r.id)) o.conflicts.push(r.id); }
    return out;
  }

  function finish(r) {
    r.id = slug(r.name);
    r.display = r.display || []; r.items = r.items || [];
    const t = r.timeStr.replace(/\(.*?\)/g, "");
    const mins = [...t.matchAll(/(\d+)\s*min/g)].map(x => +x[1]);
    r.active = mins[0] || 0;
    r.total = mins.reduce((a, b) => a + b, 0);
    // Tilbehør til retter markeret (lav) skal med i både opskrift og indkøb
    if (r.low && r.sideRaw) {
      const side = parseItem(r.sideRaw);
      if (side && !r.items.some(i => i.key === side.key)) {
        r.items.push(side);
        r.display.push(r.sideRaw + " (tilbehør - skal med)");
      }
    }
    const first = (r.items[0] || {}).key || "";
    const text = (r.name + " " + r.display.join(" ")).toLowerCase();
    r.text = text;
    r.fish = r.section === "Fisk og skaldyr" || r.items.some(i => ["Rå rejer", "Laksefilet", "Torskefilet", "Tunbøffer"].includes(i.key));
    r.chicken = r.section === "Kylling" || (r.section !== "Hakket kød" && /kylling/i.test(first));
    r.spicy = r.section === "Stærke retter";
    r.protein = r.chicken ? "kylling" : r.fish ? "fisk" : /tofu|linser/i.test(r.section || "") ? "vegetar"
      : /okse|culotte/i.test(first) ? "okse" : /svin|skinke/i.test(first) ? "svin" : /kalkun|kylling/i.test(first) ? "kalkun" : "vegetar";
    r.tech = techOf(r);
    const carb = r.items.find(i => /ris|nudler|naan|pita/i.test(i.key));
    r.carb = !carb ? "andet" : /nudler/i.test(carb.key) ? "nudler" : /naan|pita/i.test(carb.key) ? "brød" : "ris";
    r.veg = [...new Set(r.items.filter(i => i.group === "G" && !AROMA.has(i.key)).map(i => i.key))];
    return r;
  }

  function techOf(r) {
    const n = r.name.toLowerCase();
    const all = (r.display.join(" ") + " " + r.steps.join(" ")).toLowerCase();
    if (/suppe|jjigae|laksa|tom kha/.test(n)) return "suppe";
    if (/ovn/.test(r.timeStr) || /^ovn/i.test(r.steps[0] || "")) return "ovn";
    if (/salat|larb/.test(n.split(" med ")[0])) return "salat";
    if (/katsu/.test(n)) return "pande";
    if (/karry|curry|vindaloo|\bdal\b|mapo|keema matar|jalfrezi|saag|butter chicken|i tomat/.test(n)) return "gryde";
    if (/wok/.test(all) || r.items.some(i => i.key === "Majsstivelse")) return "wok";
    return "pande";
  }

  // ---------- Regler ----------

  const LOCKS = [
    ["any", "Hvad som helst"], ["kylling", "Kylling"], ["kød", "Okse, svin eller kalkun"],
    ["vegetar", "Æg, linser eller tofu"], ["fisk", "Fisk eller skaldyr"], ["stærk", "Noget stærkt"],
    ["suppe", "Suppe"], ["nudler", "Nudler"], ["gryde", "Gryderet"], ["wok", "Wok"], ["ovn", "Ovnret"], ["salat", "Salat"],
  ];

  function fitsLock(r, L) {
    switch (L.type) {
      case "any": return true;
      case "dish": return r.id === L.id;
      case "kylling": return r.chicken;
      case "kød": return ["okse", "svin", "kalkun"].includes(r.protein);
      case "vegetar": return r.protein === "vegetar";
      case "fisk": return r.fish;
      case "stærk": return r.spicy;
      case "nudler": return r.carb === "nudler";
      default: return r.tech === L.type;
    }
  }

  function termRe(t) { return new RegExp("(^|[^a-zæøå])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); }

  function haveTerms(s) {
    return (s || "").toLowerCase().split(/,|\bog\b|\n/).map(x => x.trim()).filter(x => x.length > 1);
  }

  function pools(R, opts) {
    const terms = haveTerms(opts.have).map(termRe);
    return DAYS.map((_, d) => {
      const L = (opts.locks || [])[d] || { type: "any" };
      const ex = new Set((opts.exclude || [])[d] || []);
      const fixed = (opts.fixed || [])[d];
      if (fixed) return R.filter(r => r.id === fixed);
      let p = R.filter(r => fitsLock(r, L) && !ex.has(r.id) && r.active <= 30 &&
        (!r.fish || opts.fish || L.type === "fisk" || L.type === "dish" || terms.some(t => t.test(r.text))));
      if (!p.length) p = R.filter(r => !ex.has(r.id) && (!r.fish || opts.fish));
      return p;
    });
  }

  function evaluate(w, ctx, explain) {
    let c = 0; const warn = [];
    const ids = w.map(r => r.id);
    if (new Set(ids).size < ids.length) c += 10000;

    const ch = w.map(r => r.chicken);
    const n = ch.filter(Boolean).length;
    if (n !== 3) { c += 400 * Math.abs(n - 3); explain && warn.push(`Kylling ${n} dage i stedet for 3.`); }
    for (let i = 0; i < 4; i++) if (ch[i] && ch[i + 1]) { c += 400; explain && warn.push(`Kylling to dage i træk (${DAYS[i].toLowerCase()} og ${DAYS[i + 1].toLowerCase()}).`); }
    const cw = w.filter(r => r.chicken);
    for (let i = 0; i < cw.length; i++) for (let j = i + 1; j < cw.length; j++) {
      if (cw[i].cuisine === cw[j].cuisine) { c += 150; explain && warn.push(`To kyllingeretter fra samme køkken (${cw[i].cuisine.toLowerCase()}).`); }
      if (cw[i].tech === cw[j].tech) { c += 150; explain && warn.push(`To kyllingeretter med samme teknik (${cw[i].tech}).`); }
    }

    const quick = w.filter(r => r.total < 25).length;
    if (quick < 3) { c += 300 * (3 - quick); explain && warn.push(`Kun ${quick} retter er under 25 minutter - reglen er mindst 3.`); }
    w.forEach(r => { if (r.active > 30) c += 500; });

    w.forEach((r, i) => r.conflicts.forEach(x => { if (ids.indexOf(x) > i) { c += 1000; explain && warn.push(`${r.name} og ${w[ids.indexOf(x)].name} må ikke være samme uge.`); } }));

    for (let i = 0; i < 4; i++) if (w[i].tech === "gryde" && w[i + 1].tech === "gryde") { c += 120; explain && warn.push(`To gryderetter i træk (${DAYS[i].toLowerCase()} og ${DAYS[i + 1].toLowerCase()}).`); }
    if (w.every(r => r.carb === "ris")) { c += 200; explain && warn.push("Ris alle fem dage."); }

    const veg = {};
    w.forEach(r => r.veg.forEach(v => veg[v] = (veg[v] || 0) + 1));
    for (const [v, k] of Object.entries(veg)) if (k >= 3) { c += 40 * (k - 2); explain && warn.push(`${v} går igen i ${k} retter.`); }
    const cu = {};
    w.forEach(r => cu[r.cuisine] = (cu[r.cuisine] || 0) + 1);
    for (const k of Object.values(cu)) if (k > 2) c += 30 * (k - 2);

    const h = ctx.history || [];
    w.forEach(r => {
      if ((h[0] || []).includes(r.id)) { c += 150; explain && warn.push(`${r.name} var også med i sidste plan.`); }
      else if ((h[1] || []).includes(r.id)) c += 60;
    });

    for (const t of ctx.terms) {
      const re = termRe(t);
      const hit = w.map(r => re.test(r.text));
      if (hit[0]) c -= 600;
      else if (hit.some(Boolean)) { c -= 80; explain && warn.push(`"${t}" kunne ikke komme med mandag - den bruges ${DAYS[hit.indexOf(true)].toLowerCase()}.`); }
      else if (explain && ctx.R.some(r => re.test(r.text))) warn.push(`"${t}" kom ikke med i planen.`);
      else if (explain) warn.push(`Ingen ret i opskriftsbanken bruger "${t}".`);
    }

    w.forEach(r => { if (r.protShown < 35) c += 300; else if (r.protShown < 40) c += 20; });
    w.forEach(r => c += ctx.pref[r.id] || 0);
    return explain ? { cost: c, warnings: [...new Set(warn)] } : c;
  }

  function search(R, opts) {
    const P = pools(R, opts);
    const pref = {};
    R.forEach(r => pref[r.id] = Math.random() * 60);
    const ctx = { R, history: opts.history || [], terms: haveTerms(opts.have), pref };
    const pick = a => a[Math.floor(Math.random() * a.length)];
    let best = null;
    for (let run = 0; run < 25; run++) {
      // Start med kylling mandag, onsdag og fredag når det er muligt
      let w = P.map((p, d) => {
        const want = d % 2 === 0;
        const sub = p.filter(r => r.chicken === want);
        return pick(sub.length ? sub : p);
      });
      let s = evaluate(w, ctx);
      let better = true;
      while (better) {
        better = false;
        for (let d = 0; d < 5; d++) for (const r of P[d]) {
          if (r === w[d]) continue;
          const w2 = w.slice(); w2[d] = r;
          const s2 = evaluate(w2, ctx);
          if (s2 < s) { w = w2; s = s2; better = true; }
        }
        for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
          if (!P[i].includes(w[j]) || !P[j].includes(w[i])) continue;
          const w2 = w.slice(); w2[i] = w[j]; w2[j] = w[i];
          const s2 = evaluate(w2, ctx);
          if (s2 < s) { w = w2; s = s2; better = true; }
        }
      }
      if (!best || s < best.s) best = { w, s };
    }
    const ex = evaluate(best.w, ctx, true);
    return { ids: best.w.map(r => r.id), warnings: ex.warnings };
  }

  // ---------- Indkøbsliste ----------

  function fmtN(x, dec) {
    const r = Math.round(x * Math.pow(10, dec || 1)) / Math.pow(10, dec || 1);
    if (r === 0.5) return "½";
    if (r % 1 === 0.5) return Math.floor(r) + "½";
    return String(r).replace(".", ",");
  }

  function fmtQty(key, q) {
    const parts = [];
    for (const [u, v] of Object.entries(q)) {
      if (u === "g" && v >= 1000) parts.push(fmtN(v / 1000, 2) + " kg");
      else if (u === "fed") parts.push(`${fmtN(v)} fed (ca. ${Math.max(1, Math.ceil(v / 10))} hele)`);
      else if (u === "stk" && key === "Æg") parts.push(fmtN(v) + " stk");
      else parts.push(fmtN(v) + " " + u);
    }
    return parts.join(" + ");
  }

  function shopping(recipes) {
    const map = new Map();
    for (const r of recipes) for (const it of r.items) {
      let e = map.get(it.key);
      if (!e) { e = { key: it.key, group: it.group, tag: it.tag, order: it.order, q: {} }; map.set(it.key, e); }
      let qty = it.qty, unit = it.unit;
      if (qty == null && DEFAULT_QTY[it.key]) [qty, unit] = DEFAULT_QTY[it.key];
      if (qty != null) e.q[unit] = (e.q[unit] || 0) + qty;
    }
    return Object.entries(GROUPS).map(([g, label]) => ({
      g: label,
      items: [...map.values()].filter(e => e.group === g).sort((a, b) => a.order - b.order)
        .map(e => [e.key, fmtQty(e.key, e.q), e.tag ? [e.tag] : []]),
    })).filter(g => g.items.length);
  }

  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - y0) / 864e5 + 1) / 7);
  }

  // Ugen planen gælder for: weekenden planlægger næste uge
  function nextWeek(now) {
    const d = new Date(now || Date.now());
    const wd = d.getDay();
    if (wd === 6) d.setDate(d.getDate() + 2);
    if (wd === 0) d.setDate(d.getDate() + 1);
    return isoWeek(d);
  }

  return { DAYS, LOCKS, parse, search, shopping, nextWeek };
})();
