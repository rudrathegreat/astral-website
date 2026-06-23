(function () {
    function initCarousel() {
        const track = document.getElementById('image-track');
        if (!track || track.dataset.astralCarouselInit === 'true') return;

        track.dataset.astralCarouselInit = 'true';
        track.dataset.mouseDownAt = track.dataset.mouseDownAt || '0';
        track.dataset.prevPercentage = track.dataset.prevPercentage || '0';
        track.dataset.percentage = track.dataset.percentage || '0';
        window.track = track;

        const handleOnDown = (e) => {
            track.dataset.mouseDownAt = e.clientX;
        };

        const handleOnUp = () => {
            track.dataset.mouseDownAt = '0';
            track.dataset.prevPercentage = track.dataset.percentage;

            if (track.dataset.prevPercentage > (-100 / 6)) {
                track.dataset.percentage = 0;
                track.dataset.prevPercentage = track.dataset.percentage;
            }

            if ((track.dataset.percentage > (-300 / 6)) && (track.dataset.percentage < (-100 / 6))) {
                track.dataset.percentage = (-100 / 3);
                track.dataset.prevPercentage = track.dataset.percentage;
            }

            if ((track.dataset.percentage < (-300 / 6))) {
                track.dataset.percentage = (-200 / 3);
                track.dataset.prevPercentage = track.dataset.percentage;
            }

            track.animate({
                transform: `translate(${track.dataset.prevPercentage}%, 0%)`
            }, { duration: 1000, fill: 'forwards', easing: 'ease' });
        };

        const handleOnMove = (e) => {
            if (track.dataset.mouseDownAt === '0') return;

            const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
            const maxDelta = window.innerWidth / 2;
            const percentage = (mouseDelta / maxDelta) * -100;
            let nextPercentage = parseFloat(track.dataset.prevPercentage) + percentage;

            if (nextPercentage > 0) nextPercentage = 0;
            if (nextPercentage < (-200 / 3)) nextPercentage = -200 / 3;

            track.dataset.percentage = nextPercentage;

            track.animate({
                transform: `translate(${nextPercentage}%, 0%)`
            }, { duration: 1000, fill: 'forwards' });

            for (const image of track.getElementsByClassName('project')) {
                image.animate({
                    backgroundPosition: `${100 + nextPercentage}% center`
                }, { duration: 1000, fill: 'forwards' });
            }
        };

        track.onmousedown = (e) => handleOnDown(e);
        track.ontouchstart = (e) => handleOnDown(e.touches[0]);
        track.onmouseup = () => handleOnUp();
        track.ontouchend = () => handleOnUp();
        track.onmousemove = (e) => handleOnMove(e);
        track.ontouchmove = (e) => handleOnMove(e.touches[0]);
    }

    window.AstralCarousel = {
        init: initCarousel
    };

    initCarousel();
})();
