export interface Ramo {
  id?: number;
  nombre: string;
  semestre: number;
  aprobado: boolean;
  cursando?: boolean;
  nota?: number;
}