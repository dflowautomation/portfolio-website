/* ===================================================
   DFLOWAUTOMATION PORTFOLIO — SCRIPT.JS
   Interactive background (canvas), chatbot, forms,
   animations, FAQ, Book-a-Call, Project modal
   =================================================== */

'use strict';

/* =============================================
   1. INTERACTIVE CANVAS BACKGROUND
   (Retained from dflowautomation.site style)
   Particle network with mouse interaction
   ============================================= */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let width, height, particles, mouse = { x: null, y: null, radius: 180 };

  const CONFIG = {
    particleCount: 90,
    baseSpeed: 0.35,
    minRadius: 1.5,
    maxRadius: 3.5,
    connectionDist: 130,
    primaryColor: [168, 85, 247],   // purple
    accentColor: [6, 182, 212],    // cyan
    bgColor: [10, 10, 18],
  };

  function lerp(a, b, t) { return a + (b - a) * t; }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x = randomBetween(0, width);
      this.y = init ? randomBetween(0, height) : randomBetween(-20, -5);
      this.vx = randomBetween(-CONFIG.baseSpeed, CONFIG.baseSpeed);
      this.vy = randomBetween(0.1, CONFIG.baseSpeed);
      this.r = randomBetween(CONFIG.minRadius, CONFIG.maxRadius);
      this.life = 0;
      this.maxLife = randomBetween(300, 800);
      // alternate between colors
      this.colorIdx = Math.random() > 0.5 ? 0 : 1;
      this.alpha = randomBetween(0.3, 0.8);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 3;
          this.y += (dy / dist) * force * 3;
        }
      }

      if (this.y > height + 10 || this.x < -50 || this.x > width + 50 || this.life > this.maxLife) {
        this.reset();
      }
    }

    draw() {
      const c = this.colorIdx === 0 ? CONFIG.primaryColor : CONFIG.accentColor;
      const a = this.alpha * Math.min(this.life / 60, 1) * Math.min((this.maxLife - this.life) / 60, 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDist) {
          const opacity = (1 - dist / CONFIG.connectionDist) * 0.25;
          // blend colors
          const ci = a.colorIdx === 0 ? CONFIG.primaryColor : CONFIG.accentColor;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ci[0]},${ci[1]},${ci[2]},${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawBackground() {
    const bg = CONFIG.bgColor;
    ctx.fillStyle = `rgba(${bg[0]},${bg[1]},${bg[2]},0.18)`;
    ctx.fillRect(0, 0, width, height);
  }

  // Glowing ambient orbs
  function drawOrbs() {
    const orbs = [
      { x: width * 0.15, y: height * 0.2, r: 300, color: CONFIG.primaryColor, a: 0.04 },
      { x: width * 0.85, y: height * 0.7, r: 350, color: CONFIG.accentColor, a: 0.04 },
      { x: width * 0.5, y: height * 0.5, r: 200, color: CONFIG.primaryColor, a: 0.025 },
    ];
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},${o.a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function animate() {
    drawBackground();
    drawOrbs();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
    animate();
  }

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  }, { passive: true });

  init();
})();


/* =============================================
   2. NAVBAR — scroll effects + hamburger
   ============================================= */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { passive: true });
})();


/* =============================================
   3. TYPING ANIMATION (hero)
   ============================================= */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;
  const cursor = document.querySelector('.typing-cursor');
  const texts = [
    'Automate. Integrate. Elevate',
    'AI Automation Expert',
    'Workflow Architect',
    'CRM Specialist',
    'n8n Developer',
  ];
  let textIndex = 0, charIndex = 0, deleting = false;
  const SPEED_TYPE = 120, SPEED_DEL = 30, PAUSE = 1800;

  function type() {
    const current = texts[textIndex];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, PAUSE);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
    }
    setTimeout(type, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  setTimeout(type, 500);
})();


/* =============================================
   4. SCROLL REVEAL ANIMATION
   ============================================= */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* =============================================
   5. PROJECTS DATA + RENDERING + FILTER
   ============================================= */
const PROJECTS = [
  // ================= n8n PROJECTS =================
  {
    id: 1,
    title: 'FB Page AI Chatbot',
    category: 'n8n',
    tag: 'n8n + AI',
    desc: 'AI-powered Messenger chatbot automating responses, tasks, and customer engagement with Google Gemini API.',
    longDesc: 'An n8n-powered AI chatbot for Facebook Messenger that automates customer communication. It handles inquiries and sales conversations 24/7, providing instant, intelligent responses and streamlining daily workflows without human intervention.',
    problem: 'Manual replies to customer inquiries on Facebook Messenger led to response delays, qualified lead abandonment, and lost sales opportunities.',
    solution: 'Built an n8n workflow utilizing the Google Gemini API to interpret buyer intent, answer FAQs instantly, and qualify prospects.',
    impact: 'Reduced response times to under 5 seconds, automated 90% of basic inquiries, and boosted qualified sales lead capture by 40%.',
    tools: ['n8n', 'Google Gemini API', 'FB Messenger API', 'Google Sheets'],
    img: 'images/n8n-project1.png',
  },
  {
    id: 2,
    title: 'AI Math Solver & Web Researcher on Messenger',
    category: 'n8n',
    tag: 'n8n + Messenger',
    desc: 'Text based, Chatgpt-like Math solver for both basic and complex problems and web research.',
    longDesc: 'This n8n workflow integrates Facebook Messenger with advanced AI to solve math problems and perform real-time web research, providing users with instant, interactive, and context-aware assistance directly in chat.',
    problem: 'Users lacked a quick, convenient tool to get immediate help with math problems or web research directly within a familiar messaging app, often having to switch between different applications.',
    solution: 'An n8n workflow was created to connect Messenger to an AI that interprets user questions, computes math solutions, gathers web references, and delivers concise, multi-lingual answers in a conversational format.',
    impact: 'The solution provides on-demand academic and informational support, enhancing user engagement and accessibility. It offers a seamless, interactive experience, making information retrieval and problem-solving faster and more intuitive.',
    tools: ['n8n', 'Google Gemini API', 'FB Messenger API', 'Google Sheets'],
    img: 'images/n8n-project2.png',
  },
  {
    id: 3,
    title: 'Zendesk Customer Support Ticketing System',
    category: 'n8n',
    tag: 'n8n + Zendesk API',
    desc: 'Automates ticket creation and assignment from emails.',
    longDesc: 'This workflow automates customer support by monitoring an inbox, creating tickets in a helpdesk system, categorizing requests with AI, and assigning them to the appropriate agents based on predefined rules.',
    problem: 'The support team spent significant time manually triaging incoming emails, creating tickets, and assigning them to agents. This led to slower response times and inefficient workload distribution.',
    solution: 'An n8n workflow was developed to watch a support inbox. It uses AI to parse emails, create tickets in Zendesk, categorize the issue, and assign it to the correct agent automatically.',
    impact: 'The automation drastically reduced manual triage time and improved initial response times. It ensured a more balanced workload distribution and allowed support agents to focus on resolving customer issues faster.',
    tools: ['n8n', 'Gmail API', 'Zendesk API', 'Google Gemini API', 'Perplexity.ai API'],
    img: 'images/n8n-project3.png',
  },

  // ================= MAKE.COM PROJECTS =================
  {
    id: 5,
    title: 'Auto Sort Gmail Attachments on Google Drive',
    category: 'make',
    tag: 'Make.com',
    desc: 'Automates fetching unread email attachments, renames files with AI, uploads to Google Drive, logs info in Sheets, and sends summary notifications.',
    longDesc: 'This workflow automates retrieving unread email attachments, using AI to generate concise filenames. It uploads files to Google Drive, logs details in Sheets, and sends notification emails to clients.',
    problem: 'The client faced challenges with managing and organizing a high volume of email attachments, leading to disorganized files, manual data entry, and wasted time searching for important documents.',
    solution: 'An automated system was created to fetch attachments, rename them intelligently, upload to Google Drive, log information in Google Sheets, and notify users, ensuring a streamlined and organized process.',
    impact: 'The automation significantly reduced manual effort, minimized errors, and improved document organization. This resulted in quicker access to important files, enhancing overall operational efficiency and productivity for the client.',
    tools: ['Gmail API', 'Google Drive', 'Google Sheets', 'Gemini', 'Make.com'],
    img: 'images/make-project1.png',
  },
  {
    id: 6,
    title: 'Asana Sync with Xero Automation',
    category: 'make',
    tag: 'Make.com + Xero',
    desc: 'The automation workflow syncs Asana completed tasks with Xero and Google Sheets, updates records, and uploads data attachments automatically.',
    longDesc: 'A Make.com scenario that seamlessly integrates Asana, Xero, and Google Sheets. It automates financial tracking and reporting by syncing completed tasks with transactions and updating records in real-time.',
    problem: 'The client manually reconciled completed project tasks in Asana with financial records in Xero, a time-consuming process prone to errors that delayed financial reporting and decision-making.',
    solution: 'An automated workflow was developed to track completed Asana tasks, sync financial data to Xero, and populate Google Sheets with updated records, including automated attachment uploads for reconciliation.',
    impact: 'The integration saved significant time, improved data accuracy, and enabled real-time financial oversight. This boosted operational efficiency, enhanced data reliability, and allowed for smarter, faster business decisions.',
    tools: ['Make.com', 'Asana API', 'Xero API', 'Google Sheets'],
    img: 'images/make-project2.png',
  },
  {
    id: 7,
    title: 'Lead Qualifier + Research + Voice Agent with Proposal Generator',
    category: 'make',
    tag: 'Make.com + Voice Agent',
    desc: 'An autonomous sales agent that researches leads, performs voice qualification via VAPI, and instantly generates proposals or follow-up communications.',
    longDesc: 'This Make.com scenario integrates Airtable, Perplexity AI, and VAPI to autonomously research and call new leads. It intelligently routes outcomes to generate PandaDoc proposals or send email follow-ups via Gmail.',
    problem: 'Sales teams often struggle to instantly research and contact incoming leads. Delayed responses and manual proposal drafting processes result in missed opportunities and a slow, inefficient sales pipeline.',
    solution: 'Created a fully automated workflow that uses AI to research and call leads, then dynamically generates custom PandaDoc proposals or sends follow-up emails based on the call outcome.',
    impact: 'This system ensures immediate lead engagement and consistent follow-up. It drastically reduces administrative overhead, allowing the sales team to focus purely on closing pre-qualified, high-intent opportunities.',
    tools: ['Make.com', 'VAPI', 'Slack API', 'Airtable API', 'Gmail API', 'Perplexity AI API', 'Pandadoc'],
    img: 'images/make-project3.png',
  },

  // ================= ZAPIER PROJECTS =================
  {
    id: 9,
    title: 'Zapier + Asana CRM Automation',
    category: 'zapier',
    tag: 'Zapier + CRM',
    desc: 'A central Zapier automation connecting Asana, Google Drive, and Gmail to automate project setup, client follow-ups, and post-service engagement.',
    longDesc: 'This comprehensive automation transforms Asana into a fully functional CRM. It utilizes multi-step Zapier Paths to trigger stage-specific actions—from folder creation to targeted email campaigns—based on pipeline movements.',
    problem: 'The client struggled with manual CRM management in Asana, leading to inconsistent communication, missed follow-ups, and significant time wasted on repetitive administrative tasks like folder creation and drafting emails.',
    solution: 'I engineered a robust multi-path Zapier workflow that monitors Asana columns. It automatically executes administrative tasks and sends AI-personalized emails specific to the lead\'s current stage and service package.',
    impact: 'The automation standardized the client experience, ensuring no lead is left behind. It reduced administrative overhead by automating file organization and dramatically increased engagement through timely, personalized communication for every sales stage.',
    tools: ['Asana', 'Zapier', 'Google Drive', 'Gmail'],
    img: 'images/zapier-project1.png',
  },
  {
    id: 10,
    title: 'Perspective Lead Routing - Klaviyo & Superchat for Black Friday Sale',
    category: 'zapier',
    tag: 'Zapier + Klaviyo + Superchat',
    desc: 'A smart lead routing system using Zapier Paths to direct Perspective funnel leads to either Klaviyo (Email) or Superchat (WhatsApp/SMS) based on contact data.',
    longDesc: 'This automation connects a "Perspective" mobile funnel to marketing platforms via Zapier. It utilizes conditional logic (Paths) to intelligently route leads: email-only leads go to Klaviyo, while mobile-number leads trigger WhatsApp flows in Superchat.',
    problem: 'The clients Black Friday funnel captured mixed data points (emails vs. phone numbers), causing fragmentation. Without routing, leads were getting lost or sent to the wrong platform, resulting in missed engagement opportunities during a high-stakes sale.',
    solution: 'Built a "Traffic Cop" automation in Zapier using Paths. It evaluates every incoming leads data availability (Email vs. Phone) and instantly routes them to the correct nurture sequence in either Klaviyo or Superchat.',
    impact: 'This ensured 100% of leads received immediate, channel-appropriate follow-up. It maximized Black Friday waitlist engagement by meeting customers on their preferred platform (Inbox vs. WhatsApp), significantly boosting open rates and potential revenue.',
    tools: ['Zapier', 'Klaviyo', 'Superchat', 'Perspective', 'Gmail', 'Whatsapp'],
    img: 'images/zapier-project 7-1.png',
  },

  // ================= GHL PROJECTS =================
  {
    id: 13,
    title: 'Facebook 3 Steps Funnel Automation',
    category: 'ghl',
    tag: 'GoHighLevel',
    desc: 'A comprehensive HighLevel ecosystem automating the sales funnel from Facebook lead capture to closing. It streamlines nurturing, manages appointment lifecycles, and dynamically updates pipeline stages to maximize conversion efficiency.',
    longDesc: 'A comprehensive HighLevel (GHL) automation ecosystem designed to capture Facebook leads, automate multi-channel follow-ups (SMS/Email), manage appointment lifecycles, and streamline pipeline stages from initial inquiry to closed deal.',
    problem: 'Manual lead management caused delayed responses, resulting in lost opportunities and high appointment no-show rates. The business lacked a cohesive system to track lead status, manage cancellations, or re-engage unresponsive prospects effectively.',
    solution: 'I engineered an end-to-end workflow that automates immediate nurture, halts sequences upon response, enforces appointment reminders to reduce no-shows, and dynamically updates pipeline stages based on real-time lead behavior and booking status.',
    impact: 'The system drastically reduced manual workload while increasing lead conversion rates. It ensured 24/7 responsiveness, minimized appointment no-shows through automated reminders, and provided the client with clear, automated visibility into sales performance.',
    tools: ['GoHighLevel', 'Facebook Ads API', 'Google', 'Google Calendar'],
    img: [
      'images/1. GHL Project 1.png',
      'images/2. GHL Project 1.png',
      'images/3. GHL Project 1.png',
      'images/4. GHL Project 1.png',
      'images/5. GHL Project 1.png',
      'images/6. GHL Project 1.png',
      'images/7. GHL Project 1.png',
      'images/8. GHL Project 1.png',
    ],
  },
  {
    id: 14,
    title: 'Conversational AI for FB Messenger Appointment Booking Chatbot',
    category: 'ghl',
    tag: 'GoHighLevel + AI Chatbot',
    desc: 'An intelligent HighLevel (GHL) chatbot that engages Facebook Messenger leads, handles appointment booking conversations, and automates follow-up for unresponsive users.',
    longDesc: 'This HighLevel workflow utilizes "Conversation AI" to converse with leads directly in Messenger. It features complex branching logic to handle booking requests, timeouts, and successful appointment scheduling without human intervention.',
    problem: 'Managing Facebook Messenger inquiries manually is time-consuming and prone to delays. Leads often go cold if they don\'t receive immediate replies, and scheduling appointments requires constant back-and-forth communication.',
    solution: 'Deployed an AI-driven workflow that instantly engages Messenger leads. It automatically attempts to book appointments, detects when a user stops responding (timeouts), and triggers re-engagement attempts or notifications accordingly.',
    impact: 'The chatbot ensures 24/7 instant engagement for all Messenger inquiries, significantly increasing lead-to-appointment conversion rates while removing the need for a human support agent to handle routine scheduling tasks.',
    tools: ['GoHighLevel', 'Gmail API', 'OpenAI'],
    img: 'images/GHL Project 2.png',
  },
];

(function initProjects() {
  const grid = document.getElementById('projectsGrid');
  const filters = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  function renderProjects(filter = 'all') {
    const isHomePage = !!document.querySelector('.projects-cta');
    let list = PROJECTS;

    if (filter !== 'all') {
      list = PROJECTS.filter(p => p.category === filter);
    }

    if (isHomePage) {
      if (filter === 'all') {
        const categories = ['n8n', 'make', 'zapier', 'ghl'];
        list = categories.map(cat => PROJECTS.find(p => p.category === cat)).filter(Boolean);
      } else {
        list = list.slice(0, 1);
      }
    }

    grid.innerHTML = list.map(p => `
      <div class="project-card" data-id="${p.id}">
        <div class="project-image">
          <img src="${Array.isArray(p.img) ? p.img[0] : p.img}" alt="${p.title}" loading="lazy" />
          <div class="project-overlay">
            <button class="project-overlay-btn">View Details</button>
          </div>
        </div>
        <div class="project-body">
          <span class="project-tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
    });
  }

  function openModal(id) {
    const p = PROJECTS.find(x => x.id === id);
    if (!p) return;

    const imgList = Array.isArray(p.img) ? p.img : [p.img];

    modalContent.innerHTML = `
      <div class="modal-img-wrap">
        <img src="${imgList[0]}" alt="${p.title}" class="modal-img" loading="lazy" />
        <div class="modal-img-hint"><i class="fas fa-search-plus"></i> Click to enlarge</div>
        ${imgList.length > 1 ? `
          <button class="modal-cycle-btn prev" id="modalCyclePrev" aria-label="Previous Image"><i class="fas fa-chevron-left"></i></button>
          <button class="modal-cycle-btn next" id="modalCycleNext" aria-label="Next Image"><i class="fas fa-chevron-right"></i></button>
          <div class="modal-cycle-counter" id="modalCycleCounter">1 / ${imgList.length}</div>
        ` : ''}
      </div>
      <span class="modal-tag">${p.tag}</span>
      <h2 class="modal-title">${p.title}</h2>
      <p class="modal-desc">${p.longDesc}</p>
      <div class="modal-case-section">
        <h4 class="modal-section-title"><i class="fas fa-exclamation-circle" style="color:#ef4444;margin-right:6px;"></i> Problem</h4>
        <p class="modal-section-text">${p.problem}</p>
      </div>
      <div class="modal-case-section">
        <h4 class="modal-section-title"><i class="fas fa-check-circle" style="color:#22c55e;margin-right:6px;"></i> Solution</h4>
        <p class="modal-section-text">${p.solution}</p>
      </div>
      <div class="modal-case-section">
        <h4 class="modal-section-title"><i class="fas fa-chart-line" style="color:var(--clr-accent);margin-right:6px;"></i> Impact</h4>
        <p class="modal-section-text">${p.impact}</p>
      </div>
      <h4 style="color:var(--clr-text);font-family:var(--font-heading);margin-bottom:12px;font-size:0.95rem;">Tools Used</h4>
      <div class="modal-tools">
        ${p.tools.map(t => `<span class="modal-tool">${t}</span>`).join('')}
      </div>
    `;

    // Dynamic Lightbox Creation
    let lightbox = document.getElementById('globalLightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'globalLightbox';
      lightbox.className = 'lightbox-overlay';
      lightbox.innerHTML = `
        <img id="lightboxImg" src="" alt="Enlarged view" />
        <button class="lightbox-cycle-btn prev" id="lightboxPrev" aria-label="Previous Image"><i class="fas fa-chevron-left"></i></button>
        <button class="lightbox-cycle-btn next" id="lightboxNext" aria-label="Next Image"><i class="fas fa-chevron-right"></i></button>
        <div class="lightbox-cycle-counter" id="lightboxCounter">1 / 1</div>
      `;
      document.body.appendChild(lightbox);

      lightbox.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox-cycle-btn')) return; // Don't close if clicking arrows
        lightbox.classList.remove('open');
      });

      // Bind Lightbox Cycle Listeners Once
      const lbImg = lightbox.querySelector('#lightboxImg');
      const lbPrev = lightbox.querySelector('#lightboxPrev');
      const lbNext = lightbox.querySelector('#lightboxNext');
      const lbCounter = lightbox.querySelector('#lightboxCounter');

      lbPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!lightbox.imgList || lightbox.imgList.length <= 1) return;
        lightbox.currentImgIndex = (lightbox.currentImgIndex - 1 + lightbox.imgList.length) % lightbox.imgList.length;
        lbImg.src = lightbox.imgList[lightbox.currentImgIndex];
        lbCounter.textContent = `${lightbox.currentImgIndex + 1} / ${lightbox.imgList.length}`;

        // Sync back to modal view
        const mImg = modalContent.querySelector('.modal-img');
        const mCount = modalContent.querySelector('#modalCycleCounter');
        if (mImg) mImg.src = lightbox.imgList[lightbox.currentImgIndex];
        if (mCount) mCount.textContent = `${lightbox.currentImgIndex + 1} / ${lightbox.imgList.length}`;
      });

      lbNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!lightbox.imgList || lightbox.imgList.length <= 1) return;
        lightbox.currentImgIndex = (lightbox.currentImgIndex + 1) % lightbox.imgList.length;
        lbImg.src = lightbox.imgList[lightbox.currentImgIndex];
        lbCounter.textContent = `${lightbox.currentImgIndex + 1} / ${lightbox.imgList.length}`;

        // Sync back to modal view
        const mImg = modalContent.querySelector('.modal-img');
        const mCount = modalContent.querySelector('#modalCycleCounter');
        if (mImg) mImg.src = lightbox.imgList[lightbox.currentImgIndex];
        if (mCount) mCount.textContent = `${lightbox.currentImgIndex + 1} / ${lightbox.imgList.length}`;
      });
    }

    function openLightbox(startIndex) {
      lightbox.imgList = imgList;
      lightbox.currentImgIndex = startIndex;

      const lbImg = document.getElementById('lightboxImg');
      const lbPrev = document.getElementById('lightboxPrev');
      const lbNext = document.getElementById('lightboxNext');
      const lbCounter = document.getElementById('lightboxCounter');

      if (lbImg) {
        lbImg.src = imgList[startIndex];
      }

      if (lbPrev && lbNext && lbCounter) {
        if (imgList.length > 1) {
          lbPrev.style.display = 'flex';
          lbNext.style.display = 'flex';
          lbCounter.style.display = 'block';
          lbCounter.textContent = `${startIndex + 1} / ${imgList.length}`;
        } else {
          lbPrev.style.display = 'none';
          lbNext.style.display = 'none';
          lbCounter.style.display = 'none';
        }
      }
      lightbox.classList.add('open');
    }

    // Cycle Events
    let currentImgIndex = 0;
    const mainImg = modalContent.querySelector('.modal-img');
    const prevBtn = modalContent.querySelector('#modalCyclePrev');
    const nextBtn = modalContent.querySelector('#modalCycleNext');
    const counter = modalContent.querySelector('#modalCycleCounter');

    if (prevBtn && nextBtn && counter && mainImg) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening lightbox
        currentImgIndex = (currentImgIndex - 1 + imgList.length) % imgList.length;
        mainImg.src = imgList[currentImgIndex];
        counter.textContent = `${currentImgIndex + 1} / ${imgList.length}`;
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening lightbox
        currentImgIndex = (currentImgIndex + 1) % imgList.length;
        mainImg.src = imgList[currentImgIndex];
        counter.textContent = `${currentImgIndex + 1} / ${imgList.length}`;
      });
    }

    // Click to enlarge event
    const imgWrap = modalContent.querySelector('.modal-img-wrap');
    if (imgWrap && mainImg) {
      imgWrap.addEventListener('click', () => {
        openLightbox(currentImgIndex);
      });
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const lb = document.getElementById('globalLightbox');
      if (lb && lb.classList.contains('open')) {
        lb.classList.remove('open');
      } else {
        closeModal();
      }
    }
  });

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(10px)';
      setTimeout(() => {
        renderProjects(btn.dataset.filter);
        grid.style.transition = 'all 0.4s ease';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 200);
    });
  });

  renderProjects();
})();


/* =============================================
   6. TESTIMONIALS CAROUSEL
   ============================================= */
const TESTIMONIALS = [
  {
    name: 'Olivette Valdez',
    title: 'Entrepreneur, Acquapurro WRS',
    text: '"The AI Chatbot that I commisioned DFlowAutomation to create for my Facebook Page is a life-saver! It handles customer messages automatically, saves so much time, and boosted my sales by around 40%. The setup was seamless, professional, and truly transformed my daily operations with less effort."',
    rating: 5,
    avatar: 'images/olivette.jpg'
  },
  {
    name: 'Ezekiel V.',
    title: 'Content Creator, AskMeAnything',
    text: '"DFlowAutomation built an incredible ChatGPT-style automation for my Messenger page! It’s fast, intelligent, and engages my audience like never before. The setup was smooth, fully customized to my content, and has boosted my interaction and productivity tremendously. Highly recommended!"',
    rating: 5,
    avatar: 'images/Ezekiel.jpg'
  },
];

(function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const dotsEl = document.getElementById('testimonialsDots');
  const perPage = window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
  let current = 0;
  const total = Math.ceil(TESTIMONIALS.length / perPage);

  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
      <p class="testimonial-text"><em class="testimonial-quote-em">${t.text}</em></p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">
          ${t.avatar ? `<img src="${t.avatar}" alt="${t.name}" style="width: 100%; height: 100%; object-fit: cover;" />` : t.name[0]}
        </div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-title"><em>${t.title}</em></div>
        </div>
      </div>
    </div>
  `).join('');


  dotsEl.innerHTML = Array.from({ length: total }, (_, i) =>
    `<button class="t-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></button>`
  ).join('');

  function goTo(i) {
    current = i;
    const card = track.querySelector('.testimonial-card');
    if (!card) return;
    const cardW = card.offsetWidth + 24;
    track.style.transform = `translateX(-${current * perPage * cardW}px)`;
    dotsEl.querySelectorAll('.t-dot').forEach((d, j) => d.classList.toggle('active', j === i));
  }

  dotsEl.querySelectorAll('.t-dot').forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.i)));
  });

  // Auto-advance
  setInterval(() => goTo((current + 1) % total), 5000);
})();


/* =============================================
   7. BOOK A CALL FORM — Full Questionnaire
   Validation + EmailJS email + Calendar booking
   ============================================= */
(function initBookCallForm() {
  const form = document.getElementById('bookCallForm');
  const successDiv = document.getElementById('bcfSuccess');
  const submitBtn = document.getElementById('bcSubmitBtn');

  if (!form) return;

  /* ---- EMAILJS CONFIG ----
     To activate real email sending:
     1. Sign up at https://www.emailjs.com (free 200 emails/mo)
     2. Create a service + template
     3. Replace these values:
  ---------------------------------- */
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  const OWNER_EMAIL = 'dflowautomation@gmail.com';

  /* ---- VALIDATION ---- */
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function showErr(id, msg) {
    const el = document.getElementById('err-' + id);
    if (el) { el.textContent = msg; }
    const field = document.getElementById(id);
    if (field) {
      field.closest('.form-group')?.classList.add('field-invalid');
      field.classList.add('shake');
      setTimeout(() => field.classList.remove('shake'), 400);
    }
  }
  function clearErr(id) {
    const el = document.getElementById('err-' + id);
    if (el) el.textContent = '';
    const field = document.getElementById(id);
    if (field) field.closest('.form-group')?.classList.remove('field-invalid');
  }
  function validateForm() {
    let valid = true;
    const checks = [
      { id: 'bc-name', check: v => v.length >= 2, msg: 'Please enter your full name.' },
      { id: 'bc-phone', check: v => v.length >= 7, msg: 'Please enter a valid phone number.' },
      { id: 'bc-email', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email.' },
      { id: 'bc-biz-desc', check: v => v.length >= 10, msg: 'Please describe your business (min 10 chars).' },
      { id: 'bc-revenue', check: v => v !== '', msg: 'Please select an option.' },
      { id: 'bc-top-process', check: v => v.length >= 10, msg: 'Please describe the process (min 10 chars).' },
      { id: 'bc-budget', check: v => v !== '', msg: 'Please select a budget range.' },
    ];
    checks.forEach(({ id, check, msg }) => {
      const v = getVal(id);
      if (!check(v)) { showErr(id, msg); valid = false; }
      else clearErr(id);
    });
    if (!valid) {
      // Scroll to first error
      const firstErr = form.querySelector('.field-invalid');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  /* ---- COLLECT FORM DATA ---- */
  function collectFormData() {
    const tools = [...document.querySelectorAll('input[name="tools"]:checked')].map(c => c.value).join(', ') || 'None selected';
    const platforms = [...document.querySelectorAll('input[name="platforms"]:checked')].map(c => c.value).join(', ') || 'None selected';
    const connectivity = document.querySelector('input[name="connectivity"]:checked')?.value || 'Not answered';
    return {
      from_name: getVal('bc-name'),
      from_email: getVal('bc-email'),
      from_phone: getVal('bc-phone'),
      biz_desc: getVal('bc-biz-desc'),
      revenue: getVal('bc-revenue'),
      role: getVal('bc-role') || 'Not specified',
      top_process: getVal('bc-top-process'),
      process_steps: getVal('bc-process-steps') || 'Not provided',
      hours_spent: getVal('bc-hours-spent') || 'Not provided',
      cost: getVal('bc-cost') || 'Not provided',
      tools_used: tools,
      connectivity,
      platforms,
      volume: getVal('bc-volume') || 'Not specified',
      compliance: getVal('bc-compliance') || 'None mentioned',
      success_vision: getVal('bc-success') || 'Not specified',
      tried_before: getVal('bc-tried') || 'Not specified',
      budget: getVal('bc-budget'),
      timeline: getVal('bc-timeline') || 'Not specified',
      referral: getVal('bc-referral') || 'Not specified',
      notes: getVal('bc-notes') || 'None',
      to_email: OWNER_EMAIL,
      reply_to: getVal('bc-email'),
    };
  }

  /* ---- SEND EMAIL via EmailJS ---- */
  async function sendEmail(data) {
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
        return true;
      } catch (err) {
        console.warn('EmailJS error (using mailto fallback):', err);
      }
    }
    // Fallback: open email selector with form summary
    const subject = `Strategy Call Scheduled — ${data.from_name}`;
    const body =
      `STRATEGY CALL CONFIRMED & SCHEDULED\n\n` +
      `Google Meet Link: ${data.meet_url || 'Generating...'}\n` +
      `Date: ${data.booking_date || 'Not selected'}\n` +
      `Time: ${data.booking_time || 'Not selected'} (Philippine Time)\n\n` +
      `Attendee: ${data.from_name}\nEmail: ${data.from_email}\nPhone: ${data.from_phone}\n\n` +
      `BUSINESS:\n${data.biz_desc}\nRevenue/Size: ${data.revenue}\nRole: ${data.role}\n\n` +
      `PROBLEM:\n${data.top_process}\n\nBudget: ${data.budget}\nTimeline: ${data.timeline}\n\n` +
      `Tools: ${data.tools_used}\nPlatforms: ${data.platforms}\n\nNotes: ${data.notes}`;

    // Target both invitee (client) and inviter (owner)
    const targetEmails = `${OWNER_EMAIL},${data.from_email}`;

    if (typeof window.openEmailProviderSelector === 'function') {
      window.openEmailProviderSelector(targetEmails, subject, body);
    } else {
      window.open(`mailto:${targetEmails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
    return true;
  }

  /* ---- FORM SUBMIT ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing Scheduler...';
    submitBtn.classList.add('loading');

    const data = collectFormData();

    // Small delay for UX transition
    await new Promise(r => setTimeout(r, 800));

    // Save temporary data to merge date/time later on final confirmation
    window.tempBookingData = data;
    
    // Save user's display name to Local Storage for the community chat
    try {
      localStorage.setItem('cc_user_name', data.from_name);
    } catch (err) {
      console.warn('Error saving user name to local storage:', err);
    }

    // Show success & slide calendar
    form.style.display = 'none';
    successDiv.style.display = 'block';
    document.getElementById('bcfSuccessName').textContent = data.from_name;
    document.getElementById('bcfSuccessEmail').textContent = data.from_email;

    // Scroll to success
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Init calendar with user data
    initCalendarWidget(data.from_name, data.from_email);
  });

  /* ---- RESET ---- */
  window.resetBookCallForm = function () {
    form.reset();
    form.style.display = 'block';
    successDiv.style.display = 'none';
    submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Submit & Book My Strategy Call';
    submitBtn.classList.remove('loading');
    // Clear all error states
    document.querySelectorAll('.field-err').forEach(el => el.textContent = '');
    document.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
  };

  /* ---- LIVE VALIDATION on blur ---- */
  ['bc-name', 'bc-phone', 'bc-email', 'bc-biz-desc', 'bc-revenue', 'bc-top-process', 'bc-budget'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      // re-run just this field's check
      if (el.value.trim()) clearErr(id);
    });
    el.addEventListener('input', () => {
      if (el.value.trim()) clearErr(id);
    });
  });

})();


/* =============================================
   7b. CALENDAR BOOKING WIDGET
   ============================================= */
function initCalendarWidget(userName, userEmail) {
  const gridEl = document.getElementById('calGrid');
  const timesEl = document.getElementById('calTimes');
  const dateLabel = document.getElementById('calDateLabel');
  const slotsEl = document.getElementById('calSlots');
  const bookedEl = document.getElementById('calBooked');
  const bookedMsg = document.getElementById('calBookedMsg');
  const monthLabel = document.getElementById('calMonthLabel');
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  const gcalBtn = document.getElementById('calAddToGcal');
  const resetBtn = document.getElementById('bcfReset');

  if (!gridEl) return;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const TIME_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

  let today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedTime = null;
  let bookedData = {};

  function renderCalendar() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    monthLabel.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    gridEl.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day empty';
      gridEl.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(viewYear, viewMonth, d);
      const dayOfWeek = dayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

      const cell = document.createElement('div');
      cell.textContent = d;
      cell.className = 'cal-day';

      if (isPast || isWeekend) {
        cell.classList.add('disabled');
      } else {
        cell.classList.add('available');
        if (isToday) cell.classList.add('today');
        cell.addEventListener('click', () => selectDate(d, dayDate));
      }
      if (selectedDate && selectedDate.getDate() === d &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getFullYear() === viewYear) {
        cell.classList.add('selected');
      }
      gridEl.appendChild(cell);
    }
  }

  function selectDate(d, dayDate) {
    selectedDate = dayDate;
    selectedTime = null;
    renderCalendar();

    // Show time slots
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateLabel.textContent = dayDate.toLocaleDateString('en-US', opts);
    timesEl.style.display = 'block';
    bookedEl.style.display = 'none';
    timesEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Render time slots
    slotsEl.innerHTML = TIME_SLOTS.map(t => `<div class="cal-slot" data-time="${t}">${t}</div>`).join('');
    slotsEl.querySelectorAll('.cal-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        slotsEl.querySelectorAll('.cal-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        selectedTime = slot.dataset.time;
        setTimeout(() => confirmBooking(), 400);
      });
    });
  }

  function generateMeetLink() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (len) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    return `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
  }

  function confirmBooking() {
    if (!selectedDate || !selectedTime) return;
    const opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = selectedDate.toLocaleDateString('en-US', opts);
    bookedData = { date: dateStr, time: selectedTime, name: userName, email: userEmail };

    bookedMsg.textContent = `Your 30-minute strategy call is scheduled for ${dateStr} at ${selectedTime} (Philippine Time).`;

    // Generate dynamic Meet URL
    const meetUrl = generateMeetLink();
    const meetLinkEl = document.getElementById('calMeetLink');
    if (meetLinkEl) {
      meetLinkEl.href = meetUrl;
      meetLinkEl.innerHTML = `<i class="fas fa-video"></i> ${meetUrl.replace('https://', '')}`;
    }

    timesEl.style.display = 'none';
    bookedEl.style.display = 'block';
    bookedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Update "Add to Google Calendar" link
    if (gcalBtn) {
      const gcalUrl = buildGCalUrl(bookedData, meetUrl);
      gcalBtn.onclick = () => window.open(gcalUrl, '_blank');
    }

    // Trigger community chat notification
    if (typeof window.triggerBookingNotification === 'function') {
      window.triggerBookingNotification(userName, selectedTime, selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Dispatch confirmation email to both invitee and inviter
    if (window.tempBookingData) {
      window.tempBookingData.booking_date = dateStr;
      window.tempBookingData.booking_time = selectedTime;
      window.tempBookingData.meet_url = meetUrl;

      // Send email
      sendEmail(window.tempBookingData);

      // Clear temp data
      window.tempBookingData = null;
    }
  }

  function buildGCalUrl({ date, time, name }, meetUrl) {
    const d = new Date(`${date} ${time}`);
    const start = d.toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(d.getTime() + 30 * 60000).toISOString().replace(/-|:|\.\d+/g, '');
    const title = encodeURIComponent('Free Strategy Call — DFlowAutomation');
    const desc = encodeURIComponent(`Your free 30-minute strategy call with Don Sufrir (DFlowAutomation).\n\nBooking for: ${name}\n\nGoogle Meet Link: ${meetUrl}`);
    const loc = encodeURIComponent(meetUrl);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${desc}&location=${loc}`;
  }

  // Month navigation
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (viewMonth === 0) { viewMonth = 11; viewYear--; }
    else viewMonth--;
    // Don't navigate before current month
    if (viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth())) {
      viewMonth = today.getMonth(); viewYear = today.getFullYear();
    }
    renderCalendar();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (viewMonth === 11) { viewMonth = 0; viewYear++; }
    else viewMonth++;
    renderCalendar();
  });
  if (resetBtn) resetBtn.addEventListener('click', () => { window.resetBookCallForm(); });

  renderCalendar();
}




/* =============================================
   8. FAQ ACCORDION
   ============================================= */
(function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();


/* =============================================
   9. CONTACT FORM
   ============================================= */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
})();


/* =============================================
   10. CHATBOT AI ASSISTANT
   ============================================= */
(function initChatbot() {
  const bubble = document.getElementById('chatbotBubble');
  const window_ = document.getElementById('chatbotWindow');
  if (!bubble || !window_) return;
  const closeBtn = document.getElementById('chatbotClose');
  const messages = document.getElementById('chatbotMessages');
  const input = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');
  const quickReplies = document.getElementById('quickReplies');
  let isOpen = false;

  // Knowledge base for the chatbot
  const KB = {
    services: "Don offers: **AI Agent Development**, **Workflow Automation** (n8n, Make.com, Zapier), **CRM Integration** (GoHighLevel, HubSpot), **AI Chatbot Development** (FB, WhatsApp, web), **API Integration**, and **Business Process Optimization**.",
    pricing: "Pricing depends on project scope. Simple automations start at **$300**, while complex AI agent systems or CRM builds range from **$1,000–$10,000+**. Book a free call for a transparent quote with no obligation.",
    tools: "Don works with: **n8n** (self-hosted), **Make.com**, **Zapier**, **OpenAI/Claude APIs**, **GoHighLevel**, **HubSpot**, **Airtable**, **Google Workspace**, **Slack**, **Facebook Messenger API**, **WhatsApp Business API**, and many more.",
    start: "Getting started is easy! Just **book a free 30-minute call** using the Book a Call section above. We'll map out your automation roadmap and give you an ROI estimate — completely free and no obligation.",
    timeline: "Simple automations: **3–7 days**. Complex AI agent systems or full CRM builds: **2–6 weeks**. Don always provides clear timelines before starting any project.",
    support: "Yes! Don offers **monthly retainer plans** for maintenance, monitoring, and updates. He also offers one-time support packages for smaller needs.",
    roi: "Most clients see ROI within **30–60 days**. Typical results: 10–40 hours/week saved, 30–70% reduction in errors, 2–5x faster lead response times.",
    location: "Don is based in the **Philippines 🇵🇭** and works with clients **worldwide remotely**. He's available across multiple time zones.",
    contact: "You can reach Don at **don@dflowautomation.site** or book a free call using the form above. He responds within 24 hours.",
    n8n: "n8n is an open-source workflow automation tool. Don is an **n8n expert** and can self-host it on your server for maximum data security and control.",
    make: "Make.com (formerly Integromat) is a visual automation platform. Don has built hundreds of Make.com scenarios for businesses of all sizes.",
    zapier: "Zapier is the most popular automation tool. Don uses it for quick integrations and is a certified Zapier expert.",
    highlevel: "GoHighLevel is a comprehensive CRM and marketing automation platform. Don has extensive experience building custom solutions on top of GoHighLevel for businesses of all sizes.",
    booking: "That's great! If you're ready to get started, 👆 Click the 'Book a Call' button above!",
    default: "That's a great question! I'd recommend **booking a free call** with Don to get a detailed answer tailored to your business. He's super responsive and will walk you through everything. 👆 Click the 'Book a Call' button above!",
  };

  function matchKB(msg) {
    const m = msg.toLowerCase();
    if (m.match(/service|offer|do you|help|what can/)) return KB.services;
    if (m.match(/pric|cost|how much|rate|fee|charge/)) return KB.pricing;
    if (m.match(/tool|platform|software|n8n|make|zapier/)) return KB.tools;
    if (m.match(/start|begin|first|get start|onboard/)) return KB.start;
    if (m.match(/time|long|fast|days|weeks|turnaround/)) return KB.timeline;
    if (m.match(/support|maintain|after|retainer|ongoing/)) return KB.support;
    if (m.match(/roi|return|save|hours|worth|result/)) return KB.roi;
    if (m.match(/where|location|country|timezone|based/)) return KB.location;
    if (m.match(/contact|email|reach|message|facebook/)) return KB.contact;
    if (m.match(/n8n/)) return KB.n8n;
    if (m.match(/make\.?com|make/)) return KB.make;
    if (m.match(/zapier/)) return KB.zapier;
    if (m.match(/gohighlevel|highlevel|gohighlevel/)) return KB.highlevel;
    if (m.match(/book|call|schedule|appointment/)) return KB.booking;
    if (m.match(/hi|hello|hey|howdy/))
      return "👋 Hi there! I'm Don's AI assistant. How can I help you today? Ask me about his services, pricing, tools, or how to get started!";
    return KB.default;
  }

  function formatResponse(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = `<div class="chat-bubble">${formatResponse(text)}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot chat-typing';
    div.innerHTML = `<div class="chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function respond(userMsg) {
    const typing = showTyping();
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      typing.remove();
      const response = matchKB(userMsg);
      appendMsg(response, 'bot');
      // Show quick replies again after response
      quickReplies.style.display = 'flex';
    }, delay);
  }

  function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    appendMsg(msg, 'user');
    input.value = '';
    quickReplies.style.display = 'none';
    respond(msg);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      appendMsg(msg, 'user');
      quickReplies.style.display = 'none';
      respond(msg);
    });
  });

  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    window_.classList.toggle('open', isOpen);
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    window_.classList.remove('open');
  });
})();


/* =============================================
   11. BACK TO TOP
   ============================================= */
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* =============================================
   12. SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* =============================================
   13. NAVBAR ACTIVE LINK STYLE (CSS inject)
   ============================================= */
const style = document.createElement('style');
style.textContent = `
  .nav-links a.active {
    color: var(--clr-primary) !important;
    background: rgba(168,85,247,0.08);
  }
`;
document.head.appendChild(style);


/* =============================================
   14. PROJECT GRID ANIMATION ON FILTER
   ============================================= */
(function initGridTransitions() {
  const grid = document.getElementById('projectsGrid');
  if (grid) {
    grid.style.opacity = '1';
    grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  }
})();

/* =============================================
   15. 3D ROBOT MODEL MOUSE TRACKING
   ============================================= */
(function initRobotHeadTracking() {
  const models = [
    document.getElementById('robot3dModel'),
    document.getElementById('robot3dModelHeader')
  ].filter(Boolean);

  if (models.length === 0) return;

  window.addEventListener('mousemove', (e) => {
    models.forEach(model => {
      const rect = model.getBoundingClientRect();
      const modelX = rect.left + rect.width / 2;
      const modelY = rect.top + rect.height / 2;

      const deltaX = e.clientX - modelX;
      const deltaY = e.clientY - modelY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist === 0) return;

      const rad = Math.atan2(deltaY, deltaX);

      // Max rotation in degrees
      const maxRotation = 30;
      const rotationFactor = Math.min(dist / 400, 1);
      const angleVal = rotationFactor * maxRotation;

      const angleY = Math.cos(rad) * angleVal;
      const angleX = -Math.sin(rad) * angleVal;

      model.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
  });
})();


/* =============================================
   16. COMMUNITY CHAT SYSTEM
   ============================================= */
(function initCommunityChat() {
  const chatWindow = document.getElementById('communityChatWindow');
  const chatToggleBtns = [
    document.getElementById('navbarChatBtn'),
    document.getElementById('mobileChatBtn')
  ].filter(Boolean);
  const closeBtn = document.getElementById('ccCloseBtn');
  const inputForm = document.getElementById('ccInputForm');
  const messageInput = document.getElementById('ccMessageInput');
  const messagesContainer = document.getElementById('ccMessages');

  // AI assistant window so we can close it when community chat opens
  const aiWindow = document.getElementById('chatbotWindow');

  if (!chatWindow) return;

  // URL-based reset check (?clear=true)
  if (window.location.search.includes('clear=true')) {
    try {
      localStorage.removeItem('cc_messages');
      localStorage.removeItem('cc_user_name');
      // Clean query parameter from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.warn('Could not clear local storage:', e);
    }
  }

  // Load and render past messages from Local Storage
  let savedMessages = [];
  try {
    const raw = localStorage.getItem('cc_messages');
    if (raw) savedMessages = JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading chat messages from local storage:', err);
  }

  if (messagesContainer) {
    // Start with the standard system welcome log
    messagesContainer.innerHTML = '<div class="cc-status-log">Connected to #general. Welcome to the Community Chat!</div>';

    // Render stored history
    savedMessages.forEach(msg => {
      const msgEl = document.createElement('div');
      if (msg.type === 'system') {
        msgEl.className = 'cc-status-log';
        msgEl.style.background = 'rgba(168, 85, 247, 0.08)';
        msgEl.style.border = '1px solid rgba(168, 85, 247, 0.2)';
        msgEl.style.color = 'var(--clr-primary)';
        msgEl.style.fontWeight = '600';
        msgEl.innerHTML = `<i class="fas fa-calendar-check" style="margin-right: 6px;"></i> ${msg.text}`;
      } else {
        msgEl.className = 'cc-msg';
        msgEl.innerHTML = `
          <div class="cc-avatar" style="background-color: ${msg.avatarBg}; color: ${msg.avatarText};">${msg.avatarLetter || 'YO'}</div>
          <div class="cc-msg-content">
            <div class="cc-msg-meta">
              <span class="cc-author">${msg.author}</span>
              <span class="cc-time">${msg.time}</span>
            </div>
            <p class="cc-text">${msg.text}</p>
          </div>
        `;
      }
      messagesContainer.appendChild(msgEl);
    });

    // Scroll to end of list
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Toggle chat window
  chatToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = chatWindow.classList.contains('open');
      if (isOpen) {
        chatWindow.classList.remove('open');
      } else {
        // Close AI assistant if open
        if (aiWindow) aiWindow.classList.remove('open');
        chatWindow.classList.add('open');
        // Scroll to bottom of message feed
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }
    });
  });

  // Close chat window
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('open');
    });
  }

  // Prevent closing when clicking inside the window
  chatWindow.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Close when clicking anywhere else on page
  document.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // Send message
  if (inputForm) {
    inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = messageInput.value.trim();
      if (!text) return;

      // Random avatar color
      const bgColors = ['#fca5a5', '#cbd5e1', '#fed7aa', '#c084fc', '#818cf8', '#fed7aa'];
      const textColors = ['#7f1d1d', '#334155', '#7c2d12', '#581c87', '#1e1b4b', '#7c2d12'];
      const randIndex = Math.floor(Math.random() * bgColors.length);

      const savedName = localStorage.getItem('cc_user_name');
      const authorName = savedName ? `${savedName} (Visitor)` : 'You (Visitor)';
      
      // Generate initials if they have a saved name
      let initials = 'YO';
      if (savedName) {
        const parts = savedName.trim().split(/\s+/);
        if (parts.length > 1) {
          initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length > 0 && parts[0].length > 0) {
          initials = parts[0][0].substring(0, 2).toUpperCase();
        }
      }

      const msgObj = {
        type: 'user',
        author: authorName,
        time: 'Just now',
        text: escapeHTML(text),
        avatarBg: bgColors[randIndex],
        avatarText: textColors[randIndex],
        avatarLetter: initials
      };

      savedMessages.push(msgObj);
      try {
        localStorage.setItem('cc_messages', JSON.stringify(savedMessages));
      } catch (err) {
        console.warn('Error saving chat message to local storage:', err);
      }

      // Create new message element
      const msgEl = document.createElement('div');
      msgEl.className = 'cc-msg';
      msgEl.innerHTML = `
        <div class="cc-avatar" style="background-color: ${msgObj.avatarBg}; color: ${msgObj.avatarText};">${msgObj.avatarLetter}</div>
        <div class="cc-msg-content">
          <div class="cc-msg-meta">
            <span class="cc-author">${msgObj.author}</span>
            <span class="cc-time">Just now</span>
          </div>
          <p class="cc-text">${msgObj.text}</p>
        </div>
      `;

      messagesContainer.appendChild(msgEl);
      messageInput.value = '';

      // Auto scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Expose notification callback globally
  window.triggerBookingNotification = function (name, time, date) {
    if (!messagesContainer) return;
    const textContent = `<strong>${escapeHTML(name)}</strong> just booked a Strategy Call for ${date} at ${time}!`;

    // Save system message to local storage
    const msgObj = {
      type: 'system',
      text: textContent
    };
    savedMessages.push(msgObj);
    try {
      localStorage.setItem('cc_messages', JSON.stringify(savedMessages));
    } catch (err) {
      console.warn('Error saving booking notice to local storage:', err);
    }

    const msgEl = document.createElement('div');
    msgEl.className = 'cc-status-log';
    msgEl.style.background = 'rgba(168, 85, 247, 0.08)';
    msgEl.style.border = '1px solid rgba(168, 85, 247, 0.2)';
    msgEl.style.color = 'var(--clr-primary)';
    msgEl.style.fontWeight = '600';
    msgEl.innerHTML = `<i class="fas fa-calendar-check" style="margin-right: 6px;"></i> ${textContent}`;
    
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Automatically slide open the community chat widget to show the notification
    if (chatWindow && !chatWindow.classList.contains('open')) {
      const aiWindow = document.getElementById('chatbotWindow');
      if (aiWindow) aiWindow.classList.remove('open');
      chatWindow.classList.add('open');
    }
  };

  // Real-time simultaneous visitor counter via public room broker
  (async function initRealtimePresence() {
    try {
      const Y = await import('https://esm.sh/yjs@13.6.10');
      const { WebsocketProvider } = await import('https://esm.sh/y-websocket@1.5.0');
      
      const ydoc = new Y.Doc();
      const provider = new WebsocketProvider(
        'wss://demos.yjs.dev',
        'dflowautomation-portfolio-presence-v1',
        ydoc
      );

      provider.awareness.on('change', () => {
        const count = provider.awareness.getStates().size;
        const onlineCountEl = document.getElementById('onlineCount');
        const onlineCountMobileEl = document.getElementById('onlineCountMobile');
        const ccViewingCountEl = document.getElementById('ccViewingCount');
        
        if (onlineCountEl) onlineCountEl.textContent = count;
        if (onlineCountMobileEl) onlineCountMobileEl.textContent = count;
        if (ccViewingCountEl) ccViewingCountEl.textContent = count;
      });

      // Register local presence state
      provider.awareness.setLocalStateField('user', { active: true });
    } catch (err) {
      console.warn('Realtime presence count setup failed. Falling back to 1.', err);
      const onlineCountEl = document.getElementById('onlineCount');
      const onlineCountMobileEl = document.getElementById('onlineCountMobile');
      const ccViewingCountEl = document.getElementById('ccViewingCount');
      if (onlineCountEl) onlineCountEl.textContent = '1';
      if (onlineCountMobileEl) onlineCountMobileEl.textContent = '1';
      if (ccViewingCountEl) ccViewingCountEl.textContent = '1';
    }
  })();

  // Active Visitor Geolocation marquee
  const marqueeEl = chatWindow.querySelector('.cc-marquee');
  if (marqueeEl) {
    let resolvedCountry = 'PH'; // fallback default

    function updateMarquee(countryCode) {
      const countryNames = {
        'US': 'United States 🇺🇸',
        'PH': 'Philippines 🇵🇭',
        'IN': 'India 🇮🇳',
        'CA': 'Canada 🇨🇦',
        'GB': 'United Kingdom 🇬🇧',
        'UK': 'United Kingdom 🇬🇧',
        'AU': 'Australia 🇦🇺',
        'SG': 'Singapore 🇸🇬',
        'DE': 'Germany 🇩🇪',
        'FR': 'France 🇫🇷',
        'JP': 'Japan 🇯🇵',
        'NZ': 'New Zealand 🇳🇿',
        'AE': 'United Arab Emirates 🇦🇪'
      };
      const countryName = countryNames[countryCode.toUpperCase()] || countryCode;
      marqueeEl.textContent = `visitor online from ${countryName}`;
    }

    // Try API fetch first
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          updateMarquee(data.country_code);
        } else {
          throw new Error('Invalid data');
        }
      })
      .catch(() => {
        // Fallback: Estimate from browser timezone metadata (extremely offline-resilient!)
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (tz.includes('Manila') || tz.includes('Singapore') || tz.includes('Taipei') || tz.includes('Kuala_Lumpur')) {
            resolvedCountry = 'PH';
          } else if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Denver') || tz.includes('Los_Angeles') || tz.includes('Phoenix')) {
            resolvedCountry = 'US';
          } else if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('Delhi') || tz.includes('Mumbai')) {
            resolvedCountry = 'IN';
          } else if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Winnipeg') || tz.includes('Edmonton')) {
            resolvedCountry = 'CA';
          } else if (tz.includes('London') || tz.includes('Dublin')) {
            resolvedCountry = 'GB';
          } else if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Adelaide') || tz.includes('Perth')) {
            resolvedCountry = 'AU';
          } else if (tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome') || tz.includes('Madrid') || tz.includes('Amsterdam')) {
            resolvedCountry = 'DE';
          } else {
            resolvedCountry = 'US'; // global default
          }
        } catch (e) {
          resolvedCountry = 'US';
        }
        updateMarquee(resolvedCountry);
      });
  }

})();


/* =============================================
   17. EMAIL PROVIDER SELECTOR SYSTEM
   ============================================= */
(function initEmailSelector() {
  window.openEmailProviderSelector = function (to, subject = '', body = '') {
    let overlay = document.getElementById('emailSelectorOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'emailSelectorOverlay';
      overlay.className = 'email-selector-overlay';
      overlay.innerHTML = `
        <div class="email-selector-box">
          <button class="email-selector-close" id="emailSelectorClose">&times;</button>
          <h3>Send Email</h3>
          <p>Choose your preferred email client or provider to send this message:</p>
          <div class="email-provider-list">
            <a href="#" class="provider-btn gmail" id="prov-gmail" target="_blank">
              <i class="fab fa-google"></i> Gmail (Webmail)
            </a>
            <a href="#" class="provider-btn outlook" id="prov-outlook" target="_blank">
              <i class="fab fa-windows"></i> Outlook (Webmail)
            </a>
            <a href="#" class="provider-btn yahoo" id="prov-yahoo" target="_blank">
              <i class="fab fa-yahoo"></i> Yahoo Mail (Webmail)
            </a>
            <a href="#" class="provider-btn default" id="prov-default">
              <i class="fas fa-envelope"></i> Default Mail App
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Close handlers
      const closeBtn = overlay.querySelector('#emailSelectorClose');
      closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    }

    // Build specific URLs
    const encTo = encodeURIComponent(to);
    const encSub = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSub}&body=${encBody}`;
    const outlookUrl = `https://outlook.live.com/default.aspx?rru=compose&to=${encTo}&subject=${encSub}&body=${encBody}`;
    const yahooUrl = `https://compose.mail.yahoo.com/?to=${encTo}&subj=${encSub}&body=${encBody}`;
    const defaultUrl = `mailto:${to}?subject=${encSub}&body=${encBody}`;

    overlay.querySelector('#prov-gmail').href = gmailUrl;
    overlay.querySelector('#prov-outlook').href = outlookUrl;
    overlay.querySelector('#prov-yahoo').href = yahooUrl;
    overlay.querySelector('#prov-default').href = defaultUrl;

    // Reset default link target just in case
    overlay.querySelector('#prov-default').onclick = (e) => {
      e.preventDefault();
      window.location.href = defaultUrl;
      overlay.classList.remove('open');
    };

    // Close when any provider is clicked (except default which uses inline handler)
    ['#prov-gmail', '#prov-outlook', '#prov-yahoo'].forEach(sel => {
      overlay.querySelector(sel).onclick = () => {
        setTimeout(() => overlay.classList.remove('open'), 100);
      };
    });

    overlay.classList.add('open');
  };

  // Intercept all mailto links on the page automatically
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="mailto:"]');
    if (a) {
      e.preventDefault();
      const href = a.getAttribute('href');
      const email = href.replace('mailto:', '').split('?')[0];

      // Parse subject and body if present
      const urlParams = new URLSearchParams(href.split('?')[1] || '');
      const subject = urlParams.get('subject') || '';
      const body = urlParams.get('body') || '';

      window.openEmailProviderSelector(email, subject, body);
    }
  });
})();


