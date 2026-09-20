// LIBAS TAILOR — Master Interactive Architecture & State Management
import { initAIConcierge } from './ai-concierge/concierge.js';

document.addEventListener('DOMContentLoaded', () => {

  // 0. Initialize LIBAS AI Concierge (Digital Atelier Representative)
  try {
    initAIConcierge();
  } catch (err) {
    console.warn('AI Concierge initialization error:', err);
  }

  // 1. Fashion-House Masthead Scroll Transformation & Active Link Highlight
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    });
  }

  // Highlight active nav link based on current path
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (currentPath === '/' && (href === '/' || href === 'index.html')))) {
      link.classList.add('active');
    }
  });

  // 2. Mobile Menu Drawer System
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function closeMobileDrawer() {
    if (mobileMenu) {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('is-open');
    }
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function openMobileDrawer() {
    if (mobileMenu) {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('is-open');
    }
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('is-open') && !mobileMenu.classList.contains('hidden');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
        closeMobileDrawer();
      }
    });
  }

  // Window Resize Safeguard: Ensure mobile drawer is cleanly reset when resizing to desktop (>= 1024px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMobileDrawer();
    }
  });

  // 3. Private Consultation Booking Modal & WhatsApp Pipeline
  const bookingModal = document.getElementById('booking-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const bookingForm = document.getElementById('appointment-form');
  const formServiceSelect = document.getElementById('form-service');
  
  const bookingTriggers = [
    document.getElementById('book-btn-header'),
    document.getElementById('hero-book-btn'),
    document.getElementById('final-cta-btn'),
    document.getElementById('rec-book-btn'),
    document.getElementById('sherwani-book-btn'),
    document.getElementById('mobile-bar-enquiry'),
    ...document.querySelectorAll('.book-consultation-btn'),
    ...document.querySelectorAll('.book-wedding-btn'),
    ...document.querySelectorAll('.book-custom-btn')
  ];

  function openBookingModal(defaultService = null) {
    if (bookingModal) {
      if (defaultService && formServiceSelect) {
        formServiceSelect.value = defaultService;
      }
      bookingModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeBookingModal() {
    if (bookingModal) {
      bookingModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  bookingTriggers.forEach(trigger => {
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
      });
    }
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeBookingModal);

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });
  }

  // Minimum date set to today
  const dateInput = document.getElementById('form-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  // Consultation & Appointment Submission with Web3Forms & WhatsApp Pipeline
  const formsToHandle = [
    document.getElementById('appointment-form'),
    document.getElementById('form'),
    ...document.querySelectorAll('form[data-web3forms="true"]')
  ].filter(Boolean);

  // Remove duplicates if any
  const uniqueForms = Array.from(new Set(formsToHandle));

  uniqueForms.forEach(targetForm => {
    targetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = targetForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'CONFIRM & SEND';

      const name = targetForm.querySelector('#form-name')?.value || targetForm.querySelector('[name="name"]')?.value || '';
      const phone = targetForm.querySelector('#form-phone')?.value || targetForm.querySelector('[name="phone"]')?.value || '';
      const service = targetForm.querySelector('#form-service')?.value || targetForm.querySelector('[name="service"]')?.value || 'Sherwanis';
      const occasion = targetForm.querySelector('#form-occasion')?.value || targetForm.querySelector('[name="occasion"]')?.value || 'Wedding / Groom';
      const locationRadio = targetForm.querySelector('input[name="location"]:checked');
      const location = locationRadio ? locationRadio.value : 'Shamshad Market Atelier';
      const date = targetForm.querySelector('#form-date')?.value || targetForm.querySelector('[name="date"]')?.value || '';
      const time = targetForm.querySelector('#form-time')?.value || targetForm.querySelector('[name="time"]')?.value || '';
      const notes = targetForm.querySelector('#form-notes')?.value || targetForm.querySelector('[name="notes"]')?.value || '';

      const formData = new FormData(targetForm);
      formData.append("access_key", "7097fd8c-680d-4e0a-86d8-0d53621e4b47");
      if (name) formData.set("name", name);
      if (phone) formData.set("phone", phone);
      if (service) formData.set("service", service);
      if (occasion) formData.set("occasion", occasion);
      if (location) formData.set("location", location);
      if (date) formData.set("date", date);
      if (time) formData.set("time", time);
      if (notes) formData.set("notes", notes);
      formData.set("subject", `New Consultation Request: ${name || 'Client'} (${service})`);
      formData.set("from_name", "LIBAS TAILOR Web Concierge");

      if (submitBtn) {
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
      }

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          alert("Success! Your message has been sent.");

          const message = `*Private Consultation Request — LIBAS TAILOR*\n\n` +
            `• *Client Name:* ${name}\n` +
            `• *Contact:* ${phone}\n` +
            `• *Garment Silhouette:* ${service}\n` +
            `• *Occasion:* ${occasion}\n` +
            `• *Consultation Venue:* ${location}\n` +
            `• *Preferred Date:* ${date}\n` +
            `• *Time Slot:* ${time}\n` +
            (notes ? `• *Notes:* ${notes}\n` : '') +
            `\n_Sent via LIBAS TAILOR Digital Atelier (Shamshad Market, AMU Aligarh)_`;

          const whatsappURL = `https://wa.me/919027672285?text=${encodeURIComponent(message)}`;

          targetForm.reset();
          closeBookingModal();
          window.open(whatsappURL, '_blank');
        } else {
          alert("Error: " + (data.message || "Failed to submit. Please try again."));
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("Something went wrong. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  });

  // 4. The Five Acts of Tailoring (Authentic Atelier Progress)
  const stepCards = document.querySelectorAll('.step-card');
  const stepData = {
    '1': {
      tag: "ACT I • DISCOVERY",
      title: "Occasion Dialogue & Silhouette Exploration",
      desc: "Every bespoke garment begins with a personal dialogue at our Shamshad Market atelier opposite Sulaiman Hall. We study your event setting, lighting, posture, and personal aesthetic to establish a commanding silhouette.",
      time: "Initial Consultation",
      focus: "Silhouette & Occasion Analysis",
      img: "/images/fitting_detail.webp"
    },
    '2': {
      tag: "ACT II • METROLOGY",
      title: "Anatomical Measurement Profiling",
      desc: "We capture your comprehensive anatomical profile, evaluating shoulder slope angle, spine curvature, and natural stance to ensure zero-strain drape and effortless movement.",
      time: "Precision Measurement",
      focus: "Posture & Proportion Mapping",
      img: "/images/craftsmanship.webp"
    },
    '3': {
      tag: "ACT III • CURATION",
      title: "Fabric, Weave & Accent Selection",
      desc: "Browse authentic Banarasi raw silks, rich velvets, fine wool blends, and crisp linens. Together we curate fabric weight, texture, and lining harmony designed for your celebratory climate.",
      time: "Material Curation",
      focus: "Texture, Weave & Luster",
      img: "/images/fabric_detail.webp"
    },
    '4': {
      tag: "ACT IV • ATELIER CRAFT",
      title: "Individual Pattern Cut & Hand Construction",
      desc: "Our master tailors draft an individual pattern from zero and hand-assemble internal canvassing, collar shaping, and structural interlinings that adapt organically to your physique.",
      time: "Master Construction",
      focus: "Drafting, Canvassing & Stitch",
      img: "/images/craftsmanship.webp"
    },
    '5': {
      tag: "ACT V • REFINEMENT",
      title: "Final Fitting & Personal Handoff",
      desc: "Experience your finished creation in our atelier fitting room. Sleeve pitch, collar closure, and hem drape are micro-refined before final presentation in bespoke protective garment covers.",
      time: "Final Fitting",
      focus: "Drape Validation & Delivery",
      img: "/images/hero_warm.webp"
    }
  };

  stepCards.forEach(card => {
    card.addEventListener('click', () => {
      stepCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const stepNum = card.getAttribute('data-step') || '1';
      const data = stepData[stepNum] || stepData['1'];

      const tagEl = document.getElementById('step-tag');
      const titleEl = document.getElementById('step-title');
      const descEl = document.getElementById('step-desc');
      const timeEl = document.getElementById('step-time');
      const focusEl = document.getElementById('step-focus');
      const imgEl = document.getElementById('step-img');

      if (tagEl) tagEl.innerText = data.tag;
      if (titleEl) titleEl.innerText = data.title;
      if (descEl) descEl.innerText = data.desc;
      if (timeEl) timeEl.innerText = data.time;
      if (focusEl) focusEl.innerText = data.focus;
      if (imgEl) imgEl.src = data.img;
    });
  });

  // 5. Interactive Style Consultation ("Find Your Look")
  let quizState = {
    occasion: 'Wedding',
    style: 'Classic',
    garment: 'Sherwani'
  };

  const updateQuizRecommendation = () => {
    const titleEl = document.getElementById('rec-title');
    const descEl = document.getElementById('rec-desc');

    const recs = {
      'Sherwani': {
        title: `${quizState.style} ${quizState.occasion} Sherwani`,
        desc: `Hand-tailored in raw silk with refined tone-on-tone embroidery, structured chest framing, and majestic drape tailored for ${quizState.occasion.toLowerCase()} presence.`
      },
      'Suit': {
        title: `${quizState.style} Bespoke ${quizState.occasion} Suit`,
        desc: `Single or double-breasted suit tailored in fine suiting wool weaves, engineered with sharp shoulder lines and clean drape for ${quizState.occasion.toLowerCase()} occasions.`
      },
      'Indo-Western': {
        title: `${quizState.style} Indo-Western Ensemble`,
        desc: `Contemporary asymmetric cut uniting royal Indian heritage lines with modern menswear tailoring for ${quizState.occasion.toLowerCase()} celebrations.`
      },
      'Kurta': {
        title: `${quizState.style} Silk Kurta & Pajama Set`,
        desc: `Refined raw silk or crisp linen kurta featuring hand-finished mandarin collar and streamlined tailored trouser fit.`
      }
    };

    const rec = recs[quizState.garment] || recs['Sherwani'];
    if (titleEl) titleEl.innerText = rec.title;
    if (descEl) descEl.innerText = rec.desc;
  };

  const bindQuizSelector = (containerId, stateKey) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        quizState[stateKey] = btn.getAttribute('data-val') || '';
        updateQuizRecommendation();
      });
    });
  };

  bindQuizSelector('quiz-occasion', 'occasion');
  bindQuizSelector('quiz-style', 'style');
  bindQuizSelector('quiz-garment', 'garment');

  // 6. Garment Architectural Spec Drawer Modal
  const specModal = document.getElementById('spec-modal');
  const closeSpecBtn = document.getElementById('close-spec-modal');
  const specBookNowBtn = document.getElementById('spec-book-now-btn');
  const openSpecBtns = document.querySelectorAll('.open-spec-btn');

  const specData = {
    sherwani: {
      title: "Bespoke Sherwani Silhouette",
      desc: "Regal ceremonial coats hand-tailored in pure Banarasi raw silk and velvet, crafted with structured internal interlining and tone-on-tone heritage accents.",
      hours: "Dedicated Master Hand-Craft",
      canvas: "Tailored Internal Interlining",
      mill: "Banarasi Raw Silk & Velvet",
      turnaround: "Made-to-Order Consultation",
      serviceName: "Sherwanis"
    },
    suits: {
      title: "Bespoke Suit Silhouette",
      desc: "Architecturally cut single and double-breasted suits cut directly to client proportions with balanced shoulder roll, hand-set collar, and natural drape.",
      hours: "Custom Pattern Drafting",
      canvas: "Structured Chest Canvassing",
      mill: "Fine Suiting Wool Weaves",
      turnaround: "Made-to-Order Consultation",
      serviceName: "Bespoke Suits"
    },
    indowestern: {
      title: "Indo-Western Coat Silhouette",
      desc: "Modern asymmetric coats and regal bandhgalas combining Indian heritage lines with contemporary structured shoulders and custom button accents.",
      hours: "Individual Pattern Cut",
      canvas: "Structured Interlining",
      mill: "Raw Silk & Blended Weaves",
      turnaround: "Made-to-Order Consultation",
      serviceName: "Indo-Western"
    },
    kurta: {
      title: "Kurta & Pajama Silhouette",
      desc: "Refined raw silk and breathable linen kurtas with hand-finished collar bands, concealed plackets, and streamlined tailored trousers.",
      hours: "Hand-Bound Finish",
      canvas: "Lightweight Soft Interlining",
      mill: "Mulberry Silk & Pure Linen",
      turnaround: "Made-to-Order Consultation",
      serviceName: "Kurta & Pajama"
    },
    formalwear: {
      title: "Formal Wear Silhouette",
      desc: "Evening dinner jackets tailored with silk satin peak or shawl lapels, satin-covered buttons, and tailored formal trousers.",
      hours: "Custom Dinner Jacket Cut",
      canvas: "Structured Chest Framing",
      mill: "Fine Suiting Weaves & Satin",
      turnaround: "Made-to-Order Consultation",
      serviceName: "Formal Wear"
    }
  };

  let currentActiveSpecService = "Sherwanis";

  openSpecBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const specKey = btn.getAttribute('data-collection') || 'sherwani';
      const data = specData[specKey] || specData.sherwani;
      
      currentActiveSpecService = data.serviceName;

      const titleEl = document.getElementById('spec-title');
      const descEl = document.getElementById('spec-desc');
      const hoursEl = document.getElementById('spec-hours');
      const canvasEl = document.getElementById('spec-canvas');
      const millEl = document.getElementById('spec-mill');
      const turnaroundEl = document.getElementById('spec-turnaround');

      if (titleEl) titleEl.innerText = data.title;
      if (descEl) descEl.innerText = data.desc;
      if (hoursEl) hoursEl.innerText = data.hours;
      if (canvasEl) canvasEl.innerText = data.canvas;
      if (millEl) millEl.innerText = data.mill;
      if (turnaroundEl) turnaroundEl.innerText = data.turnaround;

      if (specModal) {
        specModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeSpecBtn && specModal) {
    closeSpecBtn.addEventListener('click', () => {
      specModal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    specModal.addEventListener('click', (e) => {
      if (e.target === specModal) {
        specModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  if (specBookNowBtn) {
    specBookNowBtn.addEventListener('click', () => {
      if (specModal) specModal.classList.add('hidden');
      openBookingModal(currentActiveSpecService);
    });
  }

  // 7. Lookbook & Gallery Lightbox with Keyboard Navigation (ESC, Left, Right)
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightboxBtn = document.getElementById('close-lightbox');
  let currentLightboxItems = [];
  let currentLightboxIndex = -1;

  function updateLightboxItems() {
    currentLightboxItems = Array.from(document.querySelectorAll('.lookbook-item:not(.hidden-item), .gallery-item:not(.hidden-item)'));
  }

  function openLightbox(index) {
    updateLightboxItems();
    if (index < 0 || index >= currentLightboxItems.length) return;
    currentLightboxIndex = index;
    const item = currentLightboxItems[currentLightboxIndex];
    const src = item.getAttribute('data-src');
    if (lightboxModal && lightboxImg && src) {
      lightboxImg.src = src;
      lightboxModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.add('hidden');
      document.body.style.overflow = '';
      currentLightboxIndex = -1;
    }
  }

  // Bind click handlers to gallery/lookbook items
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.lookbook-item, .gallery-item');
    if (item) {
      updateLightboxItems();
      const index = currentLightboxItems.indexOf(item);
      if (index !== -1) {
        openLightbox(index);
      }
    }
  });

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal || lightboxModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      if (currentLightboxItems.length > 0) {
        const nextIdx = (currentLightboxIndex + 1) % currentLightboxItems.length;
        openLightbox(nextIdx);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentLightboxItems.length > 0) {
        const prevIdx = (currentLightboxIndex - 1 + currentLightboxItems.length) % currentLightboxItems.length;
        openLightbox(prevIdx);
      }
    }
  });

  // 8. Gallery Category Filter Handler (on /gallery.html)
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterCategory = btn.getAttribute('data-filter') || 'all';

        galleryItems.forEach(item => {
          const itemCat = (item.getAttribute('data-category') || '').toLowerCase().trim();
          const catList = itemCat.split(/\s+/);
          if (filterCategory === 'all' || catList.includes(filterCategory.toLowerCase())) {
            item.style.display = 'block';
            item.classList.remove('hidden-item');
          } else {
            item.style.display = 'none';
            item.classList.add('hidden-item');
          }
        });
      });
    });
  }

  // 9. Official Instagram Reels Journal Embed Processing
  const journalSection = document.getElementById('journal');
  if (journalSection) {
    // Lazy-load official Instagram embed.js only once when user approaches the journal section
    const igObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
          } else if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const igScript = document.createElement('script');
            igScript.async = true;
            igScript.src = '//www.instagram.com/embed.js';
            igScript.onload = () => {
              if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
              }
            };
            document.body.appendChild(igScript);
          }
          igObserver.unobserve(journalSection);
        }
      });
    }, { rootMargin: '350px 0px' });

    igObserver.observe(journalSection);
  }

  // 10. Cinematic Scroll Reveal Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('section > div, .editorial-frame, .royal-frame, .step-card, .lookbook-item, .gallery-item, .journal-card').forEach(el => {
    observer.observe(el);
  });

});
