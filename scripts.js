/**
 * @fileoverview Main JavaScript for the website, handling animations and interactivity.
 * @version 2.0.0
 */

/**
 * Throttles a function to limit how often it can be called.
 * @param {Function} func The function to throttle.
 * @param {number} limit The throttle limit in milliseconds.
 * @returns {Function} The throttled function.
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Manages smooth scrolling for anchor links and active link highlighting.
 */
class SmoothScroll {
  constructor() {
    this.navLinks = document.querySelectorAll("nav ul li a");
    if (this.navLinks.length > 0) {
      this.init();
    }
  }

  init() {
    this.addSmoothScroll();
    this.addSectionObserver();
  }

  addSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  addSectionObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          this.navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    }, options);

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });
  }
}

/**
 * Handles the mobile navigation menu toggle and behavior.
 */
class MobileMenu {
  constructor() {
    this.navToggle = document.querySelector(".nav-toggle");
    this.navMenu = document.querySelector(".main-nav"); // Target the nav container
    if (this.navToggle && this.navMenu) {
      this.navToggleIcon = this.navToggle.querySelector("i");
      this.init();
    }
  }

  init() {
    this.navToggle.addEventListener("click", () => this.toggleMenu());
    document.addEventListener("click", (e) => this.closeOnOutsideClick(e));
    window.addEventListener(
      "resize",
      throttle(() => this.handleResize(), 200)
    );
  }

  toggleMenu() {
    const isActive = this.navMenu.classList.toggle("active");
    this.navToggle.classList.toggle("active", isActive);
    this.navToggle.setAttribute("aria-expanded", isActive);

    if (isActive) {
      this.navToggleIcon.classList.replace("fa-bars", "fa-times");
      document.body.style.overflow = "hidden";
    } else {
      this.navToggleIcon.classList.replace("fa-times", "fa-bars");
      document.body.style.overflow = "";
    }
  }

  closeMenu() {
    if (this.navMenu.classList.contains("active")) {
      this.navMenu.classList.remove("active");
      this.navToggle.classList.remove("active");
      this.navToggleIcon.classList.replace("fa-times", "fa-bars");
      document.body.style.overflow = "";
    }
  }

  closeOnOutsideClick(e) {
    if (
      !this.navToggle.contains(e.target) &&
      !this.navMenu.contains(e.target)
    ) {
      this.closeMenu();
    }
  }

  handleResize() {
    if (window.innerWidth > 768) {
      this.closeMenu();
    }
  }
}

/**
 * Manages contact form submission, validation, and user feedback.
 * NOTE: Requires CSS for .toast, .toast-close, .toast-success, .toast-error, and .invalid classes.
 */
class FormHandler {
  constructor() {
    this.form = document.getElementById("contact-form");
    if (this.form) this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);

    if (!this.validateForm(formData)) {
      this.showToast("Please fill in all required fields correctly.", "error");
      return;
    }

    // This is a placeholder for a real API endpoint.
    // In a real application, you would send this to your server.
    try {
      this.showToast("Submitting...", "info"); // Show pending state
      // const response = await fetch("/api/contact", {
      //   method: "POST",
      //   body: JSON.stringify(Object.fromEntries(formData)),
      //   headers: { "Content-Type": "application/json" },
      // });

      // Mock successful response after 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = { ok: true };

      if (response.ok) {
        this.form.reset();
        this.showToast(
          "Thank you for your message. We will get back to you soon. God bless you!",
          "success"
        );
      } else {
        // const errorData = await response.json(); // Uncomment for real API
        throw new Error("Server error");
      }
    } catch (error) {
      this.showToast("An error occurred. Please try again later.", "error");
      console.error("Form submission error:", error);
    }
  }

  validateForm(formData) {
    let isValid = true;
    this.form.querySelectorAll("[required]").forEach((field) => {
      if (!formData.get(field.name)?.trim()) {
        field.classList.add("invalid");
        isValid = false;
      } else {
        field.classList.remove("invalid");
      }
    });

    const emailField = this.form.querySelector('[name="email"]');
    if (emailField) {
      const email = formData.get("email");
      if (
        email &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
      ) {
        emailField.classList.add("invalid");
        isValid = false;
      } else {
        emailField.classList.remove("invalid");
      }
    }
    return isValid;
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);

    const removeToast = () => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector(".toast-close").addEventListener("click", removeToast);
    setTimeout(removeToast, 5000);
  }
}

/**
 * Animates elements when they scroll into the viewport using IntersectionObserver.
 */
class ScrollAnimator {
  constructor() {
    this.animatedElements = document.querySelectorAll(".animate-on-scroll");
    if (this.animatedElements.length > 0) {
      this.init();
    }
  }

  init() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "animate__animated",
              "animate__fadeInUp"
            );
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    this.animatedElements.forEach((element) => observer.observe(element));
  }
}

/**
 * Creates a cinematic fade and scale effect on the hero content during scroll.
 */
class HeroAnimator {
  constructor() {
    this.heroContent = document.querySelector(".hero-content");
    this.ticking = false;
    if (this.heroContent) {
      this.init();
    }
  }

  init() {
    window.addEventListener("scroll", () => this.onScroll());
  }

  onScroll() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.animateHero();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  animateHero() {
    const scrollY = window.scrollY;
    const opacity = Math.max(1 - scrollY / 400, 0);
    const scale = Math.max(1 - scrollY / 1000, 0.95);
    this.heroContent.style.opacity = opacity;
    this.heroContent.style.transform = `scale(${scale})`;
  }
}

// ================== Initialize All Classes ==================
document.addEventListener("DOMContentLoaded", () => {
  new SmoothScroll();
  new MobileMenu();
  new FormHandler();
  new ScrollAnimator();
  new HeroAnimator();
});
