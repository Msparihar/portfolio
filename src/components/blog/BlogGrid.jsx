"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Calendar, Clock, Tag, ExternalLink } from 'lucide-react';
import portfolioConfig from '@/config/portfolio.json';
import Link from 'next/link';
import { SkeletonGrid } from '../ui/SkeletonCard';

// Optimized base64 placeholder images to avoid 404s and loading delays
const placeholderImages = [
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTExODI3Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPGNpcmNsZSBjeD0iNDUwIiBjeT0iMzAwIiByPSIzMCIgZmlsbD0iIzQ3NTU2OSIvPgo8dGV4dCB4PSIzMDAiIHk9IjMzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSI+QmxvZyBQb3N0PC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMGYxNDE5Ii8+CjxyZWN0IHg9IjIwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzJkNGQzNyIvPgo8dGV4dCB4PSIzMDAiIHk9IjMzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzQyYTM2NiIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSI+QmxvZyBQb3N0PC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDkwYTEzIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDUwMCAxMDBMNDAwIDMwMEwxMDAgMzAwWiIgZmlsbD0iIzJhNTA0OSIvPgo8dGV4dCB4PSIzMDAiIHk9IjM1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzJkZGQ2OSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSI+QmxvZyBQb3N0PC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTEyNTMzIi8+PGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIwMCIgcng9IjE1MCIgcnk9IjEwMCIgZmlsbD0iIzM3NGM1NyIvPjx0ZXh0IHg9IjMwMCIgeT0iMzUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzAzYzM0IiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIj5CbG9nIFBvc3Q8L3RleHQ+PC9zdmc+'
];

const BlogCard = ({ post, isPriority = false, onCardClick }) => {
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
    <div
      className="group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
      style={{
        background: 'var(--dt-surface)',
        border: '1px solid var(--dt-accent-border)',
      }}
      onClick={() => onCardClick(post)}
    >
      {/* Blog Post Image with Overlay */}
      <div className="relative h-48 overflow-hidden image-container">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10"></div>
        <Image
          src={imageSrc}
          alt={post.title}
          width={600}
          height={400}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={isPriority}
          loading={isPriority ? undefined : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTExODI3IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+Cg=="
          className="object-cover w-full h-full transition-all duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-lg font-bold mb-1 transition-colors" style={{ color: 'var(--dt-text)' }}>
            {post.title}
          </h3>
          <div className="flex items-center text-xs" style={{ color: 'var(--dt-text-muted)' }}>
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
        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--dt-text-muted)' }}>
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: 'var(--dt-surface)',
                color: 'var(--dt-text-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid var(--dt-accent-border)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(post);
            }}
            className="inline-flex items-center transition-colors"
            style={{ color: 'var(--dt-accent)' }}
          >
            View Details
            <ExternalLink size={14} className="ml-1" />
          </button>
          <Link
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm transition-colors"
            style={{ color: 'var(--dt-text-muted)' }}
          >
            Read Article →
          </Link>
        </div>
      </div>
    </div>
  );
};

const BlogGrid = ({ searchQuery = '', activeFilter = 'all', onCardClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPosts(portfolioConfig.blogs);
        setLoading(false);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Memoized filtered posts to prevent unnecessary recalculations
  const filteredPosts = useMemo(() => {
    if (posts.length === 0) return [];

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

    return filtered;
  }, [posts, searchQuery, activeFilter]);

  if (loading) {
    return <SkeletonGrid count={6} type="blog" />;
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--dt-text-muted)' }}>
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
                  className="px-3 py-1 text-sm rounded-md transition-colors"
                  style={{ background: 'var(--dt-accent)', color: 'var(--dt-bg)' }}
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
        <div className="mb-6 text-sm" style={{ color: 'var(--dt-text-muted)' }}>
          Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' && ` with "${activeFilter}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <BlogCard
            key={index}
            post={post}
            isPriority={index < 3} // Priority load first 3 images
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </>
  );
};

export default BlogGrid;
