let cursor = document.querySelector('.cursor');
let blob = document.querySelector('.blob');
let video = document.querySelector('.video video');
let images = document.querySelectorAll('.image .grid-effect');
let underline_links = document.querySelectorAll('.underline-button');
let tictac_links = document.querySelectorAll('.round-button');
let projects_div = document.querySelector('.projects');
footer_links = document.querySelectorAll('.footer a');

window.addEventListener('mousemove', function(e) {
    cursor.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:1000, fill:'forwards'});
    blob.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:7000, fill:'forwards'});
});

images.forEach(image => {
    image.addEventListener('mouseover', function() {
        cursor.style.background = 'white';
    })

    image.addEventListener('mouseleave', function() {
        cursor.style.background = '#6A6BF4';
    })
})

underline_links.forEach(link => {
    link.addEventListener('mouseover', function() {
        cursor.style.width = 0;
        cursor.style.height = 0;
    })

    link.addEventListener('mouseleave', function() {
        cursor.style.width = '1.5vw';
        cursor.style.height = '1.5vw';
    })
})

footer_links.forEach(link => {
    link.addEventListener('mouseover', function() {
        cursor.style.width = 0;
        cursor.style.height = 0;
    })

    link.addEventListener('mouseleave', function() {
        cursor.style.width = '1.5vw';
        cursor.style.height = '1.5vw';
    })
})

tictac_links.forEach(link => {
    link.addEventListener('mouseover', function() {
        cursor.style.width = 0;
        cursor.style.height = 0;
    })

    link.addEventListener('mouseleave', function() {
        cursor.style.width = '1.5vw';
        cursor.style.height = '1.5vw';
    })
})