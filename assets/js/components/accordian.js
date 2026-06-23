(function () {
    function initAccordion() {
        document.querySelectorAll('.services a').forEach((item) => {
            if (item.dataset.astralAccordionInit === 'true') return;
            item.dataset.astralAccordionInit = 'true';

            item.addEventListener('click', function () {
                this.classList.toggle('active');
                const panel = this.nextElementSibling;
                if (!panel) return;

                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = `${panel.scrollHeight + 50}px`;
                }
            });
        });
    }

    window.AstralAccordion = {
        init: initAccordion
    };

    initAccordion();
})();
