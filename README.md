# Madplan

En lille offline-app til ugens madplan. To tilstande: indkøbsliste med afkrydsning,
og madlavning med ét trin ad gangen i stor tekst.

## Sådan sættes den op (én gang)

1. Læg alle filerne i roden af et GitHub-repo.
2. Settings -> Pages -> Source: "Deploy from a branch", branch `main`, mappe `/root`.
3. Vent et minut. Siden ligger på `https://<brugernavn>.github.io/<repo>/`.
4. Åbn adressen i Chrome på telefonen -> menu -> Installer app.

Fordi det er dit eget domæne, bruges dette manifest - og appen installeres som
"Madplan" med eget ikon, ikke som en genvej til en anden tjeneste.

## Sådan opdateres planen

Kun `plan.json` skiftes ud. Resten af filerne står stille.

Service workeren henter altid `plan.json` fra nettet først og falder tilbage til
den gemte udgave uden signal. Appen sammenligner planens signatur med den gemte,
og nulstiller afkrydsninger og trin automatisk når indholdet er nyt.

Skal skallen (`index.html`, `sw.js`) ændres, så hæv `CACHE`-navnet i `sw.js`
fra `madplan-v1` til `madplan-v2`. Ellers bliver den gamle udgave hængende i telefonen.

## Filer

- `index.html` - hele appen, ingen afhængigheder
- `plan.json` - ugens plan, den eneste fil der skiftes
- `sw.js` - offline-cache
- `manifest.webmanifest` - navn, ikon, standalone-visning
- `icon-*.png` - app-ikoner
