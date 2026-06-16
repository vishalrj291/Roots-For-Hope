/* ====================================
   ROOTS OF HOPE — Interactive Layer
   ====================================
   Parallax · Scroll Reveals · Floating Leaves
   Counter Animation · Navigation · Smooth UX
   ==================================== */

(function () {
    'use strict';

    // ===========================
    // FLOATING LEAVES PARTICLE SYSTEM
    // ===========================
    const canvas = document.getElementById('leaves-canvas');
    const ctx = canvas.getContext('2d');
    let leaves = [];
    let animFrame;
    let canvasW, canvasH;

    function resizeCanvas() {
        canvasW = canvas.width = window.innerWidth;
        canvasH = canvas.height = window.innerHeight;
    }

    class Leaf {
        constructor() {
            this.reset();
            this.y = Math.random() * canvasH;
        }

        reset() {
            this.x = Math.random() * canvasW;
            this.y = -20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 0.5 + 0.15;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
            this.wobblePhase = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.008 + 0.004;
            this.wobbleAmp = Math.random() * 30 + 15;
            this.opacity = Math.random() * 0.35 + 0.1;
            this.hue = Math.random() > 0.5
                ? 90 + Math.random() * 40     // greens
                : 30 + Math.random() * 20;    // warm gold/brown
            this.sat = 25 + Math.random() * 30;
            this.light = 35 + Math.random() * 25;
        }

        update() {
            this.y += this.speedY;
            this.wobblePhase += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobblePhase) * 0.3;
            this.rotation += this.rotSpeed;

            if (this.y > canvasH + 30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Draw a leaf shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.bezierCurveTo(
                this.size * 0.6, -this.size * 0.6,
                this.size * 0.6, this.size * 0.6,
                0, this.size
            );
            ctx.bezierCurveTo(
                -this.size * 0.6, this.size * 0.6,
                -this.size * 0.6, -this.size * 0.6,
                0, -this.size
            );

            ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
            ctx.fill();

            // Leaf vein
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 0.8);
            ctx.lineTo(0, this.size * 0.8);
            ctx.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light - 10}%, 0.4)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.restore();
        }
    }

    function initLeaves() {
        resizeCanvas();
        leaves = [];
        const count = Math.min(Math.floor(canvasW / 80), 18);
        for (let i = 0; i < count; i++) {
            leaves.push(new Leaf());
        }
    }

    function animateLeaves() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        leaves.forEach(leaf => {
            leaf.update();
            leaf.draw();
        });
        animFrame = requestAnimationFrame(animateLeaves);
    }

    // ===========================
    // PARALLAX SCROLLING
    // ===========================
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    function updateParallax() {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax);
            const rect = el.parentElement.getBoundingClientRect();
            const visible = rect.bottom > 0 && rect.top < window.innerHeight;
            if (visible) {
                const offset = scrollY * speed;
                el.style.transform = `translate3d(0, ${offset * 0.3}px, 0) scale(1.1)`;
            }
        });
    }

    // ===========================
    // SCROLL REVEAL
    // ===========================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ===========================
    // COUNTER ANIMATION
    // ===========================
    const counters = document.querySelectorAll('[data-count]');
    let countersAnimated = new Set();

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated.has(entry.target)) {
                countersAnimated.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    function animateCounter(el) {
        const target = parseInt(el.dataset.count);
        const duration = 2200;
        const start = performance.now();

        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.floor(eased * target);

            el.textContent = formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = formatNumber(target);
            }
        }

        requestAnimationFrame(tick);
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return num.toLocaleString('en-IN');
        }
        return num.toString();
    }

    // ===========================
    // NAVIGATION
    // ===========================
    const nav = document.getElementById('main-nav');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    let lastScrollY = 0;

    function handleNavScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    }

    // Mobile menu
    mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';

        // Animate hamburger
        const spans = mobileToggle.querySelectorAll('span');
        if (mobileMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = nav.offsetHeight + 10;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===========================
    // IMAGE LOADING & REVEAL
    // ===========================
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.8s ease';

                    if (img.complete) {
                        img.style.opacity = '1';
                    } else {
                        img.addEventListener('load', () => {
                            img.style.opacity = '1';
                        });
                    }

                    imgObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        images.forEach(img => imgObserver.observe(img));
    }

    // ===========================
    // TIMELINE INTERACTION
    // ===========================
    function initTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.querySelector('.timeline-content').style.borderLeft = '3px solid var(--sage)';
            });
            item.addEventListener('mouseleave', () => {
                item.querySelector('.timeline-content').style.borderLeft = '';
            });
        });
    }

    // ===========================
    // GALLERY HOVER DEPTH
    // ===========================
    function initGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                item.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
                item.style.transition = 'transform 0.5s ease';
                setTimeout(() => { item.style.transition = ''; }, 500);
            });
        });
    }

    // ===========================
    // SCROLL-DRIVEN EVENTS
    // ===========================
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleNavScroll();
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ===========================
    // INITIALIZATION
    // ===========================
    function init() {
        initLeaves();
        animateLeaves();
        lazyLoadImages();
        initTimeline();
        initGallery();
        handleNavScroll();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        // Mark body as loaded
        document.body.classList.add('loaded');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
