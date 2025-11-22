// index.js

document.addEventListener("DOMContentLoaded", () => {
  const images = [
    "images/wood_Community_Final_Render.jpg",
    "images/culture_Roof_Final_Render.jpg",
    "images/sportpark_Marslanden_Final_Render.jpg",
  ];

  // Preload images for smoother transitions
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  const slideshow = document.getElementById("background-slideshow");
  let current = 0;
  const slides = [];

  // Create slide elements
  images.forEach((src, index) => {
    const slide = document.createElement("div");
    slide.classList.add("bg-slide");
    if (index === 0) slide.classList.add("active");
    slide.style.backgroundImage = `url('${src}')`;
    slideshow.appendChild(slide);
    slides.push(slide);
  });

  function showNextSlide() {
    const currentSlide = slides[current];
    currentSlide.classList.remove("active");
    currentSlide.classList.add("exit");

    // Determine the next slide index
    current = (current + 1) % slides.length;
    const nextSlide = slides[current];
    nextSlide.classList.add("active");

    // After transition ends, reset exiting slide (must match CSS transition time)
    setTimeout(() => {
      currentSlide.classList.remove("exit");
    }, 2000);
  }

  // Start slideshow with a bit more buffer to ensure smooth cycling
  let interval = setInterval(showNextSlide, 4000);

  // Pause/resume when the tab visibility changes to keep timing smooth and save CPU
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(interval);
    } else {
      clearInterval(interval);
      interval = setInterval(showNextSlide, 4000);
    }
  });
});
