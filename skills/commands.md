# Commands Reference

## Always run from the correct directory

| Command | Directory | Example |
|---|---|---|
| Kirby dev server | `kirby/` | `php -S localhost:8000 kirby/router.php` |
| Kirbo Panel API | `kirby/` | all `kill $(lsof -t -i:8000)` commands |
| Eleventy build | **project root** | `npx eleventy` |
| Eleventy dev server | **project root** | `npx eleventy --serve --port 8082` |
| npm install | **project root** | `npm install` |
| git commands | **project root** | `git commit`, `git status` |

## Start both servers

```bash
# Terminal 1 — Kirby
cd kirby
php -S localhost:8000 kirby/router.php

# Terminal 2 — Eleventy (from project root)
cd /Users/powerplant/Sites/emintoyland
npx eleventy --serve --port 8082
```

## Quick restart (one-liners)

```bash
# Restart Kirby
kill $(lsof -t -i:8000) 2>/dev/null; sleep 1; php -S localhost:8000 kirby/router.php > /dev/null 2>&1 &
# ^ must run from emintoyland/kirby/

# Rebuild + restart Eleventy
rm -rf _site .cache && npx eleventy && kill $(lsof -t -i:8080) 2>/dev/null; npx eleventy --serve --port 8082 > /dev/null 2>&1 &
# ^ must run from emintoyland/ (project root)
```

## NEVER do this

```
# WRONG — running Eleventy from kirby/ will treat Kirby as source
cd kirby && npx eleventy   # ❌ generates kirby/_site/
```
