let people = document.querySelectorAll('.team .person');

people.forEach(person => {
    person.addEventListener('mouseover', function() {
        cursor.style.width = '10vw';
        cursor.style.height = '10vw';
        cursor.style.background = 'white';
        cursor.querySelector('p').innerHTML = 'CLICK';
        cursor.querySelector('p').style.opacity = 1;
    })
    
    person.addEventListener('mouseleave', function() {
        cursor.style.width = '1.5vw';
        cursor.style.height = '1.5vw';
        cursor.style.background = '#6A6BF4';
        cursor.querySelector('p').innerHTML = '';
        cursor.querySelector('p').style.opacity = 1;
    })
})