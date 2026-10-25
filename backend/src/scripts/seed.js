import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Project } from '../models/Project.js';
import { Proposal } from '../models/Proposal.js';
import { Order } from '../models/Order.js';
import { OrderStatusHistory } from '../models/OrderStatusHistory.js';
import { Review } from '../models/Review.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { ENV } from '../config/env.js';

export const populateSeedData = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      FreelancerProfile.deleteMany({}),
      Category.deleteMany({}),
      Service.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      Order.deleteMany({}),
      OrderStatusHistory.deleteMany({}),
      Review.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      PaymentRecord.deleteMany({}),
    ]);

    console.log('[Seed] Seeding categories...');
    const categoriesData = [
      {
        name: 'Web & App Development',
        slug: 'web-app-development',
        description: 'Full-stack web apps, mobile apps, frontend design, and backend APIs.',
        icon: 'Code2',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
        displayOrder: 1,
      },
      {
        name: 'UI/UX & Product Design',
        slug: 'ui-ux-design',
        description: 'Modern Figma prototypes, wireframing, mobile UI, and web interfaces.',
        icon: 'Palette',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
        displayOrder: 2,
      },
      {
        name: 'Logo & Brand Identity',
        slug: 'logo-brand-identity',
        description: 'Custom logos, brand guidelines, typography systems, and vector artwork.',
        icon: 'Brush',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
        displayOrder: 3,
      },
      {
        name: 'Video Editing & Motion',
        slug: 'video-editing',
        description: 'Shorts, promotional videos, YouTube post-production, and animations.',
        icon: 'Video',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
        displayOrder: 4,
      },
      {
        name: 'AI & Data Science',
        slug: 'ai-data-science',
        description: 'Machine learning models, Python data analysis, LLM integrations, and ETL.',
        icon: 'Cpu',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        displayOrder: 5,
      },
      {
        name: 'Content Writing & SEO',
        slug: 'content-writing',
        description: 'High-converting copy, technical documentation, blog posts, and SEO audit.',
        icon: 'FileText',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
        displayOrder: 6,
      },
      {
        name: 'Digital Marketing & Ads',
        slug: 'digital-marketing',
        description: 'Social media growth, Google Ads, Meta campaigns, and funnel marketing.',
        icon: 'TrendingUp',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
        displayOrder: 7,
      },
      {
        name: 'Cloud & DevOps Engineering',
        slug: 'cloud-devops',
        description: 'Docker, Kubernetes, AWS, GCP, CI/CD pipelines, and cloud security.',
        icon: 'Server',
        image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80',
        displayOrder: 8,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    console.log('[Seed] Seeding users...');
    // 1 Admin
    const adminUser = await User.create({
      name: ENV.ADMIN_NAME || 'Platform Administrator',
      email: ENV.ADMIN_EMAIL || 'admin@marketplace.com',
      password: ENV.ADMIN_PASSWORD || 'Admin123!Secure',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      walletBalance: 25000,
      phone: '+1 555-0100',
      bio: 'Marketplace platform administrator and operations lead.',
    });

    // 2 Clients
    const client1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'client1@techcorp.com',
      password: 'Password123!',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      walletBalance: 3200,
      phone: '+1 555-0144',
      bio: 'Product Director at TechCorp Labs. Seeking top-tier engineers and designers.',
    });

    const client2 = await User.create({
      name: 'Marcus Vance',
      email: 'client2@growthscale.io',
      password: 'Password123!',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      walletBalance: 1500,
      phone: '+1 555-0189',
      bio: 'Founder of GrowthScale. Building next-generation SaaS tools.',
    });

    // 4 Freelancers
    const freelancer1 = await User.create({
      name: 'Alex Rivera',
      email: 'freelancer1@marketplace.com',
      password: 'Password123!',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      walletBalance: 840,
      phone: '+1 555-0211',
      bio: 'Senior Full-Stack Developer specializing in React, Node.js, Next.js, and TypeScript.',
    });

    const freelancer2 = await User.create({
      name: 'Elena Rostova',
      email: 'freelancer2@marketplace.com',
      password: 'Password123!',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      walletBalance: 1250,
      phone: '+1 555-0222',
      bio: 'Award-winning UI/UX Designer & Design Systems Architect with 7+ years of experience.',
    });

    const freelancer3 = await User.create({
      name: 'David Chen',
      email: 'freelancer3@marketplace.com',
      password: 'Password123!',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      walletBalance: 490,
      phone: '+1 555-0233',
      bio: 'AI & Data Specialist. Python, TensorFlow, PyTorch, BigQuery, and LLM fine-tuning.',
    });

    const freelancer4 = await User.create({
      name: 'Maya Patel',
      email: 'freelancer4@marketplace.com',
      password: 'Password123!',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      walletBalance: 610,
      phone: '+1 555-0244',
      bio: 'Creative Video Editor and Motion Graphics Designer for brands and digital creators.',
    });

    console.log('[Seed] Seeding freelancer profiles...');
    await FreelancerProfile.create({
      user: freelancer1._id,
      headline: 'Senior Full-Stack Engineer | React, Node.js, TypeScript & Cloud',
      bio: 'I build high-performance, responsive web applications with clean architecture and modern UX. Over 7 years of commercial engineering experience building enterprise applications.',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Next.js', 'Tailwind CSS', 'Docker'],
      hourlyRate: 55,
      availability: 'available',
      languages: ['English (Fluent)', 'Spanish (Conversational)'],
      experienceLevel: 'expert',
      ratingAvg: 4.95,
      ratingCount: 18,
      completedOrdersCount: 22,
      earningsTotal: 4850,
      portfolio: [
        {
          title: 'FinTech Analytics Dashboard',
          description: 'High-throughput real-time portfolio metrics viewer built with React and WebSockets.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://example.com/fintech',
          tags: ['React', 'TypeScript', 'Tailwind'],
        },
        {
          title: 'Cloud DevOps Monitoring Suite',
          description: 'Docker container management web portal with live CPU and network graphs.',
          image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://example.com/cloudops',
          tags: ['Node.js', 'Docker', 'MongoDB'],
        },
      ],
      socialLinks: {
        github: 'https://github.com/alexrivera-dev',
        linkedin: 'https://linkedin.com/in/alexrivera',
        website: 'https://alexrivera.dev',
      },
    });

    await FreelancerProfile.create({
      user: freelancer2._id,
      headline: 'Lead Product Designer & UX Researcher | Web & Mobile Apps',
      bio: 'Specializing in intuitive, beautiful SaaS products, high-fidelity design systems, and user journey optimization.',
      skills: ['UI/UX Design', 'Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'Mobile App Design', 'Web Design'],
      hourlyRate: 60,
      availability: 'available',
      languages: ['English (Fluent)', 'Russian (Native)'],
      experienceLevel: 'expert',
      ratingAvg: 5.0,
      ratingCount: 24,
      completedOrdersCount: 29,
      earningsTotal: 6200,
      portfolio: [
        {
          title: 'SaaS Design System 2.0',
          description: 'Complete 200+ component design system crafted in Figma for a B2B SaaS startup.',
          image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://figma.com/@elenarostova',
          tags: ['Figma', 'UI/UX', 'Design System'],
        },
      ],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/elenarostova',
        website: 'https://elenarostova.design',
      },
    });

    await FreelancerProfile.create({
      user: freelancer3._id,
      headline: 'AI & Machine Learning Specialist | Python, PyTorch & LLMs',
      bio: 'I specialize in generative AI integrations, predictive algorithms, data pipeline development, and intelligent agent workflows.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'FastAPI', 'Data Science', 'Pandas', 'OpenAI'],
      hourlyRate: 70,
      availability: 'available',
      languages: ['English (Fluent)', 'Mandarin (Native)'],
      experienceLevel: 'expert',
      ratingAvg: 4.88,
      ratingCount: 12,
      completedOrdersCount: 15,
      earningsTotal: 3900,
      portfolio: [
        {
          title: 'Predictive Customer Churn Model',
          description: 'High-accuracy XGBoost model with automated retraining pipeline in Python.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://example.com/ml-churn',
          tags: ['Python', 'ML', 'Scikit-Learn'],
        },
      ],
    });

    await FreelancerProfile.create({
      user: freelancer4._id,
      headline: 'Commercial Video Editor & Motion Designer | Premiere & After Effects',
      bio: 'Crafting captivating visual narratives, brand explainers, commercial cuts, and viral short-form social reels.',
      skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design', 'YouTube Video Editing'],
      hourlyRate: 40,
      availability: 'available',
      languages: ['English (Fluent)', 'Hindi (Native)'],
      experienceLevel: 'intermediate',
      ratingAvg: 4.9,
      ratingCount: 15,
      completedOrdersCount: 19,
      earningsTotal: 3100,
      portfolio: [
        {
          title: 'Brand Launch Teaser Video',
          description: 'Dynamic 60-second 4K promo video with custom 3D motion graphics.',
          image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://vimeo.com/example',
          tags: ['Premiere Pro', 'Motion Graphics'],
        },
      ],
    });

    console.log('[Seed] Seeding published services...');
    const servicesData = [
      {
        freelancer: freelancer1._id,
        category: catMap['web-app-development'],
        title: 'I will build a modern full-stack web application with React & Node.js',
        description: 'Get a clean, production-ready full-stack web application. Includes responsive frontend in React with Tailwind CSS, scalable Node.js/Express REST API, MongoDB database integration, JWT authentication, and automated testing.',
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
        pricingType: 'fixed',
        price: 249,
        deliveryTimeDays: 4,
        revisionsAllowed: 3,
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        ],
        status: 'published',
        ratingAvg: 4.95,
        ratingCount: 14,
        ordersCount: 18,
      },
      {
        freelancer: freelancer1._id,
        category: catMap['web-app-development'],
        title: 'I will convert your Figma design to clean, responsive React & Tailwind code',
        description: 'Pixel-perfect, accessible, and fast translation of your UI/UX designs into modular React components with TypeScript and Tailwind CSS. Clean component hierarchy and mobile-ready responsive layouts.',
        skills: ['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
        pricingType: 'fixed',
        price: 120,
        deliveryTimeDays: 2,
        revisionsAllowed: 2,
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        status: 'published',
        ratingAvg: 5.0,
        ratingCount: 8,
        ordersCount: 10,
      },
      {
        freelancer: freelancer2._id,
        category: catMap['ui-ux-design'],
        title: 'I will design a modern SaaS dashboard UI/UX in Figma with design system',
        description: 'Professional, conversion-focused UI/UX design for web applications and SaaS platforms. Includes user research, user flows, interactive prototypes, auto-layout components, and complete Figma source files.',
        skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Dashboard Design'],
        pricingType: 'fixed',
        price: 180,
        deliveryTimeDays: 3,
        revisionsAllowed: 4,
        coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
        status: 'published',
        ratingAvg: 5.0,
        ratingCount: 19,
        ordersCount: 23,
      },
      {
        freelancer: freelancer2._id,
        category: catMap['ui-ux-design'],
        title: 'I will design an intuitive mobile app UI/UX for iOS and Android',
        description: 'Complete mobile app user experience and interface design following Apple Human Interface and Material Design standards. Includes onboarding screens, main workflows, and clickable prototype.',
        skills: ['Mobile App Design', 'iOS', 'Android', 'Figma', 'UI/UX Design'],
        pricingType: 'fixed',
        price: 150,
        deliveryTimeDays: 3,
        revisionsAllowed: 3,
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
        status: 'published',
        ratingAvg: 4.9,
        ratingCount: 9,
        ordersCount: 12,
      },
      {
        freelancer: freelancer3._id,
        category: catMap['ai-data-science'],
        title: 'I will build and integrate custom AI models & LLM agents with Python',
        description: 'Transform your platform with intelligent capabilities. I create LangChain/LlamaIndex agents, vector database semantic searches, OpenAI/Claude API integrations, and custom prompt workflows.',
        skills: ['Python', 'OpenAI', 'FastAPI', 'LangChain', 'Machine Learning'],
        pricingType: 'fixed',
        price: 299,
        deliveryTimeDays: 5,
        revisionsAllowed: 2,
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        status: 'published',
        ratingAvg: 4.9,
        ratingCount: 11,
        ordersCount: 14,
      },
      {
        freelancer: freelancer4._id,
        category: catMap['video-editing'],
        title: 'I will edit high-retention YouTube videos and viral social reels',
        description: 'Professional pacing, motion graphics, sound design, color grading, subtitles, and engaging B-roll selection to maximize viewer retention and engagement.',
        skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'YouTube Video Editing'],
        pricingType: 'fixed',
        price: 85,
        deliveryTimeDays: 2,
        revisionsAllowed: 2,
        coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        status: 'published',
        ratingAvg: 4.88,
        ratingCount: 16,
        ordersCount: 20,
      },
      {
        freelancer: freelancer1._id,
        category: catMap['cloud-devops'],
        title: 'I will set up Docker containers, CI/CD pipelines, and cloud hosting',
        description: 'Reliable deployment automation for your applications. Dockerize microservices, create GitHub Actions workflows, and configure production-grade VPS or cloud infrastructure.',
        skills: ['Docker', 'CI/CD', 'AWS', 'Linux', 'DevOps'],
        pricingType: 'fixed',
        price: 140,
        deliveryTimeDays: 2,
        revisionsAllowed: 2,
        coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
        status: 'published',
        ratingAvg: 5.0,
        ratingCount: 7,
        ordersCount: 9,
      },
    ];

    const services = await Service.insertMany(servicesData);

    console.log('[Seed] Seeding client projects...');
    const project1 = await Project.create({
      client: client1._id,
      category: catMap['web-app-development'],
      title: 'Real-Time Collaboration Dashboard for Remote Engineering Teams',
      description: 'We require a talented full-stack engineer to build a real-time team collaboration web application. The platform needs active task tracking, live markdown editing, WebSocket updates, and role-based permissions.',
      skills: ['React', 'Node.js', 'TypeScript', 'Socket.IO', 'MongoDB'],
      budgetType: 'fixed',
      budgetMin: 350,
      budgetMax: 600,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'open',
      proposalsCount: 2,
    });

    const project2 = await Project.create({
      client: client2._id,
      category: catMap['ui-ux-design'],
      title: 'Complete Redesign of B2B Logistics Mobile Application',
      description: 'Our logistics fleet application requires a complete overhaul to enhance driver usability and route visualization. Need a senior UI/UX designer to craft interactive Figma wireframes and design system components.',
      skills: ['UI/UX Design', 'Figma', 'Mobile App Design', 'Wireframing'],
      budgetType: 'fixed',
      budgetMin: 200,
      budgetMax: 400,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'open',
      proposalsCount: 1,
    });

    const project3 = await Project.create({
      client: client1._id,
      category: catMap['ai-data-science'],
      title: 'Customer Support Semantic Search & AI Chatbot Integration',
      description: 'We want to integrate a knowledge-base semantic search bot into our customer portal. The solution should ingest PDF documentation and answer user inquiries with citations.',
      skills: ['Python', 'FastAPI', 'OpenAI', 'LangChain', 'Vector Search'],
      budgetType: 'hourly',
      budgetMin: 45,
      budgetMax: 75,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'open',
      proposalsCount: 1,
    });

    console.log('[Seed] Seeding proposals...');
    const prop1 = await Proposal.create({
      project: project1._id,
      freelancer: freelancer1._id,
      coverLetter: 'Hi Sarah! I have built several real-time dashboard applications using React, Node.js, and Socket.IO. Your requirements match my core engineering stack exactly. I can deliver a clean, robust architecture with 100% test coverage.',
      bidAmount: 480,
      deliveryTimeDays: 7,
      status: 'pending',
    });

    await Proposal.create({
      project: project1._id,
      freelancer: freelancer3._id,
      coverLetter: 'Hello! I can engineer the backend APIs, WebSocket messaging, and database schemas with high reliability. Looking forward to discussing the architecture with you.',
      bidAmount: 520,
      deliveryTimeDays: 8,
      status: 'pending',
    });

    await Proposal.create({
      project: project2._id,
      freelancer: freelancer2._id,
      coverLetter: 'Hi Marcus, logistics and fleet dashboards are one of my specializations. I can structure clean design tokens, high contrast mobile driver UI, and quick-tap interaction states in Figma.',
      bidAmount: 320,
      deliveryTimeDays: 5,
      status: 'pending',
    });

    console.log('[Seed] Seeding sample orders with complete lifecycle states...');
    // Completed Order with Review
    const completedOrder = await Order.create({
      orderNumber: 'ORD-881901-442',
      client: client1._id,
      freelancer: freelancer1._id,
      service: services[0]._id,
      title: services[0].title,
      agreedPrice: 249,
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'completed',
      paymentStatus: 'released',
      paymentReference: 'ESCROW-99120-RELEASED',
      deliveryNotes: 'Here is the completed full-stack application code along with clean documentation, seed scripts, and deployment instructions.',
      deliveryFiles: [
        {
          name: 'project-source-v1.zip',
          url: '/uploads/sample-delivery.zip',
          size: 1450200,
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await OrderStatusHistory.create({
      order: completedOrder._id,
      fromStatus: 'in_progress',
      toStatus: 'delivered',
      changedBy: freelancer1._id,
      notes: 'Initial delivery submitted with source archive and setup guide.',
    });

    await OrderStatusHistory.create({
      order: completedOrder._id,
      fromStatus: 'delivered',
      toStatus: 'completed',
      changedBy: client1._id,
      notes: 'Client reviewed and approved order. Escrow payment released.',
    });

    // Review on completed order
    await Review.create({
      order: completedOrder._id,
      service: services[0]._id,
      client: client1._id,
      freelancer: freelancer1._id,
      rating: 5,
      comment: 'Alex delivered exceptional work ahead of schedule! The code is clean, modular, and works flawlessly. Communication was prompt and transparent throughout.',
    });

    // In-Progress Order
    const inProgressOrder = await Order.create({
      orderNumber: 'ORD-772810-918',
      client: client2._id,
      freelancer: freelancer2._id,
      service: services[2]._id,
      title: services[2].title,
      agreedPrice: 180,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      paymentStatus: 'escrow_held',
      paymentReference: 'ESCROW-88219-HELD',
    });

    await OrderStatusHistory.create({
      order: inProgressOrder._id,
      fromStatus: 'created',
      toStatus: 'in_progress',
      changedBy: client2._id,
      notes: 'Order initiated for SaaS dashboard UI/UX design. Escrow funds secured.',
    });

    console.log('[Seed] Seeding conversations & messages...');
    const conv1 = await Conversation.create({
      participants: [client1._id, freelancer1._id],
      order: completedOrder._id,
      lastMessage: 'Everything looks outstanding, thanks Alex!',
      lastMessageSender: client1._id,
      lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Message.create({
      conversation: conv1._id,
      sender: client1._id,
      recipient: freelancer1._id,
      text: 'Hello Alex, excited to work together on this build!',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    await Message.create({
      conversation: conv1._id,
      sender: freelancer1._id,
      recipient: client1._id,
      text: 'Hi Sarah! I have already set up the architecture and will share a preview link shortly.',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await Message.create({
      conversation: conv1._id,
      sender: client1._id,
      recipient: freelancer1._id,
      text: 'Everything looks outstanding, thanks Alex!',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Seeding notifications...');
    await Notification.create({
      recipient: client1._id,
      sender: freelancer1._id,
      type: 'proposal_received',
      title: 'New Proposal on Your Project',
      message: 'Alex Rivera submitted a proposal of $480 on "Real-Time Collaboration Dashboard".',
      link: `/client/projects/${project1._id}/proposals`,
      isRead: false,
    });

    await Notification.create({
      recipient: freelancer1._id,
      sender: client1._id,
      type: 'review_received',
      title: '5-Star Review Received!',
      message: 'Sarah Jenkins left you a 5-star review for order #ORD-881901-442.',
      link: `/freelancers/${freelancer1._id}`,
      isRead: false,
    });

    console.log('[Seed] Database seeding completed successfully!');
    console.log('-------------------------------------------------------');
    console.log(' Demo Accounts Created:');
    console.log(' 1. Admin:      admin@marketplace.com      / Admin123!Secure');
    console.log(' 2. Client 1:   client1@techcorp.com       / Password123!');
    console.log(' 3. Client 2:   client2@growthscale.io     / Password123!');
    console.log(' 4. Freelancer: freelancer1@marketplace.com / Password123!');
    console.log(' 5. Freelancer: freelancer2@marketplace.com / Password123!');
    console.log('-------------------------------------------------------');

    return true;
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();
    await populateSeedData();
    return true;
  } catch (error) {
    console.error('[Seed] Error in seedDatabase:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

// If run directly via node
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
