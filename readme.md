# Web Chat - MERN Stack Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js). Features one-on-one messaging, group chats, and real-time notifications using WebSocket technology.

## Features

### Core Messaging

- **One-on-One Chat**: Direct messaging between users
- **Group Chats**: Create and manage group conversations
- **Real-Time Messaging**: Instant message delivery using Socket.io
- **Message History**: Persistent message storage with MongoDB

### User Features

- **User Authentication**: Secure login/registration with JWT
- **User Profiles**: Customizable user profiles with avatars
- **Username Availability Check**: Verify username availability before registration
- **User Search**: Find and connect with other users

### Group Management

- **Create Groups**: Create new group chats with custom details
- **Edit Groups**: Update group information and avatars
- **Group Members**: Add/remove members from groups
- **Group Info**: View group details and member list

### Notifications

- **Real-Time Notifications**: Get notified instantly about new messages
- **Notification Management**: Mark notifications as read/unread
- **Push Notifications**: Web push notification support (configured)

### Additional Features

- **Avatar Upload**: Upload profile/group avatars via Cloudinary
- **Password Management**: Change password functionality
- **Protected Routes**: Authentication-based access control
- **Error Handling**: Comprehensive error management and user feedback
- **Toast Notifications**: User-friendly toast messages for actions

## Tech Stack

### Frontend

- **Next.js 16** - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Material-UI** - Icon library
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Sonner** - Toast notifications

### Backend

- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and management
- **Multer** - File upload handling
- **Web Push** - Push notification support
- **Morgan** - HTTP request logger

## Project Structure

```
web-chat/
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/                    # Next.js pages and routes
│   │   │   ├── chat/               # Chat pages
│   │   │   ├── group/              # Group chat pages
│   │   │   ├── in/                 # User profile pages
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Registration page
│   │   │   ├── notification/       # Notifications page
│   │   │   ├── new/                # New chat/group creation
│   │   │   └── layout.tsx          # Root layout
│   │   ├── components/             # React components
│   │   │   ├── chat/               # Chat-related components
│   │   │   ├── ui/                 # UI components
│   │   │   ├── utils/              # Utility components
│   │   │   ├── Header.tsx
│   │   │   ├── ProtectRoute.tsx
│   │   │   └── socketMiddleware.tsx
│   │   ├── store/                  # Redux store
│   │   │   ├── chatSlice.ts        # Chat state
│   │   │   ├── userSlice.ts        # User state
│   │   │   ├── groupSlice.ts       # Group state
│   │   │   ├── notificationSlice.ts
│   │   │   ├── searchSlice.ts
│   │   │   ├── types/              # TypeScript types
│   │   │   └── context/            # React context
│   │   ├── lib/                    # Utility functions
│   │   └── utils/                  # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── server/                          # Express backend
│   ├── config/                     # Configuration files
│   │   ├── mongodb.ts              # MongoDB connection
│   │   ├── multer.ts               # File upload config
│   │   └── .env                    # Environment variables
│   ├── controllers/                # Request handlers
│   │   ├── userController.ts
│   │   ├── chatController.ts
│   │   ├── messageController.ts
│   │   └── notificationController.ts
│   ├── middlewares/                # Express middlewares
│   │   ├── auth.ts                 # Authentication middleware
│   │   └── error.ts                # Error handling
│   ├── models/                     # Mongoose models
│   │   ├── userModel.ts
│   │   ├── chatModel.ts
│   │   ├── messageModel.ts
│   │   └── notificationModel.ts
│   ├── routers/                    # API routes
│   │   ├── userRouter.ts
│   │   ├── chatRouter.ts
│   │   ├── messageRouter.ts
│   │   ├── groupRouter.ts
│   │   └── notificationRouter.ts
│   ├── utils/                      # Utility functions
│   │   ├── ErrorHandler.ts
│   │   └── sendToken.ts
│   ├── socket.ts                   # Socket.io setup
│   ├── index.ts                    # Server entry point
│   └── package.json
│
├── package.json                     # Root package.json
└── readme.md                        # This file
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd web-chat
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Setup Server**

   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in `server/config/`:

   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/web-chat
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7

   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   FRONTEND_URL=http://localhost:3000

   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key

   PORT=4000
   ```

4. **Setup Client**

   ```bash
   cd ../client
   npm install
   ```

5. **Run the application**

   **Terminal 1 - Start the server:**

   ```bash
   npm run server
   ```

   Server will run on `http://localhost:4000`

   **Terminal 2 - Start the client:**

   ```bash
   npm run client
   ```

   Client will run on `http://localhost:3000`

## Environment Variables

### Server (.env in server/config/)

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `COOKIE_EXPIRE` - Cookie expiration in days
- `CLOUDINARY_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `FRONTEND_URL` - Frontend application URL
- `VAPID_PUBLIC_KEY` - Web push public key
- `VAPID_PRIVATE_KEY` - Web push private key
- `PORT` - Server port (default: 4000)

## API Endpoints

### User Routes

- `POST /user/register` - Register new user
- `POST /user/login` - Login user
- `GET /user/logout` - Logout user
- `GET /user/me` - Get current user profile
- `PUT /user/update` - Update user profile
- `PUT /user/change-password` - Change password
- `GET /user/username-status` - Check username availability

### Chat Routes

- `GET /chat/all` - Get all user chats
- `POST /chat/create-group` - Create new group
- `GET /chat/:id` - Get chat details
- `PUT /chat/:id` - Update chat/group

### Message Routes

- `POST /message/send` - Send message
- `GET /message/:chatId` - Get messages for chat
- `DELETE /message/:id` - Delete message

### Notification Routes

- `GET /notification/all` - Get all notifications
- `PUT /notification/:id/read` - Mark notification as read

## Usage

1. **Register/Login**

   - Create a new account or login with existing credentials

2. **Start Chatting**

   - Search for users and start a one-on-one conversation
   - Or create a new group chat

3. **Manage Groups**

   - Create groups with custom names and descriptions
   - Add/remove members from groups
   - Edit group information

4. **Receive Notifications**
   - Get real-time notifications for new messages
   - Manage notification preferences

## Scripts

### Root Directory

```bash
npm run server     # Start backend server with nodemon
npm run client     # Start frontend development server
```

### Client Directory

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Server Directory

```bash
npm run server     # Start server with nodemon (ts-node)
```

## Key Technologies Explained

### Socket.io

Real-time bidirectional communication between client and server, enabling instant message delivery and live notifications.

### JWT Authentication

Secure token-based authentication. Users receive a JWT token upon login, which is stored in cookies and sent with each request.

### MongoDB & Mongoose

NoSQL database for storing users, chats, messages, and notifications. Mongoose provides schema validation and ODM functionality.

### Redux Toolkit

Centralized state management for managing user, chat, group, notification, and search states on the frontend.

### Cloudinary

Cloud-based service for storing and managing user avatars and group photos.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Built with ❤️ using MERN Stack**
