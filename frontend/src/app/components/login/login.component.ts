import { Component, ChangeDetectorRef, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environtment/environtment.prod';
import Swal from 'sweetalert2';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
  email = '';
  password = '';
  recordarme = false;
  error = '';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    this.renderGoogleButton();
  }

  renderGoogleButton() {
    if (typeof google === 'undefined') {
      setTimeout(() => this.renderGoogleButton(), 500);
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleGoogleResponse.bind(this)
    });
    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', width: 350 } // El ancho en píxeles
    );
  }

  handleGoogleResponse(response: any) {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();
    
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (err) => {
        this.error = 'Error al iniciar sesión con Google';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  login() {
    // Validaciones
    if (!this.email.trim()) {
      this.error = 'Ingresa tu email o nombre de usuario';
      return;
    }
    // Si ingresó algo con @, asumimos que es correo y lo validamos
    if (this.email.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email.trim())) {
        this.error = 'Ingresa un formato de correo válido';
        return;
      }
    }
    if (!this.password) {
      this.error = 'Ingresa tu contraseña';
      return;
    }

    this.error = '';
    this.cargando = true;
    this.authService.login({ email: this.email.trim(), password: this.password }, this.recordarme).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
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