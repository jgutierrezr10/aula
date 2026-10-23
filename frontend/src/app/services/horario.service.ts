import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environtment/environtment.prod';
import { AuthService } from './auth.service';
import { GuestDataService } from './guest-data.service';

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

  constructor(private http: HttpClient, private auth: AuthService, private guestData: GuestDataService) {}

  obtenerHorario(opcion: number = 1): Observable<BloqueHorarioDTO[]> {
    if (this.auth.isGuest()) return of((this.guestData.horarios.get(opcion) || []).map(b => ({ ...b })));
    return this.http.get<BloqueHorarioDTO[]>(`${this.apiUrl}?opcion=${opcion}`);
  }

  guardarHorario(bloques: BloqueHorarioDTO[], opcion: number = 1): Observable<BloqueHorarioDTO[]> {
    if (this.auth.isGuest()) { this.guestData.horarios.set(opcion, bloques.map(b => ({ ...b }))); return of(bloques.map(b => ({ ...b }))); }
    return this.http.post<BloqueHorarioDTO[]>(`${this.apiUrl}?opcion=${opcion}`, bloques);
  }

  limpiarHorario(opcion: number = 1): Observable<void> {
    if (this.auth.isGuest()) { this.guestData.horarios.delete(opcion); return of(void 0); }
    return this.http.delete<void>(`${this.apiUrl}/limpiar?opcion=${opcion}`);
  }
}
