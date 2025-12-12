track.addEventListener('mouseover', function() {
    cursor.style.width = '10vw';
    cursor.style.height = '10vw';
    cursor.style.background = 'white';
    cursor.querySelector('p').innerHTML = 'Click and Drag';
    cursor.querySelector('p').style.opacity = 1;
    blob.style.opacity = 0;
})

track.addEventListener('mouseleave', function() {
    cursor.style.width = '1.5vw';
    cursor.style.height = '1.5vw';
    cursor.style.background = '#6A6BF4';
    blob.style.opacity = 0.2;
    cursor.querySelector('p').style.opacity = 0;
})