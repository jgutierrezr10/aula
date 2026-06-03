import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  terminosAceptados = false;
  error = '';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  register() {
    // Validaciones
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    if (!this.email.trim()) {
      this.error = 'El email es obligatorio';
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (!this.terminosAceptados) {
      this.error = 'Debes aceptar los términos y condiciones para continuar';
      return;
    }

    this.error = '';
    this.cargando = true;
    this.authService.register({
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const mensajeError = err.error?.message || 'Error al conectar con el servidor. Intenta nuevamente.';
        this.error = mensajeError;
        this.cargando = false;
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: mensajeError,
          confirmButtonColor: '#6C63FF'
        });
      }
    });
  }

  mostrarTerminos() {
    Swal.fire({
      title: 'Términos y Condiciones',
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.5;">
          <p><strong>1. Uso del Servicio:</strong> AulaProject es una herramienta para la gestión de avances curriculares y horarios. El uso indebido de la plataforma está prohibido.</p>
          <p><strong>2. Privacidad de Datos:</strong> Tus datos personales y académicos están encriptados y se almacenan de forma segura (las contraseñas se guardan hasheadas con BCrypt). No los compartiremos con terceros.</p>
          <p><strong>3. Responsabilidad:</strong> No nos hacemos responsables de problemas derivados del mal uso de la plataforma o caídas del servicio por mantenimiento.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#4f46e5'
    });
  }
}