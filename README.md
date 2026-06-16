# Quick Hire - Backend

This is the Node.js backend for the Quick Hire platform, designed to connect Clients with Professionals. It provides robust, secure APIs using the Express framework, MongoDB for data persistence, and Firebase Admin SDK for authentication and authorization.

[Deployed Link](https://quickhire-web-dkgwe2fvd3c4dpha.centralindia-01.azurewebsites.net/)

## Features

- **Role-Based Access Control (RBAC):** Distinct roles for `Client` and `Professional`.
- **Firebase Authentication:** Secure login using Firebase JWTs.
- **RESTful API:** Clean endpoints protected by token verification middleware.
- **MongoDB Database:** Scalable document storage using Mongoose.

## Tech Stack

- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and Object Data Modeling (ODM)
- **Firebase Admin SDK** - Authentication validation
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing middleware

## Prerequisites

Before running the project, ensure you have the following installed and set up:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A [Firebase Project](https://console.firebase.google.com/) configured with Authentication

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

   ```bash
   cd QuickHire
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

## Configuration

### 1. Environment Variables

Create a `.env` file in the root directory (or use the existing one) and populate it with your specific values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/quickhire
```

### 2. Firebase Service Account

To verify Firebase tokens, the backend requires your Firebase Service Account credentials. You have two options:

**Option A (Recommended): serviceAccountKey.json**

1. Go to your Firebase Console > Project Settings > Service Accounts.
2. Click **Generate new private key**.
3. Rename the downloaded file to `serviceAccountKey.json`.
4. Place the file inside the `config/` folder (`QuickHire/config/serviceAccountKey.json`).

**Option B: Environment Variables**
If you prefer not to use a file, add these to your `.env`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Enable Database Connection

Once your `MONGO_URI` is set, open `server.js` and uncomment the database connection line:

```javascript
// Connect to database
connectDB();
```

## Running the Application

This project consists of a backend and a frontend. You will need to start both in separate terminal windows.

### 1. Start the Backend Server

Open a terminal in the root `QuickHire` directory:

```bash
node server.js
```

_Alternatively, you can install `nodemon` globally (`npm install -g nodemon`) and run `nodemon server.js` for auto-reloading during development._

The server will start on the port specified in your `.env` file (default is `5000`). You should see logs indicating a successful database connection and server initialization.

### 2. Start the Frontend Application

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install   # If you haven't installed frontend dependencies yet
npm run dev
```

The frontend application will start using Vite. Check the terminal output for the local URL (typically `http://localhost:5173`) and open it in your browser.

## API Endpoints (Example)

- `GET /api/users/me` - Get current user profile (Requires Bearer Token)
- `POST /api/users/register` - Create a new user profile
- `GET /api/users/client-dashboard` - Protected route (Requires Client Role)
- `GET /api/users/professional-dashboard` - Protected route (Requires Professional Role)
