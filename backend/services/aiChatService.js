const Personal = require('../models/Personal');
const Project = require('../models/Project');
const TechStack = require('../models/TechStack');
const Certificate = require('../models/Certificate');

class AIPortfolioChatService {
  constructor() {
    this.knowledgeBase = null;
    this.responses = {
      greeting: [
        "Hello! I'm Naveen's AI assistant. I can tell you about his projects, skills, and experience. What would you like to know?",
        "Hi there! I'm here to help you learn more about Naveen Agarwal's portfolio. Feel free to ask about his projects, skills, or background!",
        "Welcome! I can answer questions about Naveen's development experience, projects, and technical skills. How can I help you?"
      ],
      fallback: [
        "I'd be happy to tell you more about Naveen's projects, skills, or experience. Try asking about his React projects, MERN stack experience, or recent work!",
        "Let me help you learn more about Naveen! You can ask about his projects like the portfolio website, ToDo app, or his technical skills.",
        "I'm here to share information about Naveen's development journey. Ask me about his education, projects, or the technologies he works with!"
      ],
      thanks: [
        "You're welcome! Feel free to ask if you'd like to know more about Naveen's work or get in touch with him.",
        "Happy to help! Don't hesitate to reach out if you have more questions about Naveen's projects or experience.",
        "Glad I could help! Let me know if you need any other information about Naveen's portfolio."
      ]
    };
    
    this.patterns = {
      greeting: /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
      thanks: /^(thank|thanks|thank you|thx)/i,
      projects: /project|work|built|created|developed|portfolio|todo|contact management/i,
      skills: /skill|technology|tech|stack|language|framework|react|node|javascript|mongodb/i,
      experience: /experience|background|education|intern|work|job|career/i,
      contact: /contact|hire|email|reach|get in touch|collaborate/i,
      about: /about|who|tell me about|info|information/i,
      certificates: /certificate|certification|course|learning|training/i,
      timeline: /timeline|journey|career path|history|when/i
    };
  }

  async loadKnowledgeBase() {
    try {
      const [personal, projects, techStack, certificates] = await Promise.all([
        Personal.findOne().lean(),
        Project.find().lean(),
        TechStack.find().lean(),
        Certificate.find().lean()
      ]);

      this.knowledgeBase = {
        personal: personal || {},
        projects: projects || [],
        techStack: techStack || [],
        certificates: certificates || []
      };
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      this.knowledgeBase = { personal: {}, projects: [], techStack: [], certificates: [] };
    }
  }

  async generateResponse(userMessage) {
    if (!this.knowledgeBase) {
      await this.loadKnowledgeBase();
    }

    const message = userMessage.toLowerCase().trim();
    
    // Pattern matching for intent recognition
    if (this.patterns.greeting.test(message)) {
      return this.getRandomResponse(this.responses.greeting);
    }
    
    if (this.patterns.thanks.test(message)) {
      return this.getRandomResponse(this.responses.thanks);
    }

    // Projects-related questions
    if (this.patterns.projects.test(message)) {
      return this.generateProjectsResponse(message);
    }

    // Skills-related questions
    if (this.patterns.skills.test(message)) {
      return this.generateSkillsResponse(message);
    }

    // Experience-related questions
    if (this.patterns.experience.test(message)) {
      return this.generateExperienceResponse(message);
    }

    // Contact-related questions
    if (this.patterns.contact.test(message)) {
      return this.generateContactResponse();
    }

    // About questions
    if (this.patterns.about.test(message)) {
      return this.generateAboutResponse();
    }

    // Certificates questions
    if (this.patterns.certificates.test(message)) {
      return this.generateCertificatesResponse();
    }

    // Timeline questions
    if (this.patterns.timeline.test(message)) {
      return this.generateTimelineResponse();
    }

    // Fallback response
    return this.getRandomResponse(this.responses.fallback);
  }

  generateProjectsResponse(message) {
    const projects = this.knowledgeBase.projects;
    
    if (projects.length === 0) {
      return "Naveen has worked on several exciting projects! You can view them in the Projects section of his portfolio.";
    }

    // Check for specific project mentions
    if (message.includes('portfolio')) {
      const portfolioProject = projects.find(p => p.title.toLowerCase().includes('portfolio'));
      if (portfolioProject) {
        return `Naveen's portfolio website is built with ${portfolioProject.techStack.join(', ')}. ${portfolioProject.description} The project features a modern admin panel for content management and is optimized for performance.`;
      }
    }

    if (message.includes('todo')) {
      const todoProject = projects.find(p => p.title.toLowerCase().includes('todo'));
      if (todoProject) {
        return `The ToDo application is one of Naveen's featured projects. ${todoProject.description} It's built using ${todoProject.techStack.join(', ')}.`;
      }
    }

    // General projects response
    const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
    const projectNames = featuredProjects.length > 0 
      ? featuredProjects.map(p => p.title).join(', ')
      : projects.slice(0, 3).map(p => p.title).join(', ');

    return `Naveen has built several impressive projects including ${projectNames}. His projects showcase expertise in modern web development, featuring technologies like React.js, Node.js, and MongoDB. Each project demonstrates problem-solving skills and attention to user experience.`;
  }

  generateSkillsResponse(message) {
    const techStack = this.knowledgeBase.techStack;
    
    if (techStack.length === 0) {
      return "Naveen is skilled in MERN stack development, specializing in React.js, Node.js, MongoDB, and Express.js, along with modern web technologies.";
    }

    // Check for specific technology mentions
    const mentionedTech = techStack.find(tech => 
      message.includes(tech.name.toLowerCase())
    );

    if (mentionedTech) {
      return `Yes! Naveen has ${mentionedTech.proficiency || 'strong'} experience with ${mentionedTech.name}. ${mentionedTech.description || 'He uses it in various projects to build modern web applications.'}`;
    }

    // Group technologies by category
    const frontend = techStack.filter(t => t.category === 'Frontend').map(t => t.name);
    const backend = techStack.filter(t => t.category === 'Backend').map(t => t.name);
    const databases = techStack.filter(t => t.category === 'Database').map(t => t.name);

    let response = "Naveen's technical skills include:\n\n";
    
    if (frontend.length > 0) {
      response += `🎨 Frontend: ${frontend.join(', ')}\n`;
    }
    if (backend.length > 0) {
      response += `⚙️ Backend: ${backend.join(', ')}\n`;
    }
    if (databases.length > 0) {
      response += `🗄️ Databases: ${databases.join(', ')}\n`;
    }

    response += "\nHe specializes in full-stack development with a focus on modern, scalable web applications.";
    
    return response;
  }

  generateExperienceResponse(message) {
    const personal = this.knowledgeBase.personal;
    
    let response = "Naveen Agarwal is a MERN Stack Developer with experience in modern web development. ";
    
    if (personal.title) {
      response += `Currently working as a ${personal.title}. `;
    }
    
    if (message.includes('education') || message.includes('study')) {
      response += "He holds a BCA (Bachelor of Computer Applications) degree from Rajasthan University (2021-2024), where he graduated with distinction in Web Development & AI. ";
    }
    
    if (message.includes('intern') || message.includes('work')) {
      response += "He has completed a Front-End Developer internship at Vanshiv Technologies, where he built interactive React components and optimized website performance, achieving 40% faster load times. ";
    }
    
    response += "His expertise includes building responsive web applications, performance optimization, and working with modern JavaScript frameworks.";
    
    return response;
  }

  generateContactResponse() {
    const personal = this.knowledgeBase.personal;
    
    let response = "You can get in touch with Naveen through several ways:\n\n";
    
    if (personal.email) {
      response += `📧 Email: ${personal.email}\n`;
    }
    
    if (personal.socialLinks) {
      if (personal.socialLinks.linkedin) {
        response += `💼 LinkedIn: ${personal.socialLinks.linkedin}\n`;
      }
      if (personal.socialLinks.github) {
        response += `💻 GitHub: ${personal.socialLinks.github}\n`;
      }
    }
    
    response += "\n🤝 He's available for freelance projects, full-time opportunities, and collaborations. Feel free to reach out to discuss your project requirements!";
    
    return response;
  }

  generateAboutResponse() {
    const personal = this.knowledgeBase.personal;
    
    let response = personal.name ? `${personal.name} is a ` : "Naveen is a ";
    response += "passionate MERN Stack Developer specializing in React.js, Node.js, MongoDB, and Express.js. ";
    
    if (personal.bio) {
      response += `${personal.bio} `;
    }
    
    if (personal.tagline) {
      response += `${personal.tagline} `;
    }
    
    response += "He focuses on creating modern, responsive web applications with excellent user experience and performance optimization.";
    
    return response;
  }

  generateCertificatesResponse() {
    const certificates = this.knowledgeBase.certificates;
    
    if (certificates.length === 0) {
      return "Naveen has completed several professional certifications including MERN Stack Developer Certification and TCS iON Career Edge - Young Professional program.";
    }
    
    let response = "Naveen's certifications include:\n\n";
    
    certificates.slice(0, 5).forEach((cert, index) => {
      response += `${index + 1}. ${cert.title}`;
      if (cert.issuer) {
        response += ` - ${cert.issuer}`;
      }
      if (cert.dateIssued) {
        response += ` (${new Date(cert.dateIssued).getFullYear()})`;
      }
      response += '\n';
    });
    
    response += "\nThese certifications demonstrate his commitment to continuous learning and professional development.";
    
    return response;
  }

  generateTimelineResponse() {
    return `Here's Naveen's professional journey:

🎓 **2021-2024**: BCA at Rajasthan University - Graduated with distinction in Web Development & AI

💼 **July-Sep 2024**: Front-End Developer Intern at Vanshiv Technologies - Built interactive React components and optimized performance

🚀 **2025**: Launched multiple projects including:
   • Personal Portfolio Website (MERN Stack)
   • ToDo Application with real-time features
   • Contact Management System

📜 **Ongoing**: Completing MERN Stack certifications and building innovative web applications

He's currently available for new opportunities and exciting projects!`;
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

module.exports = new AIPortfolioChatService();