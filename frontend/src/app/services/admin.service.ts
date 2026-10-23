import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environtment/environtment.prod';
import { AdminStatsDTO, UsuarioAdminDTO, Rol } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl + '/api/admin';

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStatsDTO> {
    return this.http.get<AdminStatsDTO>(`${this.apiUrl}/stats`);
  }

  getUsuarios(): Observable<UsuarioAdminDTO[]> {
    return this.http.get<UsuarioAdminDTO[]>(`${this.apiUrl}/usuarios`);
  }

  cambiarRol(id: number, rol: Rol): Observable<UsuarioAdminDTO> {
    return this.http.put<UsuarioAdminDTO>(`${this.apiUrl}/usuarios/${id}/rol`, { rol });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }
}
