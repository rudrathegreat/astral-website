function styleNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (navbar.classList.contains('activated')) {
        navbar.style.background = 'white';
        navbar.style.backdropFilter = 'none';
    } else {
        if (window.scrollY > window.innerHeight * 0.8) {
            navbar.style.background = 'rgba(255,255,255,0.4)';
            navbar.style.backdropFilter = 'blur(40px)';
        } else {
            if (navbar.classList.contains('bg-nav')) {
                navbar.style.background = 'rgba(255,255,255,0.4)';
                navbar.style.backdropFilter = 'blur(40px)';
            } else {
                navbar.style.background = 'none';
                navbar.style.backdropFilter = 'none';
            }
        }
    }
}