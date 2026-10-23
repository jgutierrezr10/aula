import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Navbar } from '../shared/navbar/navbar';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { AdminStatsDTO, UsuarioAdminDTO, Rol } from '../../models/usuario.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  stats: AdminStatsDTO | null = null;
  usuarios: UsuarioAdminDTO[] = [];
  usuariosFiltrados: UsuarioAdminDTO[] = [];

  busqueda: string = '';
  filtroRol: string = 'TODOS';
  cargando: boolean = true;
  errorCarga: string = '';

  rolesDisponibles: { valor: Rol; label: string; icon: string; desc: string }[] = [
    { valor: 'ADMIN', label: 'Administrador', icon: 'bi-shield-check', desc: 'Acceso total y gestión del sistema' },
    { valor: 'ESTUDIANTE_BASICA', label: 'Estudiante Básica', icon: 'bi-backpack', desc: 'Educación básica y media escolar' },
    { valor: 'ESTUDIANTE_PREGRADO', label: 'Estudiante de Pregrado', icon: 'bi-mortarboard', desc: 'Universidad y educación superior' },
    { valor: 'ESTUDIANTE_POSTGRADO', label: 'Estudiante de Postgrado', icon: 'bi-award', desc: 'Magíster, doctorado y especializaciones' }
  ];

  constructor(
    private adminService: AdminService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando stats:', err);
      }
    });

    this.adminService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.filtrar();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.errorCarga = 'No se pudieron cargar los usuarios. Verifica tu conexión o permisos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    const q = this.busqueda.trim().toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const coincideTexto = !q ||
        (u.nombre && u.nombre.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const coincideRol = this.filtroRol === 'TODOS' || u.rol === this.filtroRol;

      return coincideTexto && coincideRol;
    });
  }

  setFiltroRol(rol: string): void {
    this.filtroRol = rol;
    this.filtrar();
  }

  confirmarCambioRol(usuario: UsuarioAdminDTO, nuevoRol: Rol): void {
    if (usuario.rol === nuevoRol) return;

    const labelNuevo = this.authService.getRolLabel(nuevoRol);

    Swal.fire({
      title: '¿Modificar rol?',
      html: `¿Estás seguro de asignar el rol de <strong>${labelNuevo}</strong> a <strong>${usuario.nombre}</strong> (${usuario.email})?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar rol',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#94a3b8'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.cambiarRol(usuario.id, nuevoRol).subscribe({
          next: (actualizado) => {
            usuario.rol = actualizado.rol;
            this.filtrar();
            this.adminService.getStats().subscribe(st => this.stats = st);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: `Rol cambiado a ${labelNuevo}`,
              showConfirmButton: false,
              timer: 2500
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No fue posible cambiar el rol.',
              confirmButtonColor: '#6C63FF'
            });
          }
        });
      } else {
        // Revert select back to current user role
        this.filtrar();
      }
    });
  }

  eliminarUsuario(usuario: UsuarioAdminDTO): void {
    const currentEmail = this.authService.getUsuario()?.email;
    if (currentEmail && usuario.email.toLowerCase() === currentEmail.toLowerCase()) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes eliminar tu propia cuenta de administrador.',
        confirmButtonColor: '#6C63FF'
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar usuario?',
      html: `Esta acción es irreversible. Se eliminará al usuario <strong>${usuario.nombre}</strong> y todos sus datos asociados.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarUsuario(usuario.id).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
            this.filtrar();
            this.adminService.getStats().subscribe(st => this.stats = st);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Usuario eliminado correctamente',
              showConfirmButton: false,
              timer: 2500
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: err.error?.message || 'No se pudo eliminar el usuario.',
              confirmButtonColor: '#6C63FF'
            });
          }
        });
      }
    });
  }
}
