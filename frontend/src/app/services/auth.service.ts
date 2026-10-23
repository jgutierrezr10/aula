import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UpdateUserRequest, Rol } from '../models/usuario.model';
import { environment } from '../../environtment/environtment.prod';
import { GuestDataService } from './guest-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl + '/api/auth';
  private usuarioSubject = new BehaviorSubject<AuthResponse | null>(null);
  usuario$ = this.usuarioSubject.asObservable();
  private mallaPendienteSubject = new BehaviorSubject<boolean>(false);
  mallaPendiente$ = this.mallaPendienteSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private guestData: GuestDataService) {
    const stored = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (stored) {
      const user = JSON.parse(stored);
      this.usuarioSubject.next(user);
      this.mallaPendienteSubject.next(user.tutorialPendiente ?? false);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    // Al registrar manualmente, ahora devuelve un AuthResponse sin token porque requiere verificación
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  verifyEmail(email: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, { email, code }).pipe(
      tap(res => this.guardarSesion(res, true))
    );
  }

  login(data: LoginRequest, recordarme: boolean = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.guardarSesion(res, recordarme))
    );
  }

  actualizarCuenta(data: UpdateUserRequest): Observable<AuthResponse> {
    if (this.isGuest()) {
      return new Observable(subscriber => subscriber.error(new Error('Inicia sesión para guardar cambios en tu cuenta.')));
    }
    const usuariosUrl = environment.apiUrl + '/api/usuarios';
    return this.http.put<AuthResponse>(`${usuariosUrl}/cuenta`, data).pipe(
      tap(res => {
        // Maintain the same storage type that was previously used
        const useLocalStorage = !!localStorage.getItem('usuario');
        this.guardarSesion(res, useLocalStorage);
      })
    );
  }

  loginWithGoogle(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { token }).pipe(
      tap(res => this.guardarSesion(res, true)) // Por defecto lo recordamos
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  logout() {
    this.guestData.reset();
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.mallaPendienteSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.usuarioSubject.value?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.usuarioSubject.value;
  }

  isGuest(): boolean {
    return this.getRol() === 'INVITADO';
  }

  entrarComoInvitado(): void {
    this.guestData.reset();
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    localStorage.removeItem('token');
    const guest: AuthResponse = {
      token: '', nombre: 'Invitado', email: '', rol: 'INVITADO', tutorialPendiente: false
    };
    // La sesión vive solo en memoria y se elimina al recargar o salir.
    this.usuarioSubject.next(guest);
    this.mallaPendienteSubject.next(false);
    this.router.navigate(['/dashboard']);
  }

  getUsuario(): AuthResponse | null {
    return this.usuarioSubject.value;
  }

  getRol(): Rol {
    return this.usuarioSubject.value?.rol || 'ESTUDIANTE_PREGRADO';
  }

  isAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  isOwnerAdmin(): boolean {
    return this.isAdmin() && this.usuarioSubject.value?.nombre?.toLowerCase() === 'elkiubs';
  }

  isEstudianteBasica(): boolean {
    return this.getRol() === 'ESTUDIANTE_BASICA';
  }

  isEstudiantePregrado(): boolean {
    return this.getRol() === 'ESTUDIANTE_PREGRADO';
  }

  isEstudiantePostgrado(): boolean {
    return this.getRol() === 'ESTUDIANTE_POSTGRADO';
  }

  getRolLabel(rol?: Rol): string {
    const r = rol || this.getRol();
    switch (r) {
      case 'ADMIN': return 'Administrador';
      case 'ESTUDIANTE_BASICA': return 'Estudiante Básica';
      case 'ESTUDIANTE_PREGRADO': return 'Estudiante de Pregrado';
      case 'ESTUDIANTE_POSTGRADO': return 'Estudiante de Postgrado';
      case 'INVITADO': return 'Invitado · temporal';
      default: return 'Estudiante';
    }
  }

  getRolBadgeClass(rol?: Rol): string {
    const r = rol || this.getRol();
    switch (r) {
      case 'ADMIN': return 'badge-role-admin';
      case 'ESTUDIANTE_BASICA': return 'badge-role-basica';
      case 'ESTUDIANTE_PREGRADO': return 'badge-role-pregrado';
      case 'ESTUDIANTE_POSTGRADO': return 'badge-role-postgrado';
      case 'INVITADO': return 'badge-role-invitado';
      default: return 'badge-role-pregrado';
    }
  }

  getRolIcon(rol?: Rol): string {
    const r = rol || this.getRol();
    switch (r) {
      case 'ADMIN': return 'bi-shield-check';
      case 'ESTUDIANTE_BASICA': return 'bi-backpack';
      case 'ESTUDIANTE_PREGRADO': return 'bi-mortarboard';
      case 'ESTUDIANTE_POSTGRADO': return 'bi-award';
      case 'INVITADO': return 'bi-person-walking';
      default: return 'bi-mortarboard';
    }
  }

  isMallaPendiente(): boolean {
    return this.mallaPendienteSubject.value;
  }

  completarTutorial() {
    this.mallaPendienteSubject.next(false);
    const stored = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (stored) {
      const user = JSON.parse(stored);
      user.tutorialPendiente = false;
      const dataStr = JSON.stringify(user);
      if (localStorage.getItem('usuario')) {
        localStorage.setItem('usuario', dataStr);
      } else {
        sessionStorage.setItem('usuario', dataStr);
      }
    }
  }

  private guardarSesion(res: AuthResponse, persistir: boolean = true) {
    const dataStr = JSON.stringify(res);
    if (persistir) {
      localStorage.setItem('usuario', dataStr);
      sessionStorage.removeItem('usuario');
    } else {
      sessionStorage.setItem('usuario', dataStr);
      localStorage.removeItem('usuario');
    }
    this.usuarioSubject.next(res);
    this.mallaPendienteSubject.next(res.tutorialPendiente ?? false);
  }
}
