"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

const ProjectModal = ({ isOpen, onClose, children }) => {
  const [isRendered, setIsRendered] = useState(false);
  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  // Handle open: render first, then animate in
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    }
  }, [isOpen]);

  // Animate in after rendered
  useEffect(() => {
    if (isRendered && isOpen && backdropRef.current && modalRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.7)" }
      );
    }
  }, [isRendered, isOpen]);

  // Handle close: animate out, then unmount
  useEffect(() => {
    if (!isOpen && isRendered && backdropRef.current && modalRef.current) {
      const tl = gsap.timeline({
        onComplete: () => setIsRendered(false),
      });
      tl.to(modalRef.current, { scale: 0.8, opacity: 0, duration: 0.2, ease: "power2.in" });
      tl.to(backdropRef.current, { opacity: 0, duration: 0.15 }, "-=0.1");
    }
  }, [isOpen, isRendered]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;
  if (!isRendered) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        style={{ opacity: 0, transform: 'scale(0.8)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[90vh] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectModal;
