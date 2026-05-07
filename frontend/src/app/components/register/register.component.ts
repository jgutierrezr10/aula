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
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.error = '';
    this.cargando = true;
    this.authService.register({
      nombre: this.nombre,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/malla']),
      error: (err) => {
        this.error = err.error?.message || 'Error al registrarse';
        this.cargando = false;
      }
    });
  }
}