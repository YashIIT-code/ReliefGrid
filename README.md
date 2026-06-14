# 🌍 ReliefGrid

ReliefGrid is an AI-powered disaster response and resource management platform designed to help authorities and volunteers coordinate relief efforts efficiently during emergencies.

The platform enables real-time reporting, intelligent prioritization of incidents, resource allocation, and visualization of disaster response activities through an interactive dashboard.

---

## 🚀 Features

### 📍 Interactive Disaster Map
- View shelters, hospitals, warehouses, and disaster locations.
- Real-time visualization of relief operations.
- Built using Leaflet maps.

### 🚨 SOS Reporting
- Citizens can report emergencies instantly.
- Reports include location and incident details.
- Helps authorities identify affected areas quickly.

### 🤖 AI Priority Engine
- Automatically prioritizes incidents based on severity.
- Ensures critical cases receive immediate attention.
- Reduces manual decision-making during disasters.

### 📦 Resource Allocation
- Optimizes distribution of relief resources.
- Assigns available supplies to affected regions.
- Minimizes delays and wastage.

### 🏥 Shelter & Hospital Management
- Monitor available shelters and hospitals.
- Track capacities and occupancy.
- Assist victims in finding nearby facilities.

### 📲 WhatsApp Integration
- Enables users to report emergencies through WhatsApp.
- Improves accessibility during crisis situations.

### 📊 Analytics Dashboard
- Provides insights into ongoing operations.
- Displays response statistics and resource usage.
- Supports informed decision-making.

### 👥 Role-Based Access Control
Different dashboards for:
- Administrators
- Relief Coordinators
- Volunteers

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Leaflet.js

### Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic

### Database
- SQLite

### Optimization & Intelligence
- Custom AI Priority Scoring Engine
- Google OR-Tools

### Authentication & Security
- JWT Authentication
- Python-Jose
- Bcrypt

### DevOps & Deployment
- Docker
- Docker Compose
- GitHub Actions (CI)
- Vercel (Frontend Deployment)
- Render (Backend Deployment)

---

## 🏗️ System Architecture

```
User
 │
 ▼
Frontend (React + Vite)
 │
 ▼
FastAPI Backend
 │
 ├── SQLite Database
 ├── AI Priority Engine
 ├── Resource Allocation Engine
 └── WhatsApp Integration
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd reliefgrid
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🐳 Docker Setup

Build and start all services:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down
```

---

## 🔄 CI/CD

### Continuous Integration
GitHub Actions automatically:

- Installs dependencies
- Runs validation checks
- Builds the application

### Continuous Deployment

- Frontend is automatically deployed through Vercel.
- Backend is hosted on Render.

---

## 📌 Future Enhancements

- SMS emergency reporting
- Real-time notifications
- Predictive disaster analytics
- Multi-language support
- Integration with government disaster agencies
- Mobile application support

---

## 👥 Team

Developed as a disaster management solution to improve coordination, reduce response time, and ensure efficient utilization of relief resources during emergencies.

---

## 📄 License

This project is developed for educational, innovation, and hackathon purposes.
