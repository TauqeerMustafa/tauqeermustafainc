"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminField,
  AdminFormActions,
  AdminLoadingState,
  AdminPageHeader,
  adminInputClass,
} from "@/components/admin/AdminUI";
import { useBlogs, useCreateBlog, useDeleteBlog, useUpdateBlog } from "@/hooks/useBlogs";
import type { Blog } from "@/types";
import type { BlogPayload } from "@/services/blog.service";

const emptyForm: BlogPayload = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "",
  isPublished: true,
};

export default function AdminBlogPage() {
  const { data, isLoading, isError } = useBlogs({ publishedOnly: false, pageSize: 100 });
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<BlogPayload>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Blog | null>(null);

  const posts = data?.data.items ?? [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(post: Blog) {
    setEditing(post);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content ?? "",
      category: post.category,
      isPublished: post.isPublished,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateBlog.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createBlog.mutateAsync(form);
    }
    setDrawerOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteBlog.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const isSaving = createBlog.isPending || updateBlog.isPending;

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Manage articles published to the site."
        actionLabel="New Post"
        onAction={openCreate}
      />

      {isLoading ? <AdminLoadingState label="Loading posts..." /> : null}
      {isError ? (
        <AdminErrorState message="Could not load blog posts. Confirm the backend is running and reachable." />
      ) : null}

      {!isLoading && !isError && posts.length === 0 ? (
        <AdminEmptyState title="No blog posts yet" description="Create your first post to get started." />
      ) : null}

      {!isLoading && !isError && posts.length > 0 ? (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {posts.map((post) => (
                <tr key={post.id} className="text-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{post.title}</p>
                    <p className="text-xs text-slate-500">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{post.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold ${post.isPublished ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"}`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        aria-label={`Edit ${post.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-300 transition hover:border-yellow-400"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(post)}
                        aria-label={`Delete ${post.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-300 transition hover:border-red-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AdminDrawer
        open={drawerOpen}
        title={editing ? "Edit Post" : "New Post"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Title" htmlFor="title">
            <input
              id="title"
              required
              className={adminInputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminField>
          <AdminField label="Slug" htmlFor="slug">
            <input
              id="slug"
              required
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
              className={adminInputClass}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </AdminField>
          <AdminField label="Category" htmlFor="category">
            <input
              id="category"
              required
              className={adminInputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </AdminField>
          <AdminField label="Excerpt" htmlFor="excerpt">
            <textarea
              id="excerpt"
              required
              rows={3}
              className={adminInputClass}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </AdminField>
          <AdminField label="Content" htmlFor="content">
            <textarea
              id="content"
              rows={8}
              className={adminInputClass}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </AdminField>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="h-4 w-4 accent-yellow-400"
            />
            Published
          </label>

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={isSaving} />
        </form>
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this post?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : undefined}
        isPending={deleteBlog.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
