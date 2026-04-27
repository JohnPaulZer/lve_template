# Laravel Vue Express Template CLI tool

`lve-temp-jpz` is a CLI tool that creates a ready-to-use Laravel, Vue, and Express starter project.

Instead of manually creating the same Laravel folders, Vue setup, Express server, routes, and health-check files every time you start a project, you can run one command and get a clean application structure.

It generates one Laravel-style project with:

- Laravel
- Vue
- Express
- Vite
- Laravel API health-check route
- Express API health-check route

This template is useful if you want to start a Laravel project that already has Vue for the frontend and Express for a separate Node API.

## What It Creates

The CLI creates one project with the usual Laravel structure:

- `app` - Laravel controllers, providers, and services
- `bootstrap` - Laravel application bootstrap files
- `config` - Laravel application config
- `public` - Laravel front controller and public files
- `resources` - Vue app, CSS, and Blade view
- `routes` - Laravel web, API, and console routes
- `scripts` - local development script that starts all services
- `server` - Express API server
- `storage` - Laravel storage folders

Vue is placed inside `resources/js`, so it works like a normal Laravel frontend.

Express is placed inside `server`, so it stays in the same project without creating a separate app folder.

The template also includes simple health-check examples so you can confirm Laravel, Vue, and Express are wired up.

## Quick Start

Create a new project folder:

```bash
npx lve-temp-jpz my-app
```

`my-app` is the name of the folder that will be created. You can replace it with any project name you want.

You can also create the template inside the current folder without making another folder:

```bash
mkdir my-app
cd my-app
npx lve-temp-jpz
```

When you do not add a project name, the template files are created directly in the folder where you run the command.

If you created a new project folder, open it:

```bash
cd my-app
```

Install PHP dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Create the Laravel app key:

```bash
php artisan key:generate
```

Install Node dependencies:

```bash
npm install
```

Start Laravel, Vue, and Express:

```bash
npm run dev
```

Laravel and Vue will run at:

```text
http://localhost:8000
```

The Express API will run at:

```text
http://localhost:5000
```

The Laravel health-check route will be available at:

```text
http://localhost:8000/api/health
```

The Express health-check route will be available at:

```text
http://localhost:5000/api/health
```

## Using Global Install

You can also install the CLI globally:

```bash
npm install -g lve-temp-jpz
```

The `-g` means global. This installs the CLI tool on your computer instead of inside one project folder.

After global installation, npm makes the `lve` and `laravue` commands available in your terminal. This means you can run the command from any folder without using `npx`.

Then create a project with:

```bash
lve my-app
```

or:

```bash
laravue my-app
```

## Command Format

```bash
npx lve-temp-jpz [project-name]
```

Examples:

```bash
npx lve-temp-jpz my-lve-project
```

```bash
npx lve-temp-jpz
```

If you add a project name, the CLI creates a folder with that name and puts the template files inside it.

If you do not add a project name, the CLI creates the template in the folder where you run the command.

For example, this creates the project directly inside `my-app` instead of creating `my-app/my-app`:

```bash
mkdir my-app
cd my-app
npx lve-temp-jpz
```

Use `npx` when you only want to run the CLI once. Use global install if you want the command available on your computer all the time.

## Generated Folder Structure

```text
app/
  Http/
    Controllers/
  Providers/
  Services/
bootstrap/
config/
public/
resources/
  css/
  js/
    App.vue
    app.js
  views/
    app.blade.php
routes/
  api.php
  console.php
  web.php
scripts/
  dev.js
server/
  index.js
storage/
composer.json
package.json
vite.config.js
```

## License

This project is licensed under the MIT License.

That means you can use, copy, modify, and share this CLI tool for personal or commercial projects.
