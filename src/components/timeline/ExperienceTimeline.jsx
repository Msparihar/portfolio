"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, Award, Code, Users, Zap } from 'lucide-react';
import portfolioConfig from '@/config/portfolio.json';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ExperienceTimeline = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const containerRef = useRef(null);
  const modalBackdropRef = useRef(null);
  const modalContentRef = useRef(null);
  const [isModalRendered, setIsModalRendered] = useState(false);

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
      color: 'from-[var(--dt-accent)] to-[var(--dt-accent-hover)]'
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

  const getTypeDotStyle = (type) => {
    switch (type) {
      case 'experience': return { background: 'var(--dt-accent)' };
      case 'education': return { background: 'var(--dt-info-color, #3b82f6)' };
      case 'certification': return { background: 'var(--dt-warn-color, #f97316)' };
      default: return { background: 'var(--dt-text-muted)' };
    }
  };

  // Staggered entrance animation
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-timeline-item]", {
        opacity: 0,
        x: -50,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
      });
    });
  }, { scope: containerRef });

  // Modal open
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalRendered(true);
  };

  // Animate modal in after rendered
  useEffect(() => {
    if (isModalRendered && selectedItem && modalBackdropRef.current && modalContentRef.current) {
      gsap.fromTo(modalBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(modalContentRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.7)" }
      );
    }
  }, [isModalRendered, selectedItem]);

  // Modal close
  const handleCloseModal = () => {
    if (modalBackdropRef.current && modalContentRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setSelectedItem(null);
          setIsModalRendered(false);
        },
      });
      tl.to(modalContentRef.current, { scale: 0.8, opacity: 0, duration: 0.2, ease: "power2.in" });
      tl.to(modalBackdropRef.current, { opacity: 0, duration: 0.15 }, "-=0.1");
    } else {
      setSelectedItem(null);
      setIsModalRendered(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Timeline Line */}
      <div
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{ background: 'linear-gradient(to bottom, var(--dt-accent), var(--dt-accent-hover), var(--dt-accent-border))' }}
      />

      {/* Timeline Items */}
      <div className="space-y-8">
        {timelineData.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              data-timeline-item
              className="relative flex items-start gap-6"
            >
              {/* Timeline Dot */}
              <div
                className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full shadow-lg"
                style={getTypeDotStyle(item.type)}
              >
                <Icon style={{ color: 'var(--dt-text)' }} size={24} />
              </div>

              {/* Content Card */}
              <div
                className="flex-1 rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                style={{
                  background: 'var(--dt-surface)',
                  border: '1px solid var(--dt-accent-border)',
                }}
                onClick={() => handleOpenModal(item)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--dt-text)' }}>{item.title}</h3>
                    <p className="font-medium" style={{ color: 'var(--dt-accent)' }}>{item.organization}</p>
                  </div>
                  <div className="text-right text-sm" style={{ color: 'var(--dt-text-muted)' }}>
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
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--dt-text-muted)' }}>{item.description}</p>

                {/* Key Achievements Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--dt-text-muted)' }}>Key Achievements:</h4>
                  <ul className="space-y-1">
                    {item.achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--dt-text-muted)' }}>
                        <span className="mt-1" style={{ color: 'var(--dt-accent)' }}>•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                    {item.achievements.length > 2 && (
                      <li className="text-sm" style={{ color: 'var(--dt-accent)' }}>
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
                      className="px-2 py-1 text-xs rounded-md"
                      style={{
                        background: 'var(--dt-surface)',
                        color: 'var(--dt-text-muted)',
                        border: '1px solid var(--dt-accent-border)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 4 && (
                    <span
                      className="px-2 py-1 text-xs rounded-md"
                      style={{
                        background: 'var(--dt-accent-soft-2)',
                        color: 'var(--dt-accent)',
                      }}
                    >
                      +{item.technologies.length - 4} more
                    </span>
                  )}
                </div>

                {/* View Details Button */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--dt-accent-border)' }}>
                  <button
                    className="text-sm transition-colors flex items-center gap-1"
                    style={{ color: 'var(--dt-accent)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dt-accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dt-accent)'}
                  >
                    View Details
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal */}
      {isModalRendered && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={modalBackdropRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ opacity: 0 }}
            onClick={handleCloseModal}
          />
          <div
            ref={modalContentRef}
            className="relative rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: 'var(--dt-bg)',
              border: '1px solid var(--dt-accent-border)',
              opacity: 0,
              transform: 'scale(0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--dt-text)' }}>{selectedItem.title}</h2>
                <p className="text-lg font-medium" style={{ color: 'var(--dt-accent)' }}>{selectedItem.organization}</p>
                <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--dt-text-muted)' }}>
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
                onClick={handleCloseModal}
                className="transition-colors"
                style={{ color: 'var(--dt-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dt-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dt-text-muted)'}
              >
                &#10005;
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--dt-text)' }}>Overview</h3>
              <p className="leading-relaxed" style={{ color: 'var(--dt-text-muted)' }}>{selectedItem.description}</p>
            </div>

            {/* All Achievements */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--dt-text)' }}>Key Achievements</h3>
              <ul className="space-y-2">
                {selectedItem.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start gap-3" style={{ color: 'var(--dt-text-muted)' }}>
                    <span className="mt-1" style={{ color: 'var(--dt-accent)' }}>&#10003;</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* All Technologies */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--dt-text)' }}>Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {selectedItem.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-lg"
                    style={{
                      background: 'var(--dt-surface)',
                      color: 'var(--dt-text-muted)',
                      border: '1px solid var(--dt-accent-border)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceTimeline;
