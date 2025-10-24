"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Send, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// TypeWriter component for terminal-like typing animation
const TypeWriter = ({ text, delay = 10, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const rafRef = useRef(null);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    // Defer animation start until after initial paint
    const startTimer = requestIdleCallback ?
      requestIdleCallback(() => setStarted(true)) :
      setTimeout(() => setStarted(true), 0);

    return () => {
      if (requestIdleCallback) {
        cancelIdleCallback(startTimer);
      } else {
        clearTimeout(startTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!started || currentIndex >= text.length) return;

    const animate = (currentTime) => {
      if (currentTime - lastFrameTime.current >= delay) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        lastFrameTime.current = currentTime;
      }

      if (currentIndex + 1 < text.length) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [currentIndex, delay, text, started]);

  return (
    <span className={`${className} ${currentIndex < text.length ? 'typing-animation' : ''}`}>
      {displayText}
    </span>
  );
};

const ContactInteractive = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Contact Info */}
      <div className="space-y-6">
        <div className="border-[0.5px] border-border/30 rounded-lg terminal-container p-6">
          <h2 className="text-xl font-bold mb-4 text-green-500">
            <span className="terminal-prompt">$</span>
            <span className="ml-2">whoami</span>
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-center">
              <span className="terminal-prompt text-green-500 mr-2">$</span>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 text-foreground">Manish Singh Parihar</span>
            </div>

            <div className="flex items-center">
              <span className="terminal-prompt text-green-500 mr-2">$</span>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 text-foreground">manishparihar2020@gmail.com</span>
            </div>

            <div className="flex items-center">
              <span className="terminal-prompt text-green-500 mr-2">$</span>
              <span className="text-muted-foreground">Location:</span>
              <span className="ml-2 text-foreground">India</span>
            </div>

            <div className="flex items-center">
              <span className="terminal-prompt text-green-500 mr-2">$</span>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 text-green-500">Available for work</span>
            </div>
          </div>
        </div>

        <div className="border-[0.5px] border-border/30 rounded-lg terminal-container p-6">
          <h3 className="text-lg font-bold mb-4 text-green-500">
            <span className="terminal-prompt">$</span>
            <span className="ml-2">echo "Let's connect!"</span>
          </h3>

          <div className="text-sm text-muted-foreground">
            <TypeWriter
              text="I'm always interested in hearing about new opportunities, interesting projects, or just having a chat about technology. Feel free to reach out!"
              delay={10}
              className="leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Right Column - Contact Form */}
      <div className="border-[0.5px] border-border/30 rounded-lg terminal-container p-6">
        <h2 className="text-xl font-bold mb-4 text-green-500">
          <span className="terminal-prompt">$</span>
          <span className="ml-2">send_message.sh</span>
        </h2>

        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-500 mb-2">Message Sent!</h3>
            <p className="text-muted-foreground">Thank you for reaching out. I'll get back to you soon!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                <span className="terminal-prompt text-green-500 mr-2">$</span>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                <span className="terminal-prompt text-green-500 mr-2">$</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                <span className="terminal-prompt text-green-500 mr-2">$</span>
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                <span className="terminal-prompt text-green-500 mr-2">$</span>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors resize-none"
                placeholder="Tell me about your project, idea, or just say hello!"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium rounded-md transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactInteractive;
