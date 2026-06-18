import api from './api';
import { Ramo } from '../models/ramo.model';

export const RamoService = {
  getRamos: async (): Promise<Ramo[]> => {
    const response = await api.get('/api/ramos');
    return response.data;
  },

  crearRamo: async (ramo: Ramo): Promise<Ramo> => {
    const response = await api.post('/api/ramos', ramo);
    return response.data;
  },

  actualizarRamo: async (id: number, ramo: Ramo): Promise<Ramo> => {
    const response = await api.put(`/api/ramos/${id}`, ramo);
    return response.data;
  },

  eliminarRamo: async (id: number): Promise<void> => {
    await api.delete(`/api/ramos/${id}`);
  },

  eliminarTodos: async (): Promise<void> => {
    await api.delete('/api/ramos/todos');
  },

  cargarMallaPredeterminada: async (ramos: Ramo[]): Promise<Ramo[]> => {
    const response = await api.post('/api/ramos/bulk', ramos);
    return response.data;
  },

  getAvance: async (): Promise<{ porcentaje: number }> => {
    const response = await api.get('/api/ramos/avance');
    return response.data;
  },

  cambiarEstado: async (id: number, aprobado: boolean, cursando: boolean): Promise<Ramo> => {
    const response = await api.patch(`/api/ramos/${id}/estado`, { aprobado, cursando });
    return response.data;
  }
};
