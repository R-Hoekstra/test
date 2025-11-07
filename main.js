(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // ---- Element refs (exist on all pages) ----
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav");
    const menuOverlay = document.querySelector(".menu-overlay");
    const itemsMenu = document.getElementById("wb_CssMenu1");
    const navLinks = document.querySelectorAll(".nav-link");
    const navLinkHeader = document.querySelectorAll(".header-logo-group");
    const allLinks = [...navLinks, ...navLinkHeader].filter(
      (el) => el && el.getAttribute && el.getAttribute("href")
    );
    const sections = document.querySelectorAll("main section[id]");

    // ---- Helpers ----
    const root = document.documentElement;

    const updateLayoutVars = () => {
      const headerH = header
        ? Math.round(header.getBoundingClientRect().height)
        : 0;
      const footerH = footer
        ? Math.round(footer.getBoundingClientRect().height)
        : 0;
      root.style.setProperty("--header-h", `${headerH}px`);
      root.style.setProperty("--footer-h-px", `${footerH}px`);
    };

    const setAriaExpanded = (on) => {
      if (menuToggle) menuToggle.setAttribute("aria-expanded", String(!!on));
    };

    const openMenu = () => {
      if (!menuToggle || !navMenu || !menuOverlay) return;
      menuToggle.classList.add("active");
      navMenu.classList.add("active");
      menuOverlay.classList.add("active");
      setAriaExpanded(true);

      // Focus first focusable item inside menu for a11y
      const first = navMenu.querySelector(
        "a, button, [tabindex]:not([tabindex='-1'])"
      );
      if (first) first.focus();
    };

    const closeMenu = () => {
      if (!menuToggle || !navMenu || !menuOverlay) return;
      navMenu.classList.remove("active");
      menuOverlay.classList.remove("active");
      menuToggle.classList.remove("active");
      setAriaExpanded(false);
    };

    const isHash = (href) => href && href.startsWith("#");

    const highlightActiveLink = (targetHrefOrHash) => {
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        link.classList.toggle("active", href === targetHrefOrHash);
      });
    };

    // ---- Fade-in once styles are applied ----
    window.addEventListener("load", () => {
      requestAnimationFrame(() => document.body.classList.add("loaded"));
      updateLayoutVars();
    });

    window.addEventListener("resize", updateLayoutVars);

    // ---- Menu toggle button ----
    if (menuToggle && navMenu && menuOverlay) {
      menuToggle.addEventListener("click", () => {
        const isActive = !menuToggle.classList.contains("active");
        if (isActive) openMenu();
        else closeMenu();
      });

      // Click-away behavior
      document.addEventListener("click", (e) => {
        const overlayActive = menuOverlay.classList.contains("active");
        if (!overlayActive) return;

        const clickedToggle = menuToggle && menuToggle.contains(e.target);
        const clickedInsideOverlay = menuOverlay.contains(e.target);
        const clickedInsideItemsMenu = itemsMenu.contains(e.target);

        // Close only if the click was neither on the toggle nor inside the overlay
        if (
          !clickedToggle &&
          !clickedInsideOverlay &&
          !clickedInsideItemsMenu
        ) {
          closeMenu();
        }
      });

      // ESC to close menu
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuOverlay.classList.contains("active")) {
          closeMenu();
        }
      });
    }

    // ---- Smooth scrolling for hash links + active highlight on click ----
    allLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        highlightActiveLink(href);

        if (isHash(href)) {
          const id = href.slice(1);
          const target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          closeMenu(); // close drawer after in-page nav
        }
      });
    });

    // ---- Active link on load (hash → section; else → path) ----
    (function initActiveLink() {
      const currentUrl = window.location.href;
      const hasHash = currentUrl.includes("#");
      if (hasHash) {
        const hash = `#${currentUrl.split("#")[1]}`;
        highlightActiveLink(hash);
        return;
      }
      const currentPath =
        window.location.pathname.split("/").pop() || "index.html";
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        link.classList.toggle("active", href === currentPath);
      });
    })();

    // ---- Header show/hide on scroll (closes menu when scrolling down) ----
    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      const specialNoBg = document.body.classList.contains("no-header-bg");

      if (header) {
        if (y > lastScrollY) {
          // scrolling down
          header.classList.add("hidden");
          closeMenu();
        } else {
          // scrolling up
          header.classList.remove("hidden");
          if (!specialNoBg) {
            // optional: leave background styling to CSS if you prefer
            header.style.backgroundColor = "#040a0f";
          }
        }

        if (y === 0 && !specialNoBg) {
          header.style.backgroundColor = "rgba(244, 244, 244, 0)";
          closeMenu();
        }
      }

      lastScrollY = y;
    });

    // ---- Optional: update active link while scrolling between sections ----
    // Only runs if the page actually has identifiable sections with IDs.
    if (sections.length) {
      const onScrollHighlight = () => {
        const marker = window.scrollY + window.innerHeight / 2;
        let currentHash = null;
        sections.forEach((section) => {
          const top = section.offsetTop;
          const bottom = top + section.offsetHeight;
          if (marker >= top && marker < bottom) {
            currentHash = `#${section.id}`;
          }
        });
        if (currentHash) highlightActiveLink(currentHash);
      };
      window.addEventListener("scroll", onScrollHighlight, { passive: true });
      onScrollHighlight();
    }
  });
})();
