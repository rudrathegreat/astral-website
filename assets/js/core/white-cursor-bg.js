(function () {
    function initWhiteCursorBg() {
        document.querySelectorAll('.with-bg').forEach((section) => {
            if (section.dataset.astralWhiteCursor === 'true') return;
            section.dataset.astralWhiteCursor = 'true';

            section.addEventListener('mouseover', () => {
                const cursor = document.querySelector('.cursor');
                if (cursor) cursor.style.background = 'white';
            });

            section.addEventListener('mouseleave', () => {
                const cursor = document.querySelector('.cursor');
                if (cursor) cursor.style.background = '#6A6BF4';
            });
        });
    }

    window.AstralWhiteCursorBg = {
        init: initWhiteCursorBg
    };

    initWhiteCursorBg();
})();
