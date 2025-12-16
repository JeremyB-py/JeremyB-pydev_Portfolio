# Hello, I’m Jeremy B. - *JeremyB.py*

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?logo=pandas&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?logo=streamlit&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?logo=ubuntu&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?logo=visual-studio-code&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)


**Full Stack Python Developer | Web Apps & Dashboards | AI & Automation Enthusiast**

I build practical applications that connect frontend experience, backend engineering, and automation.  

---

## Featured Projects

### Wrinkle Witch CRM (Core Platform)
> A modular Streamlit-based business management platform built for a real skincare business, **The Wrinkle Witch**.  
> Originally designed as a searchable esthetician product database, the CRM evolved into a foundation for managing clients, referrals, and other salon operations.  
> Future modules include Square API integration, client analytics, and routine suggestions.

- **Tech:** Python · Streamlit · Pandas · SQLite · CSV I/O  
- **Highlights:** Modular architecture, searchable product catalog, persistent data pipelines, and Square integration planning  
- *(Private repository, code available upon request)*  

Write-up Link: [Wrinkle Witch CRM Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/wrinkle_witch_crm.md)

---

### Referral Tracker Module
> The newest module in the Wrinkle Witch CRM ecosystem - a standalone Streamlit app that automates referral tracking, rewards, PDF card creation, and batch exports for marketing use.  
> Represents the transition from single-purpose CRM scripts to reusable, scalable modules integrated with the main platform.

- **Tech:** Python · Streamlit · Pandas · Pillow · FPDF  
- **Highlights:** Modular codebase, automated PDF generation, referral logic, session-state control, and CSV synchronization  
- *(Private repository, code available upon request)*  

Write-up link: [Wrinkle Witch Referral Tracker Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/referral_tracker.md)

---

### Wrinkle Witch Website & Multi-App Platform
> A production-oriented, full-stack platform built for **The Wrinkle Witch** (local skincare studio).  
> Combines a static customer website (Cloudflare Pages) with a FastAPI backend (Railway) and Streamlit admin apps, all inside a modular monorepo with shared business logic, auth, and integrations.

- **Tech:** Python · FastAPI · Streamlit · SQLAlchemy · PostgreSQL/SQLite · HTML/CSS/JS · Railway · Cloudflare Pages  
- **Highlights:** Static, branded customer pages (fast + SEO-friendly) that call backend APIs for referrals/unsubscribe/specials; Backend API service with validation, error handling, CORS controls, and production deployment on api.thewrinklewitch.com; Shared /shared modules (auth, Square OAuth, business_id, domain utilities) used across apps via adapter patterns; Security upgrade: bcrypt password hashing + role-based access + admin user management UI; Marketing system: Specials/Packages management with image optimization, analytics tracking, and A/B testing groundwork; Performance: HTTP caching strategy (ETag/304 + cache-aware frontend fetch) to reduce API calls and improve load times; Maintainability: monorepo structure + automated tests + CI path-filtering improvements for PRs  
- *(Private repository, code available upon request)*  

Write-up Link: [Wrinkle Witch Website Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/wrinkle_witch_website.md)

---

### Agricultural Forecasting Dashboard
> A data-science project focused on predicting tomato crop yields using regression and ARIMA modeling.  
> Includes exploratory data analysis (EDA), time-series forecasting, and Matplotlib visualizations.

- **Tech:** Python · Pandas · Scikit-Learn · Matplotlib · Statsmodels  
- **Highlights:** Parameter tuning for ARIMA (p,d,q), error analysis (RMSE / R²), multi-crop comparisons

Write-up Link: [Agricultural Forcasting Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/agricultural_forecasting.md)

---

### Continuous Learning AI Framework
> An experimental Python project modeling how an AI could evolve knowledge and moral rules over time.  
> Includes checkpointing, rollback logic, and modular “knowledge bases” for adaptive behavior.

- **Tech:** Python · JSON · Modular Design · Persistent Storage  
- **Focus:** AI safety, dynamic memory, and rule-based evolution  
- *(Private repository, demo available on request)*

Write-up Link: [CLAIP Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/continuous_learning_ai_prototype.md)

---

### Toy Blockchain
> A minimal blockchain prototype in Python demonstrating proof-of-work, transaction queues, and networking fundamentals.  
> Designed to learn basics and application of crypto technologies.

- **Tech:** Python · Flask · Hashlib · JSON  
- **Highlights:** Block validation, unconfirmed transaction pool, node-based sync logic  
- *(Private repository, demo available on request)*  

Write-up Link: [Crypto Prototype Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/crypto_prototype.md)

---

### Power BI Dashboard (Non-Profit Analytics)
> Designed a Power BI dashboard for a small non-profit organization to visualize outreach and donation performance.  
> Built around a generated sample dataset with metrics for donor activity, event participation, and volunteer engagement.  
> Structured for scalability — can easily integrate with Azure SQL or other live data sources.

- **Tools:** Power BI · KPI Visuals · Interactive Filters  
- **Highlights:** End-to-end dashboard design, data modeling for scalability, intuitive layout for organizational reporting  

Write-up Link: [PowerBI Dashboard Showcase](https://github.com/JeremyB-py/JeremyB-pydev_Portfolio/blob/main/projects/powerbi_nonprofit_dashboard.md)

---

## Supporting Projects

#### Local LLM Testing & Fine-Tuning
> Ongoing experimentation with running and fine-tuning local language models such as **Phi-2** (8-bit quantization) and **Mistral-7B (4-bit)** using **LoRA/QLoRA** parameter-efficient methods.  
> Explores model setup, quantization, embeddings, and retrieval workflows on local hardware.  

- **Tools:** PyTorch · BitsAndBytes · PEFT · Transformers  
- **Highlights:** LoRA/QLoRA fine-tuning workflows, dataset preparation, local inference optimization  

---

#### VS Code & Git Automations
> Created custom Git integration scripts and workspace configurations to streamline development across **Streamlit**, **data-science**, and **LLM** projects.  
> Includes version-controlled repo scaffolding, Jupytext syncing, and automated virtual-environment setup.  
> Testing with pytest integrated within workflows.

- **Tools:** Git · GitHub · VS Code · Jupytext · Python Virtual Environments · UnitTest · PyTest  
- **Highlights:** Automated repo scaffolding, github workflows, improved dev-environment consistency, notebook-to-script synchronization  

---

#### Ubuntu
> Working primarily in **Ubuntu 24 LTS** with custom terminal configurations, including **fish** and **Starship**.

---

## About Me
I am a full stack Python developer focused on building web applications, dashboards, and automation tools. After nine years in logistics, I bring a process driven mindset to designing systems that are reliable and practical for real businesses.

Most of my time is spent learning new tools and applying them directly in projects, from the Wrinkle Witch platform (website, CRM, and referral tools) to forecasting dashboards and early experiments with AI system design.

---

## Connect With Me
- **GitHub:** [github.com/JeremyB-py](https://github.com/JeremyB-py)  
- **LinkedIn:** [linkedin.com/in/jeremyb-pydev](https://www.linkedin.com/in/jeremyb-pydev/)  
- **Email:** JeremyB.pydev@gmail.com  

---

*If you’d like to see detailed write-ups, visit the* [`/projects`](./projects) *folder in this repository.*
