"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";

// TypeWriter component for terminal-like typing animation
const TypeWriter = ({ text, delay = 10, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, delay, text]);

  return (
    <span className={`${className} ${currentIndex < text.length ? 'typing-animation' : ''}`}>
      {displayText}
    </span>
  );
};

export default function ContactPage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate form submission
    try {
      // Replace with actual form submission logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Grid background for the entire page */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button and theme toggle */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-green-500 hover:text-green-600 transition-colors flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg"
            aria-label="Go back to home"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Terminal</span>
          </button>

          <div className="flex items-center space-x-4">
            <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} text-sm font-medium`}>
              <span className="terminal-prompt text-green-500 mr-1">$</span>
              init_contact_form
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Page Title */}
        <div className={`mb-8 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <span className="text-green-500">Contact</span>
            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-normal">
              Get in Touch
            </span>
          </h1>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} max-w-2xl`}>
            Have a question or want to work together? Feel free to reach out using the form below.
          </p>
        </div>

        {/* Contact Form Container */}
        <div className={`relative rounded-xl overflow-hidden ${
          theme === "dark" ? "bg-gray-900/30" : "bg-white/70"
        } backdrop-blur-sm border ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}>
          {theme === "dark" && (
            <>
              {/* Grid background (dark mode only) */}
              <div className="absolute inset-0 bg-grid-small-white/[0.05]" />

              {/* Radial gradient for fading effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

              {/* Scanline effect */}
              <div
                className="absolute inset-0 bg-scanline pointer-events-none opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    rgba(0, 150, 0, 0.03),
                    rgba(0, 150, 0, 0.03) 1px,
                    transparent 1px,
                    transparent 2px
                  )`,
                  backgroundSize: "100% 4px",
                  animation: "scanline 10s linear infinite",
                }}
              />
            </>
          )}

          {/* Form Content */}
          <div className="relative z-10 p-6">
            {!submitSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block mb-1 ${theme === "dark" ? "text-green-400" : "text-gray-700"}`}>
                    name:~$
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 font-mono ${
                      theme === "dark"
                        ? "bg-black/70 border border-green-500/50 text-green-300 focus:border-green-400"
                        : "bg-white/70 border border-gray-300 text-gray-800 focus:border-gray-400"
                    } outline-none rounded`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className={`block mb-1 ${theme === "dark" ? "text-green-400" : "text-gray-700"}`}>
                    email:~$
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 font-mono ${
                      theme === "dark"
                        ? "bg-black/70 border border-green-500/50 text-green-300 focus:border-green-400"
                        : "bg-white/70 border border-gray-300 text-gray-800 focus:border-gray-400"
                    } outline-none rounded`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className={`block mb-1 ${theme === "dark" ? "text-green-400" : "text-gray-700"}`}>
                    subject:~$
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full p-2 font-mono ${
                      theme === "dark"
                        ? "bg-black/70 border border-green-500/50 text-green-300 focus:border-green-400"
                        : "bg-white/70 border border-gray-300 text-gray-800 focus:border-gray-400"
                    } outline-none rounded`}
                    placeholder="Project Inquiry"
                  />
                </div>

                <div>
                  <label className={`block mb-1 ${theme === "dark" ? "text-green-400" : "text-gray-700"}`}>
                    message:~$
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full p-2 font-mono ${
                      theme === "dark"
                        ? "bg-black/70 border border-green-500/50 text-green-300 focus:border-green-400"
                        : "bg-white/70 border border-gray-300 text-gray-800 focus:border-gray-400"
                    } outline-none rounded`}
                    placeholder="Enter your message here..."
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="flex items-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center ${
                      theme === "dark"
                        ? "bg-green-500/20 hover:bg-green-500/30 text-green-500"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-100"
                    } py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse">sending_message</span>
                        <span className="ml-1 animate-pulse">.</span>
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse">.</span>
                      </>
                    ) : (
                      <>
                        <span>send_message</span>
                        <Send size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center py-8">
                <div className={`text-2xl ${theme === "dark" ? "text-green-400" : "text-gray-800"} flex flex-col items-center`}>
                  <CheckCircle size={48} className="mb-4" />
                  <span>Message sent successfully!</span>
                </div>
                <div className={theme === "dark" ? "text-green-300" : "text-gray-600"}>
                  <p className="mb-2">Thank you for reaching out.</p>
                  <p>I&apos;ll get back to you as soon as possible.</p>
                </div>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="text-green-500 hover:text-green-600 transition-colors flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg mx-auto w-fit"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Terminal</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
