import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ramo } from '../models/ramo.model';

@Injectable({
  providedIn: 'root'
})
export class RamoService {

  private apiUrl = 'http://localhost:8080/api/ramos';

  constructor(private http: HttpClient) {}

  getRamos(): Observable<Ramo[]> {
    return this.http.get<Ramo[]>(this.apiUrl);
  }

  crearRamo(ramo: Ramo): Observable<Ramo> {
    return this.http.post<Ramo>(this.apiUrl, ramo);
  }

  actualizarRamo(id: number, ramo: Ramo): Observable<Ramo> {
    return this.http.put<Ramo>(`${this.apiUrl}/${id}`, ramo);
  }

  eliminarRamo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvance(): Observable<{ porcentaje: number }> {
    return this.http.get<{ porcentaje: number }>(`${this.apiUrl}/avance`);
  }
}