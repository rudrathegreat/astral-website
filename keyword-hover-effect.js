let reviews_div = document.querySelector('.reviews');

reviews_div.addEventListener('mouseover', function(e) {
    blob.style.opacity = 0;
})

reviews_div.addEventListener('mouseleave', function() {
    blob.style.opacity = 0.2;
})

document.querySelectorAll('.review').forEach(review => {
    review.addEventListener('mouseover', function(e) {
        review_img = document.querySelector('.'+review.getAttribute('data-value'));
        review_img.style.opacity = 0.5;
        cursor.style.width = 0;
        cursor.style.height = 0;
    })
    
    review.addEventListener('mousemove', function(e) {
        review_img = document.querySelector('.'+review.getAttribute('data-value'));
        review_img.animate({
            top:e.pageY + 'px',
            left:e.pageX + 'px'
        }, {duration:2000, fill:'forwards'});
    })
    
    review.addEventListener('mouseleave', function() {
        review_img = document.querySelector('.'+review.getAttribute('data-value'));
        review_img.style.opacity = 0;
        cursor.style.width = "1.5vw";
        cursor.style.height = "1.5vw";
    })
})