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
  // Adaptive background-darkness overlay (added, fully scoped)
  // ============================================================

  // Config (tweak if you'd like)
  const AO_TARGET_CONTRAST = 4.5; // WCAG AA for normal text
  const AO_L_TARGET_MAX = (1.0 + 0.05) / AO_TARGET_CONTRAST - 0.05; // ≈ 0.183
  const AO_MAX_ALPHA = 0.7; // upper bound to avoid over-darkening
  const AO_DEFAULT_ALPHA = 0.6; // safe fallback when sampling fails
  const AO_SAMPLE_SIZE = 32; // small for speed

  const AO_toLinear = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const AO_computeAverageLuminance = (img) => {
    const w = AO_SAMPLE_SIZE,
      h = AO_SAMPLE_SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = AO_toLinear(data[i]);
      const g = AO_toLinear(data[i + 1]);
      const b = AO_toLinear(data[i + 2]);
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b; // WCAG luminance
      sum += L;
    }
    return sum / (data.length / 4);
  };

  const AO_MIN_ALPHA = 0.6;

  const AO_alphaForLuminance = (L_img) => {
    // Debug: confirm live + show luminance
    console.log("✅ to make sure it is new ", { L_img });

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
        /* ignore decode failures */
      }

      let L_img;
      try {
        L_img = AO_computeAverageLuminance(img);
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

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const s = entry.target;
            io.unobserve(s);
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

  // 👉 Call the setup once your other observers are in place
  AO_setupAdaptiveOverlays();
});
