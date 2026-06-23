function styleNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > window.innerHeight * 0.8) {
        navbar.style.background = 'rgba(255,255,255,0.4)';
        navbar.style.backdropFilter = 'blur(40px)';
    } 
    else {
        navbar.style.background = 'none';
        navbar.style.backdropFilter = 'none';
    }
}

(function () {
    const script = document.currentScript || Array.from(document.scripts).find((item) => {
        const src = item.getAttribute('src') || '';
        return src.includes('assets/js/core/layout.js');
    });

    const scriptSrc = script ? script.getAttribute('src') || '' : '';
    const root = scriptSrc.includes('assets/js/core/layout.js')
        ? scriptSrc.split('assets/js/core/layout.js')[0]
        : '';
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isNestedPage = root.startsWith('../') || root.startsWith('..\\');

    const rootPath = (path) => `${root}${path}`;
    const assetPath = (path) => `${root}assets/${path}`;
    const isPage = (page) => currentPage === page.toLowerCase();
    const isSitePage = (page) => isPage(page) && !isNestedPage;

    function samePageLink(page, label, selector) {
        if (selector && isSitePage(page)) {
            return `<a class="reveal-text" onclick="goTo('${selector}');">${label}</a>`;
        }

        return `<a class="reveal-text" href="${rootPath(page)}">${label}</a>`;
    }

    function footerLink(page, label, selector) {
        if (selector && isSitePage(page)) {
            return `<a onclick="lenis.scrollTo('${selector}')" class="footer-link">${label}</a>`;
        }

        return `<a href="${rootPath(page)}" class="footer-link">${label}</a>`;
    }

    // ============================================================
    // NAVIGATION MENU HTML - Edit this function to modify navbar/menu
    // ============================================================
    function renderNav(slot) {
        const navClass = slot.dataset.navClass || '';
        const menuIcon = slot.dataset.navIcon === 'black' ? 'menu-icon-black.svg' : 'menu-icon-white.svg';
        const navClasses = ['navbar', navClass].filter(Boolean).join(' ');
        const logoLink = isSitePage('index.html')
            ? `<a onclick="lenis.scrollTo('.hero');">`
            : `<a href="${rootPath('index.html')}">`;

        return `
    <div class="${navClasses}">
        ${logoLink}
            <img src="${assetPath('icons/logo.svg')}" alt="" class="logo">
        </a>
        <button class="menu-icon" onclick="toggleMenu();">
            <div class="text">
                <p>Menu</p>
                <p>Close</p>
            </div>
            <div class="img-icon"><img src="${assetPath(`icons/${menuIcon}`)}" alt="" class="menu-img"></div>
        </button>
        <div class="menu">
            <div class="links">
                <div class="categories">
                    ${samePageLink('index.html', 'HOME', '.hero')}
                    <a onclick="toggleOptions('about-options');" class="reveal-text">ABOUT</a>
                    <a onclick="toggleOptions('work-options');" class="reveal-text">WORK</a>
                    <a onclick="toggleOptions('cohort-options');" class="reveal-text">COHORT</a>
                    ${samePageLink('apply.html', 'APPLY', '.hero')}
                    ${samePageLink('events.html', 'EVENTS', '.hero')}
                    ${samePageLink('support.html', 'SUPPORT', '.hero')}
                    ${samePageLink('contact.html', 'CONTACT', '.hero')}
                    ${samePageLink('faqs.html', 'FAQS', '.hero')}
                </div>
                <div class="submenu-container">
                    <div class="options">
                        <div class="about-options nav-options">
                            <a href="${rootPath('about.html')}" data-image="${assetPath('images/Classroom-shots/0F7A1294.jpg')}" class="reveal-text-single">Vision and Mission</a>
                            <a href="${rootPath('team.html')}" data-image="${assetPath('images/Mentors/all-mentors.jpg')}" class="reveal-text-single">Mentors</a>
                            <a href="${rootPath('student-reviews.html')}" data-image="${assetPath('images/Classroom-shots/0F7A1112.jpg')}" class="reveal-text-single">Student Reviews</a>
                            <a href="${rootPath('code-of-conduct.html')}" data-image="${assetPath('images/Classroom-shots/0F7A1132.jpg')}" class="reveal-text-single">Code of Conduct</a>
                        </div>
                        <div class="work-options nav-options">
                            <a href="${rootPath('projects.html')}" data-image="${assetPath('images/Projects/gravitational-waves.jpg')}" class="reveal-text-single">Projects</a>
                            <a href="${rootPath('tools.html')}" data-image="${assetPath('images/Projects/cmd-interactive-mockup-landscape.jpg')}" class="reveal-text-single">Online Tools</a>
                        </div>
                        <div class="cohort-options nav-options">
                            <a href="${rootPath('cohort.html')}" data-image="${assetPath('images/cohort/ASTRAL 2026/0F7A1077.jpg')}" class="reveal-text-single">Current ASTRAL Cohort</a>
                            <a href="${rootPath('past_cohorts.html')}" data-image="${assetPath('images/cohort/ASTRAL 2025/astral2025.jpg')}" class="reveal-text-single">Past ASTRAL Cohort</a>
                        </div>
                    </div>
                    <div class="options-image-display">
                        <img src="" alt="" class="options-image">
                    </div>
                </div>
            </div>
            <div class="social-media-section">
                <a href="https://www.linkedin.com/company/astral-institute" class="social-link underline-button reveal-image">
                    <div>
                        <div class="text-indicator">
                            <p>LinkedIn</p>
                            <p>LinkedIn</p>
                        </div>
                        <div class="img-indicator">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                        </div>
                    </div>
                </a>
                <a href="https://discord.gg/Yp6v8xcrT9" class="social-link underline-button reveal-image">
                    <div>
                        <div class="text-indicator">
                            <p>Discord</p>
                            <p>Discord</p>
                        </div>
                        <div class="img-indicator">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                        </div>
                    </div>
                </a>
                <a href="https://www.instagram.com/astral.institute/" class="social-link underline-button reveal-image">
                    <div>
                        <div class="text-indicator">
                            <p>Instagram</p>
                            <p>Instagram</p>
                        </div>
                        <div class="img-indicator">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                        </div>
                    </div>
                </a>
                <a href="mailto:mbailes@swin.edu.au" class="social-link underline-button reveal-image">
                    <div>
                        <div class="text-indicator">
                            <p>Email</p>
                            <p>Email</p>
                        </div>
                        <div class="img-indicator">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                            <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                        </div>
                    </div>
                </a>
                <div class="application-status reveal-image">
                    <p>Applications Closed</p>
                </div>
            </div>
        </div>
    </div>`;
    }

    // ============================================================
    // FOOTER HTML - Edit this function to modify the footer
    // ============================================================
    function renderFooter() {
        return `
        <div class="footer">
            <div class="supporters">
                <h2>ASTRAL is supported by</h2>
                <div class="partners">
                    <a href="https://www.swinburne.edu.au">
                        <img src="${assetPath('images/Miscellaneous/Logos/swin.jpg')}" alt="">
                    </a>
                    <a href="https://ozgrav.org">
                        <img src="${assetPath('images/Miscellaneous/Logos/ozgrav.png')}" alt="">
                    </a>
                </div>
            </div>
            <div class="final-info">
                <div class="copyright">
                    <p>We acknowledge and pay respects to the Elders and Traditional Owners of the land on which our program runs.</p>
                    <p>&copy; 2026. Astrophysics, Supercomputing, Technology, Research, Analytics, Leadership Institute (ASTRAL). All Rights Reserved. Designed and Developed by Rudra Sekhri.</p>
                    <p>Photo Credit to Carl Knox from OzGrav, NASA and ESA.</p>
                    <a class="underline-button" href="${rootPath('privacy-policy.html')}">
                        <div>
                            <div class="text-indicator">
                                <p>Privacy Policy</p>
                                <p>Privacy Policy</p>
                            </div>
                            <div class="img-indicator">
                                <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                                <img src="${assetPath('icons/arrow-link.svg')}" alt="">
                            </div>
                        </div>
                    </a>
                </div>
                <div class="socials">
                    <h2>Socials</h2>
                    <div class="links">
                        <a href="https://www.linkedin.com/company/astral-institute" class="footer-link">LinkedIn</a>
                        <a href="https://discord.gg/Yp6v8xcrT9" class="footer-link">Discord</a>
                        <a href="https://www.instagram.com/astral.institute/" class="footer-link">Instagram</a>
                        <a href="mailto:mbailes@swin.edu.au" class="footer-link">Email</a>
                    </div>
                </div>
                <div class="sitemap">
                    <h2>Sitemap</h2>
                    <div class="links">
                        ${footerLink('index.html', 'Home', '.hero')}
                        ${footerLink('about.html', 'About', '.hero')}
                        ${footerLink('projects.html', 'Projects', '.hero')}
                        ${footerLink('tools.html', 'Tools', '.hero')}
                        ${footerLink('cohort.html', 'Cohort', '.hero')}
                        ${footerLink('team.html', 'Mentors', '.hero')}
                        ${footerLink('apply.html', 'Apply', '.hero')}
                        ${footerLink('events.html', 'Events', '.hero')}
                        ${footerLink('support.html', 'Support', '.hero')}
                        ${footerLink('contact.html', 'Contact', '.hero')}
                        ${footerLink('faqs.html', 'FAQs', '.hero')}
                    </div>
                </div>
                <div class="back-to-top">
                    <a onclick="lenis.scrollTo('.hero')"><img src="${assetPath('icons/circle_arrow.svg')}" alt=""></a>
                </div>
            </div>
        </div>`;
    }

    document.querySelectorAll('[data-site-nav]').forEach((slot) => {
        slot.outerHTML = renderNav(slot);
    });

    document.querySelectorAll('[data-site-footer]').forEach((slot) => {
        slot.outerHTML = renderFooter();
    });

    // ============================================================
    // NAVBAR MENU INTERACTION FUNCTIONS
    // ============================================================
    
    window.toggleMenu = function() {
        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('activated');

        if (navbar.classList.contains('activated')) {
            if (window.menuTimeline) {
                window.menuTimeline.timeScale(1).restart();
            }
        } else {
            if (window.menuTimeline) {
                window.menuTimeline.timeScale(2).reverse();
            }
            
            const subOptions = document.querySelectorAll('.nav-options');
            const subUnits = document.querySelectorAll('.nav-options .line-content, .nav-options .word-content');
            
            subOptions.forEach(opt => opt.classList.remove('options-activated'));
            if (window.gsap) {
                gsap.set(subUnits, { y: '130%', opacity: 0 });
            }
            window.changeImage('');
        }
    };

    window.toggleOptions = function(optionsClass) {
        const optionsDiv = document.querySelector(`.${optionsClass}`);
        const allOptions = document.querySelectorAll('.nav-options');
        
        if (optionsDiv && optionsDiv.classList.contains('options-activated')) {
            const units = optionsDiv.querySelectorAll('.line-content, .word-content');
            if (window.gsap) {
                gsap.to(units, {
                    y: '130%',
                    opacity: 0,
                    duration: 0.4,
                    ease: "power3.in",
                    onComplete: () => {
                        optionsDiv.classList.remove('options-activated');
                    }
                });
            }
            window.changeImage('');
            return;
        }

        allOptions.forEach(opt => {
            if (opt.classList.contains('options-activated')) {
                const units = opt.querySelectorAll('.line-content, .word-content');
                if (window.gsap) {
                    gsap.set(units, { y: '130%', opacity: 0 });
                }
                opt.classList.remove('options-activated');
            }
        });
        
        window.changeImage('');
        
        if (optionsDiv) {
            optionsDiv.classList.add('options-activated');
            const units = optionsDiv.querySelectorAll('.line-content, .word-content');
            
            if (window.gsap) {
                gsap.set(units, { y: '130%', opacity: 0 });
                gsap.to(units, {
                    y: '0%',
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.04,
                    ease: "power3.out"
                });
            }
        }
    };

    window.changeImage = function(imageUrl) {
        const imageDisplay = document.querySelector('.options-image');
        if (!imageDisplay) return;

        imageDisplay.classList.remove('active');

        setTimeout(() => {
            if (imageUrl) {
                const tempImg = new Image();
                tempImg.onload = function() {
                    imageDisplay.src = imageUrl;
                    imageDisplay.classList.add('active');
                };
                tempImg.src = imageUrl;
            } else {
                imageDisplay.src = '';
            }
        }, 200);
    };

    // Initialize navbar animations on load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.gsap) {
                const navbar = document.querySelector('.navbar');
                const categories = document.querySelectorAll('.categories .reveal-text');
                const socials = document.querySelectorAll('.social-media-section .reveal-image');
                
                const categoryUnits = [];
                categories.forEach(cat => {
                    categoryUnits.push(...cat.querySelectorAll('.line-content, .word-content'));
                });

                window.menuTimeline = gsap.timeline({ paused: true });

                gsap.set(categoryUnits, { y: '130%', opacity: 0 });
                gsap.set(socials, { y: 10, opacity: 0 });

                window.menuTimeline
                    .to(categoryUnits, {
                        y: '0%',
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.05,
                        ease: "power3.out"
                    }, 0.35)
                    .to(socials, {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.08,
                        ease: "power2.out"
                    }, 0.6);
            }

            // Handle image display and star animation on hover
            document.querySelectorAll('.nav-options a').forEach(link => {
                link.addEventListener('mouseenter', function() {
                    const imageUrl = this.getAttribute('data-image');
                    window.changeImage(imageUrl);
                    this.classList.add('hovered');
                });
                link.addEventListener('mouseleave', function() {
                    this.classList.remove('hovered');
                });
            });

            // Handle CSS changes on scroll for navbar
            if (!document.querySelector('body').classList.contains('no-bg-page')) {
                window.addEventListener('scroll', () => {
                    styleNavbar();
                });
            }
        }, 200);
    });
})();
