import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluacion } from '../models/evaluacion.model';
import { environment } from '../../environtment/environtment.prod';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {

  private apiUrl = `${environment.apiUrl}/api/evaluaciones`;

  constructor(private http: HttpClient) {}

  getEvaluaciones(): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(this.apiUrl);
  }

  getEvaluacionesByRamo(ramoId: number): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/ramo/${ramoId}`);
  }

  crearEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(this.apiUrl, evaluacion);
  }

  actualizarEvaluacion(id: number, evaluacion: Evaluacion): Observable<Evaluacion> {
    return this.http.put<Evaluacion>(`${this.apiUrl}/${id}`, evaluacion);
  }

  eliminarEvaluacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
