import {
  animationManager,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerFadeIn,
} from "../utils/animations.ts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animation initialization for Dialogh website
class DialoghAnimations {
  private isInitialized = false;
  private scrollProgress: (() => void) | null = null;
  private parallaxCleanup: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initAnimations(),
      );
    } else {
      this.initAnimations();
    }

    this.isInitialized = true;
  }

  private initAnimations() {
    // Preload animation states
    this.preloadAnimationStates();

    // Initialize different section animations
    this.initHeroAnimations();
    this.initAboutAnimations();
    this.initEventsAnimations();
    this.initTestimonialsAnimations();
    this.initTimelineAnimations();
    this.initChoicesAnimations();
    this.initProfileGalleryAnimations();
    this.initFooterAnimations();

    // Initialize utility animations
    this.initScrollProgress();
    this.initParallaxEffects();
    this.initTextAnimations();
    this.initButtonAnimations();
    this.initCardAnimations();

    // Initialize intersection observer for performance
    this.initPerformanceOptimizations();
  }

  private preloadAnimationStates() {
    // Set initial states for elements that will animate
    const selectors = [
      '[data-animate="fade-up"]',
      '[data-animate="fade-left"]',
      '[data-animate="fade-right"]',
      '[data-animate="scale"]',
      ".animate-on-scroll",
      ".stagger-children > *",
    ];

    animationManager.preloadAnimations(selectors);
  }

  private initHeroAnimations() {
    // Hero section entrance animation
    const heroTimeline = animationManager.createTimeline({
      paused: true,
    });

    // Set initial states
    gsap.set(".hero h1", { opacity: 0, y: 60 });
    gsap.set(".hero p", { opacity: 0, y: 40 });
    gsap.set(".hero button", { opacity: 0, y: 30, scale: 0.8 });
    gsap.set("#scroll-to-about", { opacity: 0, y: 20 });

    // Hero text animations
    heroTimeline
      .to(".hero h1", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      })
      .to(
        ".hero p",
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.6",
      )
      .to(
        ".hero button",
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )
      .to(
        "#scroll-to-about",
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2",
      );

    // Play hero animation on page load
    setTimeout(() => heroTimeline.play(), 300);

    // Hero background image parallax
    this.parallaxCleanup = animationManager.parallax({
      targets: '.hero [src*="dialogh-hero"]',
      speed: 0.3,
      direction: "vertical",
    });
  }

  private initAboutAnimations() {
    // About section badge
    fadeInUp(".about-section .bg-white\\/10", {
      threshold: 0.3,
      duration: 600,
    });

    // About conversation bubbles
    staggerFadeIn(".about-section .bg-white\\/20", {
      staggerDelay: 200,
      threshold: 0.2,
    });

    // About text blocks
    fadeInLeft(".about-section .max-w-xl", {
      threshold: 0.1,
      duration: 1000,
      delay: 300,
    });

    // About cards carousel
    animationManager.inView({
      targets: "#about-cards",
      threshold: 0.1,
      preset: "scaleIn",
      duration: 800,
      delay: 500,
    });
  }

  private initEventsAnimations() {
    // Events section stagger animation
    staggerFadeIn(".events-section > *", {
      staggerDelay: 150,
      threshold: 0.15,
      staggerFrom: "start",
    });

    // Event cards hover animations
    const eventCards = document.querySelectorAll(".event-card");
    eventCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }

  private initTestimonialsAnimations() {
    // Testimonials section
    fadeInUp(".testimonials-section", {
      threshold: 0.1,
      duration: 800,
    });

    // Individual testimonial cards
    staggerFadeIn(".testimonial-card", {
      staggerDelay: 200,
      threshold: 0.2,
      preset: "scaleIn",
    });
  }

  private initTimelineAnimations() {
    // Timeline items with stagger
    const timelineItems = document.querySelectorAll(".timeline-item");

    timelineItems.forEach((item, index) => {
      animationManager.inView({
        targets: item,
        threshold: 0.3,
        duration: 800,
        delay: index * 150,
        from: {
          opacity: 0,
          translateX: index % 2 === 0 ? -60 : 60,
          scale: 0.9,
        },
        to: {
          opacity: 1,
          translateX: 0,
          scale: 1,
        },
        ease: "out(expo)",
      });
    });

    // Timeline line animation
    animationManager.onScroll({
      targets: ".timeline-line",
      trigger: ".timeline-section",
      start: "top center",
      end: "bottom center",
      from: { scaleY: 0 },
      to: { scaleY: 1 },
      scrub: true,
    });
  }

  private initChoicesAnimations() {
    // Choices section
    fadeInUp(".choices-section", {
      threshold: 0.1,
      duration: 1000,
    });

    // Choice items
    staggerFadeIn(".choice-item", {
      staggerDelay: 100,
      threshold: 0.2,
      preset: "fadeInLeft",
    });
  }

  private initProfileGalleryAnimations() {
    // Profile gallery grid
    staggerFadeIn(".profile-gallery .profile-item", {
      staggerDelay: 80,
      threshold: 0.1,
      preset: "scaleIn",
      staggerFrom: "center",
    });

    // Profile image hover effects
    const profileImages = document.querySelectorAll(".profile-item img");
    profileImages.forEach((img) => {
      const container = img.parentElement;

      container?.addEventListener("mouseenter", () => {
        gsap.to(img, {
          scale: 1.1,
          rotation: 2,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      container?.addEventListener("mouseleave", () => {
        gsap.to(img, {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      });
    });
  }

  private initFooterAnimations() {
    // Footer animation
    fadeInUp(".footer", {
      threshold: 0.1,
      duration: 800,
    });

    // Footer links stagger
    staggerFadeIn(".footer a", {
      staggerDelay: 50,
      threshold: 0.2,
      preset: "fadeInUp",
    });
  }

  private initScrollProgress() {
    // Create scroll progress indicator
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    document.body.appendChild(progressBar);

    this.scrollProgress = animationManager.scrollProgress(".scroll-progress");
  }

  private initParallaxEffects() {
    // Background elements parallax
    const parallaxElements = document.querySelectorAll(".parallax-element");
    parallaxElements.forEach((element, index) => {
      animationManager.parallax({
        targets: element,
        speed: 0.2 + index * 0.1, // Varying speeds
        direction: "vertical",
      });
    });
  }

  private initTextAnimations() {
    // Animate headings
    const headings = document.querySelectorAll("h1, h2, h3");
    headings.forEach((heading) => {
      animationManager.animateText({
        targets: heading,
        preset: "fadeInUp",
        splitBy: "words",
        staggerDelay: 100,
      });
    });

    // Animate special text elements
    animationManager.animateText({
      targets: ".animate-text",
      preset: "fadeInUp",
      splitBy: "chars",
      staggerDelay: 50,
    });
  }

  private initButtonAnimations() {
    // Button hover animations
    const buttons = document.querySelectorAll("button, .button");
    buttons.forEach((button) => {
      button.classList.add("animate-button");

      // Magnetic effect for larger buttons
      if (button.classList.contains("large-button")) {
        this.addMagneticEffect(button as HTMLElement);
      }
    });
  }

  private initCardAnimations() {
    // Card hover animations
    const cards = document.querySelectorAll(
      ".card, .testimonial-card, .event-card",
    );
    cards.forEach((card) => {
      card.classList.add("animate-card");
    });
  }

  private addMagneticEffect(element: HTMLElement) {
    const handleMouseEnter = () => {
      element.style.transition = "transform 0.2s ease-out";
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const deltaX = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const deltaY = (e.clientY - rect.top - rect.height / 2) * 0.2;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "expo.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
  }

  private initPerformanceOptimizations() {
    // Add performance optimization classes
    const animatedElements = document.querySelectorAll(
      "[data-animate], .animate-element",
    );
    animatedElements.forEach((element) => {
      element.classList.add("gpu-accelerated");
    });

    // Clean up will-change properties after animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          element.style.willChange = "transform, opacity";
        } else {
          element.style.willChange = "auto";
        }
      });
    });

    animatedElements.forEach((element) => observer.observe(element));
  }

  // Public method to trigger specific animations
  public triggerAnimation(selector: string, preset: string = "fadeInUp") {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    animationManager.inView({
      targets: selector,
      preset: preset as any,
      once: false,
    });
  }

  // Cleanup method
  public destroy() {
    if (this.scrollProgress) {
      this.scrollProgress();
    }
    if (this.parallaxCleanup) {
      this.parallaxCleanup();
    }
    animationManager.destroy();
  }
}

// Initialize animations and export instance
const dialoghAnimations = new DialoghAnimations();

// Export for external use
export default dialoghAnimations;

// Global access for debugging
if (typeof window !== "undefined") {
  (window as any).dialoghAnimations = dialoghAnimations;
}

// Page visibility API for performance
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause animations when page is not visible
    document.querySelectorAll(".animate-element").forEach((el) => {
      (el as HTMLElement).style.animationPlayState = "paused";
    });
  } else {
    // Resume animations when page becomes visible
    document.querySelectorAll(".animate-element").forEach((el) => {
      (el as HTMLElement).style.animationPlayState = "running";
    });
  }
});
