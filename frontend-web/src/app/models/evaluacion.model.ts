export interface Evaluacion {
  id?: number;
  nombre: string;
  nota?: number;
  ponderacion: number;
  fecha?: string; // Formato YYYY-MM-DD
  ramoId: number;
  ramoNombre?: string;
}
