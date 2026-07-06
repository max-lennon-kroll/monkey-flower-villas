const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll(".zoomable").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.dataset.full;
    lightbox.style.display = "flex";
  });
});

lightbox.addEventListener("click", () => {
  lightbox.style.display = "none";
});

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
