# Madplan

En lille offline-app, der laver ugens madplan direkte på telefonen. Tre faner:

- **Plan** - lav en ny plan for mandag til fredag, eller byt en enkelt dag ud.
- **Indkøb** - samlet indkøbsliste med afkrydsning, lagt sammen på tværs af retterne.
- **Madlavning** - ét trin ad gangen i stor tekst, og skærmen holdes tændt.
- **Inspiration** - de hjemmesider Claude henter nye retter fra.

## Inspiration

Listen over sider ligger i `inspiration.json`. I appen tilføjer og fjerner du sider. Med en GitHub-nøgle (fine-grained, kun Madplan-repoet, "Contents: Read and write") gemmer appen listen direkte; uden nøgle kopierer den listen og åbner GitHub's editor.

Knappen **Opdater opskrifter** starter workflowen `.github/workflows/inspiration.yml`. Her henter Claude retter efter `HENT-INSPIRATION.md`: finder retter der overholder reglerne, regner protein, skriver dem om i bankens format med en `_Inspiration: domæne_`-linje og lægger dem i `retter.md`. `tools/check.js` stopper ændringer, appen ikke kan læse, og først derefter committes og pushes der. Appen følger med undervejs og henter den nye `retter.md` direkte fra repoet, så snart den er færdig. De nye retter vises som "Ny" og er med i næste plan.

### Opsætning af knappen (én gang)

1. **Claude-adgang til workflowen.** Kør `claude setup-token` i en terminal og læg resultatet som repo-secret `CLAUDE_CODE_OAUTH_TOKEN` (GitHub -> repo -> Settings -> Secrets and variables -> Actions). Alternativt en API-nøgle som `ANTHROPIC_API_KEY`.
2. **Nøgle til appen.** Fine-grained token med kun Madplan-repoet og "Contents: Read and write" + "Actions: Read and write". Indsæt den under GitHub-adgang i Inspiration-fanen.

Workflowen kan også startes manuelt under Actions -> Hent inspiration -> Run workflow.

## Sådan laves planen

Appen læser opskriftsbanken `retter.md` og bygger planen efter de samme regler som madplan-skill'en:

- Kylling tre dage (mandag, onsdag og fredag), aldrig to dage i træk, og i tre forskellige køkkener og teknikker.
- Mindst tre retter under 25 minutter og ingen over 30 minutters aktiv tid.
- Ingen fisk eller skaldyr, medmindre du sætter hak eller skriver en fisk i "Noget der skal bruges?".
- Ikke to gryderetter i træk, ikke ris alle fem dage, og ikke samme grøntsag i tre retter.
- Retter markeret **(lav)** får deres tilbehør med i både opskriften og indkøbslisten.
- Retter fra de to seneste planer undgås.

Skriver du noget i "Noget der skal bruges?" (fx `torsk, spidskål`), bygges mandagens ret op om det. Ønsker til en bestemt dag (suppe, nudler, en bestemt ret osv.) vælges i listen for den dag.

## Sådan sættes den op (én gang)

1. Læg alle filerne i roden af et GitHub-repo.
2. Settings -> Pages -> Source: "Deploy from a branch", branch `main`, mappe `/root`.
3. Vent et minut. Siden ligger på `https://<brugernavn>.github.io/<repo>/`.
4. Åbn adressen i Chrome på telefonen -> menu -> Installer app.

## Sådan opdateres opskrifterne

Ret i `retter.md` og push. Service workeren henter altid `retter.md` fra nettet først og falder tilbage til den gemte udgave, når der ikke er signal. Formatet skal følge det eksisterende: `### Navn`, en fed linje med `Køkken · tid · NN g protein`, en linje med ingredienser adskilt af ` · ` og nummererede trin.

Ingredienser, som indkøbslisten ikke kender, havner under "Resten". Tilføj dem i `DICT` i `engine.js`, så de kommer i den rigtige gruppe.

Skal skallen (`index.html`, `engine.js`, `sw.js`) ændres, så hæv `CACHE`-navnet i `sw.js` (fx `madplan-v2` -> `madplan-v3`). Ellers bliver den gamle udgave hængende i telefonen.

Planen, afkrydsningerne og historikken gemmes kun i telefonens browser. Hvis du rydder webstedsdata, starter du forfra.

## Filer

- `index.html` - appen
- `engine.js` - regelmotor og indkøbsliste
- `retter.md` - opskriftsbanken
- `inspiration.json` - inspirationssider og log over hentninger
- `HENT-INSPIRATION.md` - Claudes fremgangsmåde for at hente nye retter
- `sw.js` - offline-cache
- `manifest.webmanifest` - navn, ikon, standalone-visning
- `icon-*.png` - app-ikoner
