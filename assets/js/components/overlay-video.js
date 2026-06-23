(function () {
    function initOverlayVideo() {
        const heroVideo = document.querySelector('.video-container video');
        const overlay = document.querySelector('.overlay-video');
        if (!heroVideo || !overlay || overlay.dataset.astralOverlayInit === 'true') return;

        overlay.dataset.astralOverlayInit = 'true';

        const overlayVideo = overlay.querySelector('video');
        const closeAnchor = overlay.querySelector('a');

        function openOverlay() {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
            try { heroVideo.pause(); } catch (e) {}

            if (overlayVideo) {
                try {
                    overlayVideo.currentTime = 0;
                    overlayVideo.muted = false;
                    const playPromise = overlayVideo.play();
                    if (playPromise && typeof playPromise.then === 'function') {
                        playPromise.catch(() => {});
                    }
                } catch (e) {}
            }

            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        }

        function closeOverlay() {
            overlay.classList.add('closing');

            setTimeout(() => {
                overlay.classList.remove('active', 'closing');
                overlay.setAttribute('aria-hidden', 'true');
                if (overlayVideo) {
                    try {
                        overlayVideo.pause();
                        overlayVideo.currentTime = 0;
                    } catch (e) {}
                }
                try { heroVideo.play(); } catch (e) {}
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }, 800);
        }

        heroVideo.addEventListener('click', openOverlay);

        if (closeAnchor) {
            closeAnchor.addEventListener('click', (e) => {
                e.preventDefault();
                closeOverlay();
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });

        if (document.body.dataset.astralOverlayEscape !== 'true') {
            document.body.dataset.astralOverlayEscape = 'true';
            document.addEventListener('keydown', (e) => {
                const activeOverlay = document.querySelector('.overlay-video.active');
                if (e.key === 'Escape' && activeOverlay) {
                    activeOverlay.querySelector('a')?.click();
                }
            });
        }
    }

    window.AstralOverlayVideo = {
        init: initOverlayVideo
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOverlayVideo, { once: true });
    } else {
        initOverlayVideo();
    }
})();
