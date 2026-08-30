"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Users, Clock, Plus, ChevronRight } from "lucide-react";

export default function ProjectsGrid({ isAdmin = false }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API logic to be added
    setTimeout(() => {
      setProjects([
        { id: "1", title: "Internal Portal Overhaul", status: "in_progress", progress: 65, team: 4, deadline: "2024-12-15" },
        { id: "2", title: "Q4 Marketing Campaign", status: "planning", progress: 15, team: 6, deadline: "2025-01-30" },
        { id: "3", title: "Security Audit", status: "done", progress: 100, team: 2, deadline: "2024-10-10" },
      ]);
      setLoading(false);
    }, 500);
  }, [isAdmin]);

  const getStatusColor = (status: string) => {
    if (status === 'done') return 'bg-adm-green-light text-adm-green';
    if (status === 'planning') return 'bg-adm-amber-light text-adm-amber';
    return 'bg-adm-blue-light text-adm-blue';
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Projects Hub</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin ? "Oversee all active company projects and resource allocation." : "View your active project assignments."}
          </p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-adm-text-3">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-adm-surface border border-adm-border">
            <FolderOpen size={48} className="text-adm-text-3 mb-4" />
            <p className="font-bold text-adm-text">No Active Projects</p>
            <p className="text-sm text-adm-text-3">You haven't been assigned to any projects yet.</p>
          </div>
        ) : projects.map((proj) => (
          <div key={proj.id} className="border border-adm-border bg-adm-surface p-6 flex flex-col group hover:border-adm-blue transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(proj.status)}`}>
                {proj.status.replace('_', ' ')}
              </div>
              <div className="h-8 w-8 rounded-full bg-adm-surface-2 flex items-center justify-center group-hover:bg-adm-blue-light group-hover:text-adm-blue transition">
                <ChevronRight size={16} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-adm-text mb-6 line-clamp-2">{proj.title}</h3>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between text-xs font-semibold text-adm-text-3 mb-2">
                <span>Progress</span>
                <span>{proj.progress}%</span>
              </div>
              <div className="h-2 w-full bg-adm-surface-2 overflow-hidden mb-6">
                <div className={`h-full transition-all duration-1000 ${proj.progress === 100 ? 'bg-adm-green' : 'bg-adm-blue'}`} style={{ width: `${proj.progress}%` }}></div>
              </div>
              
              <div className="flex items-center justify-between border-t border-adm-border pt-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-adm-text-2">
                  <Users size={16} /> {proj.team} Members
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-adm-text-2">
                  <Clock size={16} /> {proj.deadline}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
