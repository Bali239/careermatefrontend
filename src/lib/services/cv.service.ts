import type { CV } from '@/app/dashboard/models';
import { api } from '@/lib/axios';

export const cvService = {
  list: async (search?: string) => {
    const response = await api.get<{ data: CV[] }>('/cvs', { params: search ? { search } : {} });
    return response.data.data;
  },

  upload: async (file: File, name: string) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.name.toLowerCase().endsWith('.docx');
    const contentType = isPdf
      ? 'application/pdf'
      : isDocx
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/msword';
    const response = await api.post('/cvs', file, {
      headers: {
        'Content-Type': file.type || contentType,
        'X-File-Name': encodeURIComponent(file.name),
        'X-CV-Name': encodeURIComponent(name.trim()),
      },
      timeout: 60_000,
    });
    return response.data;
  },

  getFile: async (id: string) => {
    const response = await api.get(`/cvs/${id}/file`, { responseType: 'blob' });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/cvs/${id}`);
  },

  extract: async (id: string) => {
    await api.post(`/cvs/${id}/extract`);
  },
};
