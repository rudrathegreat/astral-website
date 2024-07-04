let menu_links = document.querySelector('.menu .links');

function styleNavbar() {
    if (this.document.querySelector('.navbar').classList.contains('activated')) {
        this.document.querySelector('.navbar').style.background = 'white';
        this.document.querySelector('.navbar').style.border = '1px solid white';
        this.document.querySelector('.navbar').style.backdropFilter = 'none';
    }
    else {
        if (this.window.scrollY > 20) {
            this.document.querySelector('.navbar').style.background = 'rgba(255,255,255,0.4)';
            this.document.querySelector('.navbar').style.border = '1px solid rgba(255,255,255,0.15)';
            this.document.querySelector('.navbar').style.backdropFilter = 'blur(40px)';
        }
        else {
            if (this.document.querySelector('.navbar').classList.contains('bg-nav')) {
                this.document.querySelector('.navbar').style.background = 'rgba(255,255,255,0.4)';
                this.document.querySelector('.navbar').style.border = '1px solid rgba(255,255,255,0.15)';
                this.document.querySelector('.navbar').style.backdropFilter = 'blur(40px)';
            }
            else {
                this.document.querySelector('.navbar').style.background = 'none';
                this.document.querySelector('.navbar').style.border = 'none';
                this.document.querySelector('.navbar').style.backdropFilter = 'none';
            }
        }
    }
}

window.addEventListener('scroll', function() {
    styleNavbar();
})

// window.addEventListener('mousemove', function(e) {
//     percentage_x = (e.clientX / this.window.screen.width) * 100;
//     offset_x = 50 + ((percentage_x - 50)/40);
//     percentage_y = (e.clientY / this.window.screen.height) * 100;
//     offset_y = 50 + ((percentage_y - 50)/40);
//     menu_links.animate({
//         top: offset_y + '%',
//         left: offset_x + '%'
//     }, {duration:1500, fill:'forwards'});
// })

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