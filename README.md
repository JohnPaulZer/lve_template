# Laravel Vue Express Template CLI

`lve-temp-jpz` is a CLI that scaffolds one Laravel-style project with Vue and Express already wired in.

It helps you skip repetitive setup and start with a ready project shape, including health-check routes and a shared local dev flow.

## What You Get

- Laravel 12 app structure
- Vue 3 frontend inside `resources/js`
- Express API server inside `server`
- Vite integration for the frontend
- Health-check endpoints for Laravel and Express
- Local scripts to run Laravel, Vite, and Express together

## Requirements

- Node.js 18+
- PHP 8.2+
- Composer

## Quick Start

Create a new folder and scaffold into it:

```bash
npx lve-temp-jpz my-app
cd my-app
```

Install dependencies:

```bash
composer install
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Windows CMD:

```bat
copy .env.example .env
```

Generate app key and start development:

```bash
php artisan key:generate
npm run dev
```

Default URLs:

- Laravel + Vue: `http://localhost:8000`
- Express API: `http://localhost:5000`

## Health Checks

- Laravel: `http://localhost:8000/api/health`
- Express: `http://localhost:5000/api/health`

## CLI Usage

Run with `npx`:

```bash
npx lve-temp-jpz [project-name] [options]
```

Or install globally:

```bash
npm install -g lve-temp-jpz
```

Then use any of the provided commands:

```bash
lve my-app
laravue my-app
```

### Options

- `-h, --help` Show help
- `-f, --force` Allow scaffolding into a non-empty directory

Examples:

```bash
npx lve-temp-jpz
npx lve-temp-jpz my-app
npx lve-temp-jpz . --force
```

Notes:

- If no project name is provided, files are generated in the current directory.
- The CLI refuses to scaffold into this CLI package root to prevent accidental overwrite.

## Generated Project Structure

```text
app/
bootstrap/
config/
public/
resources/
  css/
  js/
  views/
routes/
scripts/
server/
storage/
artisan
composer.json
package.json
vite.config.js
```

## Scripts Inside Generated App

- `npm run dev` Start Laravel, Vite, and Express together
- `npm run dev:laravel` Start Laravel only
- `npm run dev:vite` Start Vite only
- `npm run dev:express` Start Express only
- `npm run build` Build frontend assets

## CI/CD: Publish to npm on Tags

This repository includes GitHub Actions automation in `.github/workflows/publish-npm.yml`.

Workflow behavior:

- Triggers on tag pushes (`v*` or `*.*.*`)
- Runs install and tests
- Verifies tag version matches `package.json` version
- Publishes to npm with provenance

Required GitHub secret:

- `NPM_TOKEN` (npm automation token)

Release flow:

```bash
# 1) bump package version
npm version patch

# 2) push commit and tag
git push origin main --follow-tags
```

You can also create tags manually, for example `v1.0.2`, as long as the tag version matches `package.json`.

## Development (This CLI Repo)

Install dependencies and run the built-in test command:

```bash
npm install
npm test
```

## License

MIT
