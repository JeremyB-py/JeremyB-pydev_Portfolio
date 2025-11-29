# Wrinkle Witch Website & Full-Stack Business Platform

A modern, multi-application platform built for **The Wrinkle Witch**, a local esthetician business.

This system includes both a **public customer-facing website** and an **internal admin environment**, designed to unify business tools such as the CRM, referral tracker, product database, and future scheduling integrations.

---

## Overview

The website serves as the central hub of The Wrinkle Witch's digital presence.

It is built using a **modular monorepo structure**, enabling multiple applications to share:

- Database models
- Authentication logic
- Branding and UI components
- Utility modules (PDF generation, CSV/SQL handling, API wrappers)
- Square API integration logic (planned/underway)

This allows the business to scale new applications without duplicating code, ensuring consistency and maintainability across the entire platform.

---

## Features

| Category | Description |
|-----------|-------------|
| `Customer-Facing Website` | Clean, fast-loading pages for service descriptions, brand identity, and contact information. Built to match the business aesthetic and structured for future dynamic content (booking, client portal, product catalog). Mobile-friendly layout. |
| `Internal Admin Panel` | Access-controlled admin routes that hook directly into CRM modules. Enables client lookups, referral management, and product database interactions. Ready for future integration with Square Appointments and client data. |
| `Modular Architecture (Monorepo)` | Shared Python modules for database access, utilities, and API calls. Single source of truth for business logic with easier long-term maintenance and expansion. Streamlined deployment across subdomains. |
| `Centralized Database Layer` | SQLAlchemy ORM with shared models across the CRM, referral tracker, and future tools. Smooth transition between CSV → SQL workflows. |
| `API Integrations` | Square API integration planned to sync appointments, client data, and transactional history. Shared API wrappers allow all apps to access the same Square data. |

---

## Media

**Public Website Homepage:** Clean, modern design showcasing the business brand and services.  
![Homepage](../media/wrinkle_witch_website/Homepage.png)

**Dark Mode Interface:** Alternative color scheme for improved user experience.  
![Dark Mode](../media/wrinkle_witch_website/Darkmode.png)

**FAQ Page:** Customer-facing frequently asked questions section.  
![FAQ Page](../media/wrinkle_witch_website/FAQ.png)

---

## Tech Stack

- **Frontend/UI:** Streamlit (with custom styling), HTML, CSS, JavaScript
- **Backend/Logic:** Python
- **Database Layer:** SQLAlchemy + CSV interoperability
- **App Structure:** Modular monorepo
- **Integrations:** Square API (planned), PDF generation utilities
- **Deployment:** Railway (planned), subdomain-ready

---

## Highlights

- Built a unified platform combining website, CRM, referrals, and admin tools.
- Supports future modules like client analytics, loyalty systems, and product recommendations.
- Clean, maintainable architecture suitable for long-term scaling.
- Real-world use case with evolving business needs.
- Blends full-stack development with automation and data workflows.

---

## Repository

The codebase is private due to business content, but a full summary is available in this portfolio.  
A summarized showcase of the platform is available here:  
[github.com/JeremyB-py-Portfolio](https://github.com/JeremyB-py-Portfolio)

---

## Skills Demonstrated

- Full-Stack Python development
- Modular architecture design
- Frontend development with Streamlit
- Backend logic & database layering
- API integration patterns
- UI/UX flow planning
- Business-focused development
- Multi-app platform design

---

## Next Steps

- Integrate Square Appointments API
- Expand client analytics
- Add dynamic content pages to the site
- Create a customer portal for referrals + online booking
- Migrate to PostgreSQL for production reliability

---

