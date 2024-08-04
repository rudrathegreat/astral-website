let menu_links = document.querySelector('.menu .links');

function styleNavbar() {
    if (this.document.querySelector('.navbar').classList.contains('activated')) {
        this.document.querySelector('.navbar').style.background = 'white';
        this.document.querySelector('.navbar').style.backdropFilter = 'none';
        this.document.querySelector('.menu-icon').style.background = '#6A6BF4';
    }
    else {
        if (this.window.scrollY > 20) {
            this.document.querySelector('.navbar').style.background = 'rgba(255,255,255,0.4)';
            this.document.querySelector('.navbar').style.backdropFilter = 'blur(40px)';
            this.document.querySelector('.menu-icon').style.background = '#6A6BF4';
        }
        else {
            if (this.document.querySelector('.navbar').classList.contains('bg-nav')) {
                this.document.querySelector('.navbar').style.background = 'rgba(255,255,255,0.4)';
                this.document.querySelector('.navbar').style.backdropFilter = 'blur(40px)';
            }
            else {
                this.document.querySelector('.navbar').style.background = 'none';
                this.document.querySelector('.navbar').style.backdropFilter = 'none';
                this.document.querySelector('.menu-icon').style.background = 'rgba(255,255,255,0.4)';
                this.document.querySelector('.menu-icon').style.backdropFilter = 'blur(40px)';
            }
        }
    }
}

window.addEventListener('scroll', function() {
    styleNavbar();
})

function toggleMenu() {
    document.querySelector('.navbar').classList.toggle('activated');
    styleNavbar();
}

function goTo(section_name) {
    lenis.scrollTo(section_name);
    setTimeout(() => {
        toggleMenu();
    }, 300);
}

function toggleOptions(section_name) {
    document.querySelectorAll('.options-activated').forEach(activated_item => {
        if (activated_item.classList.contains(section_name) == false) {
            activated_item.classList.toggle('options-activated');
        }
    })
    document.querySelector('.' + section_name).classList.toggle('options-activated');
}