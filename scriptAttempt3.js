// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   const header = document.getElementById("header");
//   let lastScrollY = window.scrollY;

//   window.addEventListener("scroll", () => {
//     const currentScrollY = window.scrollY;

//     // Scrolling Down: Hide Header
//     if (currentScrollY > lastScrollY) {
//       header.classList.add("hidden");
//       header.classList.remove("visible");
//     }
//     // Scrolling Up: Show Header
//     else if (currentScrollY < lastScrollY) {
//       header.classList.remove("hidden");
//       header.classList.add("visible");
//     }

//     // If at the top of the page, remove the background
//     if (currentScrollY === 0) {
//       header.style.backgroundColor = "rgba(244, 244, 244, 0)";
//     } else if (currentScrollY > 0) {
//       header.style.backgroundColor = "rgba(244, 244, 244, 0.9)"; // Background becomes visible again when scrolling down
//     }

//     lastScrollY = currentScrollY;
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  let lastScrollY = window.scrollY;
  let scrollTimeout = null;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Scrolling Down: Hide Header after 0.2s delay
    if (currentScrollY > lastScrollY) {
      // If timeout already exists, clear it
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Start delay for hiding the header
      scrollTimeout = setTimeout(() => {
        header.classList.add("hidden");
        header.classList.remove("visible");
        header.style.backgroundColor = "rgba(244, 244, 244, 0)"; // Hide background when scrolling down
      }, 100); // 0.2 seconds delay

      header.classList.remove("visible");
    }
    // Scrolling Up: Show Header
    else if (currentScrollY < lastScrollY) {
      // Clear the timeout if we scroll up before the hide effect happens
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      header.classList.remove("hidden");
      header.classList.add("visible");
      header.style.backgroundColor = "rgba(244, 244, 244, 0.9)"; // Show background when scrolling up
    }

    // If at the top of the page, remove the background
    if (currentScrollY === 0) {
      header.style.backgroundColor = "rgba(244, 244, 244, 0)";
    }

    lastScrollY = currentScrollY;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuItems = document.querySelector(".nav");
  const menuOverlay = document.querySelector(".menu-overlay"); // Get the overlay
  const cssMenu = document.querySelector("#wb_CssMenu1");

  menuToggle.addEventListener("click", () => {
    menuItems.classList.toggle("active");
    menuToggle.classList.toggle("active"); // Toggle the active class to change the icon
    menuOverlay.classList.toggle("active"); // Toggle the overlay to show/hide
  });
});
