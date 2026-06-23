(function () {
    let scrollBound = false;

    function updateContactsSection() {
        const contactBg = document.querySelector('.contacts');
        if (!contactBg) return;

        const scrollRatio = window.scrollY / window.innerHeight;

        if (scrollRatio < 9) {
            contactBg.style.width = '98vw';
            contactBg.style.height = '98vh';
            contactBg.style.borderRadius = '2vw';
            contactBg.style.margin = '1vh 1vw';
            return;
        }

        if (scrollRatio > 10) {
            contactBg.style.width = '100vw';
            contactBg.style.height = '100vh';
            contactBg.style.borderRadius = '0vw';
            contactBg.style.margin = '0vh 0vw';
            return;
        }

        const width = ((scrollRatio - 9) * 2) + 98;
        const left = 1 - (scrollRatio - 9);
        const borderRadius = 2 - ((scrollRatio - 9) * 2);

        contactBg.style.width = `${width}vw`;
        contactBg.style.height = `${width}vh`;
        contactBg.style.margin = `${left}vh ${left}vw`;
        contactBg.style.borderRadius = `${borderRadius}vw`;
    }

    function initContactsSection() {
        if (scrollBound) return;
        scrollBound = true;
        window.addEventListener('scroll', updateContactsSection, { passive: true });
        updateContactsSection();
    }

    window.AstralContactsSection = {
        init: initContactsSection
    };

    initContactsSection();
})();
