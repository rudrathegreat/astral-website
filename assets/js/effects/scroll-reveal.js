if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Robustly splits text into lines without breaking the layout.
 */
function splitTextSurgically(element) {
    if (element.classList.contains('processed')) return;
    const originalText = element.textContent.trim();
    if (!originalText) return;

    const computedStyle = window.getComputedStyle(element);
    const width = element.offsetWidth || element.parentElement.offsetWidth;
    
    // 1. Measure
    const measureContainer = document.createElement('div');
    measureContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${width}px;
        font: ${computedStyle.font};
        letter-spacing: ${computedStyle.letterSpacing};
        text-transform: ${computedStyle.textTransform};
        line-height: ${computedStyle.lineHeight};
        padding: ${computedStyle.padding};
        pointer-events: none;
        white-space: ${computedStyle.whiteSpace};
        word-break: normal;
    `;
    
    const words = originalText.split(/\s+/);
    measureContainer.innerHTML = words.map(word => `<span>${word}</span>`).join(' ');
    document.body.appendChild(measureContainer);

    const spans = measureContainer.querySelectorAll('span');
    const lines = [];
    let currentLine = [];
    let lastTop = -1;

    spans.forEach(span => {
        const top = span.offsetTop;
        if (lastTop !== -1 && Math.abs(top - lastTop) > 5) {
            lines.push(currentLine);
            currentLine = [];
        }
        currentLine.push(span.textContent);
        lastTop = top;
    });
    lines.push(currentLine);

    // 2. Reconstruct
    element.innerHTML = '';
    lines.forEach(lineWords => {
        const mask = document.createElement('div');
        mask.className = 'line-mask';
        mask.style.textAlign = computedStyle.textAlign;
        
        const content = document.createElement('div');
        content.className = 'line-content';
        content.textContent = lineWords.join(' ');
        applyRainbowTextStyle(element, content);
        
        mask.appendChild(content);
        element.appendChild(mask);
    });

    document.body.removeChild(measureContainer);
    element.classList.add('processed');
}

function shouldRevealByWord(element) {
    return element.matches(
        '.hero .reveal-text, .mission-statement .reveal-text, .main-text .reveal-text, .why .left-column > h1.reveal-text'
    );
}

function applyRainbowTextStyle(element, content) {
    if (!element.classList.contains('rainbow')) return;

    const computedStyle = window.getComputedStyle(element);
    content.style.background = computedStyle.background;
    content.style.webkitBackgroundClip = 'text';
    content.style.backgroundClip = 'text';
    content.style.webkitTextFillColor = 'transparent';
}

function splitTextByWord(element) {
    if (element.classList.contains('processed')) return;
    const originalText = element.textContent.trim();
    if (!originalText) return;

    const words = originalText.split(/\s+/);

    element.innerHTML = '';
    words.forEach((word, index) => {
        const mask = document.createElement('span');
        mask.className = 'word-mask';

        const content = document.createElement('span');
        content.className = 'word-content';
        content.textContent = word;
        applyRainbowTextStyle(element, content);

        mask.appendChild(content);
        element.appendChild(mask);

        if (index < words.length - 1) {
            element.appendChild(document.createTextNode(' '));
        }
    });

    element.classList.add('processed');
}

function getRevealUnits(element) {
    return element.querySelectorAll('.word-content, .line-content');
}

function shouldSkipGenericReveal(element) {
    return element.matches('.navbar .reveal-text, .navbar .reveal-image, .mission-statement .reveal-text, .statistics-grid, .apply-content .reveal-image, .contacts .reveal-text, .contacts .reveal-image');
}

function isInteractiveRevealText(element) {
    return element.dataset.interactiveRevealOwner === 'true' || element.dataset.interactiveTextSplit === 'true';
}

function wrapAsSingleLine(element) {
    if (element.classList.contains('processed')) return;
    const originalText = element.textContent.trim();
    if (!originalText) return;

    const computedStyle = window.getComputedStyle(element);
    
    element.innerHTML = '';
    const mask = document.createElement('div');
    mask.className = 'line-mask';
    mask.style.textAlign = computedStyle.textAlign;
    mask.style.whiteSpace = 'nowrap'; // Force single line
    
    const content = document.createElement('div');
    content.className = 'line-content';
    content.textContent = originalText;
    applyRainbowTextStyle(element, content);
    
    mask.appendChild(content);
    element.appendChild(mask);
    element.classList.add('processed');
}

function prepareNavbarRevealText() {
    const navbar = document.querySelector('.navbar');
    if (!navbar || navbar.dataset.astralNavbarRevealPrepared === 'true') return;

    navbar.querySelectorAll('.reveal-text').forEach(element => {
        splitTextSurgically(element);
    });

    navbar.querySelectorAll('.reveal-text-single').forEach(element => {
        wrapAsSingleLine(element);
    });

    navbar.dataset.astralNavbarRevealPrepared = 'true';
}

function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const container = document.querySelector('[data-barba="container"]') || document.body;
    if (container.dataset.astralRevealInit === 'true') return;
    container.dataset.astralRevealInit = 'true';

    // 1. Split all reveal-text
    prepareNavbarRevealText();

    const revealTexts = Array.from(document.querySelectorAll('.reveal-text')).filter(element => {
        return !element.closest('.navbar') && !isInteractiveRevealText(element);
    });
    revealTexts.forEach(element => {
        if (shouldRevealByWord(element)) {
            splitTextByWord(element);
            return;
        }

        splitTextSurgically(element);
    });

    // 1b. Handle single-unit reveals
    const singleRevealTexts = Array.from(document.querySelectorAll('.reveal-text-single')).filter(element => {
        return !element.closest('.navbar') && !isInteractiveRevealText(element);
    });
    singleRevealTexts.forEach(element => {
        wrapAsSingleLine(element);
    });

    // 2. Set initial hidden states immediately
    gsap.set('.line-content', { y: '130%', opacity: 0 });
    gsap.set('.word-content', { y: '130%', opacity: 0 });
    gsap.set('.reveal-image', { y: 15, opacity: 0 });
    gsap.set('.acronym-buttons.reveal-image', { y: 0, opacity: 1 });
    gsap.set('.acronym-buttons .acronym-button', { y: 34, opacity: 0 });
    gsap.set('.statistics-grid.reveal-image', { y: 0, opacity: 1 });
    gsap.set('.statistics-grid .cell', { y: 45, opacity: 0 });
    gsap.set('.apply-content .right-column.reveal-image', { y: 0, opacity: 1 });
    gsap.set('.apply-content .links h2, .apply-content .underline-button, .apply-content .image-caption-container', { y: 24, opacity: 0 });
    gsap.set('.contacts .faqs > p, .contacts .other-contact-info .image-caption-container', { y: 30, opacity: 0 });
    gsap.set('.mission-statement .star-outlines img', {
        opacity: 0,
        scale: 0,
        rotate: -35,
        transformOrigin: '50% 50%'
    });

    // 3. Hero Animation - Specific immediate trigger
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroCard = hero.querySelector('.hero-column-container .right-column.reveal-image');
        const hLines = Array.from(hero.querySelectorAll('.word-content, .line-content')).filter(unit => {
            return !heroCard || !heroCard.contains(unit);
        });
        const heroCardLines = heroCard ? heroCard.querySelectorAll('.word-content, .line-content') : [];
        const heroCardCta = heroCard?.querySelector('.hero-card-cta');
        const hImages = hero.querySelectorAll('.reveal-image');

        if (heroCardCta) {
            gsap.set(heroCardCta, { y: 15, opacity: 0 });
        }
        
        const tl = gsap.timeline();
        tl.to(hLines, {
            y: 0, opacity: 1,
            duration: 1.4, stagger: 0.035, ease: "power4.out"
        })
        .to(hImages, {
            y: 0, opacity: 1,
            duration: 1.2, stagger: 0.1,
            onStart: () => hImages.forEach(img => img.classList.add('animated'))
        }, "-=1.1")
        .to(heroCardLines, {
            y: 0, opacity: 1,
            duration: 1.4, stagger: 0.035, ease: "power4.out"
        }, "-=0.8");

        if (heroCardCta) {
            tl.to(heroCardCta, {
                y: 0, opacity: 1,
                duration: 0.8, ease: "power2.out"
            }, "-=0.65");
        }
    }

    // 4. Per-Element Scroll Triggers
    // This ensures that EACH paragraph/image triggers ONLY when it enters view
    const elementsToReveal = document.querySelectorAll('.mission-statement .reveal-text, .homepage-section:not(.hero) .reveal-text, .reveal-image:not(.hero *)');
    
    elementsToReveal.forEach(el => {
        if (shouldSkipGenericReveal(el)) return;

        const isImage = el.classList.contains('reveal-image');
        const isAcronymButtons = el.classList.contains('acronym-buttons');
        const animContent = isAcronymButtons ? el.querySelectorAll('.acronym-button') : isImage ? el : getRevealUnits(el);
        const stagger = isAcronymButtons ? 0.14 : isImage ? 0 : shouldRevealByWord(el) ? 0.035 : 0.1;
        const duration = isAcronymButtons ? 0.75 : isImage ? 1.2 : 1.3;
        const ease = isAcronymButtons ? 'power3.out' : isImage ? 'power2.out' : 'power3.out';
        
        gsap.to(animContent, {
            scrollTrigger: {
                trigger: el,
                start: "top 95%", // Extremely precise: triggers only when 5% from bottom
                toggleActions: "play none none none"
            },
            y: 0,
            opacity: 1,
            duration,
            stagger,
            ease,
            onStart: () => {
                if (isImage) el.classList.add('animated');
            }
        });
    });

    // 5. Mission statement has a staged star reveal before text and emanation.
    const missionStatement = document.querySelector('.mission-statement');
    if (missionStatement) {
        const starOutlines = missionStatement.querySelector('.star-outlines');
        const starCore = missionStatement.querySelector('.star-outlines img');
        const missionText = missionStatement.querySelectorAll('.word-content, .line-content');

        if (starOutlines && starCore && missionText.length) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: missionStatement,
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            })
            .to(starCore, {
                opacity: 1,
                scale: 1,
                rotate: 0,
                duration: 1.15,
                ease: 'power3.out'
            })
            .add(() => starOutlines.classList.add('emanating'))
            .to(missionText, {
                y: 0,
                opacity: 1,
                duration: 1.25,
                stagger: 0.035,
                ease: 'power4.out'
            }, '-=0.05');
        }
    }

    // 6. Special handling for Statistics (grid-based)
    const statsGrid = document.querySelector('.statistics-grid');
    if (statsGrid) {
        gsap.to(statsGrid.querySelectorAll('.cell'), {
            scrollTrigger: {
                trigger: statsGrid,
                start: "top 92%"
            },
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.18,
            ease: "power3.out"
        });
    }

    // 7. Apply section reveals the image before each link item.
    const applyContent = document.querySelector('.apply-content');
    if (applyContent) {
        const imageColumn = applyContent.querySelector('.left-column.reveal-image');
        const linkItems = applyContent.querySelectorAll('.links h2, .links .underline-button, .image-caption-container');

        if (imageColumn && linkItems.length) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: applyContent,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                }
            })
            .to(imageColumn, {
                y: 0,
                opacity: 1,
                duration: 1.1,
                ease: 'power2.out',
                onStart: () => imageColumn.classList.add('animated')
            })
            .to(linkItems, {
                y: 0,
                opacity: 1,
                duration: 0.75,
                stagger: 0.12,
                ease: 'power3.out'
            }, '-=0.35');
        }
    }

    // 8. Contacts reveal is section-level so it fires while the panel is visible.
    const contacts = document.querySelector('.contacts');
    if (contacts) {
        const headingLines = contacts.querySelectorAll('.contacts-info h2 .line-content, .contacts-info h2 .word-content');
        const mainLines = contacts.querySelectorAll('.contacts-info h1 .line-content, .contacts-info h1 .word-content');
        const contactButton = contacts.querySelector('.contacts-info .reveal-image');
        const faqText = contacts.querySelector('.faqs > p');
        const faqButton = contacts.querySelector('.faqs .reveal-image');
        const caption = contacts.querySelector('.other-contact-info .image-caption-container');

        gsap.timeline({
            scrollTrigger: {
                trigger: contacts,
                start: 'top 72%',
                toggleActions: 'play none none none'
            }
        })
        .to(headingLines, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out'
        })
        .to(mainLines, {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.08,
            ease: 'power3.out'
        }, '-=0.45')
        .to(contactButton, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            onStart: () => contactButton?.classList.add('animated')
        }, '-=0.35')
        .to([faqText, faqButton, caption], {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.14,
            ease: 'power3.out',
            onStart: () => faqButton?.classList.add('animated')
        }, '-=0.15');
    }

    // Final refresh to ensure all triggers are aligned with split layouts
    ScrollTrigger.refresh();
}

window.AstralScrollReveal = {
    init: initAnimations
};

window.addEventListener('load', () => {
    // Ensure Lenis and other scripts settle
    prepareNavbarRevealText();

    if (document.querySelector('.loading-content')) return;

    setTimeout(initAnimations, 100);
});

window.addEventListener('astral:loader-complete', () => {
    setTimeout(initAnimations, 100);
});

// Refresh on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
