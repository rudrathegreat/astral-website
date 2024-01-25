track.addEventListener('mouseover', function() {
    cursor.style.width = '10vw';
    cursor.style.height = '5vw';
    cursor.style.background = 'white';
    blob.style.opacity = 0;
    cursor.querySelector('.arrows').style.opacity = 1;
})

track.addEventListener('mouseleave', function() {
    cursor.style.width = '1.5vw';
    cursor.style.height = '1.5vw';
    cursor.style.background = '#6A6BF4';
    blob.style.opacity = 0.2;
    cursor.querySelector('.arrows').style.opacity = 0;
})
