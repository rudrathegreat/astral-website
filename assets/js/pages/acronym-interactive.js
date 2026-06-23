// Interactive acronym buttons with smooth animations

function getInteractiveMeasurementWidth(element) {
    if (!element) return 0;

    const computedStyle = window.getComputedStyle(element);
    const paddingX = parseFloat(computedStyle.paddingLeft || 0) + parseFloat(computedStyle.paddingRight || 0);
    const borderX = parseFloat(computedStyle.borderLeftWidth || 0) + parseFloat(computedStyle.borderRightWidth || 0);
    const availableWidth = element.clientWidth || element.offsetWidth || (element.parentElement ? element.parentElement.clientWidth : 0) || 0;

    return Math.max(1, Math.floor(availableWidth - paddingX - borderX));
}

function buildInteractiveLineFragment(element, text) {
    const cleanText = (text || '').replace(/\s+/g, ' ').trim();
    if (!cleanText) return { fragment: document.createDocumentFragment(), contents: [], text: '' };

    const computedStyle = window.getComputedStyle(element);
    const width = getInteractiveMeasurementWidth(element);
    const words = cleanText.split(' ').filter(Boolean);
    const measureContainer = document.createElement('div');
    const lineMeasure = document.createElement('span');
    const lines = [];
    let currentLine = '';

    measureContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${width}px;
        max-width: ${width}px;
        font: ${computedStyle.font};
        letter-spacing: ${computedStyle.letterSpacing};
        text-transform: ${computedStyle.textTransform};
        line-height: ${computedStyle.lineHeight};
        padding: ${computedStyle.padding};
        border: ${computedStyle.border};
        box-sizing: border-box;
        pointer-events: none;
        white-space: normal;
        word-break: ${computedStyle.wordBreak};
        overflow-wrap: ${computedStyle.overflowWrap};
    `;

    lineMeasure.style.cssText = 'display: inline-block; white-space: nowrap; visibility: hidden; position: absolute; left: -9999px; top: -9999px;';
    measureContainer.appendChild(lineMeasure);
    document.body.appendChild(measureContainer);

    const measureLineWidth = (candidate) => {
        lineMeasure.textContent = candidate;
        return lineMeasure.getBoundingClientRect().width;
    };

    words.forEach((word) => {
        const candidate = currentLine ? `${currentLine}\u00A0${word}` : word;
        const candidateWidth = measureLineWidth(candidate);

        if (currentLine && candidateWidth > width) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = candidate;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    document.body.removeChild(measureContainer);

    const fragment = document.createDocumentFragment();
    const contents = [];

    lines.forEach((lineText) => {
        const mask = document.createElement('span');
        const content = document.createElement('span');

        mask.className = 'interactive-line-mask';
        content.className = 'interactive-line-content';
        content.style.whiteSpace = 'pre-wrap';

        const lineWords = lineText.split('\u00A0').filter(Boolean);
        lineWords.forEach((word, index) => {
            if (index > 0) {
                content.appendChild(document.createTextNode('\u00A0'));
            }
            content.appendChild(document.createTextNode(word));
        });

        mask.appendChild(content);
        fragment.appendChild(mask);
        contents.push(content);
    });

    return { fragment, contents, text: cleanText };
}

function runAfterLayoutStabilization(callback) {
    const applyCallback = () => {
        if (document.fonts && typeof document.fonts.ready?.then === 'function') {
            document.fonts.ready.then(() => requestAnimationFrame(callback));
            return;
        }

        requestAnimationFrame(callback);
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        applyCallback();
    } else {
        window.addEventListener('load', applyCallback, { once: true });
    }
}

function splitInteractiveTextIntoLines(element, text) {
    const lineData = buildInteractiveLineFragment(element, text);

    element.innerHTML = '';
    element.dataset.currentText = lineData.text;
    element.dataset.interactiveTextSplit = 'true';
    element.appendChild(lineData.fragment);

    return lineData.contents;
}

function reflowInteractiveTextElements() {
    const elements = document.querySelectorAll('[data-interactive-text-split="true"]');

    elements.forEach((element) => {
        if (!element.dataset.currentText) return;
        splitInteractiveTextIntoLines(element, element.dataset.currentText);
    });
}

function initInteractiveTextResizeHandling() {
    let resizeFrame = null;

    const handleResize = () => {
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            reflowInteractiveTextElements();
        });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleResize);
}

function getInteractiveLines(element) {
    let lines = Array.from(element.querySelectorAll('.interactive-line-content, .line-content, .word-content'));

    if (!lines.length) {
        lines = splitInteractiveTextIntoLines(element, element.dataset.currentText || element.textContent);
    }

    return lines;
}

function animateLineTextSwap(element, nextText) {
    const currentLines = getInteractiveLines(element);
    const nextLineData = buildInteractiveLineFragment(element, nextText);
    const tl = gsap.timeline();

    tl.to([...currentLines].reverse(), {
        opacity: 0,
        y: 22,
        duration: 0.32,
        stagger: 0.045,
        ease: 'power2.inOut'
    })
    .add(() => {
        element.innerHTML = '';
        element.dataset.currentText = nextLineData.text;
        element.appendChild(nextLineData.fragment);
        gsap.set(nextLineData.contents, { opacity: 0, y: 24 });
    })
    .to(nextLineData.contents, {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.055,
        ease: 'power3.out'
    });

    return tl;
}

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
    });
}

function initAcronymButtons() {
    const buttons = document.querySelectorAll('.acronym-button');
    const acronymText = document.querySelector('.acronym-text');
    const acronymImage = document.querySelector('.acronym-image');
    const acronymCaption = document.querySelector('.acronym-content .image-caption');
    const leftColumn = document.querySelector('.acronym-content .left-column');
    const rightColumn = document.querySelector('.acronym-content .right-column');

    if (!buttons.length || !acronymText || !acronymImage || !acronymCaption || !window.gsap) return;
    if (acronymText.dataset.astralAcronymInit === 'true') return;
    acronymText.dataset.astralAcronymInit = 'true';

    const activeButton = document.querySelector('.acronym-button.active') || buttons[0];
    activeButton.classList.add('active');
    splitInteractiveTextIntoLines(acronymCaption, activeButton.dataset.caption || acronymCaption.textContent);

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Get data from clicked button
            const text = button.dataset.text;
            const image = button.dataset.image;
            const caption = button.dataset.caption || acronymCaption.dataset.currentText || acronymCaption.textContent;

            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Animate out
            const tl = gsap.timeline();

            tl.add(animateLineTextSwap(acronymText, text), 0)
            .add(animateLineTextSwap(acronymCaption, caption), 0.04)
            .to(acronymImage, {
                opacity: 0,
                y: 16,
                duration: 0.35,
                ease: 'power2.inOut'
            }, 0.05)
            .add(() => {
                gsap.set(acronymImage, { opacity: 0 });
                preloadImage(image)
                    .then(() => {
                        acronymImage.src = image;
                    })
                    .catch(() => {
                        acronymImage.src = image;
                    })
                    .finally(() => {
                        gsap.to(acronymImage, {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            ease: 'power2.out'
                        });
                    });
            });
        });
    });
}

function initStudentReviews() {
    const students = document.querySelectorAll('.student-reviews .student');
    const reviewText = document.querySelector('.student-reviews div.review > p.review');
    const reviewImage = document.querySelector('.student-reviews img.review');

    if (!students.length || !reviewText || !reviewImage || !window.gsap) return;
    if (reviewText.dataset.astralReviewInit === 'true') return;
    reviewText.dataset.astralReviewInit = 'true';
    reviewText.dataset.interactiveRevealOwner = 'true';
    reviewText.classList.add('processed');

    const setReviewContent = (student) => {
        const applyReviewContent = () => {
            splitInteractiveTextIntoLines(reviewText, student.dataset.text);
            reviewText.classList.add('processed');
            reviewImage.src = student.dataset.image;
            reviewImage.alt = `${student.querySelector('.name').textContent} review`;
        };

        runAfterLayoutStabilization(applyReviewContent);
    };

    const activeStudent = document.querySelector('.student-reviews .student.active') || students[0];
    activeStudent.classList.add('active');
    setReviewContent(activeStudent);

    const selectStudent = (student) => {
        if (student.classList.contains('active')) return;

        students.forEach(item => item.classList.remove('active'));
        student.classList.add('active');

        const tl = gsap.timeline();

        tl.add(animateLineTextSwap(reviewText, student.dataset.text), 0)
        .to(reviewImage, {
            opacity: 0,
            y: 18,
            duration: 0.35,
            ease: 'power2.inOut'
        }, 0)
        .add(() => {
            gsap.set(reviewImage, { opacity: 0 });
            const image = student.dataset.image;
            const altText = `${student.querySelector('.name').textContent} review`;

            preloadImage(image)
                .then(() => {
                    reviewImage.src = image;
                    reviewImage.alt = altText;
                })
                .catch(() => {
                    reviewImage.src = image;
                    reviewImage.alt = altText;
                })
                .finally(() => {
                    gsap.to(reviewImage, {
                        opacity: 1,
                        y: 0,
                        duration: 0.52,
                        ease: 'power2.out'
                    });
                });
        });
    };

    students.forEach(student => {
        student.addEventListener('click', () => selectStudent(student));
        student.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            e.preventDefault();
            selectStudent(student);
        });
    });
}

function initInteractiveSections() {
    initAcronymButtons();
    initStudentReviews();
    initInteractiveTextResizeHandling();
}

window.AstralAcronymInteractive = {
    init: initInteractiveSections
};

// Initialize on load or when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveSections, { once: true });
} else {
    initInteractiveSections();
}
