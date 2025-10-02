"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Clock, Tag, Share2, BookOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

const BlogModal = ({ isOpen, onClose, blog }) => {
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

    // Don't render on server side
    if (typeof window === 'undefined') return null;

    if (!blog) return null;

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
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(blog.url);
            // You could add a toast notification here
        }
    };

    const modalContent = (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            duration: 0.3
                        }}
                        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-900/80 hover:bg-gray-900 dark:bg-white/20 dark:hover:bg-white/30 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
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
                                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                            {blog.title}
                                        </h1>
                                        <div className="flex items-center text-sm text-gray-300 flex-wrap gap-4">
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
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                            {blog.title}
                                        </h1>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-4">
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
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                        >
                                            <Tag size={12} className="mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Excerpt */}
                                <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
                                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {blog.excerpt}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <a
                                        href={blog.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={18} className="mr-2" />
                                        Read Full Article
                                    </a>

                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                                    >
                                        <Share2 size={18} className="mr-2" />
                                        Share
                                    </button>
                                </div>

                                {/* Additional Links (if any) */}
                                {blog.github && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Related Resources
                                        </h3>
                                        <a
                                            href={blog.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                        >
                                            <ExternalLink size={14} className="mr-1" />
                                            View Source Code
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default BlogModal;