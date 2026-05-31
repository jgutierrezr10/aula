export interface RamoPredeterminadoDTO {
  nombre: string;
  semestre: number;
}

export interface MallaPredeterminadaDTO {
  id?: number;
  nombre: string;
  universidad: string;
  descripcion: string;
  icono: string;
  totalRamos: number;
  semestres: number;
  ramos: RamoPredeterminadoDTO[];
}
