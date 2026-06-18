import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environtment/environtment.prod';

export interface BloqueHorarioDTO {
  id: string;
  dia: string;
  hora: string;
  ramoId: number | null;
  ramo2Id?: number | null;
  detalle1?: string;
  detalle2?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  private apiUrl = `${environment.apiUrl}/api/horario`;

  constructor(private http: HttpClient) {}

  obtenerHorario(): Observable<BloqueHorarioDTO[]> {
    return this.http.get<BloqueHorarioDTO[]>(this.apiUrl);
  }

  guardarHorario(bloques: BloqueHorarioDTO[]): Observable<BloqueHorarioDTO[]> {
    return this.http.post<BloqueHorarioDTO[]>(this.apiUrl, bloques);
  }

  limpiarHorario(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/limpiar`);
  }
}
