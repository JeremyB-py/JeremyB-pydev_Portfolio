# Wrinkle Witch CRM & Referral Tracker

A custom-built client management and referral tracking system developed for **The Wrinkle Witch**, a local skincare business.  
The application streamlines how clients, referrals, and incentives are tracked — while also generating printable, branded referral cards for in-person distribution.

---

## Overview
The **Wrinkle Witch CRM** is a lightweight, data-driven Streamlit web application that enables an esthetician to:
- Add and manage client profiles.  
- Track who referred whom (including cross-client referrals).  
- Generate personalized, printable referral cards (PDFs) for marketing use.  
- Export combined reports for record keeping or print runs.  

All data persists between sessions using CSV and SQLite storage — ensuring both simplicity and offline reliability.

---

## Features
| Category | Description |
|-----------|-------------|
| **Client Management** | Add, view, and edit client records using an intuitive Streamlit form. |
| **Referral Tracking** | Automatically link referrer and referee clients; reward system integration ready. |
| **PDF Card Export** | Generate and export branded referral cards with logos and styling for physical printing. |
| **Batch Printing** | Combine multiple cards into printable PDF sheets per client or business-wide. |
| **Data Persistence** | Stores all data in both CSV and SQLite formats for easy sync or manual backup. |
| **Streamlit UI** | Clean interface with visual feedback, success messages, and progress indicators. |

---

## Tech Stack
- **Frontend/UI:** Streamlit  
- **Backend/Data:** Python, Pandas, SQLite, CSV I/O  
- **Assets/Export:** Pillow (image generation), FPDF (PDF export)  
- **Utilities:** OS, Time, Session State Management  

---

## Highlights
- Built for a real business use case (The Wrinkle Witch).  
- Solved early rerun-state and persistence bugs through custom `st.session_state` logic.  
- Added smart CSV synchronization to avoid data duplication.  
- Enabled full PDF export pipeline for marketing collateral.  
- Deployed internally for in-salon use on local machines.

---

## Media
- **App UI:** Include 2–3 screenshots of the Streamlit interface (client form, referral tracker, PDF preview).  
- **Referral Card Sample:** 1 image of a generated card.  
- *(Avoid posting raw client data; use demo data or blurred screenshots.)*  

---

## Future Improvements
- Integration with Square API for client and appointment sync.  
- Add referral incentive automation and analytics dashboard.  
- Move from CSV to full relational database (PostgreSQL or Supabase).  
- Optional secure multi-user login for team expansion.

---

## Repository
This project is private due to business use, but you can view a summarized showcase here:  
👉 [github.com/JeremyB-py-Portfolio](https://github.com/JeremyB-py-Portfolio)

---

## 🧠 Skills Demonstrated
- Python development and modularization  
- Streamlit web app design  
- Data engineering (CSV/SQLite pipelines)  
- File I/O, PDF and image generation  
- Debugging session states and reactivity in Streamlit  
- Business process automation & UX design
