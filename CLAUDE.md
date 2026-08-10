# wetter-app

## Deploy — alles kommt direkt auf `main`

- Die Live-App läuft auf **GitHub Pages aus `main` (Repo-Root)**: kein Deploy-Workflow,
  kein `gh-pages`-Branch. Nur was auf `main` liegt, ist live.
- **Änderungen gehen direkt auf `main`.** Kein PR-Umweg, kein Feature-Branch als Endstation —
  nur wenn Daniel ausdrücklich einen PR will. Wer bloß auf einen Feature-Branch pusht, sieht
  auf der Seite nichts und meldet fälschlich „ist deployed".
- Wird trotzdem auf einem Branch entwickelt (z. B. weil die Session einen vorgibt): am Ende
  nach `main` mergen und `main` pushen, sonst ist die Arbeit nicht live.
- Nach dem Push den Run **„pages build and deployment"** abwarten (~1 Min.). Der Job hing
  schon einmal als Phantom fest — passiert das wieder, mit einem neuen Commit neu antriggern.
- Danach gegenprüfen, dass die Seite den neuen Code wirklich ausliefert:
  `curl -s https://lightcatcher-77.github.io/wetter-app/ | grep <neue Funktion>`
- `index.html` wird vom Service Worker network-first geladen: nach dem Deploy reicht ein
  normaler Reload im Browser, es muss nichts geleert werden.
