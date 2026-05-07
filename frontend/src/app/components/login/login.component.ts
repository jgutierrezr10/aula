import { Component } from '@angular/core';
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

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error = '';
    this.cargando = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/malla']),
      error: () => {
        this.error = 'Email o contraseña incorrectos';
        this.cargando = false;
      }
    });
  }
}