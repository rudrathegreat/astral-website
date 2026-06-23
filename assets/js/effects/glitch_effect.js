(function () {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const FPS = 40;
    const FRAME_INTERVAL = 1000 / FPS;

    function initGlitchEffect() {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const lowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 2;

        if (prefersReducedMotion || lowCpu || lowMemory) {
            document.documentElement.classList.add('glitch-disabled');
            return;
        }

        document.querySelectorAll('.glitch-header').forEach((header) => {
            if (header.dataset.astralGlitchInit === 'true') return;
            header.dataset.astralGlitchInit = 'true';

            const original = header.dataset.value || header.textContent || '';
            const originalChars = original.split('');
            const len = originalChars.length;

            let rafId = null;
            let progress = 0;
            let lastTime = 0;
            let isHovering = false;

            function frame(time) {
                if (!lastTime) lastTime = time;
                const dt = time - lastTime;
                if (dt < FRAME_INTERVAL) {
                    rafId = requestAnimationFrame(frame);
                    return;
                }

                lastTime = time;
                header.textContent = originalChars.map((ch, index) => {
                    if (index < progress) return ch;
                    return LETTERS[(Math.random() * LETTERS.length) | 0];
                }).join('');

                progress += isHovering ? 0.5 : 0.8;

                if (progress >= len) {
                    header.textContent = original;
                    rafId = null;
                    return;
                }

                rafId = requestAnimationFrame(frame);
            }

            header.addEventListener('mouseenter', () => {
                isHovering = true;
                if (rafId) cancelAnimationFrame(rafId);
                progress = 0;
                lastTime = 0;
                rafId = requestAnimationFrame(frame);
            }, { passive: true });

            header.addEventListener('mouseleave', () => {
                isHovering = false;
            }, { passive: true });
        });
    }

    window.AstralGlitch = {
        init: initGlitchEffect
    };

    initGlitchEffect();
})();
