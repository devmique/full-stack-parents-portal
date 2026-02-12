# Parent's Portal – Fullstack Web App

The **Parent’s Portal** is a full-stack school management platform designed to connect schools and parents. It provides an easy way for parents to stay updated with their child’s academic life while giving administrators powerful tools to manage attendance, grades, events, and communication.

---

## Features

* **Role-Based Access** – Secure login system with different dashboards for Admin, Instructor, and Parents.
* **Attendance Tracking** – Instructors can manage and update student attendance; parents can view records anytime.
* **Grades Management** – Instructors can add, edit, and delete grades, while parents can view results instantly.
* **Subjects & Schedules** – Manage subjects and weekly class schedules in an organized table view.
* **Calendar & Events** – Interactive calendar for managing events, with Admin controls and parent view access.
* **Messaging System** – Direct communication between parents and administrators.
* **Help & Complaints** – Parents can submit issues or concerns directly through the portal.
* **Announcements** – School-wide updates posted by Admins, visible to all parents.
* **PDF Export** – One-click export of grades into downloadable PDF files.
* **Profile Management System** – Users can update their profile picture.
* **AI Assistant** – Users can ask AI to assist them while using the portal.

---

## Tech Stack

### Frontend

* React.js
* Axios (for API communication)
* FullCalendar
* Material UI

### Backend

* Node.js
* Express.js
* Multer (for profile picture uploads)
* JSON Web Token (JWT) for authentication
* Socket.IO (for real-time messaging and notifications)
* Nodemailer (for OTP verification)
* Redis (for caching and performance optimization)

### Database

* MySQL

---

## Setup Instructions

### 1. Requirements

Before setting up the project, make sure you have the following installed:

* **Node.js** and **npm** (Node Package Manager)
* **MySQL Server** or access to **phpMyAdmin**

---

## 2. Backend Setup (Server)

1. Open the terminal and navigate to the `server` folder:

```bash
cd server
```

2. Install required dependencies:

```bash
npm install
```

3. Create a `.env` file inside the `server/` folder and add:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=parents_portal
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=yourpass
GEMINI_API_KEY=your_api_key
```

Replace:

* `your_mysql_password` with your MySQL password
* `your_jwt_secret` with a secure secret key

4. Start the backend server:

```bash
npm run dev
```

The backend will run on **port 5000** (or the port specified in `.env`).

---

## 3. Frontend Setup (Client)

1. Navigate to the `client` folder:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

This will open the React app in your browser.

---

## 4. Database Setup

1. Open **phpMyAdmin** or **MySQL CLI**.

2. Create a new database:

```sql
CREATE DATABASE parents_portal;
```

3. Import the database structure and sample data from:

```
/schema/parents_portal.sql
```

Using MySQL CLI:

```bash
mysql -u root -p parents_portal < parents_portal.sql
```

Replace `root` if your MySQL username is different.

---

## 5. Redis Setup

### Using Docker (Recommended)

1. Open **Docker Desktop**.

2. Pull the official Redis image:

```bash
docker pull redis:latest
```

3. Run the Redis container with port mapping:

```bash
docker run -d -p 6379:6379 --name parents-portal-redis redis:latest
```

4. Ensure Redis is running before starting the backend server.

Redis connection URL:

```
redis://localhost:6379
```

---

## Preview

<img width="1366" height="768" alt="Screen Shot" src="https://github.com/user-attachments/assets/19cb1da6-d770-4f6d-ad46-feb9796c7484" />

---

## Author

Made by **Mique Johnlord**

---

