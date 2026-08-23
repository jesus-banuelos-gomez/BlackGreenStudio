document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.projects-carousel');
    const cards = document.querySelectorAll('.project-card');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!carousel || cards.length === 0) return;

    let currentIndex = 0;

    /* Posición de cada tarjeta relativa a la primera (funciona con
       cualquier ancho, gap o scroll-snap en desktop y móvil). */
    function cardOffset(i) {
        return cards[i].offsetLeft - cards[0].offsetLeft;
    }

    function getIndexFromScroll() {
        var x = carousel.scrollLeft;
        var best = 0;
        var bestDist = Infinity;
        for (var i = 0; i < cards.length; i++) {
            var d = Math.abs(cardOffset(i) - x);
            if (d < bestDist) {
                bestDist = d;
                best = i;
            }
        }
        return best;
    }

    window.addEventListener('resize', function () {
        carousel.scrollLeft = cardOffset(currentIndex);
    });

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, cards.length - 1));
        carousel.scrollTo({
            left: cardOffset(currentIndex),
            behavior: 'smooth'
        });
        updateDots();
        updateButtonStates();
    }

    function updateButtonStates() {
        if (!prevBtn || !nextBtn) return;
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevBtn.style.cursor = currentIndex === 0 ? 'default' : 'pointer';
        nextBtn.style.opacity = currentIndex >= cards.length - 1 ? '0.5' : '1';
        nextBtn.style.cursor = currentIndex >= cards.length - 1 ? 'default' : 'pointer';
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            goToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            goToSlide(currentIndex + 1);
        });
    }

    if (dotsContainer) {
        cards.forEach(function (_, i) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', 'Ir al proyecto ' + (i + 1));
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', function () {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        });
    }

    carousel.addEventListener('scroll', function () {
        var newIndex = getIndexFromScroll();
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cards.length) {
            currentIndex = newIndex;
            updateDots();
            updateButtonStates();
        }
    });

    updateButtonStates();
});
