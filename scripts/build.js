const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const PUBLIC = path.join(__dirname, '..', 'public');

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

function buildHtml() {
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

console.log('=== BlackGreenStudio Build ===\n');

if (!fs.existsSync(SRC)) {
    console.error('Source directory not found:', SRC);
    process.exit(1);
}

copyAssets();
buildHtml();

console.log('\n=== Build complete ===');
