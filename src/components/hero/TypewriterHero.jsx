"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Zap, ArrowRight } from 'lucide-react';
import MagneticButton from '@/components/ui/MagneticButton';
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';
import FloatingShapes from '@/components/3d/FloatingShapesWrapper';

const TypewriterHero = ({ portfolioData }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Rotating phrases for typewriter effect
  const rotatingPhrases = [
    portfolioData.title,
    2000,
    'Building AI-Powered Applications',
    2000,
    'Full Stack Developer',
    2000,
    'Machine Learning Engineer',
    2000,
    'Creating Innovative Solutions',
    2000,
  ];

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0.5, scale: 0.8 },
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      className="relative mb-12 min-h-[80vh] flex items-center"
    >
      {/* Background Effects */}
      <BackgroundBeams className="absolute inset-0 z-0" />
      <FloatingShapes className="absolute inset-0 z-0 opacity-60" />

      {/* Main Content */}
      <div className="text-center mb-8 space-y-6 relative z-10 w-full">
        {/* Animated greeting badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 blur-xl"
              variants={glowVariants}
              initial="initial"
              animate="animate"
            />

            <Sparkles className="w-5 h-5 animate-pulse relative z-10" />
            <span className="relative z-10">Welcome to my digital space</span>

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </motion.div>

        {/* Main title with gradient and glow */}
        <motion.div variants={itemVariants} className="relative">
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent relative z-10"
            style={{
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {portfolioData.name}
          </motion.h1>

          {/* Glow effect behind text */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30 blur-3xl -z-10 scale-150" />
        </motion.div>

        {/* Typewriter subtitle */}
        <motion.div variants={itemVariants} className="relative">
          <div className="text-2xl md:text-4xl text-foreground font-medium min-h-[3rem] flex items-center justify-center gap-3">
            <Code2 className="w-7 h-7 md:w-8 md:h-8 text-green-500 flex-shrink-0" />
            <TypeAnimation
              sequence={rotatingPhrases}
              wrapper="span"
              speed={50}
              className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
              repeat={Infinity}
              cursor={true}
              deletionSpeed={70}
            />
          </div>
        </motion.div>

        {/* Bio text with TextGenerateEffect */}
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto"
        >
          <TextGenerateEffect
            words={portfolioData.bio}
            className="text-lg text-muted-foreground leading-relaxed"
            duration={0.5}
          />
        </motion.div>

        {/* CTA Buttons with magnetic effect */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 pt-6"
        >
          <MagneticButton strength={0.3}>
            <Link
              href="/projects"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/50"
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />

              <Zap className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">View Projects</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-green-400/50 blur-xl group-hover:blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.3}>
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white rounded-xl font-semibold border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl overflow-hidden"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1
                }}
              />

              <span className="relative z-10">Get in Touch</span>
              <motion.div
                className="relative z-10"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                👋
              </motion.div>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="pt-12"
        >
          <motion.div
            className="inline-flex flex-col items-center gap-2 text-muted-foreground"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm">Scroll to explore</span>
            <motion.div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 bg-green-500 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TypewriterHero;
