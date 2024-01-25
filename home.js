video.addEventListener('mouseover', function() {
    cursor.style.width = '10vw';
    cursor.style.height = '10vw';
    cursor.style.background = 'white';
    cursor.querySelector('p').innerHTML = 'UNMUTE';
    cursor.querySelector('p').style.opacity = 1;
})

video.addEventListener('mouseleave', function() {
    cursor.style.width = '1.5vw';
    cursor.style.height = '1.5vw';
    cursor.style.background = '#6A6BF4';
    cursor.querySelector('p').innerHTML = '';
    cursor.querySelector('p').style.opacity = 1;
})

let astrophysics_img = document.querySelector('#astrophysics');

let supercomputing_tag = document.querySelector('.supercomputing');
let supercomputing_img = document.querySelector('#supercomputing');

let technology_tag = document.querySelector('.technology');
let technology_img = document.querySelector('#technology');

let research_tag = document.querySelector('.research');
let research_img = document.querySelector('#research');

let analytics_tag = document.querySelector('.analytics');
let analytics_img = document.querySelector('#analytics');

let leadership_tag = document.querySelector('.leadership');
let leadership_img = document.querySelector('#leadership');

let astrophysics_tag = document.querySelector('.astrophysics');
let whoweare_div = document.querySelector('.who-we-are');

whoweare_div.addEventListener('mouseover', function(e) {
    blob.style.opacity = 0;
})

whoweare_div.addEventListener('mouseleave', function() {
    blob.style.opacity = 0.2;
})

astrophysics_tag.addEventListener('mouseover', function(e) {
    astrophysics_img.style.opacity = 0.7;
})

astrophysics_tag.addEventListener('mousemove', function(e) {
    astrophysics_img.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:2000, fill:'forwards'});
})

astrophysics_tag.addEventListener('mouseleave', function() {
    astrophysics_img.style.opacity = 0;
})

supercomputing_tag.addEventListener('mouseover', function(e) {
    supercomputing_img.style.opacity = 0.7;
})

supercomputing_tag.addEventListener('mousemove', function(e) {
    supercomputing_img.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:2000, fill:'forwards'});
})

supercomputing_tag.addEventListener('mouseleave', function() {
    supercomputing_img.style.opacity = 0;
})

technology_tag.addEventListener('mouseover', function(e) {
    technology_img.style.opacity = 0.7;
})

technology_tag.addEventListener('mousemove', function(e) {
    technology_img.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:2000, fill:'forwards'});
})

technology_tag.addEventListener('mouseleave', function() {
    technology_img.style.opacity = 0;
})

research_tag.addEventListener('mouseover', function(e) {
    research_img.style.opacity = 0.7;
})

research_tag.addEventListener('mousemove', function(e) {
    research_img.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:2000, fill:'forwards'});
})

research_tag.addEventListener('mouseleave', function() {
    research_img.style.opacity = 0;
})

leadership_tag.addEventListener('mouseover', function(e) {
    leadership_img.style.opacity = 0.7;
})

leadership_tag.addEventListener('mousemove', function(e) {
    leadership_img.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:2000, fill:'forwards'});
})

leadership_tag.addEventListener('mouseleave', function() {
    leadership_img.style.opacity = 0;
})

analytics_tag.addEventListener('mouseover', function(e) {
    analytics_img.style.opacity = 0.7;
})

analytics_tag.addEventListener('mousemove', function(e) {
    analytics_img.animate({
        top:e.pageY + 'px',
        left:e.pageX + 'px'
    }, {duration:2000, fill:'forwards'});
})

analytics_tag.addEventListener('mouseleave', function() {
    analytics_img.style.opacity = 0;
})

whoweare_div.addEventListener('mouseover', function(e) {
    blob.style.opacity = 0;
})

whoweare_div.addEventListener('mouseleave', function() {
    blob.style.opacity = 0.2;
})

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
