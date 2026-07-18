document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // --- Particle Background System ---
  const canvas = document.querySelector('[data-particles]');
  const ctx = canvas?.getContext('2d');
  
  const particles = [];
  const mouse = { x: null, y: null, radius: 120 };

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1.5;
    }

    draw() {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 16, 16, 0.06)';
      ctx.fill();
    }

    update() {
      // Repel from mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 2.5;
          this.y += Math.sin(angle) * force * 2.5;
        }
      }

      // Standard movement
      this.x += this.vx;
      this.y += this.vy;

      // Bounce on borders
      if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
      if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
    }
  }

  function initParticles() {
    particles.length = 0;
    const count = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 10000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    if (!ctx) return;
    const maxDist = 130;
    
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.05;
          // Connecting lines in very subtle accent orange
          ctx.strokeStyle = `rgba(255, 130, 0, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();
    requestAnimationFrame(animateParticles);
  }

  if (canvas && ctx) {
    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
  }

  // --- Mac Terminal Style Page Loader ---
  const loader = document.querySelector('[data-loader]');
  const progress = document.querySelector('[data-progress]');
  const consoleText = document.querySelector('[data-console]');

  const logs = [
    'initializing portfolio...',
    'fetching task assets...',
    'validating raw jpegs & pngs...',
    'mounting 3-view studio frames...',
    'rendering interactive particle field...',
    'ready.'
  ];

  let currentLogIndex = 0;
  let currentProgress = 0;

  function updateLoader() {
    if (currentProgress < 100) {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress > 100) currentProgress = 100;
      
      if (progress) {
        progress.style.width = `${currentProgress}%`;
      }

      const targetLogIndex = Math.min(
        logs.length - 1,
        Math.floor((currentProgress / 100) * logs.length)
      );
      
      if (targetLogIndex > currentLogIndex && consoleText) {
        currentLogIndex = targetLogIndex;
        consoleText.innerHTML += `<br>> ${logs[currentLogIndex]}`;
      }

      setTimeout(updateLoader, Math.random() * 60 + 20);
    } else {
      // Completed, hide loader and reveal page
      setTimeout(() => {
        if (loader) {
          loader.classList.add('is-hidden');
        }
        body.classList.remove('is-loading');
        body.classList.add('is-ready');
        
        // Trigger IntersectionObserver reveals
        setupScrollObserver();
      }, 500);
    }
  }

  // Start the loader
  if (loader) {
    body.classList.add('is-loading');
    if (consoleText) {
      consoleText.innerHTML = `> ${logs[0]}`;
    }
    setTimeout(updateLoader, 300);
  } else {
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
    setupScrollObserver();
  }

  // --- IntersectionObserver Scroll Reveals (kareem-dev style) ---
  function setupScrollObserver() {
    const revealTargets = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    revealTargets.forEach((target, index) => {
      // Add staggered transition delay based on sequence index
      target.style.transitionDelay = `${Math.min(index * 40, 280)}ms`;
      revealObserver.observe(target);
    });
  }

  // --- Section Tabs Navigation ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetSection = document.getElementById(targetTab);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Re-trigger scroll checks on new visible tab elements
      const activeSectionReveals = targetSection ? targetSection.querySelectorAll('.reveal') : [];
      activeSectionReveals.forEach((el, index) => {
        el.classList.remove('is-visible');
        el.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
        
        // Use a tiny timeout to let the display block apply, then add class
        setTimeout(() => {
          el.classList.add('is-visible');
        }, 30);
      });

      updateLightboxImagesList();

      // Scroll smoothly to top of navigation tabs
      const navPosition = document.querySelector('.tabs-nav').getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: navPosition - 15,
        behavior: 'smooth'
      });
    });
  });

  // --- Task 3: Studio View Switching ---
  const studioCards = document.querySelectorAll('.window-panel');
  
  studioCards.forEach(card => {
    const viewButtons = card.querySelectorAll('.view-btn');
    const images = card.querySelectorAll('.studio-img');
    
    if (viewButtons.length > 0 && images.length > 0) {
      viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // Avoid triggering lightbox on view buttons
          const targetView = btn.getAttribute('data-view');
          
          viewButtons.forEach(b => b.classList.remove('active'));
          images.forEach(img => img.classList.remove('active'));
          
          btn.classList.add('active');
          const targetImg = card.querySelector(`.studio-img[data-view="${targetView}"]`);
          if (targetImg) {
            targetImg.classList.add('active');
          }
        });
      });
    }
  });

  // --- Lightbox / Image Zoom Viewer ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');

  let activeImages = [];
  let currentImgIndex = 0;

  function updateLightboxImagesList() {
    activeImages = [];
    const activeSection = document.querySelector('.section.active');
    if (!activeSection) return;

    // Fetch currently visible and active images
    const visibleImages = activeSection.querySelectorAll(
      '.card-image-wrapper img, .featured-image-wrapper img, .studio-img.active'
    );
    
    visibleImages.forEach(img => {
      activeImages.push({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || 'Product Showcase',
        element: img
      });
    });
  }

  // Zoom on Image Click
  document.body.addEventListener('click', (e) => {
    const clickedImage = e.target.closest('.card-image-wrapper img, .featured-img-wrapper img, .studio-img.active');
    
    if (clickedImage) {
      updateLightboxImagesList();
      
      const src = clickedImage.getAttribute('src');
      currentImgIndex = activeImages.findIndex(img => img.src === src);
      
      if (currentImgIndex !== -1) {
        openLightbox(activeImages[currentImgIndex]);
      }
    }
  });

  function openLightbox(imgData) {
    lightboxImg.src = imgData.src;
    lightboxCaption.textContent = imgData.alt;
    lightbox.classList.add('active');
    body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    body.style.overflow = '';
  }

  function showNextImage() {
    if (activeImages.length <= 1) return;
    currentImgIndex = (currentImgIndex + 1) % activeImages.length;
    updateLightboxContent();
  }

  function showPrevImage() {
    if (activeImages.length <= 1) return;
    currentImgIndex = (currentImgIndex - 1 + activeImages.length) % activeImages.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const data = activeImages[currentImgIndex];
    if (data) {
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.97)';
      
      setTimeout(() => {
        lightboxImg.src = data.src;
        lightboxCaption.textContent = data.alt;
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }, 150);
    }
  }

  // Bind Lightbox Actions
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrevImage();
  });
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showNextImage();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content-wrapper')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    }
  });

  // Init list of active images
  updateLightboxImagesList();
});
