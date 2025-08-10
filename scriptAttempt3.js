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
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Vertical Line Height Adjustment
  const verticalLine = document.querySelector(".vertical-line");
  const footer = document.getElementById("footer"); // Assuming footer has id="footer"

  // Function to close the menu
  const closeMenu = () => {
    navMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    menuToggle.classList.remove("active");
  };

  // Highlight the active menu item
  const highlightActiveLink = (currentHref) => {
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      if (linkHref === currentHref) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  // Determine which menu item should be highlighted based on scroll position
  const updateActiveLinkOnScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    sections.forEach((section) => {
      if (section) {
        const sectionId = section.getAttribute("id");
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          highlightActiveLink(`#${sectionId}`);
        }
      }
    });
  };

  // Scroll behavior for header
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Check if the page is the specific one where the header background should always be hidden
    const isSpecialPage = document.body.classList.contains("no-header-bg");

    if (currentScrollY > lastScrollY) {
      // Scrolling down: Hide header
      header.classList.add("hidden");
      closeMenu();
      header.style.backgroundColor = "rgba(244, 244, 244, 0)";
    } else {
      // Scrolling up: Show header
      header.classList.remove("hidden");
      if (!isSpecialPage) {
        header.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      }
    }

    // Reset menu when at the top
    if (currentScrollY === 0) {
      header.style.backgroundColor = "rgba(244, 244, 244, 0)";
      closeMenu();
    }

    lastScrollY = currentScrollY;

    // Update active link based on scroll position
    updateActiveLinkOnScroll();
  });

  // Toggle menu on click
  menuToggle.addEventListener("click", () => {
    const isActive = menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active", isActive);
    menuOverlay.classList.toggle("active", isActive);
  });

  // Close menu when clicking outside the menu-overlay
  document.addEventListener("click", (event) => {
    const isOverlayActive = menuOverlay.classList.contains("active");

    // If overlay is not active, do nothing
    if (!isOverlayActive) return;

    // Check if click is outside of menuOverlay and menuToggle
    const clickedInsideOverlay = menuOverlay.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);
    const clickedMenuItems = itemsMenu.contains(event.target);

    if (!clickedInsideOverlay && !clickedToggle && !clickedMenuItems) {
      closeMenu(); // Your existing function to close everything
    }
  });

  const allLinks = [...navLinks, ...navLinkHeader];
  // Handle clicks on navigation links
  allLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetHref = link.getAttribute("href");

      // Highlight the clicked link
      highlightActiveLink(targetHref);

      if (targetHref.startsWith("#")) {
        // Internal link: Scroll smoothly to section
        const targetId = targetHref.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          e.preventDefault(); // Prevent default anchor behavior
          targetSection.scrollIntoView({ behavior: "smooth" });
        } else {
          console.warn(`Section with id "${targetId}" not found.`);
        }
      } else {
        // External link: Allow navigation to new page
      }
    });
  });

  // Highlight menu item on page load
  const currentUrl = window.location.href;
  const currentHash = currentUrl.includes("#")
    ? `#${currentUrl.split("#")[1]}`
    : null;

  if (currentHash) {
    // Highlight based on hash in URL
    highlightActiveLink(currentHash);
  } else {
    // If no hash, highlight the first menu item or determine based on the current page
    const currentPath = window.location.pathname.split("/").pop();
    navLinks.forEach((link) => {
      if (
        link.getAttribute("href") === currentPath ||
        link.getAttribute("href") === `#${sections[0].id}`
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add 'visible' to navigation if it exists
          const navigation = entry.target.querySelector(".navigation");
          if (navigation) {
            navigation.classList.add("visible");
          }

          // Add 'visible' to content2 if it exists
          const content2 = entry.target.querySelector(".content2");
          if (content2) {
            content2.classList.add("visible");
          }
        }
      });
    },
    {
      threshold: 0.6, // Trigger when 60% of the element is visible
    }
  );

  // Observe all sections and content-wrapper-info
  document
    .querySelectorAll("section, .content-wrapper-info")
    .forEach((element) => {
      observer.observe(element);
    });
  const sections2 = document.querySelectorAll("section");

  sections2.forEach((section) => {
    section.addEventListener("mouseenter", () => {
      // Add a class to body based on the section's ID
      document.body.classList.add(`bg-${section.id}`);
    });

    section.addEventListener("mouseleave", () => {
      // Remove the dynamically added class from the body
      document.body.classList.remove(`bg-${section.id}`);

      // Reset the background color of the section when the mouse leaves
      section.style.backgroundColor = ""; // Reset to the default background
    });
  });
});
