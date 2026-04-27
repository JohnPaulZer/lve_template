const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("generated dev script uses Windows-safe npm spawning", () => {
  const rootDir = path.resolve(__dirname, "..");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lve-temp-jpz-"));

  try {
    const result = spawnSync(process.execPath, [path.join(rootDir, "src", "index.js"), "demo-app"], {
      cwd: tempDir,
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const projectDir = path.join(tempDir, "demo-app");
    const devPath = path.join(projectDir, "scripts", "dev.js");
    const devScript = fs.readFileSync(devPath, "utf8");

    assert.ok(devScript.includes("const isWindows = process.platform === 'win32';"));
    assert.ok(devScript.includes("const php = isWindows ? 'php.exe' : 'php';"));
    assert.ok(
      devScript.includes(
        "return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...item.args], { stdio: 'inherit' });"
      )
    );
    assert.doesNotMatch(devScript, /shell:\s*true/);

    const checkResult = spawnSync(process.execPath, ["--check", devPath], {
      cwd: projectDir,
      encoding: "utf8",
    });

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
