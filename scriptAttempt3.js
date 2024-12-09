document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav");
  const menuOverlay = document.querySelector(".menu-overlay");
  const navLinks = document.querySelectorAll(".nav-link");
  let lastScrollY = window.scrollY;

  // Function to close the menu
  const closeMenu = () => {
    navMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    menuToggle.classList.remove("active");
  };

  // Scroll behavior
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // Scrolling down: Hide header and menu
      header.classList.add("hidden");
      closeMenu();
      // Reset background when scrolling down
      header.style.backgroundColor = "rgba(244, 244, 244, 0)";
    } else {
      // Scrolling up: Show header with background
      header.classList.remove("hidden");
      header.style.backgroundColor = "rgba(244, 244, 244, 0.9)"; // Adjust to desired opacity
    }

    // Reset menu when at the top
    if (currentScrollY === 0) {
      header.style.backgroundColor = "rgba(244, 244, 244, 0)"; // Transparent when at the top
      closeMenu();
    }

    lastScrollY = currentScrollY;
  });

  // Toggle menu on click
  menuToggle.addEventListener("click", () => {
    const isActive = menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active", isActive);
    menuOverlay.classList.toggle("active", isActive);
  });

  // Close menu when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
