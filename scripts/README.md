# Skrypt losujacy ankiete

`sample_survey.py` wybiera podzbior zestawow z pelnego katalogu do jednej ankiety.

## Pliki
- `data/tasks_catalog.json` — PELNY katalog 178 kombinacji (zrodlo, nie ruszac).
- `data/tasks.json` — ANKIETA do wgrania na platforme (wynik losowania).

## Uzycie
```bash
# 10 zestawow, seed bazowy 5 (domyslne)
node scripts/sample_survey.js

# inne parametry
node scripts/sample_survey.js --n 15 --seed-base 3
node scripts/sample_survey.js --rng 42          # powtarzalne losowanie
```

## Jak dziala
- Losuje N kombinacji (color/top) z katalogu, bez powtorzen.
- Dla kazdej ustawia seed bazowy (domyslnie 5) we wszystkich trzech metodach
  (plain/rl_aes/rl_tech) — ten sam seed izoluje efekt metody.
- Jesli kombinacja nie ma seeda 5, bierze najblizszy dostepny (z ostrzezeniem).
- Zapisuje do `data/tasks.json`.

## WAZNE
- `data/tasks_catalog.json` to zrodlo — jesli go skasujesz, odtworz z pelnego
  generatora (178 kombinacji).
- `rl_aes` / `rl_tech` w URL-ach to placeholdery (`generated_rl_aes/`,
  `generated_rl_tech/`) — dzialaja dopiero gdy notatnik RL wygeneruje te obrazy.
  Do czasu RL tylko `plain` ma realne obrazy.
