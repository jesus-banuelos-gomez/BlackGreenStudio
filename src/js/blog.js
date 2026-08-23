document.addEventListener('DOMContentLoaded', function () {
    var blogContainer = document.getElementById('blog-dynamic');
    if (!blogContainer) return;

    var featuredSection = blogContainer.querySelector('.featured-article');
    var gridSection = blogContainer.querySelector('.blog-grid');
    var newsletterSection = blogContainer.querySelector('.blog-newsletter');

    function getLang() {
        return (typeof i18n !== 'undefined' && i18n.currentLang) || 'es';
    }

    function renderPosts(posts) {
        if (!posts || posts.length === 0) return;

        var lang = getLang();

        // Featured post (latest)
        var featured = posts[0];
        if (featuredSection) {
            var cat = featured.category[lang] || featured.category.es;
            var catTag = featuredSection.querySelector('.category-tag');
            var titleEl = featuredSection.querySelector('h2');
            var metaEl = featuredSection.querySelector('.article-meta');
            var excerptEl = featuredSection.querySelector('.article-excerpt');

            if (catTag) catTag.textContent = cat;
            if (titleEl) {
                titleEl.textContent = featured.title[lang] || featured.title.es;
                titleEl.setAttribute('data-i18n', '');
            }
            if (metaEl) {
                metaEl.textContent =
                    formatDate(featured.date, lang) +
                    ' | ' +
                    (featured.content[lang] ? featured.content[lang].length + ' paragraphs' : '');
            }
            if (excerptEl) {
                var summary = featured.summary[lang] || featured.summary.es;
                excerptEl.innerHTML = '<p>' + summary + '</p>';
            }

            var featImg = featuredSection.querySelector('.featured-image img');
            if (featImg && featured.image) {
                featImg.src = featured.image;
            }

            var readMore = featuredSection.querySelector('.btn-outline');
            if (readMore) {
                readMore.setAttribute('data-i18n', 'blog.cta.read');
            }
        }

        // Grid posts (remaining)
        var remaining = posts.slice(1);
        if (gridSection && remaining.length > 0) {
            gridSection.innerHTML = '';
            for (var i = 0; i < remaining.length; i++) {
                var post = remaining[i];
                var card = createCard(post, lang);
                gridSection.appendChild(card);
            }
        }
    }

    function createCard(post, lang) {
        var article = document.createElement('article');
        article.className = 'blog-card';

        var cat = post.category[lang] || post.category.es;
        var title = post.title[lang] || post.title.es;
        var summary = post.summary[lang] || post.summary.es;

        var bgColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63'];
        var colorIndex = (post.tags && post.tags.length > 0 ? post.tags[0].length : 0) % bgColors.length;

        var html = '';
        html += '<div class="article-image">';
        if (post.image) {
            html +=
                '<img src="' +
                post.image +
                '" alt="' +
                escapeHtml(title) +
                '" loading="lazy" style="width:100%;height:200px;object-fit:cover;" />';
        } else {
            html +=
                '<div style="height:200px;background:linear-gradient(135deg,' +
                bgColors[colorIndex] +
                ',' +
                bgColors[(colorIndex + 1) % bgColors.length] +
                ');display:flex;align-items:center;justify-content:center;color:#fff;font-size:2.5rem;font-weight:700;font-family:var(--font-title);">';
            html += cat.charAt(0);
            html += '</div>';
        }
        html += '</div>';
        html += '<div class="article-content">';
        html += '<span class="category-tag">' + escapeHtml(cat) + '</span>';
        html += '<h3>' + escapeHtml(title) + '</h3>';
        html += '<p class="article-meta">' + formatDate(post.date, lang) + '</p>';
        html += '<p>' + escapeHtml(summary.substring(0, 120)) + '</p>';
        html += '<a href="#" class="read-more" data-i18n="blog.cta.read-more">Continuar leyendo →</a>';
        html += '</div>';

        article.innerHTML = html;

        article.addEventListener('click', function (e) {
            if (!e.target.closest('a')) {
                showPostDetail(post, lang);
            }
        });

        var link = article.querySelector('.read-more');
        if (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                showPostDetail(post, lang);
            });
        }

        return article;
    }

    function showPostDetail(post, lang) {
        var title = post.title[lang] || post.title.es;
        var cat = post.category[lang] || post.category.es;
        var summary = post.summary[lang] || post.summary.es;
        var paragraphs = post.content[lang] || post.content.es;

        blogContainer.innerHTML = '';

        var article = document.createElement('article');
        article.className = 'featured-article';
        article.style.cssText = 'grid-column:1/-1;max-width:800px;margin:0 auto;';

        var contentHtml = '';
        contentHtml += '<div class="featured-content" style="padding:0;">';
        if (post.image) {
            contentHtml +=
                '<img src="' +
                post.image +
                '" alt="' +
                escapeHtml(title) +
                '" loading="lazy" style="width:100%;max-height:400px;object-fit:cover;border-radius:8px;margin-bottom:24px;" />';
        }
        contentHtml += '<span class="category-tag">' + escapeHtml(cat) + '</span>';
        contentHtml += '<h2>' + escapeHtml(title) + '</h2>';
        contentHtml += '<p class="article-meta">' + formatDate(post.date, lang) + '</p>';
        contentHtml += '<div class="article-excerpt"><p>' + escapeHtml(summary) + '</p>';

        for (var i = 0; i < paragraphs.length; i++) {
            var p = paragraphs[i];
            if (p.startsWith('**') && p.endsWith('**')) {
                contentHtml +=
                    '<h3 style="margin:24px 0 8px;font-size:1.1rem;">' + escapeHtml(p.replace(/\*\*/g, '')) + '</h3>';
            } else if (p.startsWith('Fuente:') || p.startsWith('Source:')) {
                var urlMatch = p.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (urlMatch) {
                    contentHtml +=
                        '<p style="font-size:0.85rem;color:var(--gray-medium);">' +
                        (lang === 'es' ? 'Fuente' : 'Source') +
                        ': <a href="' +
                        urlMatch[2] +
                        '" target="_blank" rel="noopener" style="color:var(--green-primary);">' +
                        urlMatch[1] +
                        '</a></p>';
                }
            } else {
                contentHtml += '<p style="margin:12px 0;line-height:1.7;">' + escapeHtml(p) + '</p>';
            }
        }

        contentHtml += '</div>';

        if (post.sources && post.sources.length > 0) {
            contentHtml += '<div style="margin-top:32px;padding:16px;background:var(--gray-light);border-radius:8px;">';
            contentHtml +=
                '<h4 style="margin-bottom:8px;">' + (lang === 'es' ? 'Fuentes consultadas' : 'Sources') + '</h4>';
            for (var j = 0; j < post.sources.length; j++) {
                contentHtml +=
                    '<p style="font-size:0.85rem;margin:4px 0;"><a href="' +
                    post.sources[j].url +
                    '" target="_blank" rel="noopener" style="color:var(--green-primary);">' +
                    escapeHtml(post.sources[j].title) +
                    '</a> <span style="color:var(--gray-medium);">— ' +
                    post.sources[j].name +
                    '</span></p>';
            }
            contentHtml += '</div>';
        }

        contentHtml += '<div style="margin-top:32px;text-align:center;">';
        contentHtml +=
            '<button class="btn btn-secondary" id="blog-back-btn">' +
            (lang === 'es' ? '← Volver al blog' : '← Back to blog') +
            '</button>';
        contentHtml += '</div>';

        article.innerHTML = contentHtml;
        blogContainer.appendChild(article);

        if (newsletterSection) {
            blogContainer.appendChild(newsletterSection);
        }

        document.getElementById('blog-back-btn').addEventListener('click', function () {
            loadBlog();
        });

        window.scrollTo({ top: blogContainer.offsetTop - 100, behavior: 'smooth' });
    }

    function loadBlog() {
        fetch('../js/blog-posts.json?' + new Date().getTime())
            .then(function (res) {
                return res.json();
            })
            .then(function (posts) {
                if (!posts || posts.length === 0) return;
                blogContainer.innerHTML = '';
                blogContainer.appendChild(featuredSection);
                blogContainer.appendChild(gridSection);
                if (newsletterSection) blogContainer.appendChild(newsletterSection);
                renderPosts(posts);
            })
            .catch(function () {
                // Keep default content on error
            });
    }

    function formatDate(dateStr, lang) {
        try {
            var d = new Date(dateStr);
            var options = { year: 'numeric', month: 'long', day: 'numeric' };
            return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', options);
        } catch (e) {
            return dateStr;
        }
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // Load posts
    loadBlog();

    // Reload when language changes
    if (typeof i18n !== 'undefined') {
        var origSetLang = i18n.setLang;
        i18n.setLang = function (lang) {
            origSetLang.call(i18n, lang);
            loadBlog();
        };
    }
});
