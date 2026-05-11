const https = require('https');
const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, '..', 'src', 'js', 'blog-posts.json');
const MAX_POSTS = 10;
const MIN_POSTS = 5;

function fetchJSON(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, { headers: { 'User-Agent': 'BlackGreenStudio/1.0' } }, function (res) {
            var data = '';
            res.on('data', function (chunk) { data += chunk; });
            res.on('end', function () {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid JSON from ' + url)); }
            });
        }).on('error', reject);
    });
}

function extractKeywords(title) {
    var words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    var stopwords = { the: 1, a: 1, an: 1, is: 1, are: 1, was: 1, were: 1, be: 1, being: 1, been: 1, have: 1, has: 1, had: 1, do: 1, does: 1, did: 1, will: 1, would: 1, could: 1, should: 1, may: 1, might: 1, can: 1, shall: 1, to: 1, of: 1, in: 1, for: 1, on: 1, with: 1, at: 1, by: 1, from: 1, as: 1, into: 1, through: 1, during: 1, before: 1, after: 1, above: 1, below: 1, between: 1, out: 1, off: 1, over: 1, under: 1, again: 1, further: 1, then: 1, once: 1, here: 1, there: 1, when: 1, where: 1, why: 1, how: 1, all: 1, both: 1, each: 1, few: 1, more: 1, most: 1, other: 1, some: 1, such: 1, no: 1, nor: 1, not: 1, only: 1, own: 1, same: 1, so: 1, than: 1, too: 1, very: 1, just: 1, because: 1, but: 1, and: 1, or: 1, if: 1, while: 1, this: 1, that: 1, these: 1, those: 1, it: 1, its: 1, what: 1, which: 1, who: 1, whom: 1, about: 1, up: 1, down: 1 };
    var keywords = {};
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.length > 3 && !stopwords[w]) {
            keywords[w] = (keywords[w] || 0) + 1;
        }
    }
    return Object.keys(keywords).sort(function (a, b) { return keywords[b] - keywords[a]; }).slice(0, 5);
}

function calculateRelevanceScore(story, stories) {
    var score = story.points || story.score || 0;
    var keywords = extractKeywords(story.title);
    var crossRefs = 0;
    for (var i = 0; i < stories.length; i++) {
        var other = stories[i];
        if (other === story) continue;
        var otherKeywords = extractKeywords(other.title);
        var match = 0;
        for (var k = 0; k < keywords.length; k++) {
            for (var j = 0; j < otherKeywords.length; j++) {
                if (keywords[k] === otherKeywords[j]) {
                    match++;
                    break;
                }
            }
        }
        if (match >= 2) crossRefs++;
    }
    return score + (crossRefs * 50);
}

function getCategory(title, tags) {
    var t = (title + ' ' + (tags || []).join(' ')).toLowerCase();
    if (t.match(/\b(ai|artificial|intelligence|machine learning|deep learning|gpt|llm|neural|openai|chatgpt|gemini|claude)\b/)) return { es: 'Inteligencia Artificial', en: 'Artificial Intelligence' };
    if (t.match(/\b(mobile|android|ios|swift|kotlin|flutter|react native|app)\b/)) return { es: 'Desarrollo Móvil', en: 'Mobile Development' };
    if (t.match(/\b(web|react|next\.?js|vue|angular|node|javascript|typescript|css|html|frontend|backend)\b/)) return { es: 'Desarrollo Web', en: 'Web Development' };
    if (t.match(/\b(cloud|aws|gcp|azure|serverless|docker|kubernetes|devops|deploy)\b/)) return { es: 'Cloud & DevOps', en: 'Cloud & DevOps' };
    if (t.match(/\b(security|privacy|cyber|cryptography|hack|vulnerability|breach)\b/)) return { es: 'Ciberseguridad', en: 'Cybersecurity' };
    if (t.match(/\b(startup|funding|venture|ipo|acquisition|saas|business)\b/)) return { es: 'Startups & Negocios', en: 'Startups & Business' } ;
    return { es: 'Tecnologías', en: 'Technologies' };
}

function generateSummary(title, stories) {
    var keywords = extractKeywords(title);
    var related = [];
    for (var i = 0; i < stories.length; i++) {
        var otherKeywords = extractKeywords(stories[i].title);
        for (var k = 0; k < keywords.length; k++) {
            for (var j = 0; j < otherKeywords.length; j++) {
                if (keywords[k] === otherKeywords[j] && related.indexOf(stories[i]) === -1) {
                    related.push(stories[i]);
                    break;
                }
            }
        }
    }
    related = related.slice(0, 3);

    var summaries = {
        es: 'Esta semana el mundo tecnológico trae novedades importantes en ' + keywords.slice(0, 3).join(', ') + '. ',
        en: 'This week brings important tech news in ' + keywords.slice(0, 3).join(', ') + '. '
    };

    if (related.length > 0) {
        var storyLabel = related.length === 1 ? 'historia clave' : 'historias clave';
        summaries.es += 'Destacamos ' + related.length + ' ' + storyLabel + ' que están marcando tendencia en la industria.';
        var storyLabelEn = related.length === 1 ? 'key story' : 'key stories';
        summaries.en += 'We highlight ' + related.length + ' ' + storyLabelEn + ' that are setting trends in the industry.';
    }

    return summaries;
}

function generateContent(title, stories, tags) {
    var keywords = extractKeywords(title);
    var related = [];
    for (var i = 0; i < stories.length; i++) {
        var otherKeywords = extractKeywords(stories[i].title);
        for (var k = 0; k < keywords.length; k++) {
            for (var j = 0; j < otherKeywords.length; j++) {
                if (keywords[k] === otherKeywords[j] && related.indexOf(stories[i]) === -1) {
                    related.push(stories[i]);
                    break;
                }
            }
        }
    }

    var content = { es: [], en: [] };
    var paragraphs = {
        es: [
            'El ecosistema tecnológico no se detiene. Cada semana surgen innovaciones, lanzamientos y descubrimientos que transforman la manera en que vivimos y trabajamos. En BlackGreenStudio te traemos un resumen con lo más relevante.',
            'A continuación, las historias más destacadas de esta semana:'
        ],
        en: [
            'The tech ecosystem never stops. Every week brings innovations, launches, and discoveries that transform how we live and work. At BlackGreenStudio, we bring you a roundup of the most relevant news.',
            'Below are the top stories of this week:'
        ]
    };

    content.es.push(paragraphs.es[0]);
    content.en.push(paragraphs.en[0]);
    content.es.push(paragraphs.es[1]);
    content.en.push(paragraphs.en[1]);

    var seen = [];
    for (var i = 0; i < related.length && seen.length < 5; i++) {
        var story = related[i];
        if (seen.indexOf(story.title) !== -1) continue;
        seen.push(story.title);

        content.es.push('**' + story.title + '**');
        content.en.push('**' + story.title + '**');

        var desc = story.description || story.text || '';
        if (desc.length > 200) desc = desc.substring(0, 200) + '...';
        if (desc) {
            content.es.push(desc);
            content.en.push(desc);
        }

        if (story.url) {
            content.es.push('Fuente: [' + (story.url.split('/')[2] || story.url) + '](' + story.url + ')');
            content.en.push('Source: [' + (story.url.split('/')[2] || story.url) + '](' + story.url + ')');
        }
    }

    content.es.push('En BlackGreenStudio seguimos de cerca estas tendencias para ofrecerte soluciones tecnológicas de vanguardia. ¡Mantente al tanto la próxima semana!');
    content.en.push('At BlackGreenStudio we closely follow these trends to offer you cutting-edge technology solutions. Stay tuned for next week!');

    return content;
}

function getWeekNumber(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    var week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

async function research() {
    console.log('=== BlackGreenStudio Research Script ===\n');
    var allStories = [];

    // 1. Fetch from Dev.to API
    try {
        console.log('Fetching Dev.to trending...');
        var devto = await fetchJSON('https://dev.to/api/articles?per_page=30&top=1');
        for (var i = 0; i < devto.length; i++) {
            allStories.push({
                title: devto[i].title,
                url: devto[i].url,
                description: devto[i].description,
                tags: devto[i].tag_list || [],
                points: devto[i].positive_reactions_count || 0,
                coverImage: devto[i].cover_image || '',
                source: 'Dev.to'
            });
        }
        console.log('  -> ' + devto.length + ' articles fetched');
    } catch (e) {
        console.log('  -> Error fetching Dev.to:', e.message);
    }

    // 2. Fetch from HackerNews API
    try {
        console.log('Fetching HackerNews top stories...');
        var topIds = await fetchJSON('https://hacker-news.firebaseio.com/v0/topstories.json');
        var storyIds = topIds.slice(0, 30);
        var hnStories = [];
        for (var i = 0; i < storyIds.length; i++) {
            try {
                var item = await fetchJSON('https://hacker-news.firebaseio.com/v0/item/' + storyIds[i] + '.json');
                if (item && item.title && item.type === 'story') {
                    hnStories.push({
                        title: item.title,
                        url: item.url || ('https://news.ycombinator.com/item?id=' + item.id),
                        description: item.text || '',
                        tags: [],
                        points: item.score || 0,
                        source: 'HackerNews'
                    });
                }
            } catch (e) { /* skip individual item errors */ }
        }
        allStories = allStories.concat(hnStories);
        console.log('  -> ' + hnStories.length + ' stories fetched');
    } catch (e) {
        console.log('  -> Error fetching HackerNews:', e.message);
    }

    if (allStories.length < 3) {
        console.log('\nNot enough stories fetched. Need at least 3. Aborting.');
        return;
    }

    // 3. Score and rank stories
    console.log('\nAnalyzing and cross-referencing stories...');
    for (var i = 0; i < allStories.length; i++) {
        allStories[i].relevance = calculateRelevanceScore(allStories[i], allStories);
    }
    allStories.sort(function (a, b) { return b.relevance - a.relevance; });

    var topStory = allStories[0];
    var category = getCategory(topStory.title, topStory.tags);

    // 4. Validate by cross-referencing
    var validationScore = 0;
    var keywords = extractKeywords(topStory.title);
    for (var i = 1; i < allStories.length; i++) {
        var otherKeywords = extractKeywords(allStories[i].title);
        var match = 0;
        for (var k = 0; k < keywords.length; k++) {
            for (var j = 0; j < otherKeywords.length; j++) {
                if (keywords[k] === otherKeywords[j]) {
                    match++;
                    break;
                }
            }
        }
        if (match >= 2) validationScore++;
    }

    var isVerified = validationScore >= 1;
    console.log('  -> Top story: "' + topStory.title + '"');
    console.log('  -> Cross-references found: ' + validationScore + ' similar stories');
    console.log('  -> Verification status: ' + (isVerified ? 'VERIFIED' : 'LOW CONFIDENCE'));

    if (!isVerified) {
        console.log('\nTop story has low cross-reference validation. Checking alternative...');
        for (var i = 1; i < Math.min(5, allStories.length); i++) {
            var altKeywords = extractKeywords(allStories[i].title);
            var altMatch = 0;
            for (var j = 1; j < allStories.length; j++) {
                if (i === j) continue;
                var otherKeywords = extractKeywords(allStories[j].title);
                var m = 0;
                for (var k = 0; k < altKeywords.length; k++) {
                    for (var l = 0; l < otherKeywords.length; l++) {
                        if (altKeywords[k] === otherKeywords[l]) {
                            m++;
                            break;
                        }
                    }
                }
                if (m >= 2) altMatch++;
            }
            if (altMatch >= 1) {
                topStory = allStories[i];
                isVerified = true;
                validationScore = altMatch;
                console.log('  -> Using alternative story: "' + topStory.title + '" (' + altMatch + ' refs)');
                break;
            }
        }
    }

    // 5. Generate post
    var now = new Date();
    var dateStr = now.toISOString().split('T')[0];
    var weekNum = getWeekNumber(now);
    var postId = 'tech-weekly-' + weekNum + '-' + now.getFullYear();

    var title = {
        es: 'Tech Weekly #' + weekNum + ': ' + topStory.title,
        en: 'Tech Weekly #' + weekNum + ': ' + topStory.title
    };

    var summary = generateSummary(topStory.title, allStories);
    var content = generateContent(topStory.title, allStories, topStory.tags);

    var newPost = {
        id: postId,
        date: dateStr,
        title: title,
        category: category,
        summary: summary,
        content: content,
        image: topStory.coverImage || '../Resource/blog/default-post.svg',
        verified: isVerified,
        sources: allStories.slice(0, 5).map(function (s) {
            return { name: s.source, url: s.url, title: s.title };
        }),
        tags: keywords.slice(0, 5)
    };

    // 6. Read existing posts
    var existingPosts = [];
    try {
        var data = fs.readFileSync(POSTS_FILE, 'utf-8');
        existingPosts = JSON.parse(data);
    } catch (e) {
        console.log('No existing posts file, starting fresh.');
    }

    // Check for duplicates
    var isDuplicate = false;
    for (var i = 0; i < existingPosts.length; i++) {
        if (existingPosts[i].id === postId) {
            isDuplicate = true;
            console.log('\nPost already exists for this week. Updating...');
            existingPosts[i] = newPost;
            break;
        }
    }

    if (!isDuplicate) {
        existingPosts.unshift(newPost);
        console.log('\nNew post added: ' + postId);
    }

    // 7. Trim to MAX_POSTS, ensure at least MIN_POSTS
    while (existingPosts.length > MAX_POSTS) {
        existingPosts.pop();
    }

    console.log('Total posts: ' + existingPosts.length);

    // 8. Write file
    fs.writeFileSync(POSTS_FILE, JSON.stringify(existingPosts, null, 4));
    console.log('Posts saved to: ' + POSTS_FILE);

    // 9. Run build
    console.log('\nRunning build...');
    var { execSync } = require('child_process');
    try {
        execSync('npm run build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
        console.log('\n=== Research complete ===');
    } catch (e) {
        console.log('\nBuild failed:', e.message);
        process.exit(1);
    }
}

if (require.main === module) {
    research().catch(function (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}

module.exports = {
    extractKeywords: extractKeywords,
    getCategory: getCategory,
    calculateRelevanceScore: calculateRelevanceScore,
    generateSummary: generateSummary,
    generateContent: generateContent,
    getWeekNumber: getWeekNumber
};
