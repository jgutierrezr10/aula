import api from './api';

export interface BloqueHorarioDTO {
  id: string;
  dia: string;
  hora: string;
  ramoId: number | null;
  ramo2Id?: number | null;
  detalle1?: string;
  detalle2?: string;
}

export const HorarioService = {
  obtenerHorario: async (): Promise<BloqueHorarioDTO[]> => {
    const response = await api.get('/api/horario');
    return response.data;
  },

  guardarHorario: async (bloques: BloqueHorarioDTO[]): Promise<BloqueHorarioDTO[]> => {
    const response = await api.post('/api/horario', bloques);
    return response.data;
  },

  limpiarHorario: async (): Promise<void> => {
    await api.delete('/api/horario/limpiar');
  }
};
