document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.querySelector('.menu-icon');

    var backdrop = document.querySelector('.menu-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'menu-backdrop';
        document.body.appendChild(backdrop);
    }

    function toggleMenu() {
        navLinks.classList.toggle('active');
        backdrop.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        if (navLinks.classList.contains('active')) {
            menuIcon.textContent = '✕';
        } else {
            menuIcon.textContent = '☰';
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', toggleMenu);

    var menuClose = document.getElementById('mobile-menu-close');
    if (menuClose) {
        menuClose.addEventListener('click', toggleMenu);
    }

    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.classList.remove('no-scroll');
            menuIcon.textContent = '☰';
        }
    });

    var ticking = false;
    window.addEventListener(
        'scroll',
        function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.pageYOffset > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        },
        { passive: true }
    );
});
