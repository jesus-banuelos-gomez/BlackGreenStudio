var assert = require('assert');
var path = require('path');

var research = require(path.join(__dirname, '..', 'scripts', 'research.js'));

var testsRun = 0;
var testsPassed = 0;

function test(name, fn) {
    testsRun++;
    try {
        fn();
        testsPassed++;
        console.log('  PASS: ' + name);
    } catch (e) {
        console.log('  FAIL: ' + name);
        console.log('        ' + e.message);
    }
}

function assertSetsEqual(actual, expected, msg) {
    if (!Array.isArray(actual)) throw new Error(msg + ' — expected array, got ' + typeof actual);
    var sorted = actual.slice().sort();
    var expectedSorted = expected.slice().sort();
    if (sorted.length !== expectedSorted.length) {
        throw new Error(msg + ' — length ' + sorted.length + ' !== ' + expectedSorted.length + '. Got: [' + sorted.join(', ') + ']');
    }
    for (var i = 0; i < sorted.length; i++) {
        if (sorted[i] !== expectedSorted[i]) {
            throw new Error(msg + ' — mismatch at ' + i + ': "' + sorted[i] + '" !== "' + expectedSorted[i] + '"');
        }
    }
}

console.log('\n=== Research Script Unit Tests ===\n');

// -------------------------------------------------------
// Test 1: extractKeywords
// -------------------------------------------------------
console.log('1) extractKeywords');

test('removes stopwords and returns significant keywords', function () {
    var result = research.extractKeywords('The quick brown fox jumps over the lazy dog near the river');
    assert.ok(result.length <= 5, 'should return at most 5 keywords, got ' + result.length);
    assert.ok(result.indexOf('quick') !== -1, 'should include "quick"');
    assert.ok(result.indexOf('brown') !== -1, 'should include "brown"');
    assert.ok(result.indexOf('the') === -1, 'should exclude stopword "the"');
    assert.ok(result.indexOf('over') === -1, 'should exclude stopword "over"');
    assert.ok(result.indexOf('fox') === -1, 'should exclude short word "fox"');
});

test('handles empty string', function () {
    var result = research.extractKeywords('');
    assert.ok(Array.isArray(result), 'should return an array');
    assert.strictEqual(result.length, 0, 'should return empty array');
});

test('ignores words shorter than 4 characters', function () {
    var result = research.extractKeywords('a an is to be it fox');
    assert.strictEqual(result.length, 0, 'should return empty (all words are short or stopwords)');
});

test('handles special characters and punctuation', function () {
    var result = research.extractKeywords('Hello, world! This is a test-case for NLP.');
    assert.ok(result.indexOf('hello') !== -1, 'should normalize "Hello" to "hello"');
    assert.ok(result.indexOf('testcase') !== -1, 'should include merged "testcase" (hyphen removed)');
    assert.ok(result.indexOf('nlp') === -1, 'should exclude "nlp" (3 chars, too short)');
});

// -------------------------------------------------------
// Test 2: getCategory
// -------------------------------------------------------
console.log('\n2) getCategory');

test('identifies AI category', function () {
    var cat = research.getCategory('GPT-5 and the Future of Artificial Intelligence', ['AI', 'machine learning']);
    assert.strictEqual(cat.es, 'Inteligencia Artificial');
    assert.strictEqual(cat.en, 'Artificial Intelligence');
});

test('identifies Mobile Development category', function () {
    var cat = research.getCategory('Building Cross-Platform Apps with Flutter', ['flutter', 'mobile']);
    assert.strictEqual(cat.es, 'Desarrollo Móvil');
    assert.strictEqual(cat.en, 'Mobile Development');
});

test('identifies Web Development category', function () {
    var cat = research.getCategory('React 19: What is New in the Latest Version', ['react', 'javascript']);
    assert.strictEqual(cat.es, 'Desarrollo Web');
    assert.strictEqual(cat.en, 'Web Development');
});

test('identifies Cloud & DevOps category', function () {
    var cat = research.getCategory('Kubernetes Best Practices for 2026', ['kubernetes', 'devops']);
    assert.strictEqual(cat.es, 'Cloud & DevOps');
    assert.strictEqual(cat.en, 'Cloud & DevOps');
});

test('identifies Cybersecurity category', function () {
    var cat = research.getCategory('Zero-Day Vulnerability Discovered in Popular Library', ['security']);
    assert.strictEqual(cat.es, 'Ciberseguridad');
    assert.strictEqual(cat.en, 'Cybersecurity');
});

test('identifies Startups & Business category', function () {
    var cat = research.getCategory('SaaS Startup Raises $50M Series B', ['startup', 'funding']);
    assert.strictEqual(cat.es, 'Startups & Negocios');
    assert.strictEqual(cat.en, 'Startups & Business');
});

test('falls back to default Tecnologías/Technologies when no category matches', function () {
    var cat = research.getCategory('The Art of Origami in Modern Design', ['art']);
    assert.strictEqual(cat.es, 'Tecnologías');
    assert.strictEqual(cat.en, 'Technologies');
});

// -------------------------------------------------------
// Test 3: generateContent
// -------------------------------------------------------
console.log('\n3) generateContent');

test('produces bilingual content with correct structure', function () {
    var stories = [
        { title: 'AI Revolution in Healthcare', url: 'https://example.com/ai-health', description: 'AI is transforming healthcare diagnostics.' },
        { title: 'Machine Learning for Drug Discovery', url: 'https://example.com/ml-drugs', description: 'New ML models accelerate drug discovery.' }
    ];
    var content = research.generateContent('AI Revolution in Healthcare', stories, ['AI', 'healthcare']);

    assert.ok(content.es, 'should have Spanish content array');
    assert.ok(content.en, 'should have English content array');
    assert.ok(content.es.length >= 4, 'Spanish content should have at least 4 paragraphs, got ' + content.es.length);
    assert.ok(content.en.length >= 4, 'English content should have at least 4 paragraphs, got ' + content.en.length);

    assert.strictEqual(content.es[0], 'El ecosistema tecnológico no se detiene. Cada semana surgen innovaciones, lanzamientos y descubrimientos que transforman la manera en que vivimos y trabajamos. En BlackGreenStudio te traemos un resumen con lo más relevante.');
    assert.strictEqual(content.en[0], 'The tech ecosystem never stops. Every week brings innovations, launches, and discoveries that transform how we live and work. At BlackGreenStudio, we bring you a roundup of the most relevant news.');

    var hasSpanishFooter = false;
    var hasEnglishFooter = false;
    for (var i = 0; i < content.es.length; i++) {
        if (content.es[i].indexOf('BlackGreenStudio seguimos de cerca') !== -1) hasSpanishFooter = true;
    }
    for (var i = 0; i < content.en.length; i++) {
        if (content.en[i].indexOf('BlackGreenStudio we closely follow') !== -1) hasEnglishFooter = true;
    }
    assert.ok(hasSpanishFooter, 'Spanish content should have footer');
    assert.ok(hasEnglishFooter, 'English content should have footer');
});

test('includes story titles marked with ** and source URLs', function () {
    var stories = [
        { title: 'Test Story One', url: 'https://example.com/one', description: 'Description one.' }
    ];
    var content = research.generateContent('Test Story One', stories, []);

    var hasTitle = false;
    var hasSource = false;
    for (var i = 0; i < content.es.length; i++) {
        if (content.es[i] === '**Test Story One**') hasTitle = true;
        if (content.es[i].indexOf('Fuente:') !== -1) hasSource = true;
    }
    assert.ok(hasTitle, 'Spanish content should include story title wrapped in **');
    assert.ok(hasSource, 'Spanish content should include source line');
});

test('handles stories without descriptions gracefully', function () {
    var stories = [
        { title: 'No Description Story', url: 'https://example.com/no-desc' }
    ];
    var content = research.generateContent('No Description Story', stories, []);
    assert.ok(content.es.length >= 3, 'should still generate content even without descriptions');
});

// -------------------------------------------------------
// Summary
// -------------------------------------------------------
console.log('\n=== Results: ' + testsPassed + '/' + testsRun + ' passed ===\n');
if (testsPassed !== testsRun) {
    process.exit(1);
}
