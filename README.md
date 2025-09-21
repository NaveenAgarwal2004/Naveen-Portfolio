# **Role:**
Full-Stack Developer – Portfolio Website Creator

# **Objective:**
To present a modern, full-stack developer portfolio using React and Express with an integrated admin panel and contact system, designed for hiring managers and collaborators to evaluate skills, projects, and tech stack.

# **Context:**
This portfolio is built using the MERN stack (MongoDB, Express, React, Node.js), with full CRUD capabilities via an admin dashboard and a contact form backed by email services. Tailwind CSS and shadcn/ui were used to build a modern and responsive design.

# **Instructions:**

## **Instruction 1 :**
Clone the repository and set up both frontend and backend separately. Use `.env.example` to configure your environment variables for backend services like MongoDB, Cloudinary, and Resend.

## **Instruction 2 :**
Use `npm install` and `npm start` (or `npm run dev` for backend) to start both services. The backend runs on port `8001` and serves protected routes for admin functionality.

## **Instruction 3 :**
Log in to the admin dashboard via `/admin/login` and use the UI to manage portfolio content dynamically (projects, personal info, tech stack, and messages).

# **Notes:**
- Built with React (CRA), Tailwind CSS, shadcn/ui, Node.js, Express, MongoDB.
- Includes fully protected admin dashboard using JWT and context-based authentication.
- Designed to scale and update as the developer adds more projects or changes their stack.
- Admin credentials are stored securely and managed via environment variables.

---

# 🧠 AI-Powered Portfolio – Full-Stack Developer Showcase

A full-stack portfolio website built with React and Express, featuring a dynamic admin panel, contact form, and project showcase. Designed to present your developer profile professionally with clean UI, animations, and robust backend integrations.

---

## 🚀 Tech Stack

### Frontend
- **React** (CRA)
- **Tailwind CSS**
- **ShadCN/UI Components**
- **React Router DOM**
- **Axios**
- **Context API**

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT Auth**
- **Resend API** (Email)
- **Cloudinary** (Resume/Image Upload)

---

## 🎯 Features

### 🌐 Portfolio Website
- Responsive UI with animated Hero
- Project gallery with filtering
- Tech stack section
- Contact form (email integration)
- Resume download

### 🔐 Admin Panel
- Secure Admin Login
- Add/Edit/Delete:
  - Projects
  - Tech Stack
  - Personal Info
- View Contact Messages
- Admin routes protected via JWT

---

## 🗂️ Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/ (UI + Pages)
│   ├── components/admin/ (Admin panel)
│   ├── components/ui/ (Reusable UI)
│   ├── services/ (API calls)
│   ├── contexts/ (Auth Context)
│   └── hooks/, lib/, mock.js
backend/
├── server.js
├── routes/
├── models/
├── middleware/
├── config/
├── scripts/ (Seeder scripts)
```

---

## ⚙️ Getting Started

### 🖥️ Frontend

```bash
cd frontend
npm install
npm start
```

### 🧠 Backend

```bash
cd backend
npm install
# Create a .env file (see below)
npm run dev
```

---

## 🔐 Environment Variables

### `.env` (Backend)

```env
PORT=8001
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password

RESEND_API_KEY=your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 📬 Contact

If you'd like to connect or provide feedback:

- **LinkedIn**: [linkedin.com/in/naveenagarwal](https://www.linkedin.com/in/naveen-agar)
- **Email**: naveenagarwal7624@gmail.com
- **Live Site**: [naveenagarwal-portfolio.vercel.app](https://naveenagarwal-portfolio.vercel.app)

---

## 📄 License

MIT License. Free to use with attribution.

---

> Built with ❤️ by **Naveen Agarwal** – MERN Stack Developer







