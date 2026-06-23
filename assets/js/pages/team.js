(function () {
    function cursorElements() {
        return {
            cursor: document.querySelector('.cursor'),
            cursorText: document.querySelector('.cursor p')
        };
    }

    function initTeamHover() {
        document.querySelectorAll('.team .person').forEach((person) => {
            if (person.dataset.astralTeamHover === 'true') return;
            person.dataset.astralTeamHover = 'true';

            person.addEventListener('mouseover', () => {
                const { cursor, cursorText } = cursorElements();
                if (!cursor) return;
                cursor.style.width = '10vw';
                cursor.style.height = '10vw';
                cursor.style.background = 'white';
                if (cursorText) {
                    cursorText.innerHTML = 'Click';
                    cursorText.style.opacity = 1;
                }
            });

            person.addEventListener('mouseleave', () => {
                const { cursor, cursorText } = cursorElements();
                if (!cursor) return;
                cursor.style.width = '1.5vw';
                cursor.style.height = '1.5vw';
                cursor.style.background = '#6A6BF4';
                if (cursorText) {
                    cursorText.innerHTML = '';
                    cursorText.style.opacity = 1;
                }
            });
        });
    }

    window.AstralTeam = {
        init: initTeamHover
    };

    initTeamHover();
})();
