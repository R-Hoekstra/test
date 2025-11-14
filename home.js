// =========================
//  home.js (merged version)
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav");
  const menuOverlay = document.querySelector(".menu-overlay");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");
  const navLinkHeader = document.querySelectorAll(".nav-link-header");
  const itemsMenu = document.getElementById("wb_CssMenu1");
  let lastScrollY = window.scrollY;

  // Modal functionality
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-image");
  const captionText = document.getElementById("caption");
  const closeBtn = document.querySelector(".close");
  const images = document.querySelectorAll(".clickable-image");

  // Submenu toggle functionality for "Projects"
  const projectsToggle = document.getElementById("projectsToggle");
  const projectsSubmenu = document.getElementById("projectsSubmenu");

  // Reveal hero text when its section enters the viewport
  const navBlocks = document.querySelectorAll(".navigation");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    navBlocks.forEach((el) => io.observe(el));
  } else {
    // Fallback for very old browsers
    navBlocks.forEach((el) => el.classList.add("visible"));
  }
  if (projectsToggle && projectsSubmenu) {
    projectsToggle.addEventListener("click", (e) => {
      e.preventDefault();
      projectsSubmenu.classList.toggle("show");
    });
  }

  // Open modal on image click
  images.forEach((image) => {
    image.addEventListener("click", () => {
      modal.style.display = "block";
      modalImg.src = image.src;
      captionText.innerHTML = image.alt;
    });
  });

  // Close modal functionality
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // ============================================================
  //  Adaptive background-darkness overlay (optimized)
  // ============================================================

  const AO_TARGET_CONTRAST = 4.5; // WCAG AA for normal text
  const AO_L_TARGET_MAX = (1.0 + 0.05) / AO_TARGET_CONTRAST - 0.05; // ≈ 0.183
  const AO_MAX_ALPHA = 0.7; // upper bound to avoid over-darkening
  const AO_DEFAULT_ALPHA = 0.6; // safe fallback when sampling fails
  const AO_SAMPLE_SIZE = 24; // smaller for speed on mobile

  // Re-use one tiny canvas for all luminance calculations
  const AO_canvas = document.createElement("canvas");
  AO_canvas.width = AO_canvas.height = AO_SAMPLE_SIZE;
  const AO_ctx = AO_canvas.getContext("2d", { willReadFrequently: true });

  const AO_toLinear = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const AO_computeAverageLuminance = (img) => {
    // If image didn’t load correctly, bail out
    if (!img || !img.naturalWidth || !img.naturalHeight) {
      return null;
    }

    const w = AO_SAMPLE_SIZE;
    const h = AO_SAMPLE_SIZE;

    AO_ctx.clearRect(0, 0, w, h);
    AO_ctx.drawImage(img, 0, 0, w, h);
    const data = AO_ctx.getImageData(0, 0, w, h).data;

    let sum = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = AO_toLinear(data[i]);
      const g = AO_toLinear(data[i + 1]);
      const b = AO_toLinear(data[i + 2]);
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b; // WCAG luminance
      sum += L;
    }

    return sum / pixelCount;
  };

  const AO_MIN_ALPHA = 0.6;

  const AO_alphaForLuminance = (L_img) => {
    // Bad reading → fall back
    if (L_img == null || Number.isNaN(L_img)) {
      return AO_DEFAULT_ALPHA;
    }

    // If already dark, still keep a minimum overlay so hover can brighten
    if (L_img <= AO_L_TARGET_MAX) {
      return AO_MIN_ALPHA;
    }

    // Normal computed alpha
    const a = 1 - AO_L_TARGET_MAX / Math.max(L_img, 1e-6);
    const clamped = Math.max(AO_MIN_ALPHA, Math.min(AO_MAX_ALPHA, a));

    return clamped;
  };

  const AO_applyOverlayAlpha = (section, alpha) => {
    section.style.setProperty("--overlay-alpha", alpha.toFixed(3));
  };

  const AO_processSection = async (section) => {
    try {
      // Manual override via data-overlay="0.55" (optional)
      const manual = section.dataset.overlay;
      if (manual != null && manual !== "") {
        const a = Number(manual);
        if (!Number.isNaN(a)) {
          AO_applyOverlayAlpha(section, a);
          return;
        }
      }

      // Extract the background-image URL from computed styles
      const bg = getComputedStyle(section).backgroundImage;
      const m = bg && bg.match(/url\(["']?(.*?)["']?\)/);
      if (!m) {
        AO_applyOverlayAlpha(section, AO_DEFAULT_ALPHA);
        return;
      }
      const url = m[1];

      // Load image (same-origin or CORS-enabled for sampling)
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = url;

      try {
        await img.decode();
      } catch {
        // Ignore decode failures; we’ll try anyway
      }

      let L_img;
      try {
        L_img = AO_computeAverageLuminance(img);
        if (L_img == null) {
          AO_applyOverlayAlpha(section, AO_DEFAULT_ALPHA);
          return;
        }
      } catch {
        // Canvas read blocked (likely CORS) — fall back
        AO_applyOverlayAlpha(section, AO_DEFAULT_ALPHA);
        return;
      }

      const a = AO_alphaForLuminance(L_img);
      AO_applyOverlayAlpha(section, a);
    } catch {
      AO_applyOverlayAlpha(section, AO_DEFAULT_ALPHA);
    }
  };

  const AO_setupAdaptiveOverlays = () => {
    const targets = document.querySelectorAll("section.bg-image");
    if (!targets.length) return;

    // Prefer IntersectionObserver, but don’t *depend* on it
    if (!("IntersectionObserver" in window)) {
      targets.forEach((s) => AO_processSection(s));
      return;
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const s = entry.target;
            observer.unobserve(s);
            const idle =
              window.requestIdleCallback || ((fn) => setTimeout(fn, 0));
            idle(() => AO_processSection(s));
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    targets.forEach((s) => io.observe(s));
  };

  // --------------------------------------------
  // Mobile: lighten section when it scrolls into view (debounced)
  // --------------------------------------------
  const bgSections = document.querySelectorAll("section.bg-image");

  // Only run this on touch / mobile-ish devices.
  const isTouch =
    "ontouchstart" in window ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  if (isTouch && bgSections.length) {
    let ticking = false;

    const computeActiveSection = () => {
      ticking = false;

      let winner = null;
      let maxVisible = 0;
      const viewportH =
        window.innerHeight || document.documentElement.clientHeight;

      bgSections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        const visible =
          Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);

        if (visible > maxVisible) {
          maxVisible = visible;
          winner = sec;
        }
      });

      if (winner) {
        bgSections.forEach((sec) => {
          sec.classList.toggle("is-active", sec === winner);
        });
      }
    };

    const onScrollOrResize = () => {
      // requestAnimationFrame = debounce: at most once per frame
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(computeActiveSection);
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    // Run once on load so the first section is correct
    computeActiveSection();
  }

  // 👉 Call the setup once your other observers are in place
  AO_setupAdaptiveOverlays();
});
