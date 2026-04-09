"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Calendar, Clock, Tag, Share2, BookOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import gsap from 'gsap';

const BlogModal = ({ isOpen, onClose, blog }) => {
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
    if (!isRendered || !blog) return null;

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Share functionality
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt,
                    url: blog.url,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(blog.url);
        }
    };

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
                className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
                style={{ opacity: 0, transform: 'scale(0.8)', background: 'var(--dt-surface)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
                    style={{ background: 'var(--dt-overlay-bg, rgba(0,0,0,0.5))', color: 'var(--dt-text)' }}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* Modal Content */}
                <div className="overflow-y-auto max-h-[90vh]">
                    {/* Hero Image */}
                    {blog.image && (
                        <div className="relative h-64 md:h-80 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10"></div>
                            <Image
                                src={blog.image}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--dt-text)' }}>
                                    {blog.title}
                                </h1>
                                <div className="flex items-center text-sm flex-wrap gap-4" style={{ color: 'var(--dt-text-muted)' }}>
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2" />
                                        <span>{formatDate(blog.date)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock size={16} className="mr-2" />
                                        <span>{blog.readTime} min read</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen size={16} className="mr-2" />
                                        <span>Blog Post</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {/* Title (if no image) */}
                        {!blog.image && (
                            <div className="mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--dt-text)' }}>
                                    {blog.title}
                                </h1>
                                <div className="flex items-center text-sm flex-wrap gap-4" style={{ color: 'var(--dt-text-muted)' }}>
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2" />
                                        <span>{formatDate(blog.date)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock size={16} className="mr-2" />
                                        <span>{blog.readTime} min read</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {blog.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                                    style={{
                                        background: 'var(--dt-accent-soft)',
                                        color: 'var(--dt-accent)',
                                    }}
                                >
                                    <Tag size={12} className="mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Excerpt */}
                        <div className="prose max-w-none mb-8">
                            <p className="text-lg leading-relaxed" style={{ color: 'var(--dt-text-muted)' }}>
                                {blog.excerpt}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6" style={{ borderTop: '1px solid var(--dt-accent-border)' }}>
                            <a
                                href={blog.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors"
                                style={{ background: 'var(--dt-accent)', color: 'var(--dt-bg)' }}
                            >
                                <ExternalLink size={18} className="mr-2" />
                                Read Full Article
                            </a>

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors"
                                style={{
                                    background: 'var(--dt-surface)',
                                    color: 'var(--dt-text-muted)',
                                    border: '1px solid var(--dt-accent-border)',
                                }}
                            >
                                <Share2 size={18} className="mr-2" />
                                Share
                            </button>
                        </div>

                        {/* Additional Links (if any) */}
                        {blog.github && (
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--dt-accent-border)' }}>
                                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--dt-text)' }}>
                                    Related Resources
                                </h3>
                                <a
                                    href={blog.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm transition-colors"
                                    style={{ color: 'var(--dt-text-muted)' }}
                                >
                                    <ExternalLink size={14} className="mr-1" />
                                    View Source Code
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default BlogModal;
