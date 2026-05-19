import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login() {
    // Validaciones
    if (!this.email.trim()) {
      this.error = 'Ingresa tu email o nombre de usuario';
      return;
    }
    if (!this.password) {
      this.error = 'Ingresa tu contraseña';
      return;
    }

    this.error = '';
    this.cargando = true;
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/malla']);
      },
      error: (err) => {
        if (err && err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Email o contraseña incorrectos';
        }
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar actualización de la UI
      }
    });
  }
}