# RetireAssist

RetireAssist is a full-stack MERN application designed to help senior citizens access trusted assistance services with ease. The platform allows users to submit service requests, track their progress, and connect with verified helpers through a simple and user-friendly interface.

## Features

### User Features
- Secure Authentication & Authorization
- Fingerprint/Biometric Login Support
- User Profile Management
- Service Request Creation
- Request Status Tracking
- Personalized Dashboard
- Dark/Light Theme Support
- Responsive Design

### Helper Features
- View Assigned Requests
- Manage Active Tasks
- Update Request Status
- Track Completed Services

### Admin Features
- Manage Users and Helpers
- Monitor Service Requests
- Assign Helpers to Users
- Platform Activity Tracking

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- Clerk Authentication
- Biometric Authentication Support

## Architecture


Client (React)
│
▼
REST APIs (Node.js + Express)
│
▼
MongoDB Database
│
▼
User • Helper • Admin Workflows


## Workflow

1. User registers or logs in securely.
2. User submits an assistance request.
3. Request is stored in the database.
4. A helper is assigned to the request.
5. User can monitor request progress through the dashboard.
6. Helper updates task status until completion.
7. Completed requests are maintained for tracking and future reference.

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/RetireAssist.git
cd RetireAssist
Install Dependencies
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
Environment Variables

Create a .env file:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
Run Locally
# Backend
npm run dev

# Frontend
npm run dev
Key Highlights
Full-Stack MERN Architecture
Role-Based Access Control
Biometric Authentication
RESTful API Design
Scalable Database Models
Responsive User Interface
Secure User Management
Future Enhancements
Real-time Notifications
In-App Messaging
Helper Rating & Reviews
AI-Based Helper Matching
Payment Gateway Integration
Emergency Assistance Requests
Author

Rohan
