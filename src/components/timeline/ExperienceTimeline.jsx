"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Award, Code, Users, Zap } from 'lucide-react';
import portfolioConfig from '@/config/portfolio.json';

const ExperienceTimeline = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Enhanced timeline data with more details
  const timelineData = [
    {
      id: 'stringify-ai',
      type: 'experience',
      title: 'Software Engineer',
      organization: 'StringifyAI',
      period: '2024 - Present',
      location: 'Remote',
      description: 'Developing intelligent document processing systems and advanced chatbots. Building AI-powered solutions for automated document analysis and information retrieval.',
      achievements: [
        'Built AI-powered document processing pipeline handling 10k+ documents daily',
        'Developed multi-modal chatbot with 95% accuracy in query resolution',
        'Implemented RAG systems using LangChain and vector databases',
        'Optimized model inference reducing response time by 60%'
      ],
      technologies: ['Python', 'FastAPI', 'LangChain', 'PyTorch', 'Docker', 'AWS'],
      icon: Code,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'vit-graduation',
      type: 'education',
      title: 'Bachelor of Science in Computer Science',
      organization: 'Vellore Institute of Technology',
      period: '2020 - 2024',
      location: 'Vellore, India',
      description: 'Graduated with honors, specializing in Artificial Intelligence and Machine Learning. Active in coding competitions and research projects.',
      achievements: [
        'CGPA: 8.5/10 with Honors in AI/ML specialization',
        'Winner of VIT Hackathon 2023 - AI category',
        'Published research paper on "Computer Vision in Healthcare"',
        'Led university coding club with 200+ members'
      ],
      technologies: ['Python', 'Java', 'C++', 'Machine Learning', 'Data Structures', 'Algorithms'],
      icon: Award,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'aws-certification',
      type: 'certification',
      title: 'AWS Cloud Essentials',
      organization: 'Amazon Web Services',
      period: '2024',
      location: 'Online',
      description: 'Comprehensive certification covering AWS cloud services, architecture, and best practices for scalable applications.',
      achievements: [
        'Mastered EC2, S3, Lambda, and RDS services',
        'Learned cloud architecture patterns and security',
        'Hands-on experience with serverless computing',
        'Understanding of cost optimization strategies'
      ],
      technologies: ['AWS', 'Cloud Architecture', 'Serverless', 'DevOps'],
      icon: Zap,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'freelance-projects',
      type: 'experience',
      title: 'Freelance Developer',
      organization: 'Various Clients',
      period: '2022 - 2024',
      location: 'Remote',
      description: 'Worked with multiple clients to deliver custom web applications, AI solutions, and automation tools.',
      achievements: [
        'Completed 15+ projects with 100% client satisfaction',
        'Built e-commerce platforms handling $100k+ in transactions',
        'Developed AI chatbots for customer service automation',
        'Created data visualization dashboards for business insights'
      ],
      technologies: ['React', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB'],
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'experience': return Code;
      case 'education': return Award;
      case 'certification': return Zap;
      default: return Code;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'experience': return 'bg-green-500';
      case 'education': return 'bg-blue-500';
      case 'certification': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>

      {/* Timeline Items */}
      <div className="space-y-8">
        {timelineData.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative flex items-start gap-6"
            >
              {/* Timeline Dot */}
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${getTypeColor(item.type)} shadow-lg`}>
                <Icon className="text-white" size={24} />
              </div>

              {/* Content Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-green-400 font-medium">{item.organization}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar size={14} />
                      <span>{item.period}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>

                {/* Key Achievements Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Key Achievements:</h4>
                  <ul className="space-y-1">
                    {item.achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                    {item.achievements.length > 2 && (
                      <li className="text-sm text-green-400">
                        +{item.achievements.length - 2} more achievements...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {item.technologies.slice(0, 4).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-md bg-gray-800 text-gray-300 border border-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 4 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-green-500/20 text-green-400">
                      +{item.technologies.length - 4} more
                    </span>
                  )}
                </div>

                {/* View Details Button */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                    View Details
                    <ExternalLink size={12} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                  <p className="text-green-400 text-lg font-medium">{selectedItem.organization}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{selectedItem.period}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{selectedItem.location}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{selectedItem.description}</p>
              </div>

              {/* All Achievements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Key Achievements</h3>
                <ul className="space-y-2">
                  {selectedItem.achievements.map((achievement, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* All Technologies */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-lg bg-gray-800 text-gray-300 border border-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperienceTimeline;