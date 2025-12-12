// Glitch header effect optimized: per-header rAF loop, throttled frame rate,
// and capability checks to disable on low-performance devices or when the
// user prefers reduced motion.

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FPS = 40; // target frames per second for the glitch animation
const FRAME_INTERVAL = 1000 / FPS;

const glitch_prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const glitch_lowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
const glitch_lowMemory = navigator.deviceMemory && navigator.deviceMemory < 2;

if (glitch_prefersReducedMotion || glitch_lowCpu || glitch_lowMemory) {
    document.documentElement.classList.add('glitch-disabled');
} else {
    document.querySelectorAll('.glitch-header').forEach(header => {
        const original = header.dataset.value || header.textContent || '';
        const originalChars = original.split('');

        let rafId = null;
        let progress = 0;
        let lastTime = 0;
        const iterationIncrement = 0.5; // mirrors previous behaviour
        let isHovering = false;
        const finishMultiplier = 1.6; // speed-up when mouse leaves so effect completes promptly
        const len = originalChars.length;

        function frame(time) {
            if (!lastTime) lastTime = time;
            const dt = time - lastTime;
            if (dt < FRAME_INTERVAL) {
                rafId = requestAnimationFrame(frame);
                return;
            }
            lastTime = time;
            // build text: reveal characters up to progress, randomize the rest
            const text = originalChars.map((ch, i) => {
                if (i < progress) return ch;
                return LETTERS[(Math.random() * LETTERS.length) | 0];
            }).join('');

            header.textContent = text;

            // if the pointer left, accelerate the reveal so the animation completes
            const increment = isHovering ? iterationIncrement : (iterationIncrement * finishMultiplier);
            progress += increment;

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
            // mark as not hovering; do not cancel RAF so animation can finish
            isHovering = false;
            // leave the RAF running; frame() will accelerate progress and finish
        }, { passive: true });
    });
}
