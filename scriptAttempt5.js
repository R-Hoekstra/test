document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav");
  const menuOverlay = document.querySelector(".menu-overlay");
  const navLinks = document.querySelectorAll(".nav-link");
  const navLinkHeader = document.querySelectorAll(".nav-link-header");
  const itemsMenu = document.getElementById("wb_CssMenu1");
  let lastScrollY = window.scrollY;

  // Vertical Line Height Adjustment
  const verticalLine = document.querySelector(".vertical-line");
  const footer = document.getElementById("footer"); // Assuming footer has id="footer"

  // Function to update the height of the vertical line
  function updateVerticalLineHeight() {
    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    // Check if header is hidden
    const isHeaderHidden = header.classList.contains("hidden");
    const headerHeight = header.offsetHeight;
    const headerOffset = isHeaderHidden ? 15 : headerHeight + 15; // 8 for padding or margin

    // console.log("===== Vertical Line Update =====");
    // console.log("Window height:", windowHeight);
    // console.log("Footer top position (relative to viewport):", footerTop);
    // console.log("Header is hidden:", isHeaderHidden);
    // console.log("Header height:", headerHeight);
    // console.log(
    //   "Calculated header offset (top of vertical line):",
    //   headerOffset
    // );

    // Update top position dynamically
    verticalLine.style.top = `${headerOffset}px`;
    console.log("Vertical line top set to:", verticalLine.style.top);

    // Update height depending on footer position
    if (footerTop < windowHeight) {
      verticalLine.style.transition = "none"; // Disable transition
      const heightBeforeFooter = footerTop - headerOffset - 12;
      verticalLine.style.height = `${heightBeforeFooter}px`;
      console.log(
        "Footer is visible — vertical line height set to:",
        verticalLine.style.height
      );
    } else {
      verticalLine.style.transition = "top 0.5s ease, height 0.5s ease"; // Re-enable transition
      const defaultHeight = `calc(100vh - ${headerOffset + 16}px)`;
      verticalLine.style.height = defaultHeight;
      console.log(
        "Footer not near — vertical line height set to:",
        defaultHeight
      );
    }

    console.log("================================\n");
  }

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

  // Scroll behavior for header
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
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

    // At top of page
    if (currentScrollY === 0) {
      header.style.backgroundColor = "rgba(244, 244, 244, 0)";
      closeMenu();
    }

    // Update vertical line height when scrolling
    updateVerticalLineHeight();

    lastScrollY = currentScrollY;
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
        e.preventDefault(); // Prevent default anchor behavior

        if (targetHref === "#top") {
          // Special case: scroll to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const targetId = targetHref.substring(1);
          const targetSection = document.getElementById(targetId);

          if (targetSection) {
            targetSection.scrollIntoView({ behavior: "smooth" });
          } else {
            console.warn(`Section with id "${targetId}" not found.`);
          }
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
    highlightActiveLink(currentHash);
  } else {
    const currentPath = window.location.pathname.split("/").pop();
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Initialize the vertical line height on page load
  updateVerticalLineHeight();
});

function setHeaderOffset() {
  const header = document.getElementById("header");
  if (header) {
    document.documentElement.style.setProperty(
      "--header-offset",
      header.offsetHeight + 50 + "px"
    );
  }
}

window.addEventListener("load", setHeaderOffset);
window.addEventListener("resize", setHeaderOffset);
