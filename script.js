/**
 * NOMAD'E — Image + Video Slideshow
 *
 * Supports a mix of images and videos.
 * Images display for 5 seconds each, videos play through fully.
 * Smooth crossfade transitions between all slides.
 */

const media = [
    { type: 'image', src: 'images/slideshow/figurine-earrings-closeup.jpg', alt: 'Silver figurine earrings close-up' },
    { type: 'image', src: 'images/slideshow/figurine-earrings-floral.jpg', alt: 'Silver figurine earrings on flower stem' },
    { type: 'image', src: 'images/slideshow/citrine-bracelet-oranges.jpg', alt: 'Silver chain bracelet with citrine crystals' },
    { type: 'image', src: 'images/slideshow/figurine-earrings-kumquat.jpg', alt: 'Silver figurine earrings on kumquat' },
    { type: 'image', src: 'images/slideshow/star-pin-ring-dark.jpg', alt: 'Silver safety pin ring with star' },
    { type: 'video', src: 'https://www.dropbox.com/scl/fi/eabhye1epnldtjy2dylp9/NomadeLA_Earrings.mp4?rlkey=4s20pbt255dmkbs1oopyy5i2m&st=y5cf1yx7&dl=1' }
];

// Shuffle array randomly (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

shuffleArray(media);

// Tagline rotation — synced with slide transitions
const taglines = [
    { desktop: 'LA born handmade jewelry for the visionary individual', mobile: 'LA born handmade jewelry<br>for the visionary individual' },
    { desktop: 'High-quality craftsmanship meets a creative soul', mobile: 'High-quality craftsmanship<br>meets a creative soul' }
];
let currentTagline = 0;

function getTagline(index) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    return isMobile ? taglines[index].mobile : taglines[index].desktop;
}

function cycleTagline() {
    const el = document.querySelector('.tagline');
    if (!el) return;
    el.classList.add('fade-out');
    setTimeout(() => {
        currentTagline = (currentTagline + 1) % taglines.length;
        el.innerHTML = getTagline(currentTagline);
        el.classList.remove('fade-out');
    }, 2000);
}

const slideshowContainer = document.querySelector('.slideshow');
let currentSlide = 0;
let slides = [];
let slideTimer = null;

// Create slide elements
media.forEach((item, index) => {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';

    if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
        img.loading = index === 0 ? 'eager' : 'lazy';
        slideDiv.appendChild(img);
    } else if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        video.muted = true;
        video.playsInline = true;
        video.loop = false;
        video.preload = index === 0 ? 'auto' : 'metadata';
        slideDiv.appendChild(video);
    }

    if (index === 0) {
        slideDiv.classList.add('active');
    }

    slideshowContainer.appendChild(slideDiv);
    slides.push({ div: slideDiv, config: item });
});

/**
 * Advance to the next slide
 */
function nextSlide() {
    clearTimeout(slideTimer);

    const currentEl = slides[currentSlide];

    // Pause video if leaving a video slide
    if (currentEl.config.type === 'video') {
        const video = currentEl.div.querySelector('video');
        if (video) video.pause();
    }

    // Fade out current slide and tagline together
    cycleTagline();
    currentEl.div.classList.remove('active');

    // Advance index
    currentSlide = (currentSlide + 1) % slides.length;

    const nextEl = slides[currentSlide];
    nextEl.div.classList.add('active');

    if (nextEl.config.type === 'video') {
        const video = nextEl.div.querySelector('video');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {
                // Video autoplay blocked — skip to next after 5s
                slideTimer = setTimeout(nextSlide, 5000);
            });
        }
    } else {
        // Image: show for 5 seconds
        slideTimer = setTimeout(nextSlide, 5000);
    }
}

/**
 * Start the slideshow
 */
function startSlideshow() {
    const first = slides[0];

    if (first.config.type === 'video') {
        const video = first.div.querySelector('video');
        if (video) {
            video.play().catch(() => {
                slideTimer = setTimeout(nextSlide, 5000);
            });
        }
    } else {
        slideTimer = setTimeout(nextSlide, 5000);
    }
}

// When a video ends, move to next slide
document.addEventListener('ended', function(e) {
    if (e.target.tagName === 'VIDEO') {
        nextSlide();
    }
}, true);

// Handle page visibility — pause/resume
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearTimeout(slideTimer);
        const current = slides[currentSlide];
        if (current.config.type === 'video') {
            const video = current.div.querySelector('video');
            if (video) video.pause();
        }
    } else {
        const current = slides[currentSlide];
        if (current.config.type === 'video') {
            const video = current.div.querySelector('video');
            if (video) video.play().catch(() => {});
        } else {
            slideTimer = setTimeout(nextSlide, 5000);
        }
    }
});

// Start when ready
startSlideshow();
