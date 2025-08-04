import React, { useState, useEffect, useRef } from 'react';
import { Send, Mail, MapPin, Phone, Github, Linkedin, Twitter, CheckCircle, Clock, Zap } from 'lucide-react';

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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 2000);
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
    <section id="contact" ref={contactRef} className="py-16 sm:py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-sm font-medium">Let's Connect</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 sm:mb-8 rounded-full"></div>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Ready to start your next project? Let's discuss how we can work together to bring your ideas to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <div ref={formRef} className={`transform transition-all duration-1000 delay-200 ${
            formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Send Message</h3>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Message Sent!</h4>
                  <p className="text-gray-400">Thank you for reaching out. I'll get back to you soon!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                      Your Name *
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${focusedField === 'name' ? 'opacity-100' : ''}`}></div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 
                        focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email Address *
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-100' : ''}`}></div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 
                        focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                      Message *
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${focusedField === 'message' ? 'opacity-100' : ''}`}></div>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        rows={6}
                        className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 
                        focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 backdrop-blur-sm resize-none"
                        placeholder="Tell me about your project or just say hello..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 px-6 rounded-xl font-semibold
                    transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white relative z-10"></div>
                        <span className="relative z-10">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                        <span className="relative z-10">Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Contact Details */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Contact Information</h3>
              </div>
              <div className="space-y-4">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div
                      key={contact.label}
                      className={`group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer transform
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                      style={{
                        transitionDelay: `${600 + index * 100}ms`
                      }}
                    >
                      <div className={`w-12 h-12 ${contact.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${contact.color}`} />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{contact.label}</p>
                        <p className="text-white font-semibold group-hover:text-blue-100 transition-colors duration-200">{contact.value}</p>
                      </div>
                      <div className="ml-auto w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-8 transition-all duration-300 rounded-full"></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Github className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Follow Me</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 ${social.color} ${social.bgColor}
                        transition-all duration-300 hover:scale-105 transform
                        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                      style={{
                        transitionDelay: `${900 + index * 100}ms`
                      }}
                    >
                      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium text-sm">{social.label}</span>
                      <div className="ml-auto w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-4 transition-all duration-300 rounded-full"></div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Response Info */}
            <div className={`bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm transform transition-all duration-1000 delay-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold">Quick Response</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                I typically respond to messages within 24 hours. For urgent inquiries, 
                feel free to reach out via phone or LinkedIn for faster communication.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Clock className="h-4 w-4" />
                <span>Usually responds in a few hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;