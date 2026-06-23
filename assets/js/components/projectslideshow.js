(function () {
    let projectsSlideNumber = 0;
    let isFirstLoad = true;
    const numSlides = 5;
    const titles = [
        'Discovering Nanohertz Frequency Gravitational Waves Using Pulsar Timing Arrays',
        'Exacting Solar Magnitude Measurements using Solar Twin Data from Gaia Data Release 3',
        "ASTRAL's Interactive Tour of the Solar System (AstroTours)",
        "ASTRAL's Planet Discovery Game",
        "Simulating a Model of the Galaxy",
    ];
    const projectLinks = [
        'projects/meerkat-pta.html',
        'projects/solar-twin.html',
        'projects/astrotours.html',
        'projects/planet-discovery.html',
        'projects/galaxy-simulation.html'
    ];

    function splitTextIntoWords(element, text) {
        if (!window.gsap) {
            element.innerHTML = text;
            return;
        }
        element.innerHTML = '';
        const words = text.trim().split(/\s+/);
        words.forEach((word, index) => {
            const mask = document.createElement('span');
            mask.className = 'word-mask';

            const content = document.createElement('span');
            content.className = 'word-content';
            content.textContent = word;

            mask.appendChild(content);
            element.appendChild(mask);

            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });
    }

    function displaySlides() {
        const slideshow = document.querySelector('.projects-slideshow');
        if (!slideshow) return;

        if (projectsSlideNumber < 0) {
            projectsSlideNumber = (projectsSlideNumber * -1) % numSlides;
            if (projectsSlideNumber !== 0) projectsSlideNumber = numSlides - projectsSlideNumber;
        } else {
            projectsSlideNumber %= numSlides;
        }

        slideshow.querySelectorAll('.projects-container .project').forEach((slide, counter) => {
            if (counter !== projectsSlideNumber) return;

            slide.classList.add('active');

            const h1 = slideshow.querySelector('.text-container h1');
            const link = slideshow.querySelector('.text .underline-button');
            if (h1) {
                splitTextIntoWords(h1, titles[counter]);
                if (window.gsap) {
                    const words = h1.querySelectorAll('.word-content');
                    gsap.set(words, { y: '115%', opacity: 0 });

                    if (isFirstLoad && window.ScrollTrigger) {
                        gsap.to(words, {
                            scrollTrigger: {
                                trigger: slideshow,
                                start: "top 85%",
                                toggleActions: "play none none none"
                            },
                            y: '0%',
                            opacity: 1,
                            duration: 0.9,
                            stagger: 0.02,
                            ease: "power3.out",
                            onComplete: () => {
                                isFirstLoad = false;
                            }
                        });
                    } else {
                        gsap.to(words, {
                            y: '0%',
                            opacity: 1,
                            duration: 0.9,
                            stagger: 0.02,
                            ease: "power3.out"
                        });
                    }
                } else {
                    h1.style.transform = 'translateY(0)';
                }
            }
            if (link) link.href = projectLinks[counter];
        });
    }

    function hideText() {
        const slideshow = document.querySelector('.projects-slideshow');
        if (!slideshow) return;

        const h1 = slideshow.querySelector('.text-container h1');
        const active = slideshow.querySelector('.projects-container .active');
        if (h1) {
            if (window.gsap) {
                const words = h1.querySelectorAll('.word-content');
                if (words.length > 0) {
                    gsap.to(words, {
                        y: '115%',
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.in',
                        overwrite: 'auto',
                    });
                } else {
                    h1.style.transform = 'translateY(100%)';
                }
            } else {
                h1.style.transform = 'translateY(100%)';
            }
        }
        if (active) active.classList.remove('active');
    }

    window.goToUrl = function (url) {
        window.location.href = url;
    };

    window.nextSlide = function () {
        isFirstLoad = false;
        projectsSlideNumber += 1;
        hideText();
        setTimeout(displaySlides, 600);
    };

    window.previousSlide = function () {
        isFirstLoad = false;
        projectsSlideNumber -= 1;
        hideText();
        setTimeout(displaySlides, 600);
    };

    function initProjectsSlideshow() {
        projectsSlideNumber = 0;
        isFirstLoad = true;
        displaySlides();
    }

    window.AstralProjectsSlideshow = {
        init: initProjectsSlideshow
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectsSlideshow, { once: true });
    } else {
        initProjectsSlideshow();
    }
})();
