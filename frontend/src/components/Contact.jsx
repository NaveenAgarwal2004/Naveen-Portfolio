import React, { useState, useEffect, useRef } from 'react';
import { Send, Mail, MapPin, Phone, Github, Linkedin, Twitter, CheckCircle, Clock, Zap } from 'lucide-react';
import { contactAPI } from '../services/api';
import TranslatedText from './TranslatedText';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const contactRef = useRef(null);
  const formRef = useRef(null);

  const [personalData, setPersonalData] = useState({
    email: "naveen@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: {
      github: "https://github.com/NaveenAgarwal2004",
      linkedin: "https://linkedin.com/in/naveen-agarwal",
      twitter: "https://twitter.com/naveen_dev",
      email: "naveen@example.com"
    }
  });

  useEffect(() => {
    import('../services/api').then(({ portfolioAPI }) => {
      portfolioAPI.getPersonal()
        .then(response => {
          if (response.data.success) {
            const data = response.data.data;
            setPersonalData({
              email: data.email || "naveen@example.com",
              phone: data.phone || "+1 (555) 123-4567",
              location: data.location || "San Francisco, CA",
              socialLinks: {
                github: data.socialLinks?.github || "https://github.com/NaveenAgarwal2004",
                linkedin: data.socialLinks?.linkedin || "https://linkedin.com/in/naveen-agarwal",
                twitter: data.socialLinks?.twitter || "https://twitter.com/naveen_dev",
                email: data.socialLinks?.email || "naveen@example.com"
              }
            });
          }
        })
        .catch(() => {
          // Fallback to mock data if API fails
        });
    });
  }, []);

  // Intersection Observers
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (contactRef.current) {
      observer.observe(contactRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFormVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await contactAPI.submitContact(formData);
      if (response.data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        // handle failure
        alert(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: personalData.email,
      href: `mailto:${personalData.email}`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: personalData.phone,
      href: `tel:${personalData.phone}`,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: personalData.location,
      href: '#',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: personalData.socialLinks.github,
      color: 'hover:text-gray-300',
      bgColor: 'hover:bg-gray-500/20'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: personalData.socialLinks.linkedin,
      color: 'hover:text-blue-400',
      bgColor: 'hover:bg-blue-500/20'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: personalData.socialLinks.twitter,
      color: 'hover:text-cyan-400',
      bgColor: 'hover:bg-cyan-500/20'
    },
    {
      icon: Mail,
      label: 'Email',
      href: `mailto:${personalData.socialLinks.email}`,
      color: 'hover:text-red-400',
      bgColor: 'hover:bg-red-500/20'
    }
  ];

  return (
    <section id="contact" ref={contactRef} className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-10 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 lg:w-56 lg:h-56 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-10 sm:-left-20 w-32 h-32 sm:w-40 sm:h-40 lg:w-56 lg:h-56 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-cyan-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-4 sm:mb-6">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-xs sm:text-sm font-medium">
              <TranslatedText>Let's Connect</TranslatedText>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            <TranslatedText>Get In Touch</TranslatedText>
          </h2>
          <div className="w-16 h-0.5 sm:w-20 sm:h-1 lg:w-24 lg:h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 sm:mb-6 lg:mb-8 rounded-full"></div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-400 max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
            <TranslatedText>
              Ready to start your next project? Let's discuss how we can work together to bring your ideas to life.
            </TranslatedText>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Contact Form */}
          <div ref={formRef} className={`transform transition-all duration-1000 delay-200 ${
            formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                  <TranslatedText>Send Message</TranslatedText>
                </h3>
              </div>

              {isSubmitted ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    <TranslatedText>Message Sent!</TranslatedText>
                  </h4>
                  <p className="text-sm sm:text-base text-gray-400">
                    <TranslatedText>Thank you for reaching out. I'll get back to you soon!</TranslatedText>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Name Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300">
                      <TranslatedText>Your Name *</TranslatedText>
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${focusedField === 'name' ? 'opacity-100' : ''}`}></div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 
                        focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300">
                      <TranslatedText>Email Address *</TranslatedText>
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-100' : ''}`}></div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 
                        focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-300">
                      <TranslatedText>Message *</TranslatedText>
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${focusedField === 'message' ? 'opacity-100' : ''}`}></div>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        className="relative w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 
                        focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 backdrop-blur-sm resize-none min-h-[120px] sm:min-h-[140px]"
                        placeholder="Tell me about your project or just say hello..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold
                    transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:hover:scale-100 flex items-center justify-center gap-2 sm:gap-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white relative z-10"></div>
                        <span className="relative z-10">
                          <TranslatedText>Sending...</TranslatedText>
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                        <span className="relative z-10">
                          <TranslatedText>Send Message</TranslatedText>
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className={`space-y-4 sm:space-y-6 lg:space-y-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Contact Details */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                  <TranslatedText>Contact Information</TranslatedText>
                </h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div
                      key={contact.label}
                      className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer transform
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                      style={{
                        transitionDelay: `${600 + index * 100}ms`
                      }}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${contact.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${contact.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm font-medium">
                          <TranslatedText>{contact.label}</TranslatedText>
                        </p>
                        <p className="text-white text-sm sm:text-base font-semibold group-hover:text-blue-100 transition-colors duration-200 truncate">{contact.value}</p>
                      </div>
                      <div className="ml-auto w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-6 sm:group-hover:w-8 transition-all duration-300 rounded-full"></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Github className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                  <TranslatedText>Follow Me</TranslatedText>
                </h3>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 ${social.color} ${social.bgColor}
                        transition-all duration-300 hover:scale-105 transform
                        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                      style={{
                        transitionDelay: `${900 + index * 100}ms`
                      }}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        <TranslatedText>{social.label}</TranslatedText>
                      </span>
                      <div className="ml-auto w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-3 sm:group-hover:w-4 transition-all duration-300 rounded-full"></div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Response Info */}
            <div className={`bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm transform transition-all duration-1000 delay-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-base">
                  <TranslatedText>Quick Response</TranslatedText>
                </h3>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                <TranslatedText>
                  I typically respond to messages within 24 hours. For urgent inquiries, feel free to reach out via phone or LinkedIn for faster communication.
                </TranslatedText>
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 text-green-400 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  <TranslatedText>Usually responds in a few hours</TranslatedText>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;