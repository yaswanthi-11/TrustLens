# TrustLens X – Complete Project Structure

```
TrustLens/
├── pom.xml
├── PROJECT_STRUCTURE.md
├── README.md                          (Deliverable #25)
│
├── database/
│   └── schema.sql                     (Deliverable #2 – MySQL Database Schema)
│
├── src/
│   ├── main/
│   │   ├── java/com/trustlensx/
│   │   │   ├── TrustLensXApplication.java
│   │   │   │
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ScanController.java
│   │   │   │   ├── DashboardController.java
│   │   │   │   ├── AnalyticsController.java
│   │   │   │   ├── LearningArticleController.java
│   │   │   │   └── AdminController.java
│   │   │   │
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ScanService.java
│   │   │   │   ├── RiskScoreService.java
│   │   │   │   ├── CyberDNAService.java
│   │   │   │   ├── DashboardService.java
│   │   │   │   ├── AnalyticsService.java
│   │   │   │   ├── LearningArticleService.java
│   │   │   │   ├── ReportService.java
│   │   │   │   ├── EmailService.java
│   │   │   │   └── VirusTotalService.java
│   │   │   │
│   │   │   ├── service/impl/
│   │   │   │   ├── AuthServiceImpl.java
│   │   │   │   ├── ScanServiceImpl.java
│   │   │   │   ├── RiskScoreServiceImpl.java
│   │   │   │   ├── RiskAnalysisResult.java
│   │   │   │   ├── ThreatLevelCalculator.java
│   │   │   │   ├── CyberDNAServiceImpl.java
│   │   │   │   ├── CyberDNAResult.java
│   │   │   │   ├── DashboardServiceImpl.java
│   │   │   │   ├── AnalyticsServiceImpl.java
│   │   │   │   ├── LearningArticleServiceImpl.java
│   │   │   │   ├── ReportServiceImpl.java
│   │   │   │   ├── EmailServiceImpl.java
│   │   │   │   └── VirusTotalServiceImpl.java
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RoleRepository.java
│   │   │   │   ├── UrlScanRepository.java
│   │   │   │   ├── ScanReasonRepository.java
│   │   │   │   └── LearningArticleRepository.java
│   │   │   │
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java
│   │   │   │   ├── UrlScan.java
│   │   │   │   ├── ScanReason.java
│   │   │   │   └── LearningArticle.java
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── UserRegisterDTO.java
│   │   │   │   ├── UserLoginDTO.java
│   │   │   │   ├── AuthResponseDTO.java
│   │   │   │   ├── ScanRequestDTO.java
│   │   │   │   ├── ScanResponseDTO.java
│   │   │   │   ├── DashboardDTO.java
│   │   │   │   ├── AnalyticsDTO.java
│   │   │   │   ├── LearningArticleDTO.java
│   │   │   │   └── ApiErrorDTO.java
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── JwtFilter.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   └── CorsConfig.java
│   │   │   │
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   └── UnauthorizedException.java
│   │   │   │
│   │   │   ├── util/
│   │   │   │   ├── UrlParserUtil.java
│   │   │   │   ├── HashUtil.java
│   │   │   │   └── DateUtil.java
│   │   │   │
│   │   │   └── analytics/
│   │   │       ├── ThreatCategoryAnalyzer.java
│   │   │       └── ScanTrendCalculator.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── schema.sql
│   │       └── data.sql                     (Deliverable #24 – Sample Data)
│   │
│   └── test/
│       └── java/com/trustlensx/
│           └── TrustLensXApplicationTests.java
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── assets/
        │   ├── logo.svg
        │   └── icons/
        │
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── ToastNotification.jsx
        │   ├── StatCard.jsx
        │   ├── ThreatBadge.jsx
        │   ├── ScanResultCard.jsx
        │   ├── RiskChart.jsx
        │   ├── TrendChart.jsx
        │   └── CategoryChart.jsx
        │
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ScannerPage.jsx
        │   ├── HistoryPage.jsx
        │   ├── AnalyticsPage.jsx
        │   ├── LearningPage.jsx
        │   ├── AdminPage.jsx
        │   ├── ProfilePage.jsx
        │   └── SettingsPage.jsx
        │
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── scanService.js
        │   ├── dashboardService.js
        │   ├── analyticsService.js
        │   ├── learningService.js
        │   ├── adminService.js
        │   └── websocketService.js
        │
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useToast.js
        │   └── useWebSocket.js
        │
        ├── context/
        │   └── AuthContext.jsx
        │
        ├── layouts/
        │   └── Layout.jsx
        │
        └── utils/
            ├── constants.js
            ├── threatLevels.js
            └── formatters.js
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  Pages → Components → Services (Axios) → Auth Context       │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│              Spring Boot 3.x Backend (Java 21)               │
│  Controllers → Services → Repositories → Entities            │
│  Security (JWT) │ Risk Engine │ CyberDNA │ Analytics         │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC / JPA
┌──────────────────────────▼──────────────────────────────────┐
│                      MySQL 8.x Database                      │
│  users │ roles │ url_scans │ scan_reasons │ learning_articles│
└─────────────────────────────────────────────────────────────┘
```

## Package Responsibilities

| Package | Responsibility |
|---------|----------------|
| `controller` | REST API endpoints, request/response mapping |
| `service` | Business logic interfaces |
| `service.impl` | Service implementations, threat engines |
| `repository` | Spring Data JPA data access |
| `entity` | JPA entity mappings |
| `dto` | Data transfer objects (API contracts) |
| `security` | JWT, authentication filter, user details |
| `config` | Security, CORS, WebSocket configuration |
| `exception` | Global exception handling |
| `util` | URL parsing, hashing, date utilities |
| `analytics` | Chart data aggregation helpers |

## API Endpoints Summary

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/scan` | Authenticated |
| GET | `/api/scan/history` | Authenticated |
| GET | `/api/scan/{id}` | Authenticated |
| DELETE | `/api/scan/{id}` | Authenticated |
| GET | `/api/dashboard` | Authenticated |
| GET | `/api/analytics` | Authenticated |
| GET | `/api/learning` | Authenticated |
| POST | `/api/learning` | Admin |
| PUT | `/api/learning/{id}` | Admin |
| DELETE | `/api/learning/{id}` | Admin |
| GET | `/api/admin/scans` | Admin |
| DELETE | `/api/admin/scan/{id}` | Admin |

## Current Status

- **Existing**: Core backend packages, most controllers/services/entities, frontend pages & layout
- **To create**: `exception`, `util`, `analytics` packages; additional frontend components, hooks, utils, assets
