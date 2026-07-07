const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\PC\\Documents\\GitHub\\ShelfPOS\\ShelfPOS\\shelfDocs';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.obsidian') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

const allMdFiles = walk(root);
const basenameIndex = new Map(); // basename without ext -> full path(s)
for (const f of allMdFiles) {
  const base = path.basename(f, '.md');
  if (!basenameIndex.has(base)) basenameIndex.set(base, []);
  basenameIndex.get(base).push(f);
}

let brokenMdLinks = [];
let brokenWikiLinks = [];
let ambiguousWikiLinks = [];

for (const file of allMdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  // Markdown links: ](path.md)
  const mdLinkRe = /\]\(([^)]+\.md[^)]*)\)/g;
  let m;
  while ((m = mdLinkRe.exec(content))) {
    let target = m[1].split('#')[0].trim();
    if (/^https?:\/\//.test(target)) continue;
    const resolved = path.resolve(dir, target);
    if (!fs.existsSync(resolved)) {
      brokenMdLinks.push(`${path.relative(root, file)} -> ${target} (resolved: ${path.relative(root, resolved)})`);
    }
  }

  // Wiki links: [[Name]] or [[Name#anchor]]
  const wikiLinkRe = /\[\[([^\]#]+)(#[^\]]+)?\]\]/g;
  while ((m = wikiLinkRe.exec(content))) {
    const name = m[1].trim();
    if (!basenameIndex.has(name)) {
      brokenWikiLinks.push(`${path.relative(root, file)} -> [[${name}]]`);
    } else if (basenameIndex.get(name).length > 1) {
      ambiguousWikiLinks.push(`${path.relative(root, file)} -> [[${name}]] matches multiple: ${basenameIndex.get(name).map(p => path.relative(root, p)).join(', ')}`);
    }
  }
}

console.log('=== Broken .md links (' + brokenMdLinks.length + ') ===');
console.log(brokenMdLinks.join('\n'));
console.log('\n=== Broken [[wiki links]] (' + brokenWikiLinks.length + ') ===');
console.log(brokenWikiLinks.join('\n'));
console.log('\n=== Ambiguous [[wiki links]] (' + ambiguousWikiLinks.length + ') ===');
console.log(ambiguousWikiLinks.join('\n'));
