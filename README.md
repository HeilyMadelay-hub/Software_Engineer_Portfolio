# 🎓 Business School Management System

### *Full-Stack Academic Management Platform with Gamification & AI Recommendations*

![Business School Management System](foto_readme.png)

![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-blue)
![EF Core](https://img.shields.io/badge/Entity%20Framework-Core-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [Project Structure](#-project-structure)
- [Advanced Features](#-advanced-features)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Overview

**Business School Management System** is a comprehensive web application designed to manage all aspects of an academic institution. It goes beyond basic CRUD operations by integrating intelligent recommendation systems, gamification mechanics, and role-based personalized dashboards.

### **What Makes This Project Stand Out?**

✨ **Club Recommendation Engine** — AI-powered suggestions based on user behavior and preferences  
🏆 **Gamification System** — Points, levels, and achievements to boost student engagement  
📊 **Role-Based Dashboards** — Personalized views for Admins, Managers, Leaders, and Students  
🔐 **Enterprise-Grade Security** — ASP.NET Core Identity with fine-grained authorization  
🐳 **Docker Infrastructure** — One-command deployment with containerized database  
🧱 **Clean Architecture** — Service layer pattern with clear separation of concerns

### **Who Is This For?**

- **Students** → Discover clubs, track progress, earn achievements
- **Club Leaders** → Manage members, organize events, view analytics
- **Department Managers** → Oversee departments, clubs, and events
- **Administrators** → Full system control and insights
- **Recruiters** → Evidence of production-ready backend & architectural skills

---

## ⭐ Key Features

### **Core Modules**

| Module | Description |
|--------|-------------|
| **Departments** | Complete CRUD with associated clubs, students, and events |
| **Clubs** | Management system with leader assignment and member tracking |
| **Students** | Profile management with gamification progress |
| **Events** | Academic event planning with registration and attendance tracking |
| **Dashboards** | Role-specific views with analytics and insights |

### **Advanced Capabilities**

**🤖 Intelligent Recommendations**
- Personalized club suggestions based on:
  - Current club memberships
  - Similar student behavior patterns
  - Department popularity metrics
  - Event attendance history
- Implemented using similarity-based algorithms (Jaccard/Cosine)

**🏆 Gamification System**
- **Point System:**
  - Join a club: +50 points
  - Attend an event: +50-200 points
- **Progression Levels:**
  - 🥉 Bronze (0-199 points)
  - 🥈 Silver (200-499 points)
  - 🥇 Gold (500-999 points)
  - 💎 Platinum (1000+ points)
- **Achievement Badges:**
  - Active Member (join 3 clubs)
  - Frequent Attendee (attend 5 events)
  - Emerging Leader (become a Club Leader)

**📊 Personalized Dashboards**

Each role sees a completely different system:

- **Admin** → Global statistics, charts, system-wide activity
- **Department Manager** → Department analytics, clubs, events, enrollments
- **Club Leader** → Club members, events, engagement metrics
- **Student** → Recommended clubs, gamification progress, upcoming events

---

## 🛠️ Technology Stack

**Backend**
- ASP.NET Core 8.0 MVC
- ASP.NET Core Identity (Authentication & Authorization)
- Entity Framework Core (Code First)
- Service Layer Pattern
- Dependency Injection

**Database**
- SQL Server
- EF Core Migrations
- Automated data seeding

**Frontend**
- Razor Views
- Bootstrap 5
- Chart.js (Data visualization)
- Responsive design

**DevOps**
- Docker
- Docker Compose
- Containerized deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                │
│              (Controllers + Razor Views)            │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  Service Layer                      │
│     ┌──────────────────┬──────────────────┐         │
│     │  Gamification    │  Recommendation  │         │
│     │    Service       │     Service      │         │
│     └──────────────────┴──────────────────┘         │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                   Data Layer                        │
│          (EF Core + DbContext + Models)             │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  SQL Server Database                │
│              (Containerized with Docker)            │
└─────────────────────────────────────────────────────┘
```

**Design Principles:**
- **Thin Controllers** → Handle HTTP requests and view rendering only
- **Service Layer** → Encapsulates all business logic
- **Repository Pattern** → Through EF Core DbContext
- **Dependency Injection** → For loose coupling and testability

---

## 🚀 Getting Started

### **Prerequisites**

- .NET 8.0 SDK or later
- Docker Desktop (for containerized deployment)
- Visual Studio 2022 / VS Code / Rider (optional)

### **Option 1: Docker Deployment (Recommended) 🐳**

This is the fastest way to get started. Docker handles everything automatically.

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Business_School.git
cd Business_School
```

2. **Launch with Docker Compose**
```bash
docker-compose up --build
```

3. **Wait for initialization**
   - SQL Server needs 30-45 seconds to start
   - Application will auto-run migrations and seed data
   - Look for: `Now listening on: http://[::]:8080`

4. **Access the application**
   - Open browser: **http://localhost:5000**

5. **Stop the application**
```bash
docker-compose down
# To reset database: docker-compose down -v
```

**What Docker Compose Does:**
- ✅ Creates SQL Server container
- ✅ Creates application container
- ✅ Configures networking between containers
- ✅ Runs database migrations
- ✅ Seeds initial data automatically

---

### **Option 2: Local Development**

1. **Clone and restore**
```bash
git clone https://github.com/yourusername/Business_School.git
cd Business_School
dotnet restore
```

2. **Configure connection string**

Edit `Business_School/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=BusinessSchoolDB;Trusted_Connection=True;"
  }
}
```

3. **Install EF Core tools**
```bash
dotnet tool install --global dotnet-ef --version 8.0.0
```

4. **Apply migrations**
```bash
cd Business_School
dotnet ef database update
cd ..
```

5. **Run the application**
```bash
cd Business_School
dotnet run
```

6. **Open browser**
   - HTTPS: https://localhost:5001
   - HTTP: http://localhost:5000

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@businessschool.com | Admin123! |
| **Department Manager** | manager@businessschool.com | Manager123! |
| **Club Leader** | leader@businessschool.com | Leader123! |
| **Student** | student@businessschool.com | Student123! |

---

## 📁 Project Structure

```
Business_School/
│
├── Controllers/              # HTTP request handlers
│   ├── AccountController     # Authentication
│   ├── AdminController       # Admin panel
│   ├── ClubsController       # Club management
│   ├── DashboardController   # Role-based dashboards
│   ├── DepartmentsController # Department CRUD
│   ├── EventsController      # Event management
│   └── StudentsController    # Student management
│
├── Services/                 # Business logic layer
│   ├── Gamification/
│   │   ├── IGamificationService.cs
│   │   └── GamificationService.cs
│   └── Recommendation/
│       ├── IRecommendationService.cs
│       └── RecommendationService.cs
│
├── Data/
│   ├── ApplicationDbContext  # EF Core context
│   └── DataSeeder           # Initial data population
│
├── Models/                   # Domain entities
│   ├── Department.cs
│   ├── Club.cs
│   ├── Student.cs
│   ├── Event.cs
│   ├── ApplicationUser.cs
│   └── JoinTables/          # Many-to-many relationships
│
├── ViewModels/              # View-specific models
│   ├── Dashboard/
│   ├── Club/
│   ├── Event/
│   └── Student/
│
├── Views/                   # Razor templates
│   ├── Dashboard/
│   ├── Clubs/
│   ├── Events/
│   └── Students/
│
├── Migrations/              # EF Core migrations
├── docker-compose.yml       # Container orchestration
├── Dockerfile              # Application image
└── README.md
```

---

## 🎯 Advanced Features Explained

### **1. Recommendation System**

**How It Works:**
1. Analyzes clubs the student has already joined
2. Finds other students with similar club memberships
3. Identifies clubs popular among similar students
4. Considers department affinity and event patterns
5. Returns top N recommendations sorted by relevance score

**Implementation:**
- Service: `RecommendationService.cs`
- Algorithm: Collaborative filtering with Jaccard similarity
- Displayed in: Student Dashboard, Student Profile

### **2. Gamification Engine**

**Point Calculation:**
```csharp
// Automatic point awards
Join Club → +50 points
Attend Event → +50 to +200 points (based on event importance)
```

**Level Progression:**
- Calculated dynamically based on total points
- No database storage needed
- Instant updates across all views

**Achievements:**
- Computed on-the-fly
- Checks conditions: club count, event attendance, role
- Displayed as badges in profile and dashboard

**Implementation:**
- Service: `GamificationService.cs`
- Used by: Controllers, ViewModels, Views
- Updates: Real-time calculation

### **3. Role-Based Dashboards**

Each role gets a customized dashboard with relevant information:

**Admin Dashboard:**
- Total counts (students, clubs, departments)
- Interactive charts (students by department)
- Recent activity feed
- Upcoming events calendar

**Department Manager Dashboard:**
- Department-specific statistics
- Clubs under management
- Student enrollments
- Department events

**Club Leader Dashboard:**
- Club member list
- Upcoming club events
- Engagement analytics
- Quick actions

**Student Dashboard:**
- Recommended clubs (personalized)
- Current club memberships
- Gamification progress widget
- Event registration

---

## 🗄️ Database Design

### **Core Entities**

**Department**
- Manages clubs and events
- Assigned to Department Managers
- Fields: Name, Email, Phone, Office Location

**Club**
- Belongs to one Department
- Has one Leader (ApplicationUser)
- Many-to-many with Students
- Fields: Name, Description, DepartmentId, LeaderId

**Student**
- Extended ApplicationUser
- Gamification tracking
- Many-to-many with Clubs and Events

**Event**
- Linked to Department and Clubs
- Capacity management
- Attendance tracking

### **Relationships**

```
Department 1───N Club N───M Student
    │                        │
    │                        │
    └──────N Event M─────────┘
```

---

## 🌱 Initial Data Seed

The system automatically creates demo data on first run:

**Roles:**
- Admin, DepartmentManager, ClubLeader, Student

**Sample Users:**
- 1 Admin, 1 Manager, 1 Leader, 15 Students

**Demo Content:**
- 3 Departments (Business, Technology, Arts)
- 6 Clubs distributed across departments
- 8 Academic Events
- Pre-assigned club memberships
- Initial gamification points

---

## 🐳 Docker Commands Reference

```bash
# Start the application
docker-compose up --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Reset everything (including database)
docker-compose down -v

# Check running containers
docker ps

# Access SQL Server shell
docker exec -it business_school_sqlserver /bin/bash
```

---

## 🔧 Troubleshooting

### **Docker Issues**

**Problem:** Application can't connect to database

**Solution:**
- Wait 30-45 seconds after `docker-compose up`
- Check SQL Server logs: `docker-compose logs sqlserver`
- Look for: "ready for client connections"

**Problem:** Port already in use (5000 or 1433)

**Solution:**
- Change ports in `docker-compose.yml`:
```yaml
webapp:
  ports:
    - "5001:8080"  # Use different port
```

**Problem:** Migrations not applied

**Solution:**
```bash
docker-compose down -v
docker-compose up --build
```

### **Local Development Issues**

**Problem:** `dotnet ef` not found

**Solution:**
```bash
dotnet tool install --global dotnet-ef --version 8.0.0
```

**Problem:** Database connection fails

**Solution:**
- Install SQL Server LocalDB
- Or use Docker (recommended)
- Check connection string in `appsettings.json`

---

## 📊 Features Showcase

### **What You Can Do:**

**As Admin:**
- ✅ View system-wide analytics
- ✅ Manage all departments, clubs, students
- ✅ Assign roles to users
- ✅ Monitor all events and registrations

**As Department Manager:**
- ✅ Manage your department's clubs
- ✅ Create and organize events
- ✅ View department analytics
- ✅ Monitor student enrollments

**As Club Leader:**
- ✅ Manage club members
- ✅ Organize club events
- ✅ View engagement statistics
- ✅ Track attendance

**As Student:**
- ✅ Discover and join clubs
- ✅ Register for events
- ✅ Track gamification progress
- ✅ Get personalized recommendations

---

## 📝 License

This project is for educational and portfolio purposes.

---

## 🤝 Contributing

This is a portfolio project. Suggestions and feedback are welcome!

---

## 📬 Contact

For questions or collaboration:
- **GitHub:** [Heily Madelay](https://github.com/HeilyMadelay-hub/Master-Proyects)
- **LinkedIn:** [Heily Madelay](https://www.linkedin.com/in/heilymajtan/)
- **Email:** heilymadelayajtan@icloud.com

---


**Built with ❤️ using ASP.NET Core**

