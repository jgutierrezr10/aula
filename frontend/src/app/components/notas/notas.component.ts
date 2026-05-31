import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { RamoService } from '../../services/ramo.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { Ramo } from '../../models/ramo.model';
import { Evaluacion } from '../../models/evaluacion.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.css'
})
export class NotasComponent implements OnInit {
  ramos: Ramo[] = [];
  evaluaciones: Evaluacion[] = [];
  evaluacionesPorRamo: { [ramoId: number]: Evaluacion[] } = {};

  // Filtros
  semestreSeleccionado: number = 0; // 0 significa "Todos"
  soloCursando: boolean = true; // Por defecto mostrar solo cursando

  // Formulario de edición/creación temporal por ramo
  nuevaEv: { [ramoId: number]: Partial<Evaluacion> } = {};

  // Mensajes de error/alerta por ramo
  errorMsg: { [ramoId: number]: string } = {};

  loading = true;

  constructor(
    private ramoService: RamoService,
    private evaluacionService: EvaluacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.ramoService.getRamos().subscribe({
      next: (ramos) => {
        this.ramos = ramos;
        this.inicializarNuevasEvs();
        this.cargarEvaluaciones();
      },
      error: (err) => {
        console.error('Error al cargar ramos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarEvaluaciones() {
    this.evaluacionService.getEvaluaciones().subscribe({
      next: (evs) => {
        this.evaluaciones = evs;
        this.agruparEvaluaciones();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  inicializarNuevasEvs() {
    this.ramos.forEach(ramo => {
      if (ramo.id) {
        this.nuevaEv[ramo.id] = {
          nombre: '',
          ponderacion: 20,
          nota: undefined,
          fecha: ''
        };
        this.errorMsg[ramo.id] = '';
      }
    });
  }

  agruparEvaluaciones() {
    // Inicializar agrupador
    this.ramos.forEach(ramo => {
      if (ramo.id) {
        this.evaluacionesPorRamo[ramo.id] = [];
      }
    });

    // Agrupar
    this.evaluaciones.forEach(ev => {
      if (ev.ramoId && this.evaluacionesPorRamo[ev.ramoId]) {
        this.evaluacionesPorRamo[ev.ramoId].push(ev);
      }
    });
  }

  // Filtrado de ramos
  getRamosFiltrados(): Ramo[] {
    return this.ramos.filter(ramo => {
      const cumpleSemestre = this.semestreSeleccionado === 0 || ramo.semestre === this.semestreSeleccionado;
      const cumpleCursando = !this.soloCursando || ramo.cursando;
      return cumpleSemestre && cumpleCursando;
    });
  }

  getSumaPonderacion(ramoId: number): number {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    return evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
  }

  agregarEvaluacion(ramoId: number) {
    const form = this.nuevaEv[ramoId];
    this.errorMsg[ramoId] = '';

    if (!form.nombre || form.nombre.trim() === '') {
      this.errorMsg[ramoId] = 'Debes ingresar un nombre para la evaluación.';
      return;
    }

    if (form.ponderacion === undefined || form.ponderacion <= 0 || form.ponderacion > 100) {
      this.errorMsg[ramoId] = 'La ponderación debe ser entre 1% y 100%.';
      return;
    }

    const sumaActual = this.getSumaPonderacion(ramoId);
    if (sumaActual + form.ponderacion > 100) {
      this.errorMsg[ramoId] = `La suma de ponderaciones no puede superar el 100% (actual: ${sumaActual}%).`;
      return;
    }

    if (form.nota !== undefined && form.nota !== null) {
      if (form.nota < 1.0 || form.nota > 7.0) {
        this.errorMsg[ramoId] = 'La nota debe estar entre 1.0 y 7.0.';
        return;
      }
    }

    const evaluacionObj: Evaluacion = {
      nombre: form.nombre,
      ponderacion: form.ponderacion,
      nota: form.nota || undefined,
      fecha: form.fecha || undefined,
      ramoId: ramoId
    };

    this.evaluacionService.crearEvaluacion(evaluacionObj).subscribe({
      next: (guardada) => {
        // Recargar datos
        this.cargarDatos();
      },
      error: (err) => {
        this.errorMsg[ramoId] = 'Error al guardar la evaluación.';
        console.error(err);
      }
    });
  }

  eliminarEvaluacion(evId: number, ramoId: number) {
    Swal.fire({
      title: 'Eliminar evaluación',
      text: '¿Estás seguro de eliminar esta evaluación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.evaluacionService.eliminarEvaluacion(evId).subscribe({
          next: () => {
            this.cargarDatos();
          },
          error: (err) => {
            this.errorMsg[ramoId] = 'Error al eliminar la evaluación.';
            console.error(err);
          }
        });
      }
    });
  }

  // Edición directa de nota
  actualizarNota(ev: Evaluacion, nuevaNotaVal: any, ramoId: number) {
    this.errorMsg[ramoId] = '';
    let notaParsed: number | undefined = undefined;

    if (nuevaNotaVal !== '' && nuevaNotaVal !== null && nuevaNotaVal !== undefined) {
      notaParsed = parseFloat(nuevaNotaVal);
      if (isNaN(notaParsed) || notaParsed < 1.0 || notaParsed > 7.0) {
        this.errorMsg[ramoId] = 'La nota debe estar entre 1.0 y 7.0.';
        return;
      }
    }

    const updatedEv = { ...ev, nota: notaParsed };
    if (ev.id) {
      this.evaluacionService.actualizarEvaluacion(ev.id, updatedEv).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          this.errorMsg[ramoId] = 'Error al actualizar la nota.';
          console.error(err);
        }
      });
    }
  }

  formatFecha(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    if (Array.isArray(fecha)) {
      // Si viene como arreglo [YYYY, MM, DD] desde el backend
      const [year, month, day] = fecha;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
    if (typeof fecha === 'string') {
      // Si viene como string YYYY-MM-DD
      const parts = fecha.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return 'Fecha inválida';
  }
}
