// js/script.js
(function() {
    'use strict';

    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const burger = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            const expanded = burger.getAttribute('aria-expanded') === 'true' ? false : true;
            burger.setAttribute('aria-expanded', expanded);
            mobileMenu.classList.toggle('active');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const animatedElements = document.querySelectorAll('.animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });
    animatedElements.forEach(el => observer.observe(el));

    const slider = document.getElementById('gallerySlider');
    const track = document.getElementById('galleryTrack');
    const slides = Array.from(document.querySelectorAll('.gallery__slide'));
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const dotsContainer = document.getElementById('galleryDots');

    if (slider && track && slides.length) {
        let currentIndex = 0;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let isDragging = false;
        let animationID = 0;

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.classList.add('gallery__dot');
                dot.addEventListener('click', () => goToSlide(idx));
                if (idx === currentIndex) dot.classList.add('active');
                dotsContainer.appendChild(dot);
            });
        }

        function goToSlide(index) {
            if (index < 0) index = 0;
            if (index >= slides.length) index = slides.length - 1;
            currentIndex = index;
            const shift = -slider.clientWidth * currentIndex;
            track.style.transform = `translateX(${shift}px)`;
            currentTranslate = shift;
            prevTranslate = shift;
            updateDots();
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        function touchStart(e) {
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            isDragging = true;
            animationID = requestAnimationFrame(animation);
            slider.style.cursor = 'grabbing';
        }
        function touchMove(e) {
            if (!isDragging) return;
            const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            currentTranslate = prevTranslate + (currentX - startX);
        }
        function touchEnd() {
            cancelAnimationFrame(animationID);
            isDragging = false;
            slider.style.cursor = 'grab';
            const movedBy = currentTranslate - prevTranslate;
            const threshold = slider.clientWidth * 0.2;
            if (movedBy < -threshold && currentIndex < slides.length - 1) currentIndex++;
            else if (movedBy > threshold && currentIndex > 0) currentIndex--;
            goToSlide(currentIndex);
            prevTranslate = -slider.clientWidth * currentIndex;
        }
        function animation() { if (isDragging) { track.style.transform = `translateX(${currentTranslate}px)`; animationID = requestAnimationFrame(animation); } }

        slider.addEventListener('touchstart', touchStart, { passive: true });
        slider.addEventListener('touchmove', touchMove, { passive: false });
        slider.addEventListener('touchend', touchEnd);
        slider.addEventListener('mousedown', touchStart);
        slider.addEventListener('mousemove', touchMove);
        slider.addEventListener('mouseup', touchEnd);
        slider.addEventListener('mouseleave', () => { if (isDragging) touchEnd(); });
        slider.style.cursor = 'grab';
        window.addEventListener('resize', () => goToSlide(currentIndex));
        updateDots();
        goToSlide(0);
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => { lightbox.classList.remove('active'); document.body.style.overflow = ''; });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
    }
    document.querySelectorAll('.gallery-card img, .before-after-item img').forEach(img => {
        img.addEventListener('click', () => openLightbox(img.src));
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            const target = document.querySelector(href);
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = form.querySelector('input[name="phone"]');
            if (phone && !phone.value.trim()) { alert('Укажите телефон'); return; }
            alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
            form.reset();
        });
    }

    function initMap() {
        if (typeof ymaps !== 'undefined') {
            ymaps.ready(() => {
                const mapContainer = document.getElementById('yandexMap');
                if (!mapContainer) return;
                const map = new ymaps.Map(mapContainer, {
                    center: [56.187907, 36.980496],
                    zoom: 16,
                    controls: ['zoomControl', 'fullscreenControl']
                });
                const placemark = new ymaps.Placemark([56.187907, 36.980496], {
                    hintContent: 'Студия отбеливания «Улыбка»',
                    balloonContent: 'ул. Банковская, 4'
                }, {
                    preset: 'islands#blueIcon'
                });
                map.geoObjects.add(placemark);
            });
        }
    }

    if (document.getElementById('yandexMap')) {
        if (typeof ymaps === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ваш_api_ключ&lang=ru_RU';
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }
})();