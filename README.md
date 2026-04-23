# SwiftFix Premium Marketplace 🛠️

SwiftFix is a state-of-the-art, full-stack service marketplace platform designed to connect customers with verified service professionals in real-time. Featuring advanced geospatial tracking, smart dispatching, and a robust administrative system, SwiftFix brings the "Uber experience" to home services.

---

## 🚀 Key Features

### 📍 Real-Time Live Tracking
- **Interactive Maps:** Built with Leaflet and OpenStreetMap for zero-cost, high-performance mapping.
- **Live Routing:** Automated driving path generation using OSRM (Open Source Routing Machine).
- **Smooth Animation:** High-frequency socket updates with CSS/DOM interpolation for car marker movement.
- **Dynamic ETA:** "Arriving in X mins" notifications based on real-world distance calculations.

### 🧠 Smart AI Dispatch
- **Advanced Heuristics:** Professionals are assigned using a multi-factor score: `DispatchScore = (Rating * 20) - (Distance Penalty)`.
- **Geofencing:** Automatic status updates and notifications as professionals approach the customer's location.

### 💼 Multi-Role Ecosystem
- **Customer Dashboard:** Service discovery, instant "Searching" mode, and full tracking history.
- **Professional Suite:** Job leads management, wallet/revenue analytics, and live navigation toggles.
- **Admin Command Center:** Platform-wide oversight of bookings, user verification, and commission revenue.

### 💬 Seamless Communication
- **Real-Time Chat:** Direct messaging between customers and professionals for job coordination.
- **Status Sync:** Global WebSocket state management ensures all participants see status changes (Assigned -> En Route -> Arrived -> Completed) instantly.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Leaflet.
- **Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose).
- **Authentication:** JWT (JSON Web Tokens) with secure password hashing.
- **Geospatial:** MongoDB 2dsphere indexing and `$geoNear` aggregation.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/swift-fix-marketplace.git
cd swift-fix-marketplace
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_key
PORT=5000
```
Run the seed script to populate services:
```bash
npm run seed
```
Start the server:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Access the app at `http://localhost:5173`.

---

## ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

---

*Built with ❤️ by Antigravity for the next generation of service platforms.*
