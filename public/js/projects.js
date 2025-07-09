// Actualiza el código existente con estas mejoras
document.addEventListener('DOMContentLoaded', function() {
    // ... código anterior ...
    
    // Calcular el ancho de la tarjeta de forma dinámica
    function calculateCardWidth() {
        const firstCard = cards[0];
        const style = window.getComputedStyle(firstCard);
        const margin = parseFloat(style.marginRight) + parseFloat(style.marginLeft);
        return firstCard.offsetWidth + margin;
    }
    
    let cardWidth = calculateCardWidth();
    let currentIndex = 0;
    
    // Recalcular en redimensionamiento
    window.addEventListener('resize', function() {
        cardWidth = calculateCardWidth();
        goToSlide(currentIndex); // Reajustar posición
    });
    
    // Función mejorada para mover el carrusel
    function goToSlide(index) {
        // Asegurar que el índice esté dentro de los límites
        currentIndex = Math.max(0, Math.min(index, cards.length - 1));
        
        const scrollAmount = currentIndex * cardWidth;
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        updateDots();
        updateButtonStates();
    }
    
    // Actualizar estado de los botones
    function updateButtonStates() {
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevBtn.style.cursor = currentIndex === 0 ? 'default' : 'pointer';
        
        nextBtn.style.opacity = currentIndex === cards.length - 1 ? '0.5' : '1';
        nextBtn.style.cursor = currentIndex === cards.length - 1 ? 'default' : 'pointer';
    }
    
    // ... resto del código ...
    
    // Inicializar estados
    updateButtonStates();
});