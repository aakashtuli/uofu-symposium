'use strict';

const TOTAL_SLIDES = 7;
let currentIndex = 0;
let isAnimating = false;

// DOM refs
const progressBar = document.getElementById('progressBar');
const currentSlideEl = document.getElementById('currentSlide');
const totalSlidesEl = document.getElementById('totalSlides');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slides = document.querySelectorAll('.slide');
const keyboardHint = document.getElementById('keyboardHint');

// Set total count
totalSlidesEl.textContent = TOTAL_SLIDES;

/* ─────────────────────────────────────────────
   CORE NAVIGATION
──────────────────────────────────────────────*/
function goToSlide(index, direction = 1) {
    if (isAnimating || index === currentIndex) return;
    if (index < 0 || index >= TOTAL_SLIDES) return;

    isAnimating = true;

    const currentSlide = slides[currentIndex];
    const nextSlide = slides[index];

    // Set entering slide starting position
    nextSlide.style.transform = direction > 0 ? 'translateX(40px)' : 'translateX(-40px)';
    nextSlide.style.opacity = '0';
    nextSlide.style.pointerEvents = 'none';

    // Start transition
    requestAnimationFrame(() => {
        // Move current out
        currentSlide.style.transform = direction > 0 ? 'translateX(-40px)' : 'translateX(40px)';
        currentSlide.style.opacity = '0';

        // Bring next in
        requestAnimationFrame(() => {
            nextSlide.style.transform = 'translateX(0)';
            nextSlide.style.opacity = '1';
        });
    });

    // Clean up after transition
    const DURATION = 680;
    setTimeout(() => {
        currentSlide.classList.remove('active');
        currentSlide.style.transform = '';
        currentSlide.style.opacity = '';
        currentSlide.style.pointerEvents = '';

        nextSlide.classList.add('active');
        nextSlide.style.transform = '';
        nextSlide.style.opacity = '';
        nextSlide.style.pointerEvents = '';

        currentIndex = index;
        updateUI();
        isAnimating = false;
    }, DURATION);
}

function goNext() { goToSlide(currentIndex + 1, 1); }
function goPrev() { goToSlide(currentIndex - 1, -1); }

/* ─────────────────────────────────────────────
   UI UPDATES
──────────────────────────────────────────────*/
function updateUI() {
    currentSlideEl.textContent = currentIndex + 1;

    // Progress bar
    const pct = ((currentIndex) / (TOTAL_SLIDES - 1)) * 100;
    progressBar.style.width = `${pct}%`;

    // Buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === TOTAL_SLIDES - 1;
}

/* ─────────────────────────────────────────────
   EVENT LISTENERS
──────────────────────────────────────────────*/
nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            goNext();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            goPrev();
            break;
        case 'Home':
            goToSlide(0, -1);
            break;
        case 'End':
            goToSlide(TOTAL_SLIDES - 1, 1);
            break;
    }
});

// Swipe support
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? goNext() : goPrev();
    }
}, { passive: true });

// Hide keyboard hint after first navigation
let hintHidden = false;
function hideHint() {
    if (!hintHidden) {
        hintHidden = true;
        keyboardHint.classList.add('hidden');
    }
}
document.addEventListener('keydown', hideHint, { once: false });
nextBtn.addEventListener('click', hideHint, { once: true });
setTimeout(() => keyboardHint.classList.add('hidden'), 6000);

/* ─────────────────────────────────────────────
   ENTRANCE ANIMATIONS PER SLIDE
──────────────────────────────────────────────*/
function animateSlide(index) {
    const slide = slides[index];
    const animatables = slide.querySelectorAll(
        '.pillar-card, .var-card, .ip-card, .role-card, .hd-card, ' +
        '.tank-segment, .venn-circle'
    );
    animatables.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
        el.style.transition = 'none';
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '';
            el.style.transform = '';
        }, 100 + i * 60);
    });
}

// Observe active slide changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
            const el = m.target;
            if (el.classList.contains('active')) {
                const idx = Array.from(slides).indexOf(el);
                if (idx > 0) animateSlide(idx);
            }
        }
    });
});

slides.forEach((slide) => {
    observer.observe(slide, { attributes: true });
});

/* ─────────────────────────────────────────────
   INIT
──────────────────────────────────────────────*/
updateUI();
