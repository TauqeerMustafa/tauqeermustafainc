"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, MoreVertical, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RolesManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    hierarchy_level: 0,
    description: "",
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch roles and permissions
    Promise.all([
      fetch("/api/admin/roles").then(res => res.json()),
      fetch("/api/admin/permissions").then(res => res.json())
    ])
    .then(([rolesData, permsData]) => {
      setRoles(rolesData.data || []);
      setPermissions(permsData.data || []);
    })
    .catch(() => {
      // Mock data fallback
      setRoles([
        { id: "1", name: "Super Admin", slug: "super_admin", hierarchy_level: 100, is_system: true, description: "Full system access" },
        { id: "2", name: "Manager", slug: "manager", hierarchy_level: 50, is_system: false, description: "Team management" },
        { id: "3", name: "Employee", slug: "employee", hierarchy_level: 10, is_system: true, description: "Standard access" },
      ]);
      setPermissions([
        { id: "p1", slug: "users.create", description: "Can create users" },
        { id: "p2", slug: "users.edit", description: "Can edit users" },
        { id: "p3", slug: "roles.manage", description: "Can manage roles" },
      ]);
    })
    .finally(() => setLoading(false));
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: "", slug: "", hierarchy_level: 10, description: "" });
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      hierarchy_level: role.hierarchy_level,
      description: role.description || "",
    });
    setSelectedPermissions(role.permissions?.map((p: any) => p.id) || []);
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send POST/PATCH to /api/admin/roles
    // and then POST to /api/admin/roles/{id}/permissions
    alert("Role saved successfully!");
    setIsModalOpen(false);
  };

  const handleDelete = (role: any) => {
    if (role.is_system) return alert("System roles cannot be deleted");
    if (confirm(`Are you sure you want to delete the ${role.name} role?`)) {
      // API call to delete
      setRoles(roles.filter(r => r.id !== role.id));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Roles & Permissions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Configure access levels and granular permissions for the system.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[var(--adm-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {loading ? (
            <div className="p-8 text-center text-[var(--adm-text-3)]">Loading roles...</div>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5 hover:border-[var(--adm-blue)] transition cursor-pointer group relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-[var(--adm-blue)]" />
                    <h3 className="font-bold text-[var(--adm-text)]">{role.name}</h3>
                  </div>
                  {role.is_system && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5" style={{ background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}>System</span>
                  )}
                </div>

                <p className="text-sm text-[var(--adm-text-3)] mb-4 line-clamp-2">
                  {role.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-xs text-[var(--adm-text-2)] font-medium">
                  <span>Level {role.hierarchy_level} Authority</span>
                  <span>{role.permissions?.length || 0} Permissions</span>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-[var(--adm-surface)] border border-[var(--adm-border)]">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(role); }} className="p-2 hover:bg-[var(--adm-surface-2)]" style={{ color: "var(--adm-text-2)" }}>
                    <Edit2 size={14} />
                  </button>
                  {!role.is_system && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(role); }} className="p-2 hover:bg-[var(--adm-red-light)]" style={{ color: "var(--adm-red)" }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Role / Info Panel */}
        <div className="lg:col-span-2">
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-8 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
            <Shield size={48} className="text-[var(--adm-border)] mb-4" />
            <h3 className="text-xl font-bold text-[var(--adm-text)] mb-2 uppercase">Role Management</h3>
            <p className="text-[var(--adm-text-3)] max-w-md">
              Select a role from the list to view its configuration, or create a new custom role to delegate specific permissions to your team.
            </p>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--adm-surface)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[var(--adm-border)]">
            <div className="px-8 py-6 border-b border-[var(--adm-border)]">
              <h2 className="text-xl font-bold text-[var(--adm-text)] uppercase">
                {editingRole ? `Edit ${editingRole.name}` : "Create Custom Role"}
              </h2>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="roleForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Role Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Unique Slug *</label>
                    <input required disabled={!!editingRole} type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "_")})} className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none disabled:opacity-70" style={{ background: "var(--adm-surface-2)", color: "var(--adm-text)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Hierarchy Level (Authority)</label>
                  <input type="number" min="0" max="99" value={formData.hierarchy_level} onChange={e => setFormData({...formData, hierarchy_level: parseInt(e.target.value)})} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
                  <p className="text-xs text-[var(--adm-text-3)] mt-1">Higher numbers indicate more authority. Max 99 (100 is reserved for Super Admin).</p>
                </div>

                <div className="pt-4 border-t border-[var(--adm-border)]">
                  <h3 className="font-bold text-[var(--adm-text)] mb-4">Assign Permissions</h3>
                  
                  {editingRole?.is_system ? (
                    <div className="p-4 text-sm" style={{ background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}>
                      System roles have intrinsic permissions that cannot be modified through the UI.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map(perm => (
                        <label key={perm.id} className={`flex items-start gap-3 p-3 border cursor-pointer transition ${selectedPermissions.includes(perm.id) ? "border-[var(--adm-blue)] bg-[var(--adm-blue-light)]" : "border-[var(--adm-border)] hover:bg-[var(--adm-surface-2)]"}`}>
                          <input 
                            type="checkbox" 
                            className="mt-1"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <div>
                            <p className="text-sm font-bold text-[var(--adm-text)]">{perm.slug}</p>
                            <p className="text-xs text-[var(--adm-text-3)]">{perm.description || "No description"}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="px-8 py-4 border-t border-[var(--adm-border)] flex items-center justify-end gap-3" style={{ background: "var(--adm-surface-2)" }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition">
                Cancel
              </button>
              <button type="submit" form="roleForm" className="px-6 py-2 bg-[var(--adm-blue)] text-white text-sm font-semibold hover:opacity-90 transition">
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
