document.addEventListener('DOMContentLoaded', () => {
  initializeHeader();
  initializeParallax();
  initializeSlideNavigation();
  initializeReviews();
  initializeLazyLoading();

});

function initializeHeader() {
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileMenu = document.querySelector('.nav-menu-container-mobile');
  const exitBtn = document.querySelector('.exit-menu');
  const navMenu = document.querySelector('.nav-menu-container');

  if (!hamburger || !mobileMenu || !exitBtn || !navMenu) return;

  let isMobileMenuOpen = false;

  const toggleMenu = (show) => {
    document.body.style.overflow = show ? 'hidden' : 'auto';

    if (show) {
      isMobileMenuOpen = true;
      navMenu.style.opacity = '0';
      navMenu.style.pointerEvents = 'none';
      mobileMenu.style.display = 'flex';
      exitBtn.style.display = 'block';
      setTimeout(() => { mobileMenu.style.opacity = '1'; exitBtn.style.opacity = '1'; }, 10);
    } else {
      isMobileMenuOpen = false;
      mobileMenu.style.opacity = '0';
      exitBtn.style.opacity = '0';
      setTimeout(() => {
        mobileMenu.style.display = 'none';
        exitBtn.style.display = 'none';
        
        if (!navMenu.classList.contains('nav-menu-hidden')) {
            navMenu.style.opacity = '1';
            navMenu.style.pointerEvents = 'auto';
        }
      }, 300);
    }
  };

  hamburger.addEventListener('click', () => toggleMenu(true));
  exitBtn.addEventListener('click', () => toggleMenu(false));

  let lastScroll = 0;
  let lastScrollY = 0;
  const tolerance = 10;
  let ticking = false;

  const updateScroll = (currentScroll) => {
    if (isMobileMenuOpen) return;
    
    if (currentScroll <= 0) {
      navMenu.classList.remove('nav-menu-hidden');
      navMenu.style.pointerEvents = 'auto';
      return;
    }

    if (Math.abs(currentScroll - lastScroll) <= tolerance) return;

    if (currentScroll > lastScroll) {
      navMenu.classList.add('nav-menu-hidden');
      navMenu.style.pointerEvents = 'none';
    } else {
      navMenu.classList.remove('nav-menu-hidden');
      navMenu.style.pointerEvents = 'auto';
    }

    lastScroll = currentScroll;
  };
  
  const handleScroll = () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScroll(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
}


function initializeParallax() {
  const sections = document.querySelectorAll('section');
  let activeSections = [];

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) activeSections.push(entry.target);
          else activeSections = activeSections.filter(sec => sec !== entry.target);
      });
  }, { rootMargin: "100px 0px" });
  
  sections.forEach(sec => observer.observe(sec));

  let ticking = false;
  
    const update = () => {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    
    // Pass 1: Read all layout properties
    const reads = [];
    activeSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > winHeight) return;
      const yOffset = rect.top * 0.5;
     
      const container = section.querySelector('.slides-container');
      if (!container) return;
      
      const scrollX = container.scrollLeft;
      const slides = container.querySelectorAll('.slide');
      
      slides.forEach(slide => {
          // If we cache slide.offsetLeft and slide.offsetWidth it's even better, but let's just separate reads and writes for now
          // to prevent layout thrashing within the loop
          const slideOffsetLeft = slide.offsetLeft;
          const slideOffsetWidth = slide.offsetWidth;
          
          reads.push({
            slide, yOffset, scrollX, slideOffsetLeft, slideOffsetWidth
          });
      });
    });
    
    // Pass 2: Calculate and write
    reads.forEach(r => {
      const relativeLeft = r.slideOffsetLeft - r.scrollX;
      if (relativeLeft > winWidth || relativeLeft + r.slideOffsetWidth < 0) return;
      
      const xOffset = relativeLeft * 0.5;
      
      const txt_layers = r.slide.querySelectorAll('.slide-content, .slide-text-static, .slide-content-unjustified');
      const img_layers = r.slide.querySelectorAll('.slide-video, .slide-image');
      
      img_layers.forEach(layer => {
        layer.style.transform = `translate3d(-50%, -50%, 0) translate3d(${-xOffset}px, ${-r.yOffset}px, 0)`;
      });
      txt_layers.forEach(layer => {
        layer.style.transform = `translate3d(-50%, -50%, 0) translate3d(${-xOffset/1.3}px, ${-r.yOffset/1.3}px, 0)`;
      });
    });
    
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  document.querySelectorAll('.slides-container').forEach(c => c.addEventListener('scroll', requestTick, { passive: true }));
}

function initializeSlideNavigation() {
  const leftSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z"/></svg>`;
  const rightSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M64 448c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L178.8 256L41.38 118.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25l-160 160C80.38 444.9 72.19 448 64 448z"/></svg>`;

  document.querySelectorAll('.slides-container').forEach(container => {
    const slides = container.querySelectorAll('.slide');
    if (slides.length <= 1) return;

    const parent = container.parentElement;
    
   
    const createBtn = (cls, svg, label) => {
      const btn = document.createElement('div');
      btn.className = `nav-arrow ${cls} hidden`;
      btn.innerHTML = svg;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      return btn;
    };

    const leftBtn = createBtn('nav-arrow-left', leftSVG, 'Previous Slide');
    const rightBtn = createBtn('nav-arrow-right', rightSVG, 'Next Slide');
    
    parent.appendChild(leftBtn);
    parent.appendChild(rightBtn);

   
    const scrollAmount = () => container.clientWidth;
    
    leftBtn.addEventListener('click', () => container.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    rightBtn.addEventListener('click', () => container.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

   
    const updateVisibility = () => {
      const isAtStart = container.scrollLeft <= 5;
      const isAtEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth - 5;
      
      leftBtn.classList.toggle('hidden', isAtStart);
      rightBtn.classList.toggle('hidden', isAtEnd);
    };

    container.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  });
}

function initializeReviews() {
  const wrappers = document.querySelectorAll('.slide-review-wrapper');
  
  wrappers.forEach(wrapper => {
    const prevBtn = wrapper.querySelector('.review-arrow-left');
    const nextBtn = wrapper.querySelector('.review-arrow-right');
    const items = Array.from(wrapper.querySelectorAll('.slide-review'));
    let currentIndex = 0;

    if(!wrapper.querySelector('.active')) {
        items[0].classList.add('active');
    } else {
        currentIndex = items.findIndex(item => item.classList.contains('active'));
    }

    const switchReview = (direction) => {
      const currentItem = items[currentIndex];
      currentItem.classList.remove('active');
      currentItem.classList.add('exit');
      
      setTimeout(() => {
        currentItem.classList.remove('exit');
      }, 500);

      if (direction === 'next') {
        currentIndex = (currentIndex + 1) % items.length;
      } else {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      }

      const newItem = items[currentIndex];
      requestAnimationFrame(() => {
          newItem.classList.remove('exit');
          newItem.classList.add('active');
      });
    };

    nextBtn.addEventListener('click', () => switchReview('next'));
    prevBtn.addEventListener('click', () => switchReview('prev'));
  });
}

function initializeLazyLoading() {
  const elements = document.querySelectorAll('.lazy-loading');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const bg = el.dataset.bg;

      if (bg) {
        el.style.backgroundImage = `url("${bg}")`;
      }

      el.classList.remove('lazy-loading');
      obs.unobserve(el);
    });
  }, {
    rootMargin: "500px 0px"
  });

  elements.forEach(el => observer.observe(el));
}



const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll(".zoomable").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.dataset.full;
    lightbox.style.display = "flex";
  });
});

if (lightbox) {
  lightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
  });
}

document.addEventListener('click', function(e) {
    let target = e.target.closest('button, a.slide-button, a.slide-button-inverted, a.slide-button-2, a.popup-button, a.nav-menu-booking, a.gallery-redirect-button, a.footer-booking-button');
    if (target) {
        let buttonText = target.innerText.trim() || target.getAttribute('aria-label') || target.id || 'Button';
        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                'event_category': 'button',
                'event_label': buttonText
            });
        }
    }
});
