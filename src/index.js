#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const versions = {
  php: "^8.2",
  laravel: "^12.0",
  express: "^5.2.1",
  laravelVitePlugin: "^3.0.1",
  vite: "^8.0.10",
  viteVue: "^6.0.6",
  vue: "^3.5.33",
};

function main() {
  const { target: parsedTarget, force, help } = parseArgs(process.argv.slice(2));

  if (help) {
    printHelp();
    return;
  }

  const target = parsedTarget || ".";
  const targetDir = path.resolve(process.cwd(), target);
  const projectName = packageNameFromTarget(targetDir, target);
  createProject(targetDir, projectName, force);

  const relativeTarget = path.relative(process.cwd(), targetDir) || ".";
  console.log("");
  console.log("Created Laravel Vue Express template in " + relativeTarget);
  console.log("");
  console.log("Next steps:");
  if (relativeTarget !== ".") {
    console.log("  cd " + relativeTarget);
  }
  console.log("  composer install");
  console.log("  Copy .env.example to .env and update it if needed");
  console.log("  php artisan key:generate");
  console.log("  npm install");
  console.log("  npm run dev");
}

function parseArgs(args) {
  let target = "";
  let force = false;
  let help = false;

  for (const arg of args) {
    if (arg === "-h" || arg === "--help") {
      help = true;
    } else if (arg === "-f" || arg === "--force") {
      force = true;
    } else if (arg.startsWith("-")) {
      throw new Error("Unknown option: " + arg);
    } else if (!target) {
      target = arg;
    }
  }

  return { target, force, help };
}

function printHelp() {
  console.log(`
lve

Usage:
  lve
  lve [project-name]
  lve . --force

Examples:
  lve
  lve my-app

Options:
  -f, --force   Allow scaffolding into a non-empty directory
  -h, --help    Show this help message

No project name means the template will be created in the current directory.
`);
}

function packageNameFromTarget(targetDir, rawTarget) {
  const folderName = rawTarget === "." ? path.basename(targetDir) : path.basename(rawTarget);
  const cleaned = folderName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "");

  return cleaned || "laravue-express-app";
}

function createProject(targetDir, projectName, force) {
  ensureNotCliPackageRoot(targetDir);
  ensureSafeTarget(targetDir, force);

  const template = buildTemplate(projectName);

  for (const directory of template.directories) {
    fs.mkdirSync(path.join(targetDir, directory), { recursive: true });
  }

  for (const [filePath, contents] of Object.entries(template.files)) {
    const destination = path.join(targetDir, filePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, contents, "utf8");
  }
}

function ensureNotCliPackageRoot(targetDir) {
  const cliRoot = path.resolve(__dirname, "..");
  const cliPackagePath = path.join(cliRoot, "package.json");

  if (path.resolve(targetDir) !== cliRoot || !fs.existsSync(cliPackagePath)) {
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(cliPackagePath, "utf8"));

    if (packageJson.name === "lve-temp-jpz") {
      throw new Error(
        "Refusing to scaffold into the CLI package folder. Run this command from another directory or provide a project name."
      );
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return;
    }

    throw error;
  }
}

function ensureSafeTarget(targetDir, force) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    return;
  }

  const existingFiles = fs.readdirSync(targetDir);
  if (existingFiles.length > 0 && !force) {
    throw new Error(
      "Target directory is not empty. Use --force to scaffold into it: " + targetDir
    );
  }
}

function buildTemplate(projectName) {
  const appTitle = toTitle(projectName);
  const composerName = "app/" + projectName;

  const directories = [
    "app/Http/Controllers",
    "app/Providers",
    "app/Services",
    "bootstrap/cache",
    "config",
    "public",
    "resources/css",
    "resources/js",
    "resources/views",
    "routes",
    "scripts",
    "server",
    "storage/app/public",
    "storage/framework/cache/data",
    "storage/framework/sessions",
    "storage/framework/testing",
    "storage/framework/views",
    "storage/logs",
  ];

  const files = {
    ".editorconfig": lines([
      "root = true",
      "",
      "[*]",
      "charset = utf-8",
      "end_of_line = lf",
      "insert_final_newline = true",
      "indent_style = space",
      "indent_size = 4",
      "trim_trailing_whitespace = true",
      "",
      "[*.{json,js,vue,css,blade.php}]",
      "indent_size = 2",
    ]),
    ".env.example": lines([
      "APP_NAME=" + envString(appTitle),
      "APP_ENV=local",
      "APP_KEY=",
      "APP_DEBUG=true",
      "APP_URL=http://localhost:8000",
      "",
      "APP_LOCALE=en",
      "APP_FALLBACK_LOCALE=en",
      "",
      "APP_MAINTENANCE_DRIVER=file",
      "",
      "LOG_CHANNEL=stack",
      "LOG_LEVEL=debug",
      "",
      "CACHE_STORE=file",
      "QUEUE_CONNECTION=sync",
      "SESSION_DRIVER=file",
      "",
      "EXPRESS_PORT=5000",
      "EXPRESS_CLIENT_URL=http://localhost:8000",
      "VITE_EXPRESS_API_URL=http://localhost:5000/api",
      "VITE_LARAVEL_API_URL=/api",
      "VITE_APP_NAME=\"${APP_NAME}\"",
    ]),
    ".gitattributes": lines([
      "* text=auto eol=lf",
      "",
      "*.blade.php diff=html",
      "*.css diff=css",
      "*.html diff=html",
      "*.md diff=markdown",
      "*.php diff=php",
      "*.vue diff=html",
    ]),
    ".gitignore": lines([
      "/node_modules",
      "/public/build",
      "/public/hot",
      "/public/storage",
      "/storage/*.key",
      "/vendor",
      ".env",
      ".env.backup",
      ".env.production",
      "auth.json",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      ".DS_Store",
    ]),
    "README.md": lines([
      "# " + appTitle,
      "",
      "Laravel Vue Express template generated as one Laravel-style project.",
      "",
      "## Getting Started",
      "",
      "```bash",
      "composer install",
      "cp .env.example .env",
      "php artisan key:generate",
      "npm install",
      "npm run dev",
      "```",
      "",
      "Laravel and Vue run on `http://localhost:8000`.",
      "Express runs on `http://localhost:5000`.",
      "",
      "## Health Checks",
      "",
      "```text",
      "GET /api/health",
      "GET http://localhost:5000/api/health",
      "```",
    ]),
    "artisan": lines([
      "#!/usr/bin/env php",
      "<?php",
      "",
      "use Illuminate\\Foundation\\Application;",
      "use Symfony\\Component\\Console\\Input\\ArgvInput;",
      "",
      "define('LARAVEL_START', microtime(true));",
      "",
      "require __DIR__.'/vendor/autoload.php';",
      "",
      "/** @var Application $app */",
      "$app = require_once __DIR__.'/bootstrap/app.php';",
      "",
      "$status = $app->handleCommand(new ArgvInput);",
      "",
      "exit($status);",
    ]),
    "composer.json": json({
      name: composerName,
      type: "project",
      description: "A Laravel Vue Express template.",
      keywords: ["laravel", "vue", "express"],
      license: "MIT",
      require: {
        php: versions.php,
        "laravel/framework": versions.laravel,
      },
      autoload: {
        "psr-4": {
          "App\\": "app/",
        },
      },
      scripts: {
        "post-autoload-dump": [
          "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
          "@php artisan package:discover --ansi",
        ],
        "post-root-package-install": [
          "@php -r \"file_exists('.env') || copy('.env.example', '.env');\"",
        ],
        dev: [
          "Composer\\Config::disableProcessTimeout",
          "npm run dev",
        ],
      },
      extra: {
        laravel: {
          "dont-discover": [],
        },
      },
      config: {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true,
        "allow-plugins": {},
      },
      "minimum-stability": "stable",
      "prefer-stable": true,
    }),
    "package.json": json({
      name: projectName,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "node scripts/dev.js",
        "dev:laravel": "php artisan serve --host=127.0.0.1 --port=8000",
        "dev:vite": "vite",
        "dev:express": "node --watch server/index.js",
        build: "vite build",
        "start:express": "node server/index.js",
      },
      dependencies: {
        express: versions.express,
        vue: versions.vue,
      },
      devDependencies: {
        "@vitejs/plugin-vue": versions.viteVue,
        "laravel-vite-plugin": versions.laravelVitePlugin,
        vite: versions.vite,
      },
      engines: {
        node: ">=18.0.0",
      },
    }),
    "vite.config.js": lines([
      "import vue from '@vitejs/plugin-vue';",
      "import laravel from 'laravel-vite-plugin';",
      "import { defineConfig } from 'vite';",
      "",
      "export default defineConfig({",
      "  plugins: [",
      "    laravel({",
      "      input: ['resources/css/app.css', 'resources/js/app.js'],",
      "      refresh: true,",
      "    }),",
      "    vue(),",
      "  ],",
      "});",
    ]),
    "scripts/dev.js": lines([
      "import { spawn } from 'node:child_process';",
      "",
      "const isWindows = process.platform === 'win32';",
      "const php = isWindows ? 'php.exe' : 'php';",
      "",
      "const commands = [",
      "  { name: 'laravel', command: php, args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'] },",
      "  { name: 'vite', command: 'npm', args: ['run', 'dev:vite'] },",
      "  { name: 'express', command: 'npm', args: ['run', 'dev:express'] },",
      "];",
      "",
      "const children = [];",
      "",
      "for (const item of commands) {",
      "  console.log('[' + item.name + '] starting');",
      "  const child = spawnCommand(item);",
      "",
      "  child.on('error', (error) => {",
      "    console.error('[' + item.name + '] failed to start: ' + error.message);",
      "    stopAll('SIGTERM');",
      "    process.exitCode = 1;",
      "  });",
      "",
      "  children.push(child);",
      "}",
      "",
      "let closing = false;",
      "",
      "function spawnCommand(item) {",
      "  if (isWindows && item.command === 'npm') {",
      "    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...item.args], { stdio: 'inherit' });",
      "  }",
      "",
      "  return spawn(item.command, item.args, { stdio: 'inherit' });",
      "}",
      "",
      "function stopAll(signal) {",
      "  if (closing) {",
      "    return;",
      "  }",
      "",
      "  closing = true;",
      "  for (const child of children) {",
      "    child.kill(signal);",
      "  }",
      "}",
      "",
      "for (const signal of ['SIGINT', 'SIGTERM']) {",
      "  process.on(signal, () => {",
      "    stopAll(signal);",
      "    process.exit(0);",
      "  });",
      "}",
      "",
      "for (const child of children) {",
      "  child.on('exit', (code) => {",
      "    if (!closing && code && code !== 0) {",
      "      stopAll('SIGTERM');",
      "      process.exitCode = code;",
      "    }",
      "  });",
      "}",
    ]),
    "app/Http/Controllers/Controller.php": lines([
      "<?php",
      "",
      "namespace App\\Http\\Controllers;",
      "",
      "abstract class Controller",
      "{",
      "    //",
      "}",
    ]),
    "app/Http/Controllers/HealthController.php": lines([
      "<?php",
      "",
      "namespace App\\Http\\Controllers;",
      "",
      "use App\\Services\\HealthService;",
      "use Illuminate\\Http\\JsonResponse;",
      "",
      "class HealthController extends Controller",
      "{",
      "    public function __invoke(HealthService $health): JsonResponse",
      "    {",
      "        return response()->json($health->status());",
      "    }",
      "}",
    ]),
    "app/Providers/AppServiceProvider.php": lines([
      "<?php",
      "",
      "namespace App\\Providers;",
      "",
      "use Illuminate\\Support\\ServiceProvider;",
      "",
      "class AppServiceProvider extends ServiceProvider",
      "{",
      "    public function register(): void",
      "    {",
      "        //",
      "    }",
      "",
      "    public function boot(): void",
      "    {",
      "        //",
      "    }",
      "}",
    ]),
    "app/Services/HealthService.php": lines([
      "<?php",
      "",
      "namespace App\\Services;",
      "",
      "class HealthService",
      "{",
      "    /**",
      "     * @return array<string, string>",
      "     */",
      "    public function status(): array",
      "    {",
      "        return [",
      "            'status' => 'ok',",
      "            'service' => 'laravel',",
      "            'timestamp' => now()->toISOString(),",
      "        ];",
      "    }",
      "}",
    ]),
    "bootstrap/app.php": lines([
      "<?php",
      "",
      "use Illuminate\\Foundation\\Application;",
      "use Illuminate\\Foundation\\Configuration\\Exceptions;",
      "use Illuminate\\Foundation\\Configuration\\Middleware;",
      "",
      "return Application::configure(basePath: dirname(__DIR__))",
      "    ->withRouting(",
      "        web: __DIR__.'/../routes/web.php',",
      "        api: __DIR__.'/../routes/api.php',",
      "        commands: __DIR__.'/../routes/console.php',",
      "        health: '/up',",
      "    )",
      "    ->withMiddleware(function (Middleware $middleware): void {",
      "        //",
      "    })",
      "    ->withExceptions(function (Exceptions $exceptions): void {",
      "        //",
      "    })->create();",
    ]),
    "bootstrap/cache/.gitignore": lines(["*", "!.gitignore"]),
    "bootstrap/providers.php": lines([
      "<?php",
      "",
      "return [",
      "    App\\Providers\\AppServiceProvider::class,",
      "];",
    ]),
    "config/app.php": lines([
      "<?php",
      "",
      "return [",
      "    'name' => env('APP_NAME', 'Laravel'),",
      "    'env' => env('APP_ENV', 'production'),",
      "    'debug' => (bool) env('APP_DEBUG', false),",
      "    'url' => env('APP_URL', 'http://localhost'),",
      "    'timezone' => 'UTC',",
      "    'locale' => env('APP_LOCALE', 'en'),",
      "    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),",
      "    'cipher' => 'AES-256-CBC',",
      "    'key' => env('APP_KEY'),",
      "    'previous_keys' => [",
      "        ...array_filter(",
      "            explode(',', env('APP_PREVIOUS_KEYS', ''))",
      "        ),",
      "    ],",
      "    'maintenance' => [",
      "        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),",
      "        'store' => env('APP_MAINTENANCE_STORE', 'database'),",
      "    ],",
      "];",
    ]),
    "public/.htaccess": lines([
      "<IfModule mod_rewrite.c>",
      "    <IfModule mod_negotiation.c>",
      "        Options -MultiViews -Indexes",
      "    </IfModule>",
      "",
      "    RewriteEngine On",
      "",
      "    RewriteCond %{HTTP:Authorization} .",
      "    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]",
      "",
      "    RewriteCond %{REQUEST_FILENAME} !-d",
      "    RewriteCond %{REQUEST_URI} (.+)/$",
      "    RewriteRule ^ %1 [L,R=301]",
      "",
      "    RewriteCond %{REQUEST_FILENAME} !-d",
      "    RewriteCond %{REQUEST_FILENAME} !-f",
      "    RewriteRule ^ index.php [L]",
      "</IfModule>",
    ]),
    "public/index.php": lines([
      "<?php",
      "",
      "use Illuminate\\Http\\Request;",
      "",
      "define('LARAVEL_START', microtime(true));",
      "",
      "if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {",
      "    require $maintenance;",
      "}",
      "",
      "require __DIR__.'/../vendor/autoload.php';",
      "",
      "/** @var \\Illuminate\\Foundation\\Application $app */",
      "$app = require_once __DIR__.'/../bootstrap/app.php';",
      "",
      "$app->handleRequest(Request::capture());",
    ]),
    "public/robots.txt": lines(["User-agent: *", "Disallow:"]),
    "resources/css/app.css": lines([
      ":root {",
      "  color: #1f2933;",
      "  background: #f8fafc;",
      "  font-family: Arial, Helvetica, sans-serif;",
      "}",
      "",
      "* {",
      "  box-sizing: border-box;",
      "}",
      "",
      "body {",
      "  margin: 0;",
      "  min-width: 320px;",
      "}",
      "",
      "button {",
      "  background: #111827;",
      "  border: 0;",
      "  border-radius: 6px;",
      "  color: #ffffff;",
      "  cursor: pointer;",
      "  font: inherit;",
      "  padding: 10px 14px;",
      "}",
      "",
      "button:hover {",
      "  background: #374151;",
      "}",
    ]),
    "resources/js/app.js": lines([
      "import { createApp } from 'vue';",
      "import App from './App.vue';",
      "import '../css/app.css';",
      "",
      "createApp(App).mount('#app');",
    ]),
    "resources/js/App.vue": lines([
      "<script setup>",
      "import { ref } from 'vue';",
      "",
      "const appName = import.meta.env.VITE_APP_NAME || '" + appTitle + "';",
      "const laravelStatus = ref('Not checked');",
      "const expressStatus = ref('Not checked');",
      "",
      "async function checkLaravel() {",
      "  laravelStatus.value = 'Checking...';",
      "",
      "  try {",
      "    const response = await fetch((import.meta.env.VITE_LARAVEL_API_URL || '/api') + '/health');",
      "    const payload = await response.json();",
      "    laravelStatus.value = payload.status === 'ok' ? 'Online' : 'Unexpected response';",
      "  } catch (error) {",
      "    laravelStatus.value = 'Offline';",
      "  }",
      "}",
      "",
      "async function checkExpress() {",
      "  expressStatus.value = 'Checking...';",
      "",
      "  try {",
      "    const response = await fetch((import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api') + '/health');",
      "    const payload = await response.json();",
      "    expressStatus.value = payload.status === 'ok' ? 'Online' : 'Unexpected response';",
      "  } catch (error) {",
      "    expressStatus.value = 'Offline';",
      "  }",
      "}",
      "</script>",
      "",
      "<template>",
      "  <main class=\"page\">",
      "    <section class=\"intro\">",
      "      <p>Laravel Vue Express</p>",
      "      <h1>{{ appName }}</h1>",
      "      <p>One Laravel-style template with Vue in resources/js and Express in server.</p>",
      "    </section>",
      "",
      "    <section class=\"grid\">",
      "      <article>",
      "        <h2>Laravel</h2>",
      "        <p>{{ laravelStatus }}</p>",
      "        <button type=\"button\" @click=\"checkLaravel\">Check Laravel</button>",
      "      </article>",
      "",
      "      <article>",
      "        <h2>Express</h2>",
      "        <p>{{ expressStatus }}</p>",
      "        <button type=\"button\" @click=\"checkExpress\">Check Express</button>",
      "      </article>",
      "    </section>",
      "  </main>",
      "</template>",
      "",
      "<style scoped>",
      ".page {",
      "  display: grid;",
      "  gap: 32px;",
      "  min-height: 100vh;",
      "  padding: 48px;",
      "}",
      "",
      ".intro {",
      "  max-width: 760px;",
      "}",
      "",
      ".intro p:first-child {",
      "  color: #047857;",
      "  font-size: 0.8rem;",
      "  font-weight: 700;",
      "  margin: 0 0 12px;",
      "  text-transform: uppercase;",
      "}",
      "",
      "h1 {",
      "  font-size: clamp(2.5rem, 7vw, 5.5rem);",
      "  line-height: 1;",
      "  margin: 0;",
      "}",
      "",
      ".intro p:last-child {",
      "  color: #52616b;",
      "  font-size: 1.1rem;",
      "  line-height: 1.7;",
      "  max-width: 560px;",
      "}",
      "",
      ".grid {",
      "  display: grid;",
      "  gap: 16px;",
      "  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));",
      "}",
      "",
      "article {",
      "  background: #ffffff;",
      "  border: 1px solid #d9e2ec;",
      "  border-radius: 8px;",
      "  padding: 20px;",
      "}",
      "",
      "article h2 {",
      "  margin: 0 0 10px;",
      "}",
      "",
      "article p {",
      "  color: #52616b;",
      "  font-weight: 700;",
      "}",
      "</style>",
    ]),
    "resources/views/app.blade.php": lines([
      "<!doctype html>",
      "<html lang=\"{{ str_replace('_', '-', app()->getLocale()) }}\">",
      "  <head>",
      "    <meta charset=\"utf-8\">",
      "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
      "    <title>{{ config('app.name') }}</title>",
      "    @vite(['resources/css/app.css', 'resources/js/app.js'])",
      "  </head>",
      "  <body>",
      "    <div id=\"app\"></div>",
      "  </body>",
      "</html>",
    ]),
    "routes/api.php": lines([
      "<?php",
      "",
      "use App\\Http\\Controllers\\HealthController;",
      "use Illuminate\\Support\\Facades\\Route;",
      "",
      "Route::get('/health', HealthController::class);",
    ]),
    "routes/console.php": lines([
      "<?php",
      "",
      "use Illuminate\\Support\\Facades\\Artisan;",
      "",
      "Artisan::command('hello', function () {",
      "    $this->comment('Hello from Laravel.');",
      "});",
    ]),
    "routes/web.php": lines([
      "<?php",
      "",
      "use Illuminate\\Support\\Facades\\Route;",
      "",
      "Route::view('/{any?}', 'app')",
      "    ->where('any', '^(?!api).*$');",
    ]),
    "server/index.js": lines([
      "import fs from 'node:fs';",
      "import path from 'node:path';",
      "import express from 'express';",
      "",
      "loadEnv();",
      "",
      "const app = express();",
      "const port = Number(process.env.EXPRESS_PORT || process.env.PORT || 5000);",
      "const clientUrl = process.env.EXPRESS_CLIENT_URL || process.env.APP_URL || 'http://localhost:8000';",
      "",
      "app.use((request, response, next) => {",
      "  response.setHeader('Access-Control-Allow-Origin', clientUrl);",
      "  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');",
      "  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');",
      "",
      "  if (request.method === 'OPTIONS') {",
      "    response.status(204).end();",
      "    return;",
      "  }",
      "",
      "  next();",
      "});",
      "",
      "app.use(express.json());",
      "",
      "app.get('/', (request, response) => {",
      "  response.json({",
      "    service: 'express',",
      "    message: 'Express API is running',",
      "  });",
      "});",
      "",
      "app.get('/api/health', (request, response) => {",
      "  response.json({",
      "    status: 'ok',",
      "    service: 'express',",
      "    timestamp: new Date().toISOString(),",
      "  });",
      "});",
      "",
      "app.use((request, response) => {",
      "  response.status(404).json({",
      "    message: 'Route not found',",
      "  });",
      "});",
      "",
      "app.listen(port, () => {",
      "  console.log('Express API running on http://localhost:' + port);",
      "});",
      "",
      "function loadEnv() {",
      "  const envPath = path.resolve(process.cwd(), '.env');",
      "",
      "  if (!fs.existsSync(envPath)) {",
      "    return;",
      "  }",
      "",
      "  const lines = fs.readFileSync(envPath, 'utf8').split(/\\r?\\n/);",
      "",
      "  for (const line of lines) {",
      "    const trimmed = line.trim();",
      "",
      "    if (!trimmed || trimmed.startsWith('#')) {",
      "      continue;",
      "    }",
      "",
      "    const separator = trimmed.indexOf('=');",
      "",
      "    if (separator === -1) {",
      "      continue;",
      "    }",
      "",
      "    const key = trimmed.slice(0, separator).trim();",
      "    const value = trimmed.slice(separator + 1).trim().replace(/^['\\\"]|['\\\"]$/g, '');",
      "",
      "    if (!process.env[key]) {",
      "      process.env[key] = value;",
      "    }",
      "  }",
      "}",
    ]),
    "storage/app/.gitignore": lines(["*", "!public/", "!.gitignore"]),
    "storage/app/public/.gitignore": lines(["*", "!.gitignore"]),
    "storage/framework/cache/.gitignore": lines(["*", "!data/", "!.gitignore"]),
    "storage/framework/cache/data/.gitignore": lines(["*", "!.gitignore"]),
    "storage/framework/sessions/.gitignore": lines(["*", "!.gitignore"]),
    "storage/framework/testing/.gitignore": lines(["*", "!.gitignore"]),
    "storage/framework/views/.gitignore": lines(["*", "!.gitignore"]),
    "storage/logs/.gitignore": lines(["*", "!.gitignore"]),
  };

  return { directories, files };
}

function envString(value) {
  return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

function json(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function lines(value) {
  return value.join("\n") + "\n";
}

function toTitle(value) {
  return value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
