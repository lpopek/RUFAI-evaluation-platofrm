# Badanie oceny grafik — MOS & Ranking

Aplikacja badawcza (React + Vite, backend serverless na Vercelu) do oceny grafik
generowanych z promptów. Powstała w ramach doktoratu wdrożeniowego
(Politechnika Warszawska · Sieć Badawcza — Rafał Perz).

## Przepływ uczestnika

1. **Nagłówek** — informacja o badaniu, logo PW i sieci, przełącznik języka PL/EN.
2. **Instrukcja** — opis zadania.
3. **Metryczka** — nick, wiek, płeć, doświadczenie z grafiką AI + zgoda.
4. **Karty trójek** — dla każdego promptu 3 grafiki; najpierw ocena MOS (1–5)
   każdej z nich, potem ranking (1.–3. miejsce). Trójki w losowej kolejności.
5. **Wyjście w dowolnej chwili** ("Zakończ i zapisz") = zapis i ekran podziękowania.

Każda ukończona trójka zapisywana jest osobno do bazy (z doklejoną metryczką),
więc przerwanie badania nie traci wcześniejszych odpowiedzi.

## Dwujęzyczność (PL/EN)

Interfejs i prompty mają wersje `pl` i `en`. Teksty UI w `src/i18n.jsx`,
prompty w `data/tasks.json` (pola `prompt.pl` / `prompt.en`).
Wybrany język zapisywany jest przy każdej ocenie (pole `lang`).

## Logo

Podmień placeholdery: wrzuć pliki do `public/` (`logo-pw.svg`, `logo-siec.svg`)
i zamień `<div className="logo-ph">` na `<img className="logo-img">`
w `src/components/Header.jsx` — szczegóły w `public/README-logo.txt`.

## Struktura

```
api/
  tasks.js      # GET — metadane zadań (prompt PL/EN + grafiki)
  results.js    # GET/POST — odczyt i zapis ocen (Vercel KV)
data/
  tasks.json    # baza: prompty dwujęzyczne + przypisane grafiki
src/
  App.jsx           # logika ekranów, losowanie, zapis
  i18n.jsx          # słownik PL/EN
  components/        # Header, Intro, Demographics, TaskCard, Done, StarRating
```

## Format zapisanego wpisu

```json
{
  "type": "evaluation",
  "taskId": "task-003",
  "rater": "uczestnik_07",
  "sessionId": "uczestnik_07-1718800000000",
  "participant": { "nick": "uczestnik_07", "age": 28, "gender": "K", "exp": "srednie" },
  "lang": "pl",
  "scores":  { "img-003-a": 4, "img-003-b": 2, "img-003-c": 5 },
  "ranking": { "img-003-a": 2, "img-003-b": 3, "img-003-c": 1 },
  "savedAt": "2026-06-19T17:20:00.000Z"
}
```

## Wdrożenie na Vercel

1. Wrzuć repo na GitHub i zaimportuj w panelu Vercela.
2. **Storage → utwórz bazę KV** i połącz z projektem (Vercel ustawi
   `KV_REST_API_URL` i `KV_REST_API_TOKEN`, których używa `@vercel/kv`).
3. Redeploy. Bez KV ocenianie w UI działa, ale zapis zwróci błąd.

## Pobranie wyników

`GET /api/results` zwraca wszystkie wpisy w JSON (do dalszej analizy / eksportu CSV
po stronie analityka).

## Rozwój lokalny

```bash
npm install
vercel dev      # frontend + funkcje /api (wymaga zalogowania w Vercel CLI)
```

`npm run dev` uruchomi sam frontend (bez /api).

## Plan

Mieści się w darmowym planie Hobby Vercela (klauzula niekomercyjna — do zastosowań
komercyjnych wymagany Pro).
