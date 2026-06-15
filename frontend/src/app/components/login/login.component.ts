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

  recuperarPassword() {
    Swal.fire({
      title: 'Recuperar Contraseña',
      text: 'Ingresa el correo electrónico asociado a tu cuenta',
      input: 'email',
      inputPlaceholder: 'tu@email.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar código',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6C63FF',
      showLoaderOnConfirm: true,
      preConfirm: (emailStr) => {
        if (!emailStr) {
          Swal.showValidationMessage('El correo es obligatorio');
          return false;
        }
        return this.authService.forgotPassword(emailStr).toPromise().catch(err => {
          Swal.showValidationMessage(err.error?.message || 'Error al solicitar recuperación');
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        // Pedir el código y la nueva contraseña
        Swal.fire({
          title: 'Código enviado',
          html: `
            <p>Revisa tu correo e ingresa el código y tu nueva contraseña.</p>
            <input type="text" id="reset-token" class="swal2-input" placeholder="Código de recuperación (UUID)">
            <input type="password" id="reset-pass" class="swal2-input" placeholder="Nueva contraseña">
          `,
          confirmButtonText: 'Cambiar contraseña',
          confirmButtonColor: '#6C63FF',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          preConfirm: () => {
            const token = (document.getElementById('reset-token') as HTMLInputElement).value;
            const newPass = (document.getElementById('reset-pass') as HTMLInputElement).value;
            if (!token || !newPass) {
              Swal.showValidationMessage('Debes ingresar el código y la nueva contraseña');
              return false;
            }
            if (newPass.length < 6) {
              Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
              return false;
            }
            return this.authService.resetPassword(token, newPass).toPromise().catch(err => {
              Swal.showValidationMessage(err.error?.message || 'Error al cambiar contraseña');
            });
          }
        }).then((resetResult) => {
          if (resetResult.isConfirmed) {
            Swal.fire({
              icon: 'success',
              title: '¡Contraseña actualizada!',
              text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
              confirmButtonColor: '#6C63FF'
            });
          }
        });
      }
    });
  }

}