(function () {
    function initAboutInteractions() {
        const track = document.getElementById('image-track') || window.track;
        if (!track || track.dataset.astralAboutHover === 'true') return;

        track.dataset.astralAboutHover = 'true';

        track.addEventListener('mouseover', () => {
            const cursor = document.querySelector('.cursor');
            const cursorText = document.querySelector('.cursor p');
            const blob = document.querySelector('.blob');
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
            const blob = document.querySelector('.blob');
            if (!cursor) return;

            cursor.style.width = '1.5vw';
            cursor.style.height = '1.5vw';
            cursor.style.background = '#6A6BF4';
            if (blob) blob.style.opacity = 0.2;
            if (cursorText) cursorText.style.opacity = 0;
        });
    }

    window.AstralAbout = {
        init: initAboutInteractions
    };

    initAboutInteractions();
})();
