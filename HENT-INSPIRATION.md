# Hent inspiration - fremgangsmåde for Claude

Bruges når Johan beder om "hent ny inspiration", og af den planlagte opgave. Målet er at udvide `retter.md` med nye retter fra siderne i `inspiration.json`, uden at bryde reglerne i madplan-skill'en.

## 1. Læs listen

`inspiration.json` har `sites` (url + valgfri note) og `log`. Respektér noten for hver side, fx "kun asiatisk".

## 2. Find kandidater

For hver side: find 1-3 retter, der ikke allerede er i `retter.md` (sammenlign på ret, ikke kun navn). En ret er kun kandidat, hvis den kan holde reglerne:

- **Max 30 min aktiv tid.** Intet der kræver forberedelse dagen før eller lang braisering.
- **Min. 35 g protein pr. portion, gerne 40-45 g**, regnet på råvægt af proteinkilderne delt med 3,5 portioner. Gæt ikke - regn. Under 40 g markeres `(lav)` med det tilbehør, der løfter den.
- **Køkken:** asiatisk og indisk først, derefter thai, koreansk, vietnamesisk, japansk og mellemøstligt. Ingen dansk husmandskost.
- Mæt og grøntsagstung. Stærk mad er velkommen.

Sorterer en side næsten kun dansk eller bagværk, så tag færre eller ingen derfra og skriv det i loggen.

## 3. Skriv retten om

Gengiv aldrig en opskrift ordret. Skriv den om i bankens eget format, skaleret til 3 personer (3,5 voksenportioner). Trinene skal være grundige, så en uøvet kan følge dem: varme (lav/middel/høj), hvor fint der skæres, hvor længe, hvordan man ser at noget er færdigt, og hvad der laves imens. Typisk 4-6 trin på 2-3 sætninger. Start med risen, hvis retten har ris ("Sæt risen over: skyl 300 g jasminris, kog den i 4,5 dl vand ..."). Skriv mængder i trinene som `300 g`, `4,5 dl`, `2 spsk` - så regner appen dem om til andre antal personer.

```
### Navn på retten
**Køkken · 22 min · 44 g protein**
_Inspiration: valdemarsro.dk_
650 g kyllingeoverlår i stykker · 2 løg · 4 fed hvidløg · ... · jasminris
1. Sæt risen over: skyl 300 g jasminris, kog den i 4,5 dl vand med lidt salt, læg låg på og lad den trække på laveste blus i 12 min. Lad den hvile 5 min.
2. Skær kyllingen i mundrette stykker og hak løgene fint. Steg løgene i 2 spsk olie ved middel varme i 5 min, til de er bløde og gyldne. ...
```

- Mængder i g, dl, spsk, tsk, ds, fed, cm, bdt. Ingredienser adskilt af ` · `. Underlister som `sauce: 3 spsk soja, 1 spsk sukker`.
- Ovnretter skrives som `10 min aktiv + 20 min ovn`.
- `_Inspiration: <domæne>_` lige under den fede linje - appen viser retten som "Ny".
- Læg retten i den rigtige sektion (Kylling, Fisk og skaldyr, Okse og svin, Hakket kød, Æg linser og tofu, Stærke retter) og opdatér antallet i indholdsfortegnelsen.

## 4. Tjek at appen kan læse den

Ingredienser skal kunne genkendes af `DICT` i `engine.js`, ellers lander de under "Resten" i indkøbslisten. Tilføj en linje i `DICT` for nye råvarer (fx `[/halloumi/, "Halloumi", "M"]`), og hæv `CACHE` i `sw.js`, når `engine.js` ændres.

## 5. Log og push

Tilføj én post pr. side i `log` i `inspiration.json`:

```json
{ "date": "2026-10-11", "site": "valdemarsro.dk", "added": ["Navn 1", "Navn 2"], "note": "kort begrundelse hvis 0" }
```

Kør `node tools/check.js` og ret alle fejl, den melder.

Kører du i GitHub Actions (startet fra appens "Opdater opskrifter"), committer og pusher workflowen selv. Ellers: commit med beskeden `Inspiration: N nye retter` og push til `main`. Appen henter den nye `retter.md` direkte fra repoet.
