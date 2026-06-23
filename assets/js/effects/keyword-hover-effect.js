(function () {
    function initKeywordHover() {
        const reviewsDiv = document.querySelector('.reviews');
        const blob = document.querySelector('.blob');

        if (reviewsDiv && reviewsDiv.dataset.astralKeywordBlob !== 'true') {
            reviewsDiv.dataset.astralKeywordBlob = 'true';
            reviewsDiv.addEventListener('mouseover', () => {
                if (blob) blob.style.opacity = 0;
            });
            reviewsDiv.addEventListener('mouseleave', () => {
                if (blob) blob.style.opacity = 0.2;
            });
        }

        document.querySelectorAll('.review').forEach((review) => {
            if (review.dataset.astralKeywordHover === 'true') return;
            review.dataset.astralKeywordHover = 'true';

            review.addEventListener('mouseover', () => {
                const reviewImg = document.querySelector(`.${review.getAttribute('data-value')}`);
                const cursor = document.querySelector('.cursor');
                if (reviewImg) reviewImg.style.opacity = 0.5;
                if (cursor) {
                    cursor.style.width = 0;
                    cursor.style.height = 0;
                }
            });

            review.addEventListener('mousemove', (e) => {
                const reviewImg = document.querySelector(`.${review.getAttribute('data-value')}`);
                if (!reviewImg) return;

                reviewImg.animate({
                    top: `${e.pageY}px`,
                    left: `${e.pageX}px`
                }, { duration: 2000, fill: 'forwards' });
            });

            review.addEventListener('mouseleave', () => {
                const reviewImg = document.querySelector(`.${review.getAttribute('data-value')}`);
                const cursor = document.querySelector('.cursor');
                if (reviewImg) reviewImg.style.opacity = 0;
                if (cursor) {
                    cursor.style.width = '1.5vw';
                    cursor.style.height = '1.5vw';
                }
            });
        });
    }

    window.AstralKeywordHover = {
        init: initKeywordHover
    };

    initKeywordHover();
})();
