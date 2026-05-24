# Skills / Helpers

This folder contains helper scripts, tutorials, and reference docs for the Em in Toyland project.

## Files

| File | Purpose |
|------|---------|
| `download-images.sh` | Downloads all Webflow CDN images to `public/images/` |

## Commands

```sh
# Download all site images
bash skills/download-images.sh

# Start dev server
npm run dev

# Build for production (local)
npm run build-local

# Build for production (CI)
npm run build
```

## Conventions

- **Commit format**: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`
  - Example: `feat(collections): rename blogCategories to categories`

- **Branch naming**: Use descriptive kebab-case names
