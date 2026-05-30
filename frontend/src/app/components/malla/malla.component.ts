import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RamoService } from '../../services/ramo.service';
import { Ramo } from '../../models/ramo.model';
import { AprobadosPipe } from '../../pipes/aprobados.pipe';
import { MALLAS_PREDETERMINADAS, MallaPredeterminada } from '../../data/mallas-predeterminadas';
import { forkJoin } from 'rxjs';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  selector: 'app-malla',
  standalone: true,
  imports: [CommonModule, FormsModule, AprobadosPipe, Navbar, RouterLink],
  templateUrl: './malla.component.html',
  styleUrl: './malla.component.css'
})
export class MallaComponent implements OnInit {

  ramos: Ramo[] = [];
  porcentaje = 0;
  semestres: number[] = [];

  // Modal individual
  mostrarFormulario = false;
  editando = false;
  ramoActual: Ramo = { nombre: '', semestre: 1, aprobado: false, cursando: false };

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

  // Modal malla predeterminada
  mostrarModalMalla = false;
  mallasPredeterminadas = MALLAS_PREDETERMINADAS;
  mallaSeleccionada: MallaPredeterminada | null = null;
  cargandoMalla = false;

  // Modal confirmación
  mostrarModalConfirmacion = false;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  accionConfirmacion: () => void = () => {};

  constructor(
    private ramoService: RamoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarRamos();
  }

  cargarRamos() {
    this.ramoService.getRamos().subscribe({
      next: (ramos) => {
        this.ramos = ramos;
        this.actualizarSemestres();
        this.calcularAvance();
        this.cdr.detectChanges();
      },
      error: () => {
        this.ramos = [];
        this.semestres = [];
        this.porcentaje = 0;
        this.cdr.detectChanges();
      }
    });
  }

  actualizarSemestres() {
    this.semestres = [...new Set(this.ramos.map(r => r.semestre))].sort((a, b) => a - b);
  }

  calcularAvance() {
    this.ramoService.getAvance().subscribe({
      next: (res) => {
        this.porcentaje = res.porcentaje;
        this.cdr.detectChanges();
      },
      error: () => {
        this.porcentaje = 0;
        this.cdr.detectChanges();
      }
    });
  }

  getRamosPorSemestre(semestre: number): Ramo[] {
    return this.ramos.filter(r => r.semestre === semestre);
  }

  getCursandoCount(): number {
    return this.ramos.filter(r => r.cursando).length;
  }

  getPendienteCount(): number {
    return this.ramos.filter(r => !r.aprobado && !r.cursando).length;
  }

  getSemestreColorClass(semestre: number): string {
    if (semestre >= 1 && semestre <= 10) {
      return `sem-color-${semestre}`;
    }
    return 'sem-color-default';
  }

  // ─── Modal individual ───────────────────────────────
  abrirFormulario(semestre?: number) {
    this.ramoActual = { nombre: '', semestre: semestre ?? 1, aprobado: false, cursando: false };
    this.editando = false;
    this.mostrarFormulario = true;
  }

  editarRamo(ramo: Ramo) {
    this.ramoActual = { ...ramo };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  onAprobadoChange() {
    if (this.ramoActual.aprobado) {
      this.ramoActual.cursando = false;
    }
  }

  onCursandoChange() {
    if (this.ramoActual.cursando) {
      this.ramoActual.aprobado = false;
    }
  }

  guardarRamo() {
    if (!this.ramoActual.nombre.trim()) return;
    if (this.editando && this.ramoActual.id) {
      this.ramoService.actualizarRamo(this.ramoActual.id, this.ramoActual).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.cargarRamos();
        },
        error: () => alert('Error al actualizar el ramo')
      });
    } else {
      this.ramoService.crearRamo(this.ramoActual).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.cargarRamos();
        },
        error: () => alert('Error al crear el ramo')
      });
    }
  }

  eliminarRamo(id: number) {
    this.confirmacionTitulo = 'Eliminar ramo';
    this.confirmacionMensaje = '¿Estás seguro de que deseas eliminar este ramo?';
    this.accionConfirmacion = () => {
      this.ramoService.eliminarRamo(id).subscribe({
        next: () => {
          this.mostrarModalConfirmacion = false;
          this.cargarRamos();
        },
        error: () => alert('Error al eliminar el ramo')
      });
    };
    this.mostrarModalConfirmacion = true;
  }

  eliminarTodos() {
    this.confirmacionTitulo = 'Eliminar todos los ramos';
    this.confirmacionMensaje = '¿Estás seguro de que deseas eliminar TODOS los ramos? Esta acción no se puede deshacer.';
    this.accionConfirmacion = () => {
      this.ramoService.eliminarTodos().subscribe({
        next: () => {
          this.mostrarModalConfirmacion = false;
          this.cargarRamos();
        },
        error: () => alert('Error al eliminar todos los ramos')
      });
    };
    this.mostrarModalConfirmacion = true;
  }

  toggleEstado(ramo: Ramo) {
    let nuevoAprobado = false;
    let nuevoCursando = false;

    if (!ramo.aprobado && !ramo.cursando) {
      // De pendiente pasa a cursando
      nuevoCursando = true;
    } else if (ramo.cursando) {
      // De cursando pasa a aprobado
      nuevoAprobado = true;
    } else {
      // De aprobado pasa a pendiente
      nuevoAprobado = false;
      nuevoCursando = false;
    }

    // Guardar estado anterior por si falla
    const prevAprobado = ramo.aprobado;
    const prevCursando = ramo.cursando;

    // Update optimístico inmediato en la UI
    ramo.aprobado = nuevoAprobado;
    ramo.cursando = nuevoCursando;
    this.cdr.detectChanges();

    this.ramoService.cambiarEstado(ramo.id!, nuevoAprobado, nuevoCursando).subscribe({
      next: () => {
        this.calcularAvance();
      },
      error: () => {
        // Revertir si falla
        ramo.aprobado = prevAprobado;
        ramo.cursando = prevCursando;
        this.cdr.detectChanges();
        alert('Error al actualizar el estado');
      }
    });
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

    const peticiones = nombres.map(nombre =>
      this.ramoService.crearRamo({
        nombre,
        semestre: this.semestreSeleccionado,
        aprobado: false
      })
    );

    forkJoin(peticiones).subscribe({
      next: () => {
        this.mostrarModalMultiple = false;
        this.cargarRamos();
      },
      error: () => {
        alert('Error al agregar algunos ramos');
        this.cargarRamos();
      }
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
    const peticiones = this.ramosImportados.map(r =>
      this.ramoService.crearRamo(r)
    );

    forkJoin(peticiones).subscribe({
      next: () => {
        this.mostrarModalImportar = false;
        this.cargarRamos();
      },
      error: () => {
        alert('Error al importar algunos ramos');
        this.cargarRamos();
      }
    });
  }

  // ─── Modal malla predeterminada ─────────────────────
  abrirModalMalla() {
    this.mallaSeleccionada = null;
    this.mostrarModalMalla = true;
  }

  seleccionarMalla(malla: MallaPredeterminada) {
    this.mallaSeleccionada = malla;
  }

  confirmarCargarMalla() {
    if (!this.mallaSeleccionada) return;
    this.cargandoMalla = true;

    this.ramoService.cargarMallaPredeterminada(this.mallaSeleccionada.ramos).subscribe({
      next: () => {
        this.cargandoMalla = false;
        this.mostrarModalMalla = false;
        this.cargarRamos();
      },
      error: () => {
        this.cargandoMalla = false;
        alert('Error al cargar la malla predeterminada');
      }
    });
  }

}