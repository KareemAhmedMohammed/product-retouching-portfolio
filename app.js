document.addEventListener('DOMContentLoaded', () => {
  // --- Mac Terminal Style Page Loader ---
  const loader = document.querySelector('[data-loader]');
  const progress = document.querySelector('[data-progress]');
  const consoleText = document.querySelector('[data-console]');
  const body = document.body;

  const logs = [
    'initializing portfolio...',
    'fetching task assets...',
    'validating raw jpugs & pngs...',
    'mounting 3-view studio frames...',
    'rendering responsive grid layout...',
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

      // Periodically output new log lines based on progress
      const targetLogIndex = Math.min(
        logs.length - 1,
        Math.floor((currentProgress / 100) * logs.length)
      );
      
      if (targetLogIndex > currentLogIndex && consoleText) {
        currentLogIndex = targetLogIndex;
        consoleText.innerHTML += `<br>> ${logs[currentLogIndex]}`;
      }

      setTimeout(updateLoader, Math.random() * 80 + 30);
    } else {
      // Completed, hide loader and show page content
      setTimeout(() => {
        if (loader) {
          loader.classList.add('is-hidden');
        }
        body.classList.remove('is-loading');
        
        // Trigger initial reveal checks for elements on screen
        setTimeout(checkReveals, 100);
      }, 400);
    }
  }

  // Start the loader animation
  if (loader) {
    body.classList.add('is-loading');
    if (consoleText) {
      consoleText.innerHTML = `> ${logs[0]}`;
    }
    setTimeout(updateLoader, 200);
  } else {
    body.classList.remove('is-loading');
  }

  // --- Scroll Reveal System (kareem-dev style) ---
  const revealElements = document.querySelectorAll('.reveal');

  function checkReveals() {
    const triggerBottom = window.innerHeight * 0.9;
    
    revealElements.forEach(el => {
      const boxTop = el.getBoundingClientRect().top;
      if (boxTop < triggerBottom) {
        el.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', checkReveals);
  // Also check on resize
  window.addEventListener('resize', checkReveals);

  // --- Section Tabs Navigation ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Remove active class from buttons & sections
      tabButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // Add active to clicked button and target section
      btn.classList.add('active');
      const targetSection = document.getElementById(targetTab);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Re-trigger scroll checks on new visible tab elements
      setTimeout(() => {
        checkReveals();
        updateLightboxImagesList();
      }, 50);

      // Scroll smoothly to top of navigation tabs
      const navPosition = document.querySelector('.tabs-nav').getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: navPosition - 20,
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
          e.stopPropagation(); // Avoid triggering lightbox on view switcher click
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

    // Fetch visible and active images
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
    body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    body.style.overflow = ''; // Unlock scroll
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

  // Init visible images
  updateLightboxImagesList();
});
