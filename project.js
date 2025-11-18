// project.bundle.js — page-specific logic only (works with main.js)
document.addEventListener("DOMContentLoaded", () => {
  /* ================================
     HERO BACKGROUND (data-bg)
  ================================= */
  document.querySelectorAll(".hero-background").forEach((section) => {
    const bg = section.getAttribute("data-bg");
    if (bg) section.style.backgroundImage = `url('${bg}')`;
  });

  /* ================================
     LIGHTBOX (accessible)
  ================================= */
  const images = document.querySelectorAll(".gallery-image");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox .close");
  const prevBtn = document.querySelector(".lightbox .prev");
  const nextBtn = document.querySelector(".lightbox .next");

  let currentIndex = 0;
  let lastActiveElement = null;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';

  function setDialogHidden(hidden) {
    if (!lightbox) return;
    if (hidden) {
      lightbox.setAttribute("hidden", "");
      lightbox.style.display = "none";
    } else {
      lightbox.removeAttribute("hidden");
      lightbox.style.display = "flex";
    }
  }

  function openLightbox(index, triggerEl) {
    if (!images.length || !lightboxImg) return;
    currentIndex = index;
    lastActiveElement = triggerEl || document.activeElement;

    const src = images[currentIndex].getAttribute("src");
    const alt = images[currentIndex].getAttribute("alt") || "";
    lightboxImg.src = src;
    lightboxImg.alt = alt;

    setDialogHidden(false);
    lightbox && lightbox.focus();

    document.querySelector("main")?.setAttribute("aria-hidden", "true");
    document.getElementById("header")?.setAttribute("aria-hidden", "true");
    document.getElementById("footer")?.setAttribute("aria-hidden", "true");
  }

  function closeLightbox() {
    setDialogHidden(true);
    document.querySelector("main")?.removeAttribute("aria-hidden");
    document.getElementById("header")?.removeAttribute("aria-hidden");
    document.getElementById("footer")?.removeAttribute("aria-hidden");
    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  function showPrev() {
    if (!images.length || !lightboxImg) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    const src = images[currentIndex].getAttribute("src");
    const alt = images[currentIndex].getAttribute("alt") || "";
    lightboxImg.src = src;
    lightboxImg.alt = alt;
  }

  function showNext() {
    if (!images.length || !lightboxImg) return;
    currentIndex = (currentIndex + 1) % images.length;
    const src = images[currentIndex].getAttribute("src");
    const alt = images[currentIndex].getAttribute("alt") || "";
    lightboxImg.src = src;
    lightboxImg.alt = alt;
  }

  images.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index, img));
  });
  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", showPrev);
  nextBtn?.addEventListener("click", showNext);

  document.addEventListener("keydown", (e) => {
    const isOpen = lightbox && !lightbox.hasAttribute("hidden");
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      showNext();
    } else if (e.key === "Tab") {
      const focusable = Array.from(
        lightbox.querySelectorAll(focusableSelector)
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === lightbox) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ================================
     PORTFOLIO SLIDER
  ================================= */
  (function initPortfolioSlider() {
    const slider = document.querySelector(".portfolio-slider");
    const wrapper = document.querySelector(".portfolio-wrapper");
    let cards = slider ? slider.querySelectorAll(".portfolio-card") : [];
    const prevBtn = document.querySelector(".arrow-left");
    const nextBtn = document.querySelector(".arrow-right");

    if (!slider || !wrapper || !cards.length) return;

    // 🔓 Make sure wrapper is interactive even if hidden-until-load sticks around
    wrapper.classList.remove("hidden-until-load");
    wrapper.style.pointerEvents = "auto";

    // --- indicators based on REAL cards (before cloning) ---
    const realCardCount = cards.length;
    const indicatorsContainer = wrapper.querySelector(".portfolio-indicators");
    let indicators = [];

    if (indicatorsContainer && realCardCount > 0) {
      indicatorsContainer.innerHTML = "";
      for (let i = 0; i < realCardCount; i++) {
        const span = document.createElement("span");
        span.className = "portfolio-indicator";

        // make them accessible & focusable
        span.setAttribute("role", "button");
        span.setAttribute("tabindex", "0");
        span.setAttribute("aria-label", `Go to project ${i + 1}`);

        indicatorsContainer.appendChild(span);
      }
      indicators = Array.from(indicatorsContainer.children);
    }

    // --- clone first & last for infinite loop ---
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, cards[0]);
    cards = slider.querySelectorAll(".portfolio-card");

    let index = 1; // start on first REAL card
    let isLocked = false;
    let transitionSafetyTimer = null;

    // map cloned index -> real index [0..realCardCount-1]
    function getRealIndex(idx) {
      if (!realCardCount) return 0;
      if (idx === 0) return realCardCount - 1; // left clone
      if (idx === cards.length - 1) return 0; // right clone
      return idx - 1;
    }

    function updateIndicatorsByIndex(idx) {
      if (!indicators.length) return;
      const realIdx = getRealIndex(idx);
      indicators.forEach((el, i) => {
        el.classList.toggle("active", i === realIdx);
      });
    }

    function setCardWidths() {
      const w = wrapper.clientWidth;
      cards.forEach((c) => {
        c.style.width = `${w}px`;
        c.style.flex = `0 0 ${w}px`;
      });
      slider.style.width = `${w * cards.length}px`;
    }

    function moveSlider(animate = true) {
      const w = wrapper.clientWidth;
      slider.style.transition = animate ? "transform 0.35s ease" : "none";
      slider.style.transform = `translate3d(-${index * w}px,0,0)`;
    }

    setCardWidths();
    moveSlider(false);
    updateIndicatorsByIndex(index);

    slider.addEventListener("transitionend", (e) => {
      // Only react to the main transform transition on the slider itself
      if (e.target !== slider || e.propertyName !== "transform") return;

      const lastRealIndex = cards.length - 2;
      if (index === cards.length - 1) {
        index = 1; // from right clone to first real
        moveSlider(false);
      } else if (index === 0) {
        index = lastRealIndex; // from left clone to last real
        moveSlider(false);
      }
      updateIndicatorsByIndex(index);

      // Clear safety timer if it exists
      if (transitionSafetyTimer) {
        clearTimeout(transitionSafetyTimer);
        transitionSafetyTimer = null;
      }

      requestAnimationFrame(() => {
        isLocked = false;
      });
    });

    function goTo(i) {
      if (!cards.length) return;

      // clamp target index so we never go outside [0, cards.length - 1]
      const maxIndex = cards.length - 1;
      if (i < 0) i = 0;
      if (i > maxIndex) i = maxIndex;

      // If we’re already on this slide, just sync and bail
      if (i === index) {
        moveSlider(false);
        updateIndicatorsByIndex(index);
        return;
      }

      if (isLocked) return;
      isLocked = true;
      index = i;
      updateIndicatorsByIndex(index);
      moveSlider(true);

      // Safety unlock in case "transitionend" doesn’t fire
      if (transitionSafetyTimer) {
        clearTimeout(transitionSafetyTimer);
      }
      transitionSafetyTimer = setTimeout(() => {
        isLocked = false;
        transitionSafetyTimer = null;
      }, 600); // a bit longer than the CSS transition (0.35s)
    }

    // arrows
    prevBtn?.addEventListener("click", () => {
      if (isLocked) return;
      goTo(index - 1);
    });
    nextBtn?.addEventListener("click", () => {
      if (isLocked) return;
      goTo(index + 1);
    });

    // keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    // drag + snap swipe with smoothing (more reliable on DuckDuckGo)
    // dynamic threshold:
    //  - quick swipe: 10% width
    //  - slow drag:  50% width (whichever card is more visible)
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchX = 0;
    let isDragging = false;
    let hasDirectionLock = false;
    let isHorizontal = false;
    let lastDxForTransform = 0; // smoothed drag distance

    let touchStartTime = 0;
    let lastTouchTime = 0;

    let scrollLocked = false; // 🔒 blocks vertical scroll once we’re swiping horizontally

    const directionLockThreshold = 12; // px before we decide direction
    const maxStepRatio = 0.18; // max ~18% of card width per move event
    const QUICK_SWIPE_TIME = 180; // ms: shorter than this = "quick swipe"

    function onTouchStart(e) {
      if (!e.touches || e.touches.length !== 1) return; // ignore multi-touch
      if (isLocked) return; // don't start a drag during a transition

      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      lastTouchX = touchStartX;

      const now = Date.now();
      touchStartTime = now;
      lastTouchTime = now;

      isDragging = true;
      hasDirectionLock = false;
      isHorizontal = false;
      lastDxForTransform = 0;
      scrollLocked = false; // reset at start of gesture

      // disable animation while dragging
      slider.style.transition = "none";
    }

    function onTouchMove(e) {
      if (!isDragging || !e.touches || !e.touches.length) return;

      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      lastTouchTime = Date.now();

      // Decide if this gesture is horizontal vs vertical
      if (!hasDirectionLock) {
        if (
          Math.abs(dx) > directionLockThreshold ||
          Math.abs(dy) > directionLockThreshold
        ) {
          hasDirectionLock = true;
          // slight bias toward vertical so pull-to-refresh still works if mostly vertical
          isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

          // 🔒 once we decide it's horizontal, lock scrolling
          if (isHorizontal) {
            scrollLocked = true;
          }
        }
      }

      // If we decided it's vertical: stop dragging, let page handle scroll / pull-to-refresh
      if (hasDirectionLock && !isHorizontal) {
        isDragging = false;
        scrollLocked = false;
        slider.style.transition = "";
        return;
      }

      // If scroll is locked for this gesture, block page scroll
      if (scrollLocked) {
        e.preventDefault();
      }

      if (!isHorizontal) {
        // still undecided, don't interfere with scroll yet
        return;
      }

      // From here on, we own the gesture
      lastTouchX = t.clientX;

      const w = wrapper.clientWidth;
      const baseOffset = -index * w;

      // --- SPEED LIMIT: smooth the drag so fast flicks don't jump too far in one frame ---
      const maxStep = w * maxStepRatio; // max px change per event
      let step = dx - lastDxForTransform;
      if (step > maxStep) step = maxStep;
      if (step < -maxStep) step = -maxStep;
      lastDxForTransform += step;

      // Never show more than one neighbour card
      const maxDrag = w;
      const clampedDx = Math.max(
        Math.min(lastDxForTransform, maxDrag),
        -maxDrag
      );

      slider.style.transform = `translate3d(${baseOffset + clampedDx}px, 0, 0)`;
    }

    function endDrag() {
      const wasDragging = isDragging;
      const wasHorizontal = isHorizontal;

      // reset flags first
      isDragging = false;
      hasDirectionLock = false;
      isHorizontal = false;
      scrollLocked = false; // 🔓 allow page scroll again

      if (!wasDragging || !wasHorizontal) {
        slider.style.transition = "";
        return;
      }

      const totalDx = lastTouchX - touchStartX;
      const w = wrapper.clientWidth;
      const absDx = Math.abs(totalDx);

      // ---- dynamic threshold based on swipe duration (quick vs slow) ----
      const durationMs = Math.max(1, lastTouchTime - touchStartTime);
      const isQuickSwipe = durationMs < QUICK_SWIPE_TIME; // e.g. 180ms

      // quick = 10% width, slow = 50% width (whichever card is more visible)
      const fastThreshold = w * 0.1;
      const slowThreshold = w * 0.5;
      const threshold = isQuickSwipe ? fastThreshold : slowThreshold;

      // 👉 smooth snap-back when you come up short
      if (absDx < threshold) {
        const baseOffset = -index * w;
        slider.style.transition = "transform 0.25s ease-out";
        slider.style.transform = `translate3d(${baseOffset}px, 0, 0)`;
        return;
      }

      // Otherwise, go to the next / previous slide
      let targetIndex = index;
      if (totalDx <= -threshold) {
        // swipe left -> next
        targetIndex = index + 1;
      } else if (totalDx >= threshold) {
        // swipe right -> prev
        targetIndex = index - 1;
      }

      // Let goTo() handle its own transition + infinite-loop logic
      slider.style.transition = "";
      goTo(targetIndex);
    }

    function onTouchEnd() {
      endDrag();
    }

    function onTouchCancel() {
      // some browsers (DuckDuckGo/WebView) fire cancel instead of end
      endDrag();
    }

    // IMPORTANT: passive:false so preventDefault actually works
    slider.addEventListener("touchstart", onTouchStart, { passive: false });
    slider.addEventListener("touchmove", onTouchMove, { passive: false });
    slider.addEventListener("touchend", onTouchEnd);
    slider.addEventListener("touchcancel", onTouchCancel);

    // clickable indicators (mouse + keyboard)
    if (indicators.length) {
      indicators.forEach((el, realIdx) => {
        const goToIndicator = () => {
          // +1 because index 0 is the left clone
          goTo(realIdx + 1);
        };

        el.addEventListener("click", goToIndicator);

        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToIndicator();
          }
        });
      });
    }

    // keep layout correct on resize + bfcache restore
    const refreshLayout = () => {
      setCardWidths();
      moveSlider(false);
      updateIndicatorsByIndex(index);
    };

    window.addEventListener("resize", refreshLayout);
    window.addEventListener("pageshow", refreshLayout);
  })();
});

/* ================================
   KEEP THIS (unhide cards on load)
   main.js sets body.loaded; we only remove the helper class here.
================================ */
window.addEventListener("load", () => {
  document.querySelectorAll(".hidden-until-load").forEach((el) => {
    el.classList.remove("hidden-until-load");
  });
});
