"use client";
import dynamic from 'next/dynamic';

const TypewriterHero = dynamic(() => import("@/components/hero/TypewriterHero"), {
  ssr: false,
  loading: () => (
    <div className="relative mb-12">
      <div className="text-center mb-8 space-y-6">
        <div className="h-12 w-64 mx-auto bg-gray-800/50 rounded-full animate-pulse" />
        <div className="h-16 w-96 mx-auto bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-12 w-80 mx-auto bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-20 w-full max-w-2xl mx-auto bg-gray-800/50 rounded-lg animate-pulse" />
      </div>
    </div>
  )
});

export default TypewriterHero;
