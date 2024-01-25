window.addEventListener('scroll', () => {
    bg_scale = 100 + (window.scrollY/80);
    blur_effect = (window.scrollY/400);
    pos_y = 30-((this.window.scrollY)/80);

    document.querySelector('.hero').animate({
        backgroundSize: bg_scale + "%",
        backgroundPosition: '50% ' + pos_y + '%',
        filter: "blur(" + blur_effect + "px)"
    }, {duration:2000, fill:'forwards'});

    var topicsDistanceToTop = window.pageYOffset + (document.querySelector('.projects').getBoundingClientRect().top)-200;

    left_offset = (window.scrollY - topicsDistanceToTop)/10;
    top_offset = (window.scrollY - topicsDistanceToTop)/30;
    if (top_offset > 30) {
        top_offset = 30;
    }
    document.querySelector('.projects').animate({
        transform:'translate(-'+left_offset+'%, ' + top_offset + '%)'
    }, {duration:2000, fill:'forwards'})
})