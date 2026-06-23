(function () {
    function initApplyGridEffect() {
        const wrapper = document.querySelector('.apply .effect-container');
        const wrapperGrid = document.querySelector('.apply .effect-container .grid-effect');
        if (!wrapper || !wrapperGrid) return;

        function createTile() {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.style.opacity = 0.3;
            return tile;
        }

        function createGrid() {
            wrapperGrid.innerHTML = '';
            const size = 100;
            const columns = Math.floor(wrapper.clientWidth / size);
            const rows = Math.floor(wrapper.clientHeight / size);

            wrapperGrid.style.setProperty('--columns', columns);
            wrapperGrid.style.setProperty('--rows', rows);

            Array.from({ length: columns * rows }).forEach(() => {
                wrapperGrid.appendChild(createTile());
            });
        }

        createGrid();

        if (wrapperGrid.dataset.astralApplyGridResize !== 'true') {
            wrapperGrid.dataset.astralApplyGridResize = 'true';
            window.addEventListener('resize', createGrid);
        }
    }

    window.AstralApplyGridEffect = {
        init: initApplyGridEffect
    };

    initApplyGridEffect();
})();
