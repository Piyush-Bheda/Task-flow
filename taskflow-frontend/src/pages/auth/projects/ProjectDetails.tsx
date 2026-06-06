import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FolderKanban,
  Loader2,
  Plus,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  UserPlus,
  X,
  Search,
  Filter,
  Activity,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/api/axios';
import { projectService } from '@/services/project.service';
import type { Project, ProjectMember, ProjectStats, Issue, Activity as ActivityType, ProjectRole } from '@/types/projectDetails';

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors = {
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  backlog: 'bg-purple-100 text-purple-700',
};

const roleColors = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  member: 'bg-slate-100 text-slate-700',
};

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'member'>('member');

  // Edit project state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch project
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Project }>(`/api/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
    retry: false,
  });

  // Fetch user's role in project
  const { data: userRole, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['projectRole', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { role: ProjectRole | null } }>(`/api/projects/${id}/members/role`);
      return data.data?.role ?? null;
    },
    enabled: !!id,
    retry: false,
  });

  // Show access denied if user is not even a workspace member
  const accessDenied = (projectError && (projectError as any).response?.status === 403) ||
    (roleError && (roleError as any).response?.status === 403);

  if (accessDenied) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Access Denied</h1>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            You don't have access to this project. Please contact your workspace administrator.
          </p>
        </div>
      </div>
    );
  }

  // Fetch project stats
  const { data: stats } = useQuery({
    queryKey: ['projectStats', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ProjectStats }>(`/api/projects/${id}/stats`);
      return data.data;
    },
    enabled: !!id && !!project,
    retry: false,
  });

  // Fetch project members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['projectMembers', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ProjectMember[] }>(`/api/projects/${id}/members`);
      return data.data || [];
    },
    enabled: !!id && !!project,
    retry: false,
  });

  // Fetch project issues
  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['projectIssues', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { issues: Issue[]; total: number } }>(`/api/projects/${id}/issues`);
      return data.data;
    },
    enabled: !!id && !!project,
    retry: false,
  });

  // Fetch project activity
  const { data: activity = [] } = useQuery({
    queryKey: ['projectActivity', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ActivityType[] }>(`/api/projects/${id}/activity`);
      return data.data || [];
    },
    enabled: !!id && !!project,
    retry: false,
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'member' }) => {
      const { data } = await api.post(`/api/projects/${id}/members`, { email, role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', id] });
      setShowAddMember(false);
      setMemberEmail('');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/api/projects/${id}/members/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', id] });
    },
  });

  // Edit project mutation
  const editMutation = useMutation({
    mutationFn: async (input: { name: string; description: string | null }) => {
      return projectService.updateProject(id!, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowEditModal(false);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || 'Failed to update project');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return projectService.deleteProject(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects', { replace: true });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete project');
    },
  });

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Project Not Found</h1>
        </div>
        <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  const canManage = userRole === 'owner' || userRole === 'admin';
  const canDelete = userRole === 'owner';

  return (
    <div className="space-y-8">
      {/* VIEW-ONLY BANNER */}
      {!roleLoading && userRole === null && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">View-only access</p>
            <p className="text-xs text-amber-700">
              You're a workspace member but not a project member. Ask an admin to add you to collaborate.
            </p>
          </div>
        </div>
      )}

      {/* PROJECT HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                {project.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditName(project.name);
                setEditDescription(project.description ?? '');
                setShowEditModal(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* PROJECT STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<FolderKanban className="h-5 w-5" />}
          label="Total Issues"
          value={stats?.totalIssues || 0}
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Open"
          value={stats?.openIssues || 0}
          className="text-orange-600"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="In Progress"
          value={stats?.inProgressIssues || 0}
          className="text-blue-600"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={stats?.completedIssues || 0}
          className="text-green-600"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Members"
          value={stats?.membersCount || 0}
        />
      </div>

      {/* PROJECT MEMBERS & ISSUES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MEMBERS SECTION */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Team Members</h2>
              {canManage && (
                <Button size="sm" variant="ghost" onClick={() => setShowAddMember(true)}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
            <div className="p-4 space-y-3">
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
              ) : (
                members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {member.user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn('text-xs', roleColors[member.role])}>
                        {member.role}
                      </Badge>
                      {canManage && member.role !== 'owner' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ISSUES SECTION */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Issues</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search issues..." className="w-[200px] pl-8 h-9" />
                </div>
                <Button size="sm" variant="ghost">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="divide-y">
              {issuesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : issuesData?.issues.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No issues yet</p>
                  {canManage && (
                    <Button size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Create Issue
                    </Button>
                  )}
                </div>
              ) : (
                issuesData?.issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={cn('text-xs', priorityColors[issue.priority])}>
                        {issue.priority}
                      </Badge>
                      <Badge variant="secondary" className={cn('text-xs', statusColors[issue.status])}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                      {issue.assignee && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            {issue.assignee.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT ACTIVITY */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="p-4">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{item.user.name}</span>{' '}
                      <span className="text-muted-foreground">{item.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Team Member</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddMember(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as 'admin' | 'member')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddMember(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => addMemberMutation.mutate({ email: memberEmail, role: memberRole })}
                  disabled={!memberEmail || addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Edit Project</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editName.trim()) return;
                editMutation.mutate({ name: editName.trim(), description: editDescription.trim() || null });
              }}
            >
              <div className="space-y-4">
                {editMutation.isError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {(editMutation.error as any)?.response?.data?.message || (editMutation.error as any)?.message || 'Failed to update project'}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Project Name <span className="text-red-500">*</span></label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Project name"
                    className="mt-1"
                    disabled={editMutation.isPending}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Project description"
                    className="mt-1"
                    disabled={editMutation.isPending}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={editMutation.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!editName.trim() || editMutation.isPending}>
                    {editMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Delete Project</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete "{project.name}"? This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteMutation.isError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {(deleteMutation.error as any)?.response?.data?.message || (deleteMutation.error as any)?.message || 'Failed to delete project'}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: number; className?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('h-10 w-10 rounded-lg bg-muted flex items-center justify-center', className)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}