import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  nombreUsuario = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const usuario = this.authService.getUsuario();
    if (usuario && usuario.nombre) {
      this.nombreUsuario = usuario.nombre;
    } else {
      this.nombreUsuario = 'Estudiante';
    }
  }

  logout() {
    this.authService.logout();
  }
}
