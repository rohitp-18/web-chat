# Web Chat - Frontend (Client)

A real-time chat application built with Next.js, React 19, TypeScript, and Redux Toolkit.

## Features

- User authentication with JWT
- One-on-one and group messaging
- Real-time notifications via Socket.io
- User search and profile management
- Group creation and member management
- Avatar upload via Cloudinary
- Web push notifications
- Responsive UI with Tailwind CSS

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Axios** - HTTP client
- **Sonner** - Toast notifications

## Project Structure

```
src/
├── app/              # Next.js routes and pages
├── components/       # React components
│   ├── chat/        # Chat-related components
│   ├── group/       # Group management components
│   └── ui/          # UI component library
├── store/           # Redux state (userSlice, chatSlice, groupSlice, etc.)
├── lib/             # Utility functions
└── utils/           # Helper functions
```

## Installation

```bash
cd client
npm install
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Running

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## Key Components

| Component              | Purpose                          |
| ---------------------- | -------------------------------- |
| `Header.tsx`           | Top navigation with user profile |
| `ProtectRoute.tsx`     | Route protection for auth        |
| `socketMiddleware.tsx` | Socket.io connection setup       |
| `allChats.tsx`         | Display all conversations        |
| `chatInfo.tsx`         | Chat details panel               |

## Redux Slices

- **userSlice** - Auth and user profile
- **chatSlice** - Chats and messages
- **groupSlice** - Groups and members
- **notificationSlice** - Notifications
- **searchSlice** - User search

## Pages & Routes

| Route           | Purpose           |
| --------------- | ----------------- |
| `/`             | Home              |
| `/register`     | Registration      |
| `/login`        | Login             |
| `/chat`         | Chat list         |
| `/new/user`     | Start 1-on-1 chat |
| `/new/group`    | Create group      |
| `/in/[name]`    | 1-on-1 chat       |
| `/group/[id]`   | Group chat        |
| `/notification` | Notifications     |

## Socket.io Events

**Emit:** `sendMessage`, `joinChat`, `leaveChat`, `typing`, `stopTyping`

**Listen:** `receiveMessage`, `userTyping`, `userOnline`, `userOffline`, `notification`

## Development

```bash
npm run lint --fix    # Auto-fix linting issues
```

## Common Issues

| Issue                 | Solution                          |
| --------------------- | --------------------------------- |
| Socket not connecting | Check backend URL in `.env.local` |
| Auth issues           | Clear cookies and login again     |
| Styles not applying   | Clear `.next` folder and restart  |
| Port 3000 in use      | Use `npm run dev -- -p 3001`      |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Contributing

1. Create feature branch
2. Follow TypeScript strict mode
3. Run `npm run lint --fix`
4. Push and create PR

## License

ISC License

---

**For full documentation, see [main README](../readme.md)**
