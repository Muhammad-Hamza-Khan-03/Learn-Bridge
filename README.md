# Learn-Bridge

Learn-Bridge is a web application built using the MERN (MongoDB, Express, React, Node.js) stack. It is designed to enhance education by providing features such as session chats, one-on-one meetings, course selection, and tutor choices. The platform connects students and tutors, enabling seamless learning experiences.

## Features

- **Course Management**: Create, manage, and enroll in courses tailored to educational needs.
- **Smart Scheduling**: Book sessions based on availability, ratings, and preferences.
- **HD Video Conferencing**: High-quality video and audio for seamless learning.
- **Instant Messaging**: Communicate with tutors or students before, during, and after sessions.
- **Session Tracking**: Keep track of past and upcoming sessions with reminders.
- **Admin Dashboard**: Manage users, courses, and platform settings.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **State Management**: Redux
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/Muhammad-Hamza-Khan-03/Learn-Bridge.git
cd Learn-Bridge
```

### 2. Set Up the Backend

1. Navigate to the backend directory:

   ```bash
   cd learn_bridge_backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `learn_bridge_backend` directory and add the following environment variables:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:

   ```bash
   npm start
   ```

   The backend server will run on `http://localhost:5000`.

### 3. Set Up the Frontend

1. Navigate to the frontend directory:

   ```bash
   cd ../learn_bridge_frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `learn_bridge_frontend` directory and add the following environment variables:

   ```
    API_BASE_URL = "http://localhost:5000"
    TUTOR_ROOM_ID = 100ms
    STUDENT_ROOM_ID = 100ms

   ```

4. Start the frontend development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`.


## Folder Structure

```
Learn-Bridge/
├── learn_bridge_backend/   # Backend code
├── learn_bridge_frontend/  # Frontend code
└── README.md               # Project documentation
```

## Usage

1. Open the frontend in your browser at `http://localhost:5173`.
2. Sign up as a student, tutor, or admin.
3. Explore features such as course management, scheduling, and messaging.

## Scripts

### Backend

- `npm start`: Start the backend server.
- `npm run dev`: Start the backend server in development mode.
- `npm run seed`: Seed the database with initial data.

### Frontend

- `npm run dev`: Start the frontend development server.
- `npm run build`: Build the frontend for production.
- `npm run preview`: Preview the production build.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Submit a pull request.

## Contact

- **Email**: hamzakhan102003@gmail.com
- **GitHub**: [Muhammad-Hamza-Khan-03](https://github.com/Muhammad-Hamza-Khan-03)
