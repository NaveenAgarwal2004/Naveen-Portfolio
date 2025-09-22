import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title = "Naveen Agarwal - MERN Stack Developer | Portfolio",
  description = "Passionate MERN Stack Developer specializing in React.js, Node.js, MongoDB, and Express.js. View my portfolio of modern web applications and AI-powered projects.",
  keywords = "MERN Stack Developer, React Developer, Node.js Developer, Full Stack Developer, JavaScript, MongoDB, Express.js, Web Development, Frontend Developer, Portfolio",
  image = "/api/og-image.jpg",
  url = "https://your-portfolio-domain.com",
  type = "website",
  author = "Naveen Agarwal"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Naveen Agarwal Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@naveen_dev" />

      {/* Additional SEO */}
      <meta name="theme-color" content="#1e293b" />
      <meta name="color-scheme" content="dark" />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Naveen Agarwal",
          "jobTitle": "MERN Stack Developer",
          "description": description,
          "url": url,
          "image": image,
          "sameAs": [
            "https://github.com/NaveenAgarwal2004",
            "https://linkedin.com/in/naveen-agarwal",
            "https://twitter.com/naveen_dev"
          ],
          "knowsAbout": [
            "JavaScript",
            "React.js",
            "Node.js", 
            "MongoDB",
            "Express.js",
            "MERN Stack",
            "Full Stack Development",
            "Frontend Development",
            "Web Development"
          ],
          "worksFor": {
            "@type": "Organization",
            "name": "Freelance Developer"
          }
        })}
      </script>

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://res.cloudinary.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
    </Helmet>
  );
};

export default MetaTags;