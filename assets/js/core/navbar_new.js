(function () {
    function initNavbar() {
        if (window.AstralLayout && typeof window.AstralLayout.initNavbarAnimations === 'function') {
            window.AstralLayout.initNavbarAnimations();
        }
    }

    window.AstralNavbar = {
        init: initNavbar
    };

    window.addEventListener('load', () => {
        setTimeout(initNavbar, 200);
    });
})();
