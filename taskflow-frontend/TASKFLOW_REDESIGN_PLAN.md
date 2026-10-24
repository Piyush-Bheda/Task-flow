# TaskFlow Redesign & Engineering Plan

This plan outlines the transformation of TaskFlow from a CRUD application into a production-ready SaaS project. The focus is on **system stability**, **professional UX**, and **demonstrable engineering depth**.

## Phase 1: Audit, Stabilize & Normalize
**Goal**: Eliminate runtime crashes and establish a reliable data contract.

- [ ] **Data Normalization Layer**: Implement a transformation layer in `src/services` that maps backend string responses to frontend Typescript enums. 
  - *Rationale*: Prevents the `config[undefined]` crashes seen in `StatusBadge` and `PriorityBadge`.
- [ ] **Contract Sync**: Align `IssueStatus` and `IssuePriority` between `backend/src/types/app.ts` and `frontend/src/types/issue.ts`.
- [ ] **API Error Standardization**: Implement a global Axios interceptor to handle 401 (Unauthenticated) and 403 (Forbidden) consistently across the app.
- [ ] **Build Baseline**: Ensure a clean production build with no TS errors.

## Phase 2: Design Foundation & Shell
**Goal**: Establish a professional, cohesive visual identity and navigation.

- [ ] **Design Token Implementation**: Define a semantic color palette (e.g., `primary`, `secondary`, `success`, `warning`, `destructive`, `muted`) in Tailwind.
- [ ] **The "SaaS Shell"**: 
  - Redesign `AppLayout` to include a persistent, high-fidelity sidebar.
  - Implement a polished `WorkspaceSwitcher` that feels integrated into the shell.
  - Standardize page headers with clear breadcrumbs and primary actions.
- [ ] **Responsive Foundation**: Audit and fix layout shifts and mobile responsiveness in the main navigation.

## Phase 3: Core Product Workflows
**Goal**: Move from "screens" to "workflows."

- [ ] **Actionable Dashboard**:
  - Replace static cards with "Work-Centric" views: "My Open Issues," "Recently Updated," and "Workspace Health."
  - Connect all dashboard metrics to actual filtered views (click metric $\rightarrow$ navigate to filtered list).
- [ ] **High-Fidelity Issue Management**:
  - **The "Issue Hub"**: Redesign the Issues page to use a combined Table + Detail view (e.g., using a Slide-over/Drawer for issue details) to reduce page navigation.
  - **Advanced Filtering**: Implement a robust filter bar (Status, Priority, Assignee, Project) with URL synchronization for shareable views.
  - **Detail View**: Add activity history and metadata (createdAt, updatedAt) to the issue detail panel.
- [ ] **Project Lifecycle**: Improve project creation and detail views to provide better context for the issues within them.

## Phase 4: Engineering Depth (The "Interview" Features)
**Goal**: Demonstrate advanced full-stack patterns.

- [ ] **Role-Based UI (RBAC)**:
  - Create a `<Can role="admin">` component to conditionally render management actions.
  - Ensure frontend visibility matches backend `WorkspaceRole` logic.
- [ ] **Optimistic UI**: Use TanStack Query's `onMutate` to implement optimistic updates for issue status/priority changes.
- [ ] **Global Search/Command Palette**: Implement a `Cmd+K` interface for quick navigation to projects or issues.
- [ ] **Session Management**: Implement a robust session restoration flow that handles token expiry gracefully without a full white-screen crash.

## Phase 5: Cleanup & Verification
**Goal**: Polish and document.

- [ ] **Complexity Audit**: Remove duplicate components and unused dependencies.
- [ ] **Performance Pass**: Optimize large list rendering and redundant API calls.
- [ ] **Final Integration Matrix**: Update `TASKFLOW_API_INTEGRATION_MATRIX.md` to mark all features as "Verified."
- [ ] **Production Build**: Final verify of `npm run build`.

---

## Success Criteria
1. **Zero Runtime Crashes**: No `undefined` lookups in badge components.
2. **Contract Reliability**: API responses are transformed at the boundary.
3. **Professional UX**: Layout mimics modern project management tools (Linear/GitHub).
4. **Proven Authorization**: UI actions are gated by actual user roles.
5. **Technical Depth**: Implementation of Optimistic UI and a Global Command Palette.
