// GSAP ScrollTrigger configurations and utilities
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Fade in animation on scroll
export const fadeInOnScroll = (element, options = {}) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Stagger fade in for multiple elements
export const staggerFadeIn = (elements, options = {}) => {
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: elements[0],
        start: "top 80%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Parallax effect
export const parallax = (element, options = {}) => {
  return gsap.to(element, {
    y: (i, target) =>
      -ScrollTrigger.maxScroll(window) * target.dataset.speed || -100,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      ...options,
    },
  });
};

// Horizontal scroll section
export const horizontalScroll = (container, sections, options = {}) => {
  const totalWidth = sections.reduce(
    (acc, section) => acc + section.offsetWidth,
    0
  );

  return gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      snap: 1 / (sections.length - 1),
      end: () => `+=${totalWidth}`,
      ...options,
    },
  });
};

// Pin section while animating content
export const pinSection = (section, content, options = {}) => {
  return gsap
    .timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: true,
        start: "top top",
        end: "+=100%",
        ...options,
      },
    })
    .to(content, {
      opacity: 1,
      y: 0,
      duration: 1,
    });
};

// Number counter animation
export const animateNumber = (element, endValue, options = {}) => {
  const obj = { value: 0 };

  return gsap.to(obj, {
    value: endValue,
    duration: 2,
    ease: "power1.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value);
    },
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none reverse",
      ...options,
    },
  });
};

// Scale in animation
export const scaleIn = (element, options = {}) => {
  return gsap.fromTo(
    element,
    {
      scale: 0.8,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Reveal animation (clip path)
export const revealAnimation = (element, options = {}) => {
  return gsap.fromTo(
    element,
    {
      clipPath: "inset(0 100% 0 0)",
    },
    {
      clipPath: "inset(0 0% 0 0)",
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Rotate in animation
export const rotateIn = (element, options = {}) => {
  return gsap.fromTo(
    element,
    {
      rotation: -10,
      opacity: 0,
      scale: 0.8,
    },
    {
      rotation: 0,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Slide in from left
export const slideInLeft = (element, options = {}) => {
  return gsap.fromTo(
    element,
    {
      x: -100,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Slide in from right
export const slideInRight = (element, options = {}) => {
  return gsap.fromTo(
    element,
    {
      x: 100,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
        ...options,
      },
    }
  );
};

// Clean up ScrollTrigger instances
export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};
