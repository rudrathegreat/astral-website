(function () {
    const acronymItems = [
        ['astrophysics', '#astrophysics'],
        ['supercomputing', '#supercomputing'],
        ['technology', '#technology'],
        ['research', '#research'],
        ['analytics', '#analytics'],
        ['leadership', '#leadership']
    ];

    function initFloatingImage(tag, image) {
        if (!tag || !image || tag.dataset.astralHomeFloat === 'true') return;
        tag.dataset.astralHomeFloat = 'true';

        tag.addEventListener('mouseover', () => {
            image.style.opacity = 0.7;
        });

        tag.addEventListener('mousemove', (e) => {
            image.animate({
                top: `${e.pageY}px`,
                left: `${e.pageX}px`
            }, { duration: 2000, fill: 'forwards' });
        });

        tag.addEventListener('mouseleave', () => {
            image.style.opacity = 0;
        });
    }

    function initHomeInteractions() {
        const blob = document.querySelector('.blob');
        const whoWeAre = document.querySelector('.who-we-are');

        if (whoWeAre && whoWeAre.dataset.astralHomeBlob !== 'true') {
            whoWeAre.dataset.astralHomeBlob = 'true';
            whoWeAre.addEventListener('mouseover', () => {
                if (blob) blob.style.opacity = 0;
            });
            whoWeAre.addEventListener('mouseleave', () => {
                if (blob) blob.style.opacity = 0.2;
            });
        }

        acronymItems.forEach(([className, imageSelector]) => {
            initFloatingImage(
                document.querySelector(`.${className}`),
                document.querySelector(imageSelector)
            );
        });

        const track = document.getElementById('image-track') || window.track;
        if (track && track.dataset.astralHomeTrackHover !== 'true') {
            track.dataset.astralHomeTrackHover = 'true';

            track.addEventListener('mouseover', () => {
                const cursor = document.querySelector('.cursor');
                const cursorText = document.querySelector('.cursor p');
                if (!cursor) return;

                cursor.style.width = '10vw';
                cursor.style.height = '10vw';
                cursor.style.background = 'white';
                if (cursorText) {
                    cursorText.innerHTML = 'Click and Drag';
                    cursorText.style.opacity = 1;
                }
                if (blob) blob.style.opacity = 0;
            });

            track.addEventListener('mouseleave', () => {
                const cursor = document.querySelector('.cursor');
                const cursorText = document.querySelector('.cursor p');
                if (!cursor) return;

                cursor.style.width = '1.5vw';
                cursor.style.height = '1.5vw';
                cursor.style.background = '#6A6BF4';
                if (blob) blob.style.opacity = 0.2;
                if (cursorText) cursorText.style.opacity = 0;
            });
        }
    }

    window.AstralHome = {
        init: initHomeInteractions
    };

    initHomeInteractions();
})();
