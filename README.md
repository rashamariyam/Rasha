# LeaveEase — College Management System

LeaveEase is a modern web application for college management, featuring leave application and multi-tier approval workflows, Green Card study slot bookings, classroom availability tracking, and administrative controls.

---

## 🚀 Features

- **Multi-Role Support**: Preconfigured roles for **Students**, **Teachers**, **HODs (Head of Department)**, and **Administrators**.
- **Leave Application & Workflow**: Students can apply for leave; Teachers and HODs review, approve, or reject requests with notes.
- **Green Card Slots**: Reserve study, lab, or seminar slots with capacity tracking.
- **Classroom Availability**: Search and check room occupancy schedules in real time.
- **User Management**: Administrators can add, edit, filter, and export user directories.
- **Export Reports**: One-click CSV downloads for leaves, bookings, and classrooms.
- **Instant Demo Login**: Switch roles seamlessly without passwords to test every user journey.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistence**: Browser `localStorage` (seeds with realistic sample data automatically)

---

## 💻 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm (bundled with Node.js)

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## 🔑 Demo Roles

On the login page, select any role to explore the application:

| Role | Capabilities |
| :--- | :--- |
| **Student** | Apply for leave, track application status, book Green Card slots, check free classrooms. |
| **Teacher** | Initial review and recommendation for student leave requests in the department. |
| **HOD** | Final approval/rejection stage for departmental leave requests. |
| **Admin** | Manage users, configure slots and classrooms, download system CSV reports. |

---

## 📦 Production Build

To build the static production bundle:
```bash
npm run build
```
The compiled assets will be placed in the `dist/` directory, ready to deploy to Netlify, Vercel, or any web server.
