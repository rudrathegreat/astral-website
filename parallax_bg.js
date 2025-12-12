if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency > 10) {
        window.addEventListener('scroll', () => {
            bg_scale = 100 + (window.scrollY/80);
            blur_effect = (window.scrollY/400);
            pos_y = 30-((this.window.scrollY)/40);

            document.querySelector('.hero').animate({
                backgroundSize: bg_scale + "%",
                backgroundPosition: '50% ' + pos_y + '%',
                // filter: "blur(" + blur_effect + "px)"
            }, {duration:2000, fill:'forwards'});

            var topicsDistanceToTop = window.pageYOffset + (document.querySelector('.projects').getBoundingClientRect().top)-100;

            left_offset = track.dataset.prevPercentage-(window.scrollY - topicsDistanceToTop)/10;
            top_offset = (window.scrollY - topicsDistanceToTop)/30;
            if (top_offset > 30) {
                top_offset = 30;
            }

            if (top_offset < 0) {
                top_offset = 0;
            }

            if (left_offset > 0) {
                left_offset = 0;
            }

            if (left_offset < (-200/3)) {
                left_offset = -200/3;
            }
            track.dataset.percentage = left_offset;

            document.querySelector('.projects').animate({
                transform: `translate(0%, ${top_offset}%)`
            }, { duration: 1000, fill: "forwards" });

            track.animate({
                transform: `translate(${left_offset}%, 0%)`
            }, { duration: 1000, fill: "forwards" });
            
            for(const image of track.getElementsByClassName("project")) {
                image.animate({
                    backgroundPosition: `${100 + (left_offset)}% center`
                }, { duration: 1000, fill: "forwards" });
            }
        })
    }
}