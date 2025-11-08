# Referral Tracker Module

The **Referral Tracker** is a modular Streamlit application built as an extension to the **Wrinkle Witch CRM** ecosystem.  
It focuses on automating client referral management and marketing material generation for **The Wrinkle Witch**, a local skincare business.  

This module represents the latest evolution in the platform’s development — shifting from a single Streamlit script into a scalable, modular architecture that integrates data management, automation, and UI components seamlessly.

---

## Overview

The Referral Tracker extends the core CRM’s client management foundation with a specialized tool for handling **referrals, incentives, and branded referral cards**.  
It automates a previously manual workflow, allowing the business to:
- Track who referred whom (and when).  
- Automatically associate clients through linked referral logic.  
- Generate customized referral cards featuring the salon’s branding, contact details, and referrer name.  
- Export single or multi-client PDFs for in-person distribution.  

The system was designed to maintain data integrity while enabling repeated runs through Streamlit without loss of session context — a key improvement over earlier prototypes.

---

## Features

| Category | Description |
|-----------|-------------|
| **Client Referral Linking** | Automatically links clients as referrer/referee pairs based on user input or CSV lookup. |
| **Session State Control** | Custom session management prevents Streamlit reruns from erasing unsaved data. |
| **Dynamic Card Generator** | Uses Pillow to generate custom-branded PNG referral cards with business colors, logo, and typography. |
| **PDF Batch Export** | Combines generated cards into printable PDFs for each client or the entire business. |
| **Error Handling & Validation** | Input validation ensures accurate CSV syncing and duplicate detection. |
| **Persistent Storage** | All updates are written back to disk immediately through CSV synchronization and optional SQLite integration. |

---

## Tech Stack

- **Framework:** Streamlit  
- **Languages:** Python  
- **Libraries:** Pandas, Pillow, FPDF, OS, Time, Reportlab  
- **Storage:** CSV (primary), SQLite (optional for scaling)  
- **Platform:** Local deployment for business use  

---

## Architecture & Modular Design

The Referral Tracker is designed as a **self-contained module** within the Wrinkle Witch CRM framework.  

### Core Modules

| Module | Purpose |
|---------|----------|
| `analytics_manager.py` | Creates summary reports and charts for referrals. |
| `client_manager.py` | Handles loading, validation, and updating of client data. |
| `referral_card_generator.py` | Creates individual PNG cards from client info and branding assets. |
| `referral_manager.py` | Tracks client referrals, allowing for rewards for both referrer and referred. |
| `streamlit_app.py` | Streamlit front-end with integrated feedback, progress, and rerun control. |

This structure allows it to be:
- Run as a **standalone Streamlit app** (`streamlit run streamlit_app.py`), or  
- Imported as a **module** into the larger CRM platform for integrated usage.

---

## Highlights

- **New Modular Codebase:** Refactored older CRM logic into reusable components with clean import structures.  
- **Stable UI Behavior:** Solved persistent Streamlit rerun issues via controlled session flags.  
- **Optimized PDF Export:** Batched multiple PNGs per page with precise sizing for card stock printing.  
- **Customizable Branding:** Easily configurable assets (logo, fonts, card dimensions, and color palette).  
- **Real Business Deployment:** Currently used internally by *The Wrinkle Witch* for client engagement.  

---

## Media

- **Main Streamlit Interface:** Client/referral form and confirmation messages.  
- **Card Preview:** A branded referral card showing placeholder client data.  
- **Batch Export Example:** Screenshot of the generated multi-card PDF layout.  

---

## Skills Demonstrated

- Streamlit app development  
- Modular Python architecture  
- Data persistence & CSV/SQLite synchronization  
- Image manipulation (Pillow)  
- PDF generation and layout (FPDF)  
- Business process automation  
- Debugging and UI state control in Streamlit  

---

## Integration with Wrinkle Witch CRM

The Referral Tracker serves as the **first deployed module** in the Wrinkle Witch CRM ecosystem.  
It connects directly to the CRM’s client database and shares common components such as `client_manager.py` and CSV sync utilities.

**Related project:**  
The **Wrinkle Witch CRM** core project is maintained as a separate private repository due to business sensitivity.  
A summarized version is available here:
[github.com/JeremyB-py-Portfolio](https://github.com/JeremyB-py-Portfolio)

---

## Future Improvements

- Migrate PDF export to background thread for improved responsiveness.  
- Add direct integration with the Square API for automatic referral code generation.  
- Introduce analytics dashboard summarizing referral performance.  
- Implement optional secure login for multi-user business usage.

---

## Repository

This module is maintained as a separate private repository due to business sensitivity.  
A summarized version is available here:  
[github.com/JeremyB-py-Portfolio](https://github.com/JeremyB-py-Portfolio)

