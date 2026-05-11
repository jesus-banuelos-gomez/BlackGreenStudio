document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.projects-carousel');
    const cards = document.querySelectorAll('.project-card');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!carousel || cards.length === 0) return;

    let currentIndex = 0;

    function calculateCardWidth() {
        const firstCard = cards[0];
        const gap = parseInt(window.getComputedStyle(carousel).gap) || 30;
        return firstCard.offsetWidth + gap;
    }

    let cardWidth = calculateCardWidth();

    window.addEventListener('resize', function () {
        cardWidth = calculateCardWidth();
        goToSlide(currentIndex);
    });

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, cards.length - 1));
        const scrollAmount = currentIndex * cardWidth;
        carousel.scrollTo({
            left: scrollAmount,
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
            const dot = document.createElement('span');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', function () {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        });
    }

    carousel.addEventListener('scroll', function () {
        const newIndex = Math.round(carousel.scrollLeft / cardWidth);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cards.length) {
            currentIndex = newIndex;
            updateDots();
            updateButtonStates();
        }
    });

    updateButtonStates();
});
