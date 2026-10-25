import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, FolderTree, CheckCircle2 } from 'lucide-react';
import { categoryApi } from '../../services/api';
import type { Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getAll();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, {
          name: categoryName.trim(),
          description: categoryDesc.trim(),
        });
      } else {
        await categoryApi.create({
          name: categoryName.trim(),
          description: categoryDesc.trim(),
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryApi.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Marketplace Category Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize service categories, edit taxonomy slugs, and configure discovery filters.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          New Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading taxonomy categories..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug Identifier</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Active Services</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{c.slug}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {c.description || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      {c.servicesCount || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Configure taxonomy parameters for marketplace discovery"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Mobile App Development"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description for category listings..."
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
