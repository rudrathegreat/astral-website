let cursor = document.querySelector('.cursor');
let blob = document.querySelector('.blob');
let video = document.querySelector('.video video');
let images = document.querySelectorAll('.image .grid-effect');
let underline_links = document.querySelectorAll('.underline-button');
let tictac_links = document.querySelectorAll('.round-button');
let projects_div = document.querySelector('.projects');
footer_links = document.querySelectorAll('.footer a');

// Improve performance: use a single requestAnimationFrame loop for the blob
// and GPU-accelerated transforms. Throttle pointer events and avoid
// continuous element.animate calls which can queue heavy work.
let mouseX = 0, mouseY = 0;
// Initialize blob position to center of viewport to match CSS initial state
let blobX = window.innerWidth / 2, blobY = window.innerHeight / 2;
let blobAnimating = false;

// Prefer client coordinates and passive listener for better performance
window.addEventListener('mousemove', function(e) {
    // update cursor using a smoother CSS transition via transform where possible
    // keep the existing cursor.animate for larger, less-frequent updates
    cursor.animate({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
    }, { duration: 500, fill: 'forwards' });

    // use page coordinates so values include scroll offset and match CSS positioning
    mouseX = e.pageX;
    mouseY = e.pageY;

    if (!blobAnimating) {
        blobAnimating = true;
        requestAnimationFrame(updateBlob);
    }
}, { passive: true });

// Hint the browser about the properties we'll update
if (blob) {
    blob.style.willChange = 'left, top, opacity';
    // position blob at center initially
    blob.style.left = blobX + 'px';
    blob.style.top = blobY + 'px';
}

function updateBlob() {
    // simple easing for smooth follow effect
    const ease = 0.05;
    blobX += (mouseX - blobX) * ease;
    blobY += (mouseY - blobY) * ease;

    // Use page coordinates and set left/top. CSS already applies
    // `transform: translate(-50%, -50%)` so setting left/top to the
    // pointer position will center the blob correctly.
    blob.style.left = blobX + 'px';
    blob.style.top = blobY + 'px';

    // continue the loop while the blob is still moving noticeably
    const dx = Math.abs(blobX - mouseX);
    const dy = Math.abs(blobY - mouseY);
    if (dx > 0.5 || dy > 0.5) {
        requestAnimationFrame(updateBlob);
    } else {
        blobAnimating = false;
    }
}

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

// Check how much performant the device has, and if the performance is low, disable the blob in the background
if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency < 10) {
        blob.style.display = 'none';
    }
} else {
    // If the browser doesn't support hardwareConcurrency, assume it's a low-performance device
    blob.style.display = 'none';
}
