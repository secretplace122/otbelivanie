// js/script.js
(function() {
    'use strict';

    const nameInputEl = document.querySelector('input[name="name"]');
    if (nameInputEl) nameInputEl.setAttribute('maxlength', '30');
    const messageTextarea = document.querySelector('textarea[name="message"]');
    if (messageTextarea) messageTextarea.setAttribute('maxlength', '500');

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

    function applyPhoneMask(input) {
        let previousDigits = '';

        input.addEventListener('input', function(e) {
            let cursorPos = input.selectionStart;
            let value = input.value;
            let digits = value.replace(/\D/g, '');

            if (!digits.startsWith('7') && digits.length > 0) {
                digits = '7' + digits;
            }
            digits = digits.slice(0, 11);
            const newDigits = digits;

            const isDigitAdded = newDigits.length > previousDigits.length;
            const isDigitRemoved = newDigits.length < previousDigits.length;

            let formatted = '+7';
            if (newDigits.length > 1) formatted += ' (' + newDigits.substring(1, 4);
            if (newDigits.length >= 4) formatted += ') ' + newDigits.substring(4, 7);
            if (newDigits.length >= 7) formatted += '-' + newDigits.substring(7, 9);
            if (newDigits.length >= 9) formatted += '-' + newDigits.substring(9, 11);

            input.value = formatted;

            let newCursorPos = cursorPos;
            if (isDigitAdded) {
                let digitCount = 0;
                for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted[i])) {
                        digitCount++;
                        if (digitCount === newDigits.length) {
                            newCursorPos = i + 1;
                            break;
                        }
                    }
                }
            } else if (isDigitRemoved) {
                let digitCount = 0;
                for (let i = formatted.length - 1; i >= 0; i--) {
                    if (/\d/.test(formatted[i])) {
                        digitCount++;
                        if (digitCount === newDigits.length) {
                            newCursorPos = i + 1;
                            break;
                        }
                    }
                }
                if (newDigits.length === 0) newCursorPos = 2;
            } else {
                let digitCount = 0;
                for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted[i])) {
                        digitCount++;
                        if (digitCount === previousDigits.length && previousDigits.length <= newDigits.length) {
                            newCursorPos = i + 1;
                            break;
                        }
                    }
                }
            }
            newCursorPos = Math.min(formatted.length, Math.max(2, newCursorPos));
            input.setSelectionRange(newCursorPos, newCursorPos);
            previousDigits = newDigits;
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const cursorPos = input.selectionStart;
                const value = input.value;
                let digits = value.replace(/\D/g, '');
                let posInDigits = 0;
                for (let i = 0; i < cursorPos && i < value.length; i++) {
                    if (/\d/.test(value[i])) posInDigits++;
                }
                if (e.key === 'Backspace' && posInDigits > 0) {
                    posInDigits--;
                } else if (e.key === 'Delete' && posInDigits < digits.length) {
                } else {
                    e.preventDefault();
                    return;
                }
                const newDigits = digits.slice(0, posInDigits) + digits.slice(posInDigits + 1);
                let formatted = '+7';
                if (newDigits.length > 1) formatted += ' (' + newDigits.substring(1, 4);
                if (newDigits.length >= 4) formatted += ') ' + newDigits.substring(4, 7);
                if (newDigits.length >= 7) formatted += '-' + newDigits.substring(7, 9);
                if (newDigits.length >= 9) formatted += '-' + newDigits.substring(9, 11);
                input.value = formatted;
                let newCursorPos = 2;
                let digitCount = 0;
                for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted[i])) {
                        digitCount++;
                        if (digitCount === posInDigits) {
                            newCursorPos = i + 1;
                            break;
                        }
                    }
                }
                if (posInDigits === 0) newCursorPos = 2;
                input.setSelectionRange(newCursorPos, newCursorPos);
                previousDigits = newDigits;
                e.preventDefault();
            }
        });

        input.addEventListener('focus', function() {
            if (!input.value.startsWith('+7')) {
                input.value = '+7 (';
                input.setSelectionRange(4, 4);
                previousDigits = '';
            }
        });

        input.addEventListener('blur', function() {
            if (input.value === '+7 (' || input.value === '+7') {
                input.value = '';
                previousDigits = '';
            }
        });

        previousDigits = input.value.replace(/\D/g, '');
    }

    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        applyPhoneMask(phoneInput);
    }

    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = form.querySelector('input[name="name"]');
            const phoneInputField = form.querySelector('input[name="phone"]');
            const messageInput = form.querySelector('textarea[name="message"]');
            if (!nameInput.value.trim() || !phoneInputField.value.trim()) {
                alert('Пожалуйста, заполните имя и телефон');
                return;
            }
            const cleanPhone = phoneInputField.value.replace(/\D/g, '');
            const formData = {
                name: nameInput.value.trim(),
                phone: cleanPhone,
                message: messageInput ? messageInput.value.trim() : '',
                page: 'Главная',
                source: 'website'
            };
            const url = 'https://script.google.com/macros/s/AKfycbyszsAkcHdzaRD981FxAIkP1SyIe8CIKqwA1uzuoywssUUuavBxQ4hLTMBVjelhNlsF1Q/exec';
            fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(() => {
                alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
                form.reset();
                if (phoneInputField) phoneInputField.value = '';
            })
            .catch(() => {
                alert('Ошибка отправки. Пожалуйста, позвоните нам.');
            });
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
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=api&lang=ru_RU';
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }
})();