import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RamoService } from '../../services/ramo.service';
import { Ramo } from '../../models/ramo.model';

@Component({
  selector: 'app-malla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './malla.component.html',
  styleUrl: './malla.component.css'
})
export class MallaComponent implements OnInit {

  ramos: Ramo[] = [];
  porcentaje = 0;
  nombreUsuario = '';
  semestres: number[] = [];

  mostrarFormulario = false;
  editando = false;
  ramoActual: Ramo = { nombre: '', semestre: 1, aprobado: false };

  constructor(
    private ramoService: RamoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.nombreUsuario = this.authService.getUsuario()?.nombre ?? '';
    this.cargarRamos();
  }

  cargarRamos() {
    this.ramoService.getRamos().subscribe(ramos => {
      this.ramos = ramos;
      this.semestres = [...new Set(ramos.map(r => r.semestre))].sort((a, b) => a - b);
      this.calcularAvance();
    });
  }

  calcularAvance() {
    this.ramoService.getAvance().subscribe(res => {
      this.porcentaje = res.porcentaje;
    });
  }

  getRamosPorSemestre(semestre: number): Ramo[] {
    return this.ramos.filter(r => r.semestre === semestre);
  }

  abrirFormulario() {
    this.ramoActual = { nombre: '', semestre: 1, aprobado: false };
    this.editando = false;
    this.mostrarFormulario = true;
  }

  editarRamo(ramo: Ramo) {
    this.ramoActual = { ...ramo };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  guardarRamo() {
    if (this.editando && this.ramoActual.id) {
      this.ramoService.actualizarRamo(this.ramoActual.id, this.ramoActual).subscribe(() => {
        this.mostrarFormulario = false;
        this.cargarRamos();
      });
    } else {
      this.ramoService.crearRamo(this.ramoActual).subscribe(() => {
        this.mostrarFormulario = false;
        this.cargarRamos();
      });
    }
  }

  eliminarRamo(id: number) {
    if (confirm('¿Eliminar este ramo?')) {
      this.ramoService.eliminarRamo(id).subscribe(() => this.cargarRamos());
    }
  }

  toggleAprobado(ramo: Ramo) {
    const actualizado = { ...ramo, aprobado: !ramo.aprobado };
    this.ramoService.actualizarRamo(ramo.id!, actualizado).subscribe(() => this.cargarRamos());
  }

  logout() {
    this.authService.logout();
  }
}