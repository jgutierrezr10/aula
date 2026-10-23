import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Ramo } from '../models/ramo.model';
import { environment } from '../../environtment/environtment.prod';
import { MallaPredeterminadaDTO } from '../models/malla-predeterminada.model';
import { AuthService } from './auth.service';
import { GuestDataService } from './guest-data.service';

@Injectable({
  providedIn: 'root'
})
export class RamoService {

  private apiUrl = `${environment.apiUrl}/api/ramos`;
  private apiUrlMallas = `${environment.apiUrl}/api/mallas-predeterminadas`;

  constructor(private http: HttpClient, private auth: AuthService, private guestData: GuestDataService) {}

  getRamos(): Observable<Ramo[]> {
    if (this.auth.isGuest()) return of(this.guestData.ramos.map(r => ({ ...r })));
    return this.http.get<Ramo[]>(this.apiUrl);
  }

  crearRamo(ramo: Ramo): Observable<Ramo> {
    if (this.auth.isGuest()) return of(this.guestData.addRamo(ramo));
    return this.http.post<Ramo>(this.apiUrl, ramo);
  }

  actualizarRamo(id: number, ramo: Ramo): Observable<Ramo> {
    if (this.auth.isGuest()) {
      const updated = { ...ramo, id };
      this.guestData.ramos = this.guestData.ramos.map(r => r.id === id ? updated : r);
      return of(updated);
    }
    return this.http.put<Ramo>(`${this.apiUrl}/${id}`, ramo);
  }

  eliminarRamo(id: number): Observable<void> {
    if (this.auth.isGuest()) { this.guestData.ramos = this.guestData.ramos.filter(r => r.id !== id); return of(void 0); }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  eliminarTodos(): Observable<void> {
    if (this.auth.isGuest()) { this.guestData.ramos = []; this.guestData.evaluaciones = []; this.guestData.horarios.clear(); this.guestData.etiquetasHora = {}; return of(void 0); }
    return this.http.delete<void>(`${this.apiUrl}/todos`);
  }

  cargarMallaPredeterminada(ramos: Ramo[]): Observable<Ramo[]> {
    if (this.auth.isGuest()) { this.guestData.ramos = []; return of(ramos.map(r => this.guestData.addRamo(r))); }
    return this.http.post<Ramo[]>(`${this.apiUrl}/bulk`, ramos);
  }

  getAvance(): Observable<{ porcentaje: number }> {
    if (this.auth.isGuest()) { const total = this.guestData.ramos.length; return of({ porcentaje: total ? Math.round(this.guestData.ramos.filter(r => r.aprobado).length * 100 / total) : 0 }); }
    return this.http.get<{ porcentaje: number }>(`${this.apiUrl}/avance`);
  }

  cambiarEstado(id: number, aprobado: boolean, cursando: boolean): Observable<Ramo> {
    if (this.auth.isGuest()) { const ramo = this.guestData.ramos.find(r => r.id === id); if (!ramo) return of({ id, nombre: '', semestre: 1, aprobado, cursando }); Object.assign(ramo, { aprobado, cursando }); return of({ ...ramo }); }
    return this.http.patch<Ramo>(`${this.apiUrl}/${id}/estado`, { aprobado, cursando });
  }

  cambiarEstadoBulk(estados: { id: number, aprobado: boolean, cursando: boolean }[]): Observable<Ramo[]> {
    if (this.auth.isGuest()) { estados.forEach(e => { const r = this.guestData.ramos.find(x => x.id === e.id); if (r) Object.assign(r, { aprobado: e.aprobado, cursando: e.cursando }); }); return of(this.guestData.ramos.map(r => ({ ...r }))); }
    return this.http.put<Ramo[]>(`${this.apiUrl}/bulk/estado`, estados);
  }

  obtenerMallasPredeterminadas(): Observable<MallaPredeterminadaDTO[]> {
    // Solo consulta mallas públicas; no crea ni modifica datos del visitante.
    return this.http.get<MallaPredeterminadaDTO[]>(this.apiUrlMallas);
  }

  publicarMallaPredeterminada(malla: MallaPredeterminadaDTO): Observable<MallaPredeterminadaDTO> {
    if (this.auth.isGuest()) return of({ ...malla, id: Date.now() });
    return this.http.post<MallaPredeterminadaDTO>(this.apiUrlMallas, malla);
  }

  eliminarMallaPredeterminada(id: number): Observable<void> {
    if (this.auth.isGuest()) return of(void 0);
    return this.http.delete<void>(`${this.apiUrlMallas}/${id}`);
  }

  importarConIA(imagen: File): Observable<Ramo[]> {
    if (this.auth.isGuest()) return new Observable(subscriber => subscriber.error(new Error('Inicia sesión para usar la importación con IA.')));
    const formData = new FormData();
    formData.append('imagen', imagen);
    return this.http.post<Ramo[]>(`${this.apiUrl}/importar-ia`, formData);
  }
}
