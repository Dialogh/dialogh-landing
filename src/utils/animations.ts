import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animation configuration types
export interface AnimationConfig {
  targets: string | Element | Element[];
  duration?: number;
  delay?: number | Function;
  ease?: string;
  autoplay?: boolean;
}

export interface InViewConfig extends AnimationConfig {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export interface ScrollAnimationConfig extends AnimationConfig {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean;
}

// Animation presets - converted to GSAP equivalents
export const ANIMATION_PRESETS = {
  fadeInUp: {
    from: {
      opacity: 0,
      y: 60,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
    },
  },
  fadeInDown: {
    from: {
      opacity: 0,
      y: -60,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
    },
  },
  fadeInLeft: {
    from: {
      opacity: 0,
      x: -60,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "power2.out",
    },
  },
  fadeInRight: {
    from: {
      opacity: 0,
      x: 60,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "power2.out",
    },
  },
  scaleIn: {
    from: {
      opacity: 0,
      scale: 0.8,
    },
    to: {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.out",
    },
  },
  slideUp: {
    from: {
      opacity: 0,
      y: 100,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    },
  },
  rotateIn: {
    from: {
      opacity: 0,
      rotation: -45,
      scale: 0.8,
    },
    to: {
      opacity: 1,
      rotation: 0,
      scale: 1,
      duration: 1,
      ease: "back.out(1.7)",
    },
  },
} as const;

// Main AnimationManager class
export class AnimationManager {
  private observers: IntersectionObserver[] = [];
  private scrollTriggers: ScrollTrigger[] = [];
  private animations: gsap.core.Tween[] = [];
  private timelines: gsap.core.Timeline[] = [];
  private isReduced: boolean;

  constructor() {
    this.isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.setupMediaQuery();
  }

  private setupMediaQuery() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", (e) => {
      this.isReduced = e.matches;
    });
  }

  // In-view animations using Intersection Observer
  inView(config: InViewConfig & { preset?: keyof typeof ANIMATION_PRESETS }) {
    if (this.isReduced) return;

    const {
      targets,
      threshold = 0.1,
      rootMargin = "0px 0px -10% 0px",
      once = true,
      preset,
      ...animationConfig
    } = config;

    const elements =
      typeof targets === "string"
        ? document.querySelectorAll(targets)
        : Array.isArray(targets)
        ? targets
        : [targets];

    // Set initial states if using preset
    if (preset && ANIMATION_PRESETS[preset]) {
      const presetConfig = ANIMATION_PRESETS[preset];
      gsap.set(elements, presetConfig.from);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;

            // Apply preset if specified
            let finalConfig = { ...animationConfig };
            if (preset && ANIMATION_PRESETS[preset]) {
              const presetConfig = ANIMATION_PRESETS[preset];
              finalConfig = { ...presetConfig.to, ...animationConfig };
            }

            const animation = gsap.to(element, finalConfig);
            this.animations.push(animation);

            if (once) {
              observer.unobserve(element);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    elements.forEach((element) => {
      if (element instanceof Element) {
        observer.observe(element);
      }
    });

    this.observers.push(observer);
    return observer;
  }

  // Scroll-triggered animations using GSAP ScrollTrigger
  onScroll(
    config: ScrollAnimationConfig & { preset?: keyof typeof ANIMATION_PRESETS }
  ) {
    if (this.isReduced) return;

    const {
      targets,
      trigger,
      start = "top 80%",
      end = "bottom 20%",
      scrub = false,
      preset,
      ...animationConfig
    } = config;

    let animConfig = { ...animationConfig };

    // Apply preset if specified
    if (preset && ANIMATION_PRESETS[preset]) {
      const presetConfig = ANIMATION_PRESETS[preset];
      gsap.set(targets, presetConfig.from);
      animConfig = { ...presetConfig.to, ...animationConfig };
    }

    const scrollTrigger = ScrollTrigger.create({
      trigger: trigger || targets,
      start,
      end,
      scrub,
      onEnter: () => {
        const animation = gsap.to(targets, animConfig);
        this.animations.push(animation);
      },
      onLeave: () => {
        if (scrub) {
          gsap.to(targets, {
            ...ANIMATION_PRESETS[preset as keyof typeof ANIMATION_PRESETS]?.from || {},
            duration: 0.3
          });
        }
      },
    });

    this.scrollTriggers.push(scrollTrigger);
    return scrollTrigger;
  }

  // Stagger animations for multiple elements
  staggerIn(
    config: InViewConfig & {
      staggerDelay?: number;
      staggerFrom?: "start" | "center" | "end" | number;
      preset?: keyof typeof ANIMATION_PRESETS;
    }
  ) {
    if (this.isReduced) return;

    const {
      targets,
      staggerDelay = 0.1,
      staggerFrom = "start",
      preset = "fadeInUp",
      ...restConfig
    } = config;

    const presetConfig = ANIMATION_PRESETS[preset];

    // Set initial states
    gsap.set(targets, presetConfig.from);

    return this.inView({
      targets,
      ...presetConfig.to,
      ...restConfig,
      stagger: {
        amount: staggerDelay,
        from: staggerFrom,
      },
    });
  }

  // Timeline animations
  createTimeline(config: any = {}) {
    const tl = gsap.timeline(config);
    this.timelines.push(tl);
    return tl;
  }

  // Text animations with splitting
  animateText(config: {
    targets: string | Element | Element[];
    preset?: keyof typeof ANIMATION_PRESETS | "typewriter";
    splitBy?: "chars" | "words" | "lines";
    staggerDelay?: number;
  }) {
    if (this.isReduced) return;

    const {
      targets,
      preset = "fadeInUp",
      splitBy = "chars",
      staggerDelay = 0.05,
    } = config;

    const elements =
      typeof targets === "string"
        ? document.querySelectorAll(targets)
        : Array.isArray(targets)
        ? targets
        : [targets];

    elements.forEach((element) => {
      if (!(element instanceof Element)) return;

      // Split text into spans
      this.splitText(element, splitBy);

      const children = element.querySelectorAll("span");

      if (preset === "typewriter") {
        return this.typewriterEffect(children);
      }

      const presetConfig =
        ANIMATION_PRESETS[preset] || ANIMATION_PRESETS.fadeInUp;

      // Set initial state
      gsap.set(children, presetConfig.from);

      // Trigger animation when element comes into view
      this.inView({
        targets: element,
        duration: 0.01,
        onComplete: () => {
          const animation = gsap.to(children, {
            ...presetConfig.to,
            stagger: staggerDelay,
          });
          this.animations.push(animation);
        },
      });
    });
  }

  private splitText(element: Element, splitBy: "chars" | "words" | "lines") {
    const text = element.textContent || "";
    let html = "";

    switch (splitBy) {
      case "chars":
        html = text
          .split("")
          .map((char) =>
            char === " "
              ? " "
              : `<span style="display: inline-block;">${char}</span>`
          )
          .join("");
        break;

      case "words":
        html = text
          .split(" ")
          .map((word) => `<span style="display: inline-block;">${word}</span>`)
          .join(" ");
        break;

      case "lines":
        html = text
          .split("\n")
          .map((line) => `<span style="display: block;">${line}</span>`)
          .join("");
        break;
    }

    element.innerHTML = html;
  }

  private typewriterEffect(elements: NodeListOf<Element>) {
    const timeline = this.createTimeline();

    gsap.set(elements, { opacity: 0 });

    elements.forEach((element, index) => {
      timeline.to(element, {
        opacity: 1,
        duration: 0.05,
      }, index * 0.05);
    });

    return timeline;
  }

  // Utility animations
  pulse(targets: string | Element | Element[], options: any = {}) {
    const animation = gsap.to(targets, {
      scale: 1.05,
      duration: 1,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
      ...options,
    });
    this.animations.push(animation);
    return animation;
  }

  shake(targets: string | Element | Element[], options: any = {}) {
    const animation = gsap.to(targets, {
      x: "-=10, +=20, -=20, +=20, -=10, +=0",
      duration: 0.5,
      ease: "power2.inOut",
      ...options,
    });
    this.animations.push(animation);
    return animation;
  }

  bounce(targets: string | Element | Element[], options: any = {}) {
    const animation = gsap.to(targets, {
      y: -20,
      duration: 0.4,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      ...options,
    });
    this.animations.push(animation);
    return animation;
  }

  // Scroll progress indicator
  scrollProgress(targets: string | Element | Element[]) {
    const scrollTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(targets, { scaleX: self.progress });
      },
    });

    this.scrollTriggers.push(scrollTrigger);
    return () => scrollTrigger.kill();
  }

  // Parallax effect
  parallax(config: {
    targets: string | Element | Element[];
    speed?: number;
    direction?: "vertical" | "horizontal";
  }) {
    if (this.isReduced) return;

    const { targets, speed = 0.5, direction = "vertical" } = config;

    const elements = gsap.utils.toArray(targets);

    elements.forEach((element) => {
      const scrollTrigger = ScrollTrigger.create({
        trigger: element as Element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const yPos = self.progress * speed * 100;
          const transform = direction === "vertical"
            ? { y: yPos }
            : { x: yPos };
          gsap.set(element, transform);
        },
      });

      this.scrollTriggers.push(scrollTrigger);
    });

    return () => {
      this.scrollTriggers.forEach(trigger => trigger.kill());
    };
  }

  // Cleanup method
  destroy() {
    // Clean up intersection observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // Clean up scroll triggers
    this.scrollTriggers.forEach((trigger) => trigger.kill());
    this.scrollTriggers = [];

    // Clean up animations
    this.animations.forEach((animation) => animation.kill());
    this.animations = [];

    // Clean up timelines
    this.timelines.forEach((timeline) => timeline.kill());
    this.timelines = [];

    // Clean up all ScrollTriggers
    ScrollTrigger.killAll();
  }

  // Batch animations for performance
  batchAnimations(animations: (() => void)[]) {
    gsap.ticker.add(() => {
      animations.forEach((animation) => animation());
    }, true);
  }

  // Preload animations - set initial states
  preloadAnimations(selectors: string[]) {
    selectors.forEach((selector) => {
      gsap.set(selector, {
        opacity: 0,
        y: 60,
      });
    });
  }

  // Refresh ScrollTrigger (useful after content changes)
  refresh() {
    ScrollTrigger.refresh();
  }
}

// Create and export a singleton instance
export const animationManager = new AnimationManager();

// Convenience functions
export const fadeInUp = (
  targets: string | Element | Element[],
  options: any = {}
) => animationManager.inView({ targets, preset: "fadeInUp", ...options });

export const fadeInDown = (
  targets: string | Element | Element[],
  options: any = {}
) => animationManager.inView({ targets, preset: "fadeInDown", ...options });

export const fadeInLeft = (
  targets: string | Element | Element[],
  options: any = {}
) => animationManager.inView({ targets, preset: "fadeInLeft", ...options });

export const fadeInRight = (
  targets: string | Element | Element[],
  options: any = {}
) => animationManager.inView({ targets, preset: "fadeInRight", ...options });

export const scaleIn = (
  targets: string | Element | Element[],
  options: any = {}
) => animationManager.inView({ targets, preset: "scaleIn", ...options });

export const staggerFadeIn = (
  targets: string | Element | Element[],
  options: any = {}
) => animationManager.staggerIn({ targets, preset: "fadeInUp", ...options });

// Export GSAP instance and utilities
export { gsap };

// Clean up on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    animationManager.destroy();
  });
}
