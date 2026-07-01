// Work experience data
const workExperiences = {
  kalshi: {
    company: 'kalshi',
    role: 'software engineer intern',
    dates: 'jan 2026 - present',
    logo: '/images/kalshi.png',
    logoAlt: 'kalshi logo',
    description: 'building software for the world\'s first regulated prediction market.',
    logoStyle: 'cover',
    hasWhiteBg: false,
  },
  shopify: {
    company: 'shopify',
    role: 'engineering intern',
    dates: 'may 2025 - aug 2025',
    logo: '/images/shopify_glyph.svg',
    logoAlt: 'shopify logo',
    description: 'worked on checkout flows for retail point of sale systems with ruby, react native, gRPC, and graphql.',
    logoStyle: 'contain',
    hasWhiteBg: true,
  },
  cohere: {
    company: 'cohere',
    role: 'senior data quality specialist',
    dates: 'sept 2024 - aug 2025',
    logo: '/images/cohere_logo.svg',
    logoAlt: 'cohere logo',
    description: 'worked on data quality and evaluation for language models on coding tasks.',
    logoStyle: 'contain',
    hasWhiteBg: true,
  },
};

// Modal functionality
function initModal() {
  const modal = document.getElementById('modal');
  const modalBackdrop = modal.querySelector('.modal-backdrop');
  const modalClose = modal.querySelector('.modal-close');
  const modalLogo = document.getElementById('modal-logo');
  const modalLogoImg = document.getElementById('modal-logo-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDates = document.getElementById('modal-dates');
  const modalDescription = document.getElementById('modal-description');

  function openModal(workId) {
    const experience = workExperiences[workId];
    if (!experience) return;

    // Update modal content
    modalLogoImg.src = experience.logo;
    modalLogoImg.alt = experience.logoAlt;
    modalLogoImg.className = experience.logoStyle === 'cover' ? 'logo-cover' : 'logo-contain';
    
    if (experience.hasWhiteBg) {
      modalLogo.classList.add('white-bg');
    } else {
      modalLogo.classList.remove('white-bg');
    }

    modalTitle.textContent = `${experience.company} — ${experience.role}`;
    modalDates.textContent = experience.dates;
    modalDescription.textContent = experience.description;

    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  let lastFocusedElement = null;

  // Event listeners for work cards
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      lastFocusedElement = card;
      openModal(card.dataset.work);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastFocusedElement = card;
        openModal(card.dataset.work);
      }
    });
  });

  // Focus the close button when modal opens
  const originalOpen = openModal;
  openModal = function(workId) {
    originalOpen(workId);
    modalClose.focus();
  };

  // Close modal events
  modalBackdrop.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Return focus to the card that opened the modal
  const originalClose = closeModal;
  closeModal = function() {
    originalClose();
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  };
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
  // Animate hero section items on load
  const heroItems = document.querySelectorAll('.hero-section .animate-item, .work-cards .animate-item, .scroll-indicator.animate-item');
  
  // Trigger hero animations after a small delay
  setTimeout(() => {
    heroItems.forEach(item => {
      item.classList.add('visible');
    });
  }, 100);

  // Intersection Observer for social section
  const socialSection = document.getElementById('next');
  const socialItems = socialSection.querySelectorAll('.animate-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        socialItems.forEach(item => {
          item.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.4
  });

  observer.observe(socialSection);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initScrollAnimations();
});

