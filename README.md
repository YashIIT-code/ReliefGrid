# 🌍 ReliefGrid

ReliefGrid is an AI-powered disaster response and resource management platform. It helps government authorities, NGOs, hospitals, shelters, and volunteers coordinate relief work during emergencies. 

The main idea behind ReliefGrid is simple: when a disaster happens, different teams need to work together quickly, but the information is usually spread across calls, messages, spreadsheets, and different systems. ReliefGrid brings the important information into one platform so that the response teams can understand the situation and take action faster.

## 🚨 The Problem

During a disaster, many SOS requests can come in at the same time. Some incidents may be more urgent than others, but it is not always easy to identify them quickly. At the same time, response teams need to know:
- Where the incident has happened
- How many people are affected
- Which hospitals have available capacity
- Which shelters have available space
- Which warehouses have food, water, medicine, blankets, or vehicles
- Which warehouse is closest to the affected area
- How long it may take to deliver the resources

Most of this work is done manually through phone calls, messages, and spreadsheets. This can make the response slower and less organized.

## 💡 Our Solution

ReliefGrid connects SOS reports, disaster zones, hospitals, shelters, warehouses, volunteers, and relief resources in one system. 

A user can submit an SOS request by adding the incident type, severity, location, description, and number of affected people. After that, ReliefGrid calculates a priority score and gives an explanation for it. The platform also checks the nearby impact zone, available warehouse stock, nearest warehouse, and estimated delivery time. 

Response teams can then use this information to decide what needs to be done first and how the available resources should be allocated. 

### The Basic Workflow:
`SOS Request` ➔ `Priority Assessment` ➔ `Impact and Location Analysis` ➔ `Find Available Resources` ➔ `Resource Allocation` ➔ `Response and Resolution`

## 👥 Who Can Use It?

ReliefGrid is designed for the different teams involved in disaster response.

| User | What they can do |
| :--- | :--- |
| **Government Admin** | Monitor the complete situation and manage relief operations |
| **NGO Coordinator** | Manage SOS requests and resource allocation |
| **Hospital Staff** | Update hospital capacity and medical resources |
| **Shelter Manager** | Update shelter capacity and available spaces |
| **Field Volunteer** | View and respond to nearby SOS requests |
| **Citizens & Field Teams** | Report emergencies with important details |

## 🚀 Main Features

### 🚨 SOS Reporting
Users can report an emergency by adding:
- Name
- Incident category
- Severity
- Description
- Location
- Number of affected people

The request is then stored in the system and can be monitored by the response teams.

### 🤖 Priority Assessment
ReliefGrid calculates a priority score for each SOS request. The score can consider:
- Incident category
- Severity
- Number of affected people
- Distance from an active disaster zone
- Distance from available resources
- Warehouse stock
- Estimated delivery time

The system also gives a reason for the priority so that the response team can understand why a request is marked as critical, high, or medium.

### 📍 Interactive Map
The map shows SOS requests, disaster zones, hospitals, shelters, and warehouses. This helps response teams understand where the incidents are happening and where the available resources are located.

### 📦 Resource Allocation
ReliefGrid helps allocate resources from warehouses to hospitals, shelters, and affected locations. It checks the available supplies, vehicles, destination, priority, and distance before creating an allocation plan.

### 🏥 Hospital Management
Hospital staff can update hospital capacity, current occupancy, medical resources, and location. This helps response teams find hospitals that can receive affected people during an emergency.

### 🏠 Shelter Management
Shelter managers can update the total capacity, current occupancy, and available spaces in a shelter. This helps the teams find suitable shelters for people who need temporary accommodation.

### 🏭 Warehouse Management
The platform keeps information about the resources available in different warehouses, such as:
- Food
- Water
- Blankets
- Medicine
- Vehicles

The system can also help identify the nearest warehouse for an SOS request.

### 📊 Analytics Dashboard
The analytics dashboard gives an overview of the current relief operations. It can show information about SOS requests, priority levels, shelters, hospitals, warehouses, volunteers, and resource usage.

### 👥 Multiple User Roles
The application includes different demo roles for different users:
- Government Admin
- NGO Coordinator
- Hospital Staff
- Shelter Manager
- Field Volunteer

Each role is designed around a different part of the disaster response process.

### 📲 Communication Simulation
ReliefGrid includes a communication simulation that shows how an emergency message can be converted into structured information. This represents how people may report emergencies through simple messages or other communication channels.

## 🧠 How the Priority System Works

The priority system uses the information from an SOS request and the available disaster data to understand its urgency. For example, an incident can receive a higher priority when it has high severity, affects many people, is close to an active disaster zone, or has a longer response distance. 

ReliefGrid also gives an explanation along with the score. This is important because the response team should not only see which request has a high priority, but should also understand why it has that priority.

## 🏗️ Project Structure

```text
ReliefGrid/
├── frontend/
│   └── src/
│       ├── pages/          # Dashboard, map, SOS, analytics, and resource pages
│       ├── components/     # Reusable UI components
│       ├── context/        # Authentication and user session
│       ├── api/            # Backend API connection
│       └── types/          # TypeScript types
│
├── backend/
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── schemas/            # Request and response schemas
│   ├── services/           # Priority and allocation logic
│   ├── seed.py             # Demo data
│   └── test_*.py           # Backend tests
│
├── docker-compose.yml      # Runs frontend and backend together
├── frontend/Dockerfile
├── backend/Dockerfile
└── README.md

LICENSE
MIT License

Copyright (c) 2026 Yash

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
