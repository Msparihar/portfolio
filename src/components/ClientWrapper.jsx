"use client";

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { usePreloadPages } from '@/components/PreloadLink';

gsap.registerPlugin(ScrollTrigger);

export const ClientWrapper = ({ children }) => {
  usePreloadPages();
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Set initial hidden state immediately (prevents flash)
      gsap.set("[data-anim-header], [data-anim-nav-item], [data-anim-terminal]", { autoAlpha: 0 });

      // --- Hero entrance timeline ---
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo("[data-anim-header]",
        { y: -30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 }
      );

      tl.fromTo("[data-anim-nav-item]",
        { y: -20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08 },
        "-=0.3"
      );

      tl.fromTo("[data-anim-terminal]",
        { y: 30, autoAlpha: 0, scale: 0.98 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.7 },
        "-=0.2"
      );

      // --- Scroll-triggered sections ---
      gsap.utils.toArray("[data-anim-section]").forEach((section) => {
        gsap.fromTo(section,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // --- Footer fade in ---
      gsap.fromTo("[data-anim-footer]",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-anim-footer]",
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );

      // --- Parallax dot grid background ---
      gsap.to("[data-anim-bg]", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    });

    // Reduced motion: everything visible, no animations
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-anim-header], [data-anim-nav-item], [data-anim-terminal], [data-anim-section], [data-anim-footer]", {
        autoAlpha: 1,
        y: 0,
        scale: 1,
      });
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>{children}</div>;
};
