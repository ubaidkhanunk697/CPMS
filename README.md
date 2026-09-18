# Clinic Payment Management System (CPMS)
### Khattak Medical Complex

A comprehensive, role-based Clinic Payment and Revenue Management System built with pure web technologies and Supabase.

---

## 🛠️ Technology Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (Zero Frameworks — No React, No Vite, No Tailwind, No Bootstrap)
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security - RLS)
- **PWA**: Service Worker caching, offline support, installable PWA manifest
- **Localization**: Bilingual support (English LTR & Urdu RTL)

---

## 👥 Clinic Staff Roles & Access

1. **MRI Office (Aqeb Khan)**
   - Records MRI scans, MRI types, and patient payments.
   - Financial Rule:
     - Payment >= Rs. 3,000: MRI Office Share = Rs. 3,000 | Doctor Share = Payment - Rs. 3,000
     - Payment < Rs. 3,000: MRI Office Share = Rs. 0 | Doctor Share = 100%

2. **Investigation Office (Shezaad)**
   - Records lab investigations and test payments.
   - Financial Rule: 100% Doctor Share (Office Share: Rs. 0).

3. **Operation / Assistant Office (Qari Mustajab)**
   - Records surgical operations and assistant payments.
   - Financial Rule: 100% Doctor Share (Office Share: Rs. 0).

4. **Doctor Executive Dashboard (Dr. Nawaz Khattak)**
   - Aggregates clinic revenue across all three departments.
   - Live Formula: \MRI Doctor Share + Inv Doctor Share + Asst Doctor Share = Grand Total\
   - Department tabs (MRI, Investigation, Assistant) with real-time badges, dedicated KPI metrics, and filtered histories.

---

## 🚀 How to Run Locally

### Option 1: Using PHP Built-in Server
\\\ash
php -S localhost:8000
\\\
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Using XAMPP (Apache)
1. Place this project inside your \xampp/htdocs/\ directory.
2. Start Apache from the XAMPP Control Panel.
3. Open \http://localhost/Clinic%20Calculation/\ in your browser.

---

## 🗄️ Database Setup
The complete PostgreSQL database schema, tables, security functions, and 14 Row Level Security (RLS) policies are provided in \supabase-schema.sql\.
