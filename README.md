# Parent's Portal – Fullstack Web App


---


The **Parent’s Portal** is a full-stack school management platform designed to connect schools and parents. It provides an easy way for parents to stay updated with their child’s academic life while giving administrators powerful tools to manage attendance, grades, events, and communication.  

##  Features

- **Role-Based Access** – Secure login system with different dashboards for Admin, Instructor and Parents.  
- **Attendance Tracking** – Instructor can manage and update student attendance; parents can view records anytime.  
- **Grades Management** – Instructor can add, edit, and delete grades, while parents can view results instantly.  
- **Subjects & Schedules** – Manage subjects and weekly class schedules in an organized table view.  
- **Calendar & Events** – Interactive calendar for managing events, with Admin controls and parent view access.  
- **Messaging System** – Direct communication between parents and administrators.  
- **Help & Complaints** – Parents can submit issues or concerns directly through the portal.  
- **Announcements** – School-wide updates posted by Admins, visible to all parents.  
- **PDF Export** – One-click export of grades into downloadable PDF files.  
- **Profile Management system** – You can change your profile picture.  

- **AI assistant** – you can ask AI to assist you using the portal.  

---

## Tech Stack

### Frontend:

- React.js
- Axios (for API communication)

### Backend
- Node.js
- Express.js
- Multer (for profile picture uploads)
- JSON Web Token (JWT) for authentication
- Socket.IO (for real-time messaging and notification)
- Nodemailer (for OTP verification)

### Database
- MySQL

---

## Setup Instructions

### 1. Requirements
Before setting up the project, make sure you have the following installed on your machine:
- **Node.js** and **npm** (Node Package Manager)
- **MySQL Server** or access to **phpMyAdmin** for managing MySQL databases

At the root(parents-portal folder)on terminal, run this command:

    
    npm install
    
---


### 2. Backend Setup (Server)

Follow these steps to set up the backend:

1. Open the terminal and navigate to the `server` folder:

    ```bash
    cd server
    ```

2. Install all required dependencies by running:

    ```bash
    npm install
    ```

3. Create a `.env` file inside the `server/` folder and add the following environment variables to configure the database and server settings:

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=parents_portal
    JWT_SECRET=your_jwt_secret
    PORT=5000
    EMAIL_USER=youremail@gmail.com
    EMAIL_PASS=yourpass
    ```

    Replace `your_mysql_password` and `your_jwt_secret` with your actual MySQL password and a secret key for JWT authentication.

4. Start the backend server:

    ```bash
    node server.js
    ```

    This will run the backend server on port 5000 (or any port you configured in the `.env` file).

---

### 3. Frontend Setup (Client)

To set up the frontend, follow these steps:

1. Open the terminal and navigate to the `client` folder:

    ```bash
    cd client
    ```

2. Install all the frontend dependencies:

    ```bash
    npm install
    ```

3. Start the React frontend:

    ```bash
    npm start
    ```

    This will start the frontend app and open it in your default web browser.

---

### 4. Database Setup

1. Open **phpMyAdmin** or **MySQL CLI**.
2. **Create a new database** for the project:

    ```sql
    CREATE DATABASE parents_portal;
    ```

3. **Import the database structure and sample data** from the provided `parents_portal.sql` file. This can be done using the **Import** tab in phpMyAdmin or by running the following command in MySQL CLI:

    ```bash
    mysql -u root -p parents_portal < parents_portal.sql
    ```

    Replace `root` with your MySQL username if it's different.

---

## Author

Made by **Mique Johnlord** 

---




