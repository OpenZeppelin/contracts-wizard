import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(import.meta.dirname, '..');

function getWorkspacePackages() {
  const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const patterns = rootPkg.workspaces?.packages ?? rootPkg.workspaces ?? [];

  const packages = new Map(); // name -> Set<dependency name>

  for (const pattern of patterns) {
    // Expand simple globs (e.g. "packages/core/*")
    const dirs = pattern.includes('*') ? expandGlob(pattern) : [join(root, pattern)];

    for (const dir of dirs) {
      const pkgPath = join(dir, 'package.json');
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        if (!pkg.name) continue;
        packages.set(pkg.name, {
          dir,
          deps: new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]),
        });
      } catch {
        // no package.json in this dir
      }
    }
  }

  // Filter deps to only monorepo packages
  for (const [, info] of packages) {
    info.deps = new Set([...info.deps].filter(d => packages.has(d)));
  }

  return packages;
}

function expandGlob(pattern) {
  const base = join(root, pattern.replace(/\/?\*$/, ''));
  try {
    return readdirSync(base)
      .map(name => join(base, name))
      .filter(p => {
        try {
          return statSync(p).isDirectory();
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

function findCycles(packages) {
  const cycles = [];
  const visited = new Set();
  const inStack = new Set();

  function dfs(name, path) {
    if (inStack.has(name)) {
      const cycleStart = path.indexOf(name);
      cycles.push(path.slice(cycleStart).concat(name));
      return;
    }
    if (visited.has(name)) return;

    visited.add(name);
    inStack.add(name);
    path.push(name);

    for (const dep of packages.get(name)?.deps ?? []) {
      dfs(dep, path);
    }

    path.pop();
    inStack.delete(name);
  }

  for (const name of packages.keys()) {
    dfs(name, []);
  }

  return cycles;
}

const packages = getWorkspacePackages();
const cycles = findCycles(packages);

if (cycles.length > 0) {
  console.error('Circular dependencies detected:\n');
  for (const cycle of cycles) {
    console.error('  ' + cycle.join(' -> '));
  }
  process.exit(1);
} else {
  console.log('No circular dependencies found.');
}
