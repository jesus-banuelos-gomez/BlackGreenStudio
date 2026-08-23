const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.join(__dirname, '..', 'src');
const PUBLIC = path.join(__dirname, '..', 'public');

const ASSET_RE = /(href|src)="((?:\.\.\/)?(?:css|js|Resource)\/[^"#?]+\.(?:css|js|png|jpe?g|gif|ico|svg|webp|woff2?))"/g;

function collectAssetHashes() {
    const hashes = {};
    const dirs = ['css', 'js', 'Resource'];
    for (const dir of dirs) {
        const root = path.join(PUBLIC, dir);
        if (!fs.existsSync(root)) continue;
        (function walk(dirPath) {
            for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
                const full = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    walk(full);
                } else {
                    const rel = path.relative(PUBLIC, full).split(path.sep).join('/');
                    hashes[rel] = crypto
                        .createHash('sha256')
                        .update(fs.readFileSync(full))
                        .digest('hex')
                        .slice(0, 8);
                }
            }
        })(root);
    }
    return hashes;
}

function versionAssets(html, assetHashes, baseDir) {
    return html.replace(ASSET_RE, function (match, attr, url) {
        const resolved = path.relative(PUBLIC, path.resolve(baseDir, url)).split(path.sep).join('/');
        const hash = assetHashes[resolved];
        if (!hash) return match;
        return attr + '="' + url + '?v=' + hash + '"';
    });
}

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function processIncludes(content, baseDir, processed) {
    if (!processed) processed = new Set();

    return content.replace(/<!--#include\s+virtual="([^"]+)"\s*-->/g, function(match, includePath) {
        const fullPath = path.resolve(baseDir, includePath);
        const resolvedPath = path.normalize(fullPath);

        if (processed.has(resolvedPath)) {
            console.warn('Circular include detected:', includePath);
            return '';
        }

        if (!fs.existsSync(resolvedPath)) {
            console.error('Include not found:', includePath, 'at', resolvedPath);
            return '<!-- INCLUDE NOT FOUND: ' + includePath + ' -->';
        }

        processed.add(resolvedPath);
        let includeContent = fs.readFileSync(resolvedPath, 'utf-8');
        includeContent = processIncludes(includeContent, path.dirname(resolvedPath), processed);
        processed.delete(resolvedPath);

        return includeContent;
    });
}

function buildHtml(assetHashes) {
    const htmlSrc = path.join(SRC, 'html');
    const htmlDest = path.join(PUBLIC, 'html');

    if (!fs.existsSync(htmlDest)) fs.mkdirSync(htmlDest, { recursive: true });

    const files = fs.readdirSync(htmlSrc).filter(f => f.endsWith('.html'));
    for (const file of files) {
        const srcPath = path.join(htmlSrc, file);
        const destPath = path.join(htmlDest, file);

        console.log('Processing:', file);
        let content = fs.readFileSync(srcPath, 'utf-8');
        content = processIncludes(content, htmlSrc);
        content = versionAssets(content, assetHashes, htmlDest);
        fs.writeFileSync(destPath, content);
        console.log('  -> Written to:', path.relative(path.join(__dirname, '..'), destPath));
    }
}

function copyAssets() {
    const dirs = ['css', 'js', 'Resource'];
    for (const dir of dirs) {
        const srcDir = path.join(SRC, dir);
        const destDir = path.join(PUBLIC, dir);
        if (fs.existsSync(srcDir)) {
            copyDir(srcDir, destDir);
            console.log('Copied:', dir);
        }
    }
}

function copyRootFiles() {
    const rootSrc = path.join(SRC, 'root');
    if (!fs.existsSync(rootSrc)) return;
    if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });
    const entries = fs.readdirSync(rootSrc);
    for (const entry of entries) {
        const srcPath = path.join(rootSrc, entry);
        if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, path.join(PUBLIC, entry));
            console.log('Copied (root):', entry);
        }
    }
}

console.log('=== BlackGreenStudio Build ===\n');

if (!fs.existsSync(SRC)) {
    console.error('Source directory not found:', SRC);
    process.exit(1);
}

copyAssets();
const assetHashes = collectAssetHashes();
buildHtml(assetHashes);
copyRootFiles();

console.log('\n=== Build complete ===');
