/* Lock de scroll compartido (menu + chat): fija el body para frenar
   el rebote táctil en iOS Safari y restaura la posición al liberar. */
window.bgsScrollLock = (function () {
    var count = 0;
    var scrollY = 0;
    return {
        acquire: function () {
            if (count === 0) {
                scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
                document.body.style.position = 'fixed';
                document.body.style.top = -scrollY + 'px';
                document.body.style.width = '100%';
            }
            count++;
        },
        release: function () {
            if (count === 0) return;
            count--;
            if (count === 0) {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            }
        }
    };
})();

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

    var mqMobile = window.matchMedia('(max-width: 768px)');
    var isOpen = false;

    function openMenu() {
        if (isOpen) return;
        isOpen = true;
        navLinks.classList.add('active');
        backdrop.classList.add('active');
        document.body.classList.add('menu-open');
        window.bgsScrollLock.acquire();
        if (menuIcon) menuIcon.textContent = '✕';
    }

    function closeMenu() {
        if (!isOpen) return;
        isOpen = false;
        navLinks.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.classList.remove('menu-open');
        window.bgsScrollLock.release();
        if (menuIcon) menuIcon.textContent = '☰';
    }

    function toggleMenu() {
        if (isOpen) closeMenu();
        else openMenu();
    }

    menuToggle.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    var menuClose = document.getElementById('mobile-menu-close');
    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }

    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (mqMobile.matches && isOpen) closeMenu();
        });
    });

    window.addEventListener('resize', function () {
        if (!mqMobile.matches) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) closeMenu();
    });

    var ticking = false;
    window.addEventListener(
        'scroll',
        function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (header && window.pageYOffset > 50) {
                        header.classList.add('scrolled');
                    } else if (header) {
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
