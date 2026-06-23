(function () {
    let globalScrollBound = false;

    function updateHeroParallax() {
        const hero = document.querySelector('.hero');
        if (!hero || !hero.classList.contains('with-bg')) return;

        const bgScale = 100 + (window.scrollY / 80);
        const posY = 30 - (window.scrollY / 40);

        hero.animate({
            backgroundSize: `${bgScale}%`,
            backgroundPosition: `50% ${posY}%`
        }, { duration: 2000, fill: 'forwards' });
    }

    function updateMentorParallax() {
        document.querySelectorAll('.all-mentors-parallax').forEach((section) => {
            const scrolled = window.pageYOffset;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;

            if (scrolled + viewportHeight > sectionTop && scrolled < sectionTop + sectionHeight) {
                const relativeScroll = (scrolled + viewportHeight - sectionTop) / (viewportHeight + sectionHeight);
                const posY = 20 + (relativeScroll * 20);
                section.style.backgroundPosition = `center ${posY}%`;
            }
        });
    }

    function handleScroll() {
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 10) {
            updateHeroParallax();
        }
        updateMentorParallax();
    }

    function initParallax() {
        if (globalScrollBound) return;
        globalScrollBound = true;
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    window.AstralParallax = {
        init: initParallax
    };

    initParallax();
})();
