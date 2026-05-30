import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

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
        this.error = err.error?.message || 'Error al registrarse';
        this.cargando = false;
      }
    });
  }
}