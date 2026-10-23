import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Evaluacion } from '../models/evaluacion.model';
import { environment } from '../../environtment/environtment.prod';
import { AuthService } from './auth.service';
import { GuestDataService } from './guest-data.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {

  private apiUrl = `${environment.apiUrl}/api/evaluaciones`;

  constructor(private http: HttpClient, private auth: AuthService, private guestData: GuestDataService) {}

  getEvaluaciones(): Observable<Evaluacion[]> {
    if (this.auth.isGuest()) return of(this.guestData.evaluaciones.map(e => ({ ...e })));
    return this.http.get<Evaluacion[]>(this.apiUrl);
  }

  getEvaluacionesByRamo(ramoId: number): Observable<Evaluacion[]> {
    if (this.auth.isGuest()) return of(this.guestData.evaluaciones.filter(e => e.ramoId === ramoId).map(e => ({ ...e })));
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/ramo/${ramoId}`);
  }

  crearEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    if (this.auth.isGuest()) return of(this.guestData.addEvaluacion(evaluacion));
    return this.http.post<Evaluacion>(this.apiUrl, evaluacion);
  }

  actualizarEvaluacion(id: number, evaluacion: Evaluacion): Observable<Evaluacion> {
    if (this.auth.isGuest()) { const updated = { ...evaluacion, id }; this.guestData.evaluaciones = this.guestData.evaluaciones.map(e => e.id === id ? updated : e); return of(updated); }
    return this.http.put<Evaluacion>(`${this.apiUrl}/${id}`, evaluacion);
  }

  eliminarEvaluacion(id: number): Observable<void> {
    if (this.auth.isGuest()) { this.guestData.evaluaciones = this.guestData.evaluaciones.filter(e => e.id !== id); return of(void 0); }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
