(function () {
    const defaultCursorSize = '1.5vw';
    let mouseX = 0;
    let mouseY = 0;
    let blobX = window.innerWidth / 2;
    let blobY = window.innerHeight / 2;
    let blobAnimating = false;

    function getCursor() {
        return document.querySelector('.cursor');
    }

    function getCursorText() {
        return document.querySelector('.cursor p');
    }

    function getBlob() {
        return document.querySelector('.blob');
    }

    function setCursorSize(width, height = width) {
        const cursor = getCursor();
        if (!cursor) return;
        cursor.style.width = width;
        cursor.style.height = height;
    }

    function resetCursor() {
        const cursor = getCursor();
        const cursorText = getCursorText();
        if (!cursor) return;

        setCursorSize(defaultCursorSize);
        cursor.style.background = '#6A6BF4';

        if (cursorText) {
            cursorText.textContent = '';
            cursorText.style.opacity = 0;
        }
    }

    function showVideoCursor() {
        const cursor = getCursor();
        const cursorText = getCursorText();
        if (!cursor) return;

        setCursorSize('8vw');
        cursor.style.background = 'white';

        if (cursorText) {
            cursorText.textContent = 'Watch Video';
            cursorText.style.opacity = 1;
        }
    }

    function contractCursor() {
        setCursorSize('0');
    }

    function isLinkTarget(target) {
        return target.closest('a, button, [role="button"], .underline-button, .round-button');
    }

    function isVideoTarget(target) {
        const video = target.closest('.video video, .video-container video, video');
        if (video && video.closest('.overlay-video')) return null;
        return video;
    }

    function isGridTarget(target) {
        return target.closest('.grid-effect');
    }

    function prepareBlob() {
        const blob = getBlob();
        if (!blob || blob.dataset.astralCursorReady === 'true') return;

        blob.dataset.astralCursorReady = 'true';
        blob.style.willChange = 'transform, left, top, opacity';
        blob.style.left = `${blobX}px`;
        blob.style.top = `${blobY}px`;

        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 10) {
            blob.style.display = 'none';
        } else if (!navigator.hardwareConcurrency) {
            blob.style.display = 'none';
        }
    }

    function updateBlob() {
        const blob = getBlob();
        if (!blob) {
            blobAnimating = false;
            return;
        }

        const ease = 0.05;
        blobX += (mouseX - blobX) * ease;
        blobY += (mouseY - blobY) * ease;

        blob.style.left = `${blobX}px`;
        blob.style.top = `${blobY}px`;

        const dx = Math.abs(blobX - mouseX);
        const dy = Math.abs(blobY - mouseY);

        if (dx > 0.5 || dy > 0.5) {
            requestAnimationFrame(updateBlob);
        } else {
            blobAnimating = false;
        }
    }

    function initCursor() {
        prepareBlob();
        resetCursor();
    }

    if (document.body.dataset.astralCursorGlobal !== 'true') {
        document.body.dataset.astralCursorGlobal = 'true';

        window.addEventListener('mousemove', (e) => {
            const cursor = getCursor();
            const blob = getBlob();

            if (cursor) {
                cursor.animate({
                    top: `${e.pageY}px`,
                    left: `${e.pageX}px`
                }, { duration: 500, fill: 'forwards' });
            }

            mouseX = e.clientX;
            mouseY = e.clientY;

            if (blob && !blobAnimating) {
                prepareBlob();
                blobAnimating = true;
                requestAnimationFrame(updateBlob);
            }
        }, { passive: true });

        document.addEventListener('mouseover', (e) => {
            const cursor = getCursor();

            if (isVideoTarget(e.target)) {
                showVideoCursor();
                return;
            }

            if (isLinkTarget(e.target)) {
                contractCursor();
                return;
            }

            if (isGridTarget(e.target) && cursor) {
                cursor.style.background = 'white';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const leavingInteractiveElement = isVideoTarget(e.target) || isLinkTarget(e.target) || isGridTarget(e.target);
            const enteringSameElement = e.relatedTarget && (
                isVideoTarget(e.target)?.contains(e.relatedTarget) ||
                isLinkTarget(e.target)?.contains(e.relatedTarget) ||
                isGridTarget(e.target)?.contains(e.relatedTarget)
            );

            if (leavingInteractiveElement && !enteringSameElement) {
                resetCursor();
            }
        });
    }

    window.AstralCursor = {
        init: initCursor,
        reset: resetCursor
    };

    initCursor();
})();
