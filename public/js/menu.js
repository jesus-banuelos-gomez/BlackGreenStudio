document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.querySelector('.menu-icon');
    
    // Función para alternar el menú
    function toggleMenu() {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        // Cambiar icono
        if (navLinks.classList.contains('active')) {
            menuIcon.textContent = '✕';
        } else {
            menuIcon.textContent = '☰';
        }
    }
    
    // Evento click en el botón del menú
    menuToggle.addEventListener('click', toggleMenu);
    
    // Cerrar menú al hacer clic en un enlace (para móviles)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // Ajustar el menú al cambiar el tamaño de la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
            menuIcon.textContent = '☰';
        }
    });
});