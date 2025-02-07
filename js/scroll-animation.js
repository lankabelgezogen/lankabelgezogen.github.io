document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.experience-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });
});