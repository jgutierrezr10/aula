import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RamoService } from '../../services/ramo.service';
import { Ramo } from '../../models/ramo.model';
import { AprobadosPipe } from '../../pipes/aprobados.pipe';

@Component({
  selector: 'app-malla',
  standalone: true,
  imports: [CommonModule, FormsModule, AprobadosPipe],
  templateUrl: './malla.component.html',
  styleUrl: './malla.component.css'
})
export class MallaComponent implements OnInit {

  ramos: Ramo[] = [];
  porcentaje = 0;
  nombreUsuario = '';
  semestres: number[] = [];

  // Modal individual
  mostrarFormulario = false;
  editando = false;
  ramoActual: Ramo = { nombre: '', semestre: 1, aprobado: false };

  // Modal múltiple por semestre
  mostrarModalMultiple = false;
  semestreSeleccionado = 1;
  ramosTexto = '';

  // Modal importar PDF/Excel
  mostrarModalImportar = false;
  archivoSeleccionado: File | null = null;
  importando = false;
  ramosImportados: Ramo[] = [];
  mostrarPreview = false;

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
      this.actualizarSemestres();
      this.calcularAvance();
    });
  }

  actualizarSemestres() {
    this.semestres = [...new Set(this.ramos.map(r => r.semestre))].sort((a, b) => a - b);
  }

  calcularAvance() {
    this.ramoService.getAvance().subscribe(res => {
      this.porcentaje = res.porcentaje;
    });
  }

  getRamosPorSemestre(semestre: number): Ramo[] {
    return this.ramos.filter(r => r.semestre === semestre);
  }

  getSemestreColorClass(semestre: number): string {
    if (semestre >= 1 && semestre <= 10) {
      return `sem-color-${semestre}`;
    }
    return 'sem-color-default';
  }

  // ─── Modal individual ───────────────────────────────
  abrirFormulario(semestre?: number) {
    this.ramoActual = { nombre: '', semestre: semestre ?? 1, aprobado: false };
    this.editando = false;
    this.mostrarFormulario = true;
  }

  editarRamo(ramo: Ramo) {
    this.ramoActual = { ...ramo };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  guardarRamo() {
    if (!this.ramoActual.nombre.trim()) return;
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

  // ─── Modal múltiple ──────────────────────────────────
  abrirModalMultiple(semestre?: number) {
    this.semestreSeleccionado = semestre ?? 1;
    this.ramosTexto = '';
    this.mostrarModalMultiple = true;
  }

  guardarMultiples() {
    const nombres = this.ramosTexto
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (nombres.length === 0) return;

    const promesas = nombres.map(nombre =>
      this.ramoService.crearRamo({
        nombre,
        semestre: this.semestreSeleccionado,
        aprobado: false
      }).toPromise()
    );

    Promise.all(promesas).then(() => {
      this.mostrarModalMultiple = false;
      this.cargarRamos();
    });
  }

  // ─── Modal importar ──────────────────────────────────
  abrirModalImportar() {
    this.archivoSeleccionado = null;
    this.ramosImportados = [];
    this.mostrarPreview = false;
    this.mostrarModalImportar = true;
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoSeleccionado = input.files[0];
      this.mostrarPreview = false;
      this.ramosImportados = [];
    }
  }

  procesarArchivo() {
    if (!this.archivoSeleccionado) return;
    this.importando = true;

    const archivo = this.archivoSeleccionado;
    const nombre = archivo.name.toLowerCase();

    if (nombre.endsWith('.csv') || nombre.endsWith('.txt')) {
      this.procesarCSV(archivo);
    } else {
      alert('Por ahora soportamos archivos .csv o .txt\nFormato: nombre,semestre (una por línea)');
      this.importando = false;
    }
  }

  procesarCSV(archivo: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target?.result as string;
      const lineas = texto.split('\n').filter(l => l.trim());
      this.ramosImportados = lineas
        .map(linea => {
          const partes = linea.split(',');
          return {
            nombre: partes[0]?.trim() ?? '',
            semestre: parseInt(partes[1]?.trim() ?? '1') || 1,
            aprobado: false
          };
        })
        .filter(r => r.nombre.length > 0);

      this.mostrarPreview = true;
      this.importando = false;
    };
    reader.readAsText(archivo);
  }

  confirmarImportacion() {
    const promesas = this.ramosImportados.map(r =>
      this.ramoService.crearRamo(r).toPromise()
    );
    Promise.all(promesas).then(() => {
      this.mostrarModalImportar = false;
      this.cargarRamos();
    });
  }

  logout() {
    this.authService.logout();
  }
}