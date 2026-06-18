import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

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
  recordarme = false;
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

  async olvidePassword() {
    const { value: emailToReset } = await Swal.fire({
      title: 'Recuperar Contraseña',
      input: 'email',
      inputLabel: 'Ingresa tu correo electrónico',
      inputPlaceholder: 'tu@email.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar código',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6C63FF',
      validationMessage: 'Por favor ingresa un correo válido'
    });

    if (emailToReset) {
      this.cargando = true;
      this.authService.forgotPassword(emailToReset).subscribe({
        next: async (res: any) => {
          this.cargando = false;
          await Swal.fire(
            '¡Correo Enviado!',
            res.message || `Hemos enviado un código a ${emailToReset}`,
            'success'
          );
          this.pedirCodigoReset();
        },
        error: (err) => {
          this.cargando = false;
          Swal.fire('Error', err.error?.message || 'No se pudo procesar la solicitud', 'error');
        }
      });
    }
  }

  async pedirCodigoReset() {
    const { value: formValues } = await Swal.fire({
      title: 'Restablecer contraseña',
      html:
        '<input id="swal-input-token" class="swal2-input" placeholder="Código de recuperación (Ej: uuid...)" required>' +
        '<input id="swal-input-pwd" type="password" class="swal2-input" placeholder="Nueva contraseña (min 6)" required>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cambiar contraseña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6C63FF',
      preConfirm: () => {
        const token = (document.getElementById('swal-input-token') as HTMLInputElement).value;
        const pwd = (document.getElementById('swal-input-pwd') as HTMLInputElement).value;
        if (!token || !pwd || pwd.length < 6) {
          Swal.showValidationMessage('Ingresa el código y una contraseña de al menos 6 caracteres');
        }
        return { token, newPassword: pwd };
      }
    });

    if (formValues) {
      this.cargando = true;
      this.authService.resetPassword(formValues.token, formValues.newPassword).subscribe({
        next: () => {
          this.cargando = false;
          Swal.fire('¡Éxito!', 'Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión.', 'success');
        },
        error: (err) => {
          this.cargando = false;
          Swal.fire('Error', err.error?.message || 'El código es inválido o expiró', 'error');
        }
      });
    }
  }
}