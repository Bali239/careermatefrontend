import type { ChatSession } from '@/app/dashboard/models';
import { api } from '@/lib/axios';

export const chatService = {
  list: async () => {
    const response = await api.get<{ data: ChatSession[] }>('/chat');
    return response.data.data;
  },

  get: async (id: string) => {
    const response = await api.get<{ data: ChatSession }>(`/chat/${id}`);
    return response.data.data;
  },

  create: async (payload: { cvId: string; jobDescription: string; title?: string }) => {
    const response = await api.post<{ data: ChatSession }>('/chat', payload, {
      timeout: 600_000,
    });
    return response.data.data;
  },

  analyze: async (id: string) => {
    const response = await api.post<{ data: ChatSession }>(`/chat/${id}/analyze`, undefined, {
      timeout: 600_000,
    });
    return response.data.data;
  },

  rewrite: async (id: string) => {
    const response = await api.post<{ data: ChatSession }>(`/chat/${id}/rewrite`);
    return response.data.data;
  },

  sendMessage: async (id: string, message: string) => {
    const response = await api.post<{ data: ChatSession }>(`/chat/${id}/messages`, { message });
    return response.data.data;
  },

  editDraft: async (id: string, draftHtml: string, isEditing: boolean) => {
    const response = await api.post<{ data: ChatSession }>(`/chat/${id}/edit`, {
      draftHtml,
      isEditing,
    });
    return response.data.data;
  },

  exitEditMode: async (id: string) => {
    const response = await api.post<{ data: ChatSession }>(`/chat/${id}/exit-edit`);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ data: { id: string } }>(`/chat/${id}`);
    return response.data.data.id;
  },

  updateTitle: async (id: string, title: string) => {
    const response = await api.patch<{ data: ChatSession }>(`/chat/${id}`, { title });
    return response.data.data;
  },
};
