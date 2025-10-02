"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Database, Cloud, Brain, Zap, Star } from 'lucide-react';
import portfolioConfig from '@/config/portfolio.json';

const SkillsVisualization = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animationComplete, setAnimationComplete] = useState(false);

  const skillCategories = {
    languages: {
      icon: Code,
      title: 'Programming Languages',
      color: 'from-blue-500 to-cyan-500',
      skills: portfolioConfig.skills.languages || []
    },
    frameworks: {
      icon: Zap,
      title: 'Frameworks & Libraries',
      color: 'from-green-500 to-emerald-500',
      skills: portfolioConfig.skills.frameworks || []
    },
    tools: {
      icon: Database,
      title: 'Tools & Technologies',
      color: 'from-purple-500 to-pink-500',
      skills: portfolioConfig.skills.tools || []
    },
    ai_ml: {
      icon: Brain,
      title: 'AI & Machine Learning',
      color: 'from-orange-500 to-red-500',
      skills: portfolioConfig.skills.ai_ml || []
    }
  };

  // Skill proficiency levels (you can customize these)
  const skillLevels = {
    'Python': 95,
    'JavaScript/TypeScript': 90,
    'React/Next.js': 92,
    'FastAPI': 88,
    'PyTorch': 85,
    'TensorFlow': 80,
    'Docker': 85,
    'AWS/Vercel': 82,
    'Computer Vision': 88,
    'Natural Language Processing': 85,
    'Large Language Models': 90,
    'Git/GitHub': 95,
    'MongoDB/PostgreSQL': 85,
    'Node.js/Express': 80,
    'Tailwind CSS': 90,
    'Hugging Face': 85,
    'LangChain': 88,
    'SQL': 85,
    'HTML/CSS': 95,
    'Deep Learning': 85,
    'Document Processing': 80
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getSkillLevel = (skill) => {
    // Find exact match or partial match
    const exactMatch = skillLevels[skill];
    if (exactMatch) return exactMatch;
    
    // Try to find partial matches
    const partialMatch = Object.keys(skillLevels).find(key => 
      key.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(key.toLowerCase())
    );
    
    return partialMatch ? skillLevels[partialMatch] : Math.floor(Math.random() * 20) + 70; // Random between 70-90
  };

  const filteredCategories = selectedCategory === 'all' 
    ? Object.entries(skillCategories)
    : Object.entries(skillCategories).filter(([key]) => key === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Skills
        </button>
        {Object.entries(skillCategories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === key
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              {category.title}
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid gap-8"
        >
          {filteredCategories.map(([categoryKey, category], categoryIndex) => {
            const Icon = category.icon;
            
            return (
              <motion.div
                key={categoryKey}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-800"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{category.title}</h3>
                    <p className="text-gray-400 text-sm">{category.skills.length} skills</p>
                  </div>
                </div>

                {/* Skills List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.skills.map((skill, skillIndex) => {
                    const proficiency = getSkillLevel(skill);
                    
                    return (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 font-medium">{skill}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-400">{proficiency}%</span>
                            {proficiency >= 90 && (
                              <Star className="text-yellow-400" size={12} fill="currentColor" />
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: animationComplete ? `${proficiency}%` : 0 }}
                            transition={{ 
                              delay: (categoryIndex * 0.2) + (skillIndex * 0.1),
                              duration: 0.8,
                              ease: "easeOut"
                            }}
                            className={`h-full bg-gradient-to-r ${category.color} relative`}
                          >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                          </motion.div>
                        </div>
                        
                        {/* Hover Effect */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-xs text-gray-500">
                            {proficiency >= 90 && "Expert level"}
                            {proficiency >= 80 && proficiency < 90 && "Advanced"}
                            {proficiency >= 70 && proficiency < 80 && "Intermediate"}
                            {proficiency < 70 && "Learning"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Category Stats */}
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Average Proficiency</span>
                    <span>
                      {Math.round(
                        category.skills.reduce((acc, skill) => acc + getSkillLevel(skill), 0) / 
                        category.skills.length
                      )}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Overall Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20"
      >
        <h3 className="text-lg font-bold text-white mb-4">Skill Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(skillCategories).map(([key, category]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {category.skills.length}
              </div>
              <div className="text-sm text-gray-400">{category.title}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SkillsVisualization;