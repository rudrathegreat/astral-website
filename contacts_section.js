contact_bg = document.querySelector('.contacts');

window.addEventListener('scroll', function() {
    if ((this.window.scrollY / this.window.innerHeight) < 9) {
        contact_bg.style.width = '98vw';
        contact_bg.style.height = '98vh';
        contact_bg.style.borderRadius = '2vw';
        contact_bg.style.margin = '1vh 1vw';
    }

    else if ((this.window.scrollY / this.window.innerHeight) >10) {
        contact_bg.style.width = '100vw';
        contact_bg.style.height = '100vh';
        contact_bg.style.borderRadius = '0vw';
        contact_bg.style.margin = '0vh 0vw';
    }

    else {
        width = (((this.window.scrollY / this.window.innerHeight) - 9)*2) + 98;
        left = 1-(((this.window.scrollY / this.window.innerHeight) - 9))
        borderRadius = 2 - (((this.window.scrollY / this.window.innerHeight) - 9)*2);
        contact_bg.style.width = width + 'vw';
        contact_bg.style.height = width + 'vh';
        contact_bg.style.margin = left + 'vh ' + left + 'vw';
        contact_bg.style.borderRadius = + borderRadius + 'vw';
    }
})
