# TaskFlow API Integration Matrix

This document maps frontend capabilities to backend endpoints, documenting the actual implementation state, authentication requirements, and authorization rules.

## 1. Authentication & Identity
| Feature | Frontend Location | Endpoint | Method | Auth | Authz | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Registration | `Register.tsx` | `/api/auth/register` | POST | None | Public | Verified |
| Login | `Login.tsx` | `/api/auth/login` | POST | None | Public | Verified |
| Logout | `Navbar.tsx` | `/api/auth/logout` | POST | JWT | User | Unverified |
| User Profile | - | `/api/auth/me` | GET | JWT | User | Unverified |

## 2. Workspace Management
| Feature | Frontend Location | Endpoint | Method | Auth | Authz | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Create Workspace | - | `/api/workspaces` | POST | JWT | User | Verified |
| List Workspaces | `WorkspaceSwitcher.tsx`| `/api/workspaces` | GET | JWT | User | Verified |
| Add Member | - | `/api/workspaces/:workspaceId/members` | POST | JWT | Owner/Admin | Verified |
| Workspace Access | - | (Middleware) | - | JWT | Member | Verified |

## 3. Project Management
| Feature | Frontend Location | Endpoint | Method | Auth | Authz | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Create Project | `CreateProjectModal.tsx`| `/api/projects` | POST | JWT | Member | Verified |
| List Projects | `Projects.tsx` | `/api/projects` | GET | JWT | Member | Verified |
| Project Details | `ProjectDetails.tsx` | `/api/projects/:id` | GET | JWT | Member | Verified |
| Project Members | - | `/api/projects/:id/members` | GET | JWT | Member | Unverified |

## 4. Issue Management
| Feature | Frontend Location | Endpoint | Method | Auth | Authz | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| List Issues | `Issues.tsx` | `/api/issues` | GET | JWT | Member | Verified |
| Create Issue | `CreateIssueModal.tsx`| `/api/issues` | POST | JWT | Member | Verified |
| View Issue | `IssueDetails.tsx` | `/api/issues/:id` | GET | JWT | Member | Verified |
| Update Issue | `UpdateIssueModal.tsx`| `/api/issues/:id` | PATCH | JWT | Member | Verified |
| Delete Issue | - | `/api/issues/:id` | DELETE | JWT | Owner/Admin | Verified |

## 5. Dashboard & Analytics
| Feature | Frontend Location | Endpoint | Method | Auth | Authz | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| General Stats | `Dashboard.tsx` | `/api/dashboard/stats` | GET | JWT | User | Verified |
| Summary Metrics | `StatsCard.tsx` | `/api/dashboard/summary` | GET | JWT | Member | Verified |
| Chart Data | `DashboardCharts.tsx` | `/api/dashboard/charts` | GET | JWT | Member | Verified |
| Project Distribution| `Dashboard.tsx` | `/api/dashboard/projects` | GET | JWT | Member | Verified |

## 6. Activity & Social
| Feature | Frontend Location | Endpoint | Method | Auth | Authz | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Activity Log | `ActivityList.tsx` | `/api/activity` | GET | JWT | Member | Unverified |
| Add Comment | - | `/api/comments` | POST | JWT | Member | Unverified |
| List Comments | - | `/api/issues/:id/comments` | GET | JWT | Member | Unverified |

---

### Legend
- **Verified**: Endpoint exists, implementation inspected, and frontend integration confirmed.
- **Unverified**: Endpoint exists in backend routes, but frontend integration is missing or not fully tested.
- **Blocked**: Feature requested but backend endpoint does not exist.
