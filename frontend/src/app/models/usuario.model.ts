export type Rol = 'ADMIN' | 'ESTUDIANTE_BASICA' | 'ESTUDIANTE_PREGRADO' | 'ESTUDIANTE_POSTGRADO' | 'INVITADO';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol?: Rol;
  verificado?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
}

export interface AuthResponse {
  token: string;
  nombre: string;
  email: string;
  rol?: Rol;
  nuevoUsuario?: boolean;
  tutorialPendiente?: boolean;
}

export interface UpdateUserRequest {
  nombre?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  rol?: Rol;
}

export interface UsuarioAdminDTO {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  verificado: boolean;
  totalRamos: number;
}

export interface AdminStatsDTO {
  totalUsuarios: number;
  totalAdmins: number;
  totalEstudiantesBasica: number;
  totalEstudiantesPregrado: number;
  totalEstudiantesPostgrado: number;
  totalMallasPredeterminadas: number;
  totalRamosRegistrados: number;
}
