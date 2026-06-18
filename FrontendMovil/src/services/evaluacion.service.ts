import api from './api';
import { Evaluacion } from '../models/evaluacion.model';

export const EvaluacionService = {
  getEvaluaciones: async (): Promise<Evaluacion[]> => {
    const response = await api.get('/api/evaluaciones');
    return response.data;
  },

  getEvaluacionesByRamo: async (ramoId: number): Promise<Evaluacion[]> => {
    const response = await api.get(`/api/evaluaciones/ramo/${ramoId}`);
    return response.data;
  },

  crearEvaluacion: async (evaluacion: Evaluacion): Promise<Evaluacion> => {
    const response = await api.post('/api/evaluaciones', evaluacion);
    return response.data;
  },

  actualizarEvaluacion: async (id: number, evaluacion: Evaluacion): Promise<Evaluacion> => {
    const response = await api.put(`/api/evaluaciones/${id}`, evaluacion);
    return response.data;
  },

  eliminarEvaluacion: async (id: number): Promise<void> => {
    await api.delete(`/api/evaluaciones/${id}`);
  }
};
