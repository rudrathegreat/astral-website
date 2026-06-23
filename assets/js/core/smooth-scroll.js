function easeInOutCubic(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

const lenis = new Lenis(wrapper=document.querySelector(".scroll-container"), easing = (t) => easeInOutCubic(), duration=0.3)

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)