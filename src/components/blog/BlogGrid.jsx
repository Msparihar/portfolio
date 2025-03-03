"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Calendar, Clock, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { TerminalLoader } from '../ui/LoadingDots';

// Placeholder images for blog posts that don't have their own
const placeholderImages = [
  '/images/blog/placeholder-1.jpg',
  '/images/blog/placeholder-2.jpg',
  '/images/blog/placeholder-3.jpg',
  '/images/blog/placeholder-4.jpg',
];

const BlogCard = ({ post, isDark }) => {
  // Get a placeholder image based on post title hash
  const getPlaceholderImage = (title) => {
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholderImages[hash % placeholderImages.length];
  };

  // Image source - either from post or placeholder
  const imageSrc = post.image || getPlaceholderImage(post.title);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
      isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
    } border ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-sm hover:shadow-md`}>
      {/* Blog Post Image with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10"></div>
        <Image
          src={imageSrc}
          alt={post.title}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center text-xs text-gray-300">
            <Calendar size={12} className="mr-1" />
            <span>{formatDate(post.date)}</span>
            <span className="mx-2">•</span>
            <Clock size={12} className="mr-1" />
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Blog Post Body */}
      <div className="p-4">
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-3`}>
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-1 rounded-full ${
                isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Read More Link */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-800">
          <Link
            href={`/blog/${post.slug}`}
            className={`inline-flex items-center ${
              isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'
            }`}
          >
            Read More
            <ExternalLink size={14} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const BlogGrid = ({ searchQuery = '', activeFilter = 'all' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Add a short delay to simulate data loading
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock blog data for demonstration
        const mockPosts = [
          {
            title: "Getting Started with Next.js",
            slug: "getting-started-with-nextjs",
            date: "2023-04-15",
            readTime: 5,
            excerpt: "Next.js is a powerful React framework that makes building modern web applications simple and efficient. Learn how to get started with this amazing tool.",
            tags: ["React", "Next.js", "Web Development"],
            image: "/images/blog/nextjs.jpg"
          },
          {
            title: "Mastering Tailwind CSS",
            slug: "mastering-tailwind-css",
            date: "2023-05-20",
            readTime: 8,
            excerpt: "Tailwind CSS is a utility-first CSS framework that can speed up your development workflow. Discover how to use it effectively in your projects.",
            tags: ["CSS", "Tailwind", "Frontend"],
            image: "/images/blog/tailwind.jpg"
          },
          {
            title: "Building APIs with FastAPI",
            slug: "building-apis-with-fastapi",
            date: "2023-06-10",
            readTime: 10,
            excerpt: "FastAPI is a modern Python framework for building high-performance APIs. Learn the key concepts and best practices for creating robust backend services.",
            tags: ["Python", "FastAPI", "Backend", "API"],
            image: "/images/blog/fastapi.jpg"
          },
          {
            title: "The Power of TypeScript",
            slug: "power-of-typescript",
            date: "2023-07-05",
            readTime: 7,
            excerpt: "TypeScript adds static typing to JavaScript, making your code more robust and maintainable. Discover why it's becoming the standard for modern web development.",
            tags: ["TypeScript", "JavaScript", "Web Development"],
            image: "/images/blog/typescript.jpg"
          },
          {
            title: "Containerizing Your Applications with Docker",
            slug: "containerizing-applications-docker",
            date: "2023-08-15",
            readTime: 12,
            excerpt: "Docker simplifies deployment and ensures consistency across different environments. Learn how to containerize your applications effectively.",
            tags: ["Docker", "DevOps", "Deployment"],
            image: "/images/blog/docker.jpg"
          }
        ];

        setPosts(mockPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search and filter criteria
  useEffect(() => {
    if (posts.length === 0) return;

    let filtered = [...posts];

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(query);
        const excerptMatch = post.excerpt.toLowerCase().includes(query);
        const tagMatch = post.tags.some(tag =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || excerptMatch || tagMatch;
      });
    }

    // Apply tag filter if not 'all'
    if (activeFilter !== 'all') {
      filtered = filtered.filter(post => {
        const tags = post.tags.map(tag => tag.toLowerCase());
        return tags.some(tag => tag.includes(activeFilter.toLowerCase()));
      });
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className={`h-72 rounded-xl animate-pulse ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <div className={`h-48 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-t-xl`}></div>
            <div className="p-4">
              <div className={`h-4 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
              <div className={`h-3 w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {searchQuery || activeFilter !== 'all' ? (
          <>
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">No matching blog posts found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
            <div className="flex gap-2 mt-2">
              {activeFilter !== 'all' && (
                <button
                  onClick={() => document.dispatchEvent(new CustomEvent('clearFilters'))}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No blog posts added yet</h3>
            <p>Check back later for new content</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Results summary if filtering is active */}
      {(searchQuery || activeFilter !== 'all') && (
        <div className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' && ` with "${activeFilter}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <BlogCard key={index} post={post} isDark={isDark} />
        ))}
      </div>
    </>
  );
};

export default BlogGrid;
