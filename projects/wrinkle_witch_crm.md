# Wrinkle Witch CRM (Core Platform)

The **Wrinkle Witch CRM** is a modular, Streamlit-based business management platform designed for **The Wrinkle Witch**, a local skincare business.  
Initially developed as a **searchable product database for esthetician products**, the CRM now serves as the foundation for a broader suite of connected applications — including client tracking, referral management, and future automation tools.

Built with scalability and modular integration in mind, the CRM architecture supports new components like the **Referral Tracker**, while maintaining simple offline persistence through CSV and SQLite storage.

---

## Overview

The Wrinkle Witch CRM was designed to streamline how an esthetician manages multiple facets of their business — from product organization to client engagement and marketing.  
The initial version focuses on providing a structured product lookup and management system, with planned modules for:

- **Client Tracking & Scheduling Integration:** Future module to connect client profiles and appointments with Square API data.  
- **Referrals & Rewards:** Active development via the standalone [Referral Tracker Module](./referral_tracker.md).  
- **Routine Suggestions:** Planned model-based recommendation engine for skincare routines based on client skin types and purchased products.  
- **Automatic Reminders & Follow-ups:** Potential future feature to automate client check-ins or reorder prompts.

This foundation allows new tools to plug into the same ecosystem — sharing a consistent database layer, UI structure, and branding assets.

---

## Features

| Category | Description |
|-----------|-------------|
| `Product Retrieval` | Fetch information and images for all products from an expandable number of skincare websites using BeautifulSoup and Playwright. |
| `Product Search` | Search, filter, and browse esthetician products across brands (e.g., Circadia, GlyMed, PCA). |
| `Data Persistence` | Stores all product and configuration data in CSV and SQLite for easy backup and portability. |
| `Extensible Framework` | Structured around modular imports, making it easy to integrate new Streamlit-based features. |
| `Referrals & Rewards (in progress)` | Core support for the new Referral Tracker module, which automates client referral workflows and PDF exports. |
| `Future Scheduling Hooks` | Planned integration with Square API for automated scheduling, reminders, and analytics. |

---

## Tech Stack

- **Frontend/UI:** Streamlit  
- **Backend/Data:** Python, Pandas, SQLite, CSV I/O  
- **Modules:** OS utilities, Session State Management, Playwright, BeautifulSoup  
- **Version Control:** Git / VS Code  

---

## Modular Extensions

| Module | Description |
|---------|--------------|
| **Referral Tracker** | Latest standalone module that automates referral tracking, PDF card generation, and CSV synchronization. *(See detailed write-up [here](./referral_tracker.md))* |
| **Product Database** | Core CRM feature enabling advanced product search, brand lookup, and data management for estheticians. |
| **Client Analytics Dashboard** | Planned Streamlit dashboard for tracking client activity, preferences, and product usage patterns. |
| **Routine Suggestions (Planned)** | Smart recommendation engine to suggest skincare routines based on client and product data. |

---

## Highlights

- Evolved from a simple searchable product database into a modular CRM platform.  
- Designed for real-world business use by *The Wrinkle Witch* (esthetician studio).  
- Structured for future Square API integration for automated appointment and client sync.  
- Provides a persistent, local-first data layer (CSV and SQLite) with future cloud scalability.  
- Acts as the base framework supporting the **Referral Tracker** module.

---

## Media

- **Product Search Interface:** Screenshot showing brand/product lookup.  
- **Module Architecture Diagram:** Optional illustration of how modules plug into the core system.  
- **Future Concepts:** Optional placeholder images (client dashboard mockups, referral UI integration).

---

## Skills Demonstrated

- Streamlit app architecture & modularization  
- Python development and data management  
- SQLite & CSV data pipelines  
- Session-state handling in reactive UIs  
- Business process automation & scalability planning  
- Modular system design for future integrations  

---

## Repository

This project is private due to business use.  
A summarized showcase of the CRM platform is available here:  
[github.com/JeremyB-py-Portfolio](https://github.com/JeremyB-py-Portfolio)
