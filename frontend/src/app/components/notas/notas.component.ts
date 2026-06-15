import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
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

  // Edición en línea de evaluaciones
  editandoEvId: number | null = null;
  evEditando: Partial<Evaluacion> = {};

  constructor(
    private ramoService: RamoService,
    private evaluacionService: EvaluacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos(silent = false) {
    if (!silent) {
      this.loading = true;
    }
    forkJoin({
      ramos: this.ramoService.getRamos(),
      evaluaciones: this.evaluacionService.getEvaluaciones()
    }).subscribe({
      next: (res) => {
        this.ramos = res.ramos;
        this.evaluaciones = res.evaluaciones;
        this.inicializarNuevasEvs();
        this.agruparEvaluaciones();
        this.crearEvaluacionesPorDefecto(silent);
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
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
      if (ev.ramoId && this.evaluacionesPorRamo[ev.ramoId] && ev.ponderacion > 0) {
        this.evaluacionesPorRamo[ev.ramoId].push(ev);
      }
    });

    // Ordenar cada grupo
    this.ramos.forEach(ramo => {
      if (ramo.id && this.evaluacionesPorRamo[ramo.id]) {
        this.evaluacionesPorRamo[ramo.id] = this.ordenarEvaluaciones(this.evaluacionesPorRamo[ramo.id]);
      }
    });
  }

  // Filtrado de ramos
  getRamosFiltrados(): Ramo[] {
    return this.ramos
      .filter(ramo => {
        const cumpleSemestre = this.semestreSeleccionado === 0 || ramo.semestre === this.semestreSeleccionado;
        const cumpleCursando = !this.soloCursando || ramo.cursando;
        return cumpleSemestre && cumpleCursando;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
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
        // Recargar datos de forma silenciosa
        this.cargarDatos(true);
      },
      error: (err) => {
        this.errorMsg[ramoId] = 'Error al guardar la evaluación.';
        this.cdr.detectChanges();
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
            this.cargarDatos(true);
          },
          error: (err) => {
            this.errorMsg[ramoId] = 'Error al eliminar la evaluación.';
            this.cdr.detectChanges();
            console.error(err);
          }
        });
      }
    });
  }

  formatNotaDisplay(nota?: number): string {
    if (nota === undefined || nota === null) return '';
    return nota.toFixed(1);
  }

  onNotaInput(event: Event, ev: Evaluacion, ramoId: number) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    // Solo permitir números y un punto decimal
    val = val.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos y limitar a 1 decimal
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Si ya hay un punto, asegurar que solo haya 1 decimal máximo
    const partsAfterDot = val.split('.');
    if (partsAfterDot.length === 2 && partsAfterDot[1].length > 1) {
      // Reemplazar el viejo decimal con el nuevo que tipeó (ej: 2.0 -> tipean 5 al final -> 2.05 -> se cambia a 2.5)
      val = partsAfterDot[0] + '.' + partsAfterDot[1].slice(-1);
    }

    // Poner el punto automáticamente si ingresan un solo dígito del 1 al 7
    if (/^[1-7]$/.test(val)) {
      val = val + '.';
    }

    // Poner el punto automáticamente si escriben dos dígitos seguidos sin él (ej: "55" -> "5.5")
    if (/^[0-9]{2}$/.test(val)) {
      val = val[0] + '.' + val[1];
    }

    // Impedir notas mayores a 7.0
    let num = parseFloat(val);
    if (!isNaN(num) && num > 7.0) {
      val = '7.0';
    }

    input.value = val;

    if (val === '') {
      this.actualizarNotaSilenciosa(ev, undefined, ramoId);
    } else if (/^[1-7](\.[0-9])?$/.test(val)) {
      const parsed = parseFloat(val);
      this.actualizarNotaSilenciosa(ev, parsed, ramoId);
    }
  }

  onNotaBlur(event: Event, ev: Evaluacion, ramoId: number) {
    const input = event.target as HTMLInputElement;
    let val = input.value.trim();

    if (val === '') {
      this.actualizarNotaSilenciosa(ev, undefined, ramoId);
      return;
    }

    let num = parseFloat(val);
    if (isNaN(num) || num < 1.0) {
      num = 1.0;
    } else if (num > 7.0) {
      num = 7.0;
    }

    num = Math.round(num * 10) / 10;
    input.value = num.toFixed(1);
    this.actualizarNotaSilenciosa(ev, num, ramoId);
  }

  onNotaInputEdit(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    val = val.replace(/[^0-9.]/g, '');

    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    const partsAfterDot = val.split('.');
    if (partsAfterDot.length === 2 && partsAfterDot[1].length > 1) {
      val = partsAfterDot[0] + '.' + partsAfterDot[1].slice(-1);
    }

    // Poner el punto automáticamente si ingresan un solo dígito del 1 al 7
    if (/^[1-7]$/.test(val)) {
      val = val + '.';
    }

    if (/^[0-9]{2}$/.test(val)) {
      val = val[0] + '.' + val[1];
    }

    let num = parseFloat(val);
    if (!isNaN(num) && num > 7.0) {
      val = '7.0';
    }

    input.value = val;

    if (val === '') {
      this.evEditando.nota = undefined;
    } else if (/^[1-7](\.[0-9])?$/.test(val)) {
      this.evEditando.nota = parseFloat(val);
    }
  }

  onNotaBlurEdit(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.trim();

    if (val === '') {
      this.evEditando.nota = undefined;
      return;
    }

    let num = parseFloat(val);
    if (isNaN(num) || num < 1.0) {
      num = 1.0;
    } else if (num > 7.0) {
      num = 7.0;
    }

    num = Math.round(num * 10) / 10;
    input.value = num.toFixed(1);
    this.evEditando.nota = num;
  }

  actualizarNotaSilenciosa(ev: Evaluacion, nota: number | undefined, ramoId: number) {
    this.errorMsg[ramoId] = '';
    
    if (ev.nota === nota) return;

    ev.nota = nota;
    this.recalcularPromedioLocal(ramoId);
    this.cdr.detectChanges();

    const updatedEv = { ...ev, nota: nota };
    if (ev.id) {
      this.evaluacionService.actualizarEvaluacion(ev.id, updatedEv).subscribe({
        next: () => {
          // No recargar los datos enteros para evitar saltos en la pantalla
          // La nota ya se actualizó de forma optimista
        },
        error: (err) => {
          this.errorMsg[ramoId] = 'Error al actualizar la nota.';
          this.cdr.detectChanges();
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

  crearEvaluacionesPorDefecto(silent = false) {
    const evsParaCrear: any[] = [];
    
    if (this.ramos.length === 0) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // Solo crear por defecto para los ramos que se están cursando
    const ramosCursando = this.ramos.filter(r => r.cursando);

    ramosCursando.forEach(ramo => {
      if (ramo.id) {
        const evsDelRamo = this.evaluacionesPorRamo[ramo.id] || [];
        if (evsDelRamo.length === 0) {
          const defaults = [
            { nombre: 'Certamen 1', ponderacion: 25, ramoId: ramo.id },
            { nombre: 'Certamen 2', ponderacion: 25, ramoId: ramo.id },
            { nombre: 'Certamen 3', ponderacion: 25, ramoId: ramo.id },
            { nombre: 'Taller', ponderacion: 25, ramoId: ramo.id }
          ];
          defaults.forEach(d => {
            evsParaCrear.push(this.evaluacionService.crearEvaluacion(d));
          });
        }
      }
    });

    if (evsParaCrear.length > 0) {
      if (!silent) {
        this.loading = true;
      }
      this.cdr.detectChanges();
      
      forkJoin(evsParaCrear).subscribe({
        next: () => {
          this.evaluacionService.getEvaluaciones().subscribe({
            next: (evs) => {
              this.evaluaciones = evs;
              this.agruparEvaluaciones();
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error al recargar evaluaciones tras crear defaults:', err);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          console.error('Error al crear evaluaciones por defecto:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getPromedioGeneral(): number | null {
    const ramosConNota = this.getRamosFiltrados().filter(r => r.nota !== null && r.nota !== undefined);
    if (ramosConNota.length === 0) return null;
    const sum = ramosConNota.reduce((acc, r) => acc + (r.nota ?? 0), 0);
    return sum / ramosConNota.length;
  }

  getAproximado(nota: number | null | undefined): string {
    if (nota === null || nota === undefined) return '--';
    return (Math.round(nota * 10) / 10).toFixed(1);
  }

  isAprobado(nota: number | null | undefined): boolean {
    if (nota === null || nota === undefined) return false;
    return (Math.round(nota * 10) / 10) >= 4.0;
  }

  isAprobadoPorAproximacion(nota: number | null | undefined): boolean {
    if (nota === null || nota === undefined) return false;
    return nota < 4.0 && this.isAprobado(nota);
  }

  getPonderacionPromedio(): number {
    const filtrados = this.getRamosFiltrados();
    if (filtrados.length === 0) return 0;
    const sum = filtrados.reduce((acc, r) => acc + this.getSumaPonderacion(r.id!), 0);
    return Math.round(sum / filtrados.length);
  }

  getTotalEvaluacionesCount(): number {
    let count = 0;
    this.getRamosFiltrados().forEach(ramo => {
      if (ramo.id && this.evaluacionesPorRamo[ramo.id]) {
        count += this.evaluacionesPorRamo[ramo.id].length;
      }
    });
    return count;
  }

  getPassingStatusMessage(ramoId: number): string {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    
    // Sum of all weights (graded + ungraded)
    const sumAllWeights = evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
    const T = Math.max(100, sumAllWeights);
    
    // Sum of graded weights and graded weighted score
    let sumGradedWeights = 0;
    let sumGradedScore = 0;
    
    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumGradedWeights += ev.ponderacion;
        sumGradedScore += ev.nota * ev.ponderacion;
      }
    });

    const remainingWeight = T - sumGradedWeights;
    
    // If no remaining weight (all evaluations graded)
    if (remainingWeight <= 0) {
      if (sumGradedWeights === 0) return 'Sin notas ingresadas';
      const finalGrade = sumGradedScore / sumGradedWeights;
      if (this.isAprobadoPorAproximacion(finalGrade)) return 'Aprobado por aproximación';
      return this.isAprobado(finalGrade) ? '¡Ramo aprobado!' : 'Ramo reprobado';
    }

    // Required grade on the remaining weight to reach an average of 4.0
    // formula: (4.0 * T - sumGradedScore) / remainingWeight
    const requiredGrade = (4.0 * T - sumGradedScore) / remainingWeight;

    if (requiredGrade <= 1.0) {
      return '¡Aprobado! (Suficiente con nota 1.0)';
    } else if (requiredGrade > 7.0) {
      return 'No alcanza (Requiere > 7.0)';
    } else {
      const rounded = Math.ceil(requiredGrade * 10) / 10;
      return `Falta nota ${rounded.toFixed(1)} prom. para pasar`;
    }
  }

  getPassingStatusClass(ramoId: number): string {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    const sumAllWeights = evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
    const T = Math.max(100, sumAllWeights);
    
    let sumGradedWeights = 0;
    let sumGradedScore = 0;
    
    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumGradedWeights += ev.ponderacion;
        sumGradedScore += ev.nota * ev.ponderacion;
      }
    });

    const remainingWeight = T - sumGradedWeights;
    
    if (remainingWeight <= 0) {
      if (sumGradedWeights === 0) return 'status-pending';
      const finalGrade = sumGradedScore / sumGradedWeights;
      if (this.isAprobadoPorAproximacion(finalGrade)) return 'status-passed status-warning';
      return this.isAprobado(finalGrade) ? 'status-passed' : 'status-failed';
    }

    const requiredGrade = (4.0 * T - sumGradedScore) / remainingWeight;

    if (requiredGrade <= 1.0) {
      return 'status-passed';
    } else if (requiredGrade > 7.0) {
      return 'status-failed';
    } else {
      return 'status-pending';
    }
  }

  getPassingStatusIcon(ramoId: number): string {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    const sumAllWeights = evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
    const T = Math.max(100, sumAllWeights);
    
    let sumGradedWeights = 0;
    let sumGradedScore = 0;
    
    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumGradedWeights += ev.ponderacion;
        sumGradedScore += ev.nota * ev.ponderacion;
      }
    });

    const remainingWeight = T - sumGradedWeights;
    
    if (remainingWeight <= 0) {
      if (sumGradedWeights === 0) return 'bi-info-circle-fill';
      const finalGrade = sumGradedScore / sumGradedWeights;
      if (this.isAprobadoPorAproximacion(finalGrade)) return 'bi-exclamation-triangle-fill';
      return this.isAprobado(finalGrade) ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    }

    const requiredGrade = (4.0 * T - sumGradedScore) / remainingWeight;

    if (requiredGrade <= 1.0) {
      return 'bi-trophy-fill';
    } else if (requiredGrade > 7.0) {
      return 'bi-x-circle-fill';
    } else {
      return 'bi-calculator';
    }
  }

  iniciarEdicion(ev: Evaluacion) {
    this.editandoEvId = ev.id || null;
    this.evEditando = { ...ev };
    
    // Normalizar formato de fecha para el input HTML5
    if (this.evEditando.fecha) {
      if (Array.isArray(this.evEditando.fecha)) {
        const [y, m, d] = this.evEditando.fecha;
        this.evEditando.fecha = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      } else if (typeof this.evEditando.fecha === 'string') {
        if (this.evEditando.fecha.includes('T')) {
          this.evEditando.fecha = this.evEditando.fecha.split('T')[0];
        }
      }
    }
  }

  cancelarEdicion() {
    this.editandoEvId = null;
    this.evEditando = {};
  }

  guardarEdicion(ramoId: number) {
    if (!this.evEditando.nombre || this.evEditando.nombre.trim() === '') {
      this.errorMsg[ramoId] = 'Debes ingresar un nombre para la evaluación.';
      return;
    }

    if (this.evEditando.ponderacion === undefined || this.evEditando.ponderacion < 0 || this.evEditando.ponderacion > 100) {
      this.errorMsg[ramoId] = 'La ponderación debe ser entre 0% y 100%.';
      return;
    }

    // Validar suma total de ponderaciones excluyendo la evaluación actual
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    const sumaExcluyendoActual = evs
      .filter(ev => ev.id !== this.editandoEvId)
      .reduce((sum, ev) => sum + ev.ponderacion, 0);

    if (sumaExcluyendoActual + this.evEditando.ponderacion > 100) {
      this.errorMsg[ramoId] = `La suma de ponderaciones no puede superar el 100% (actual: ${sumaExcluyendoActual + this.evEditando.ponderacion}%).`;
      return;
    }

    const updatedEv = { ...this.evEditando } as Evaluacion;
    if (updatedEv.ponderacion === 0) {
      updatedEv.nota = undefined;
    }

    if (this.editandoEvId) {
      this.evaluacionService.actualizarEvaluacion(this.editandoEvId, updatedEv).subscribe({
        next: () => {
          this.editandoEvId = null;
          this.evEditando = {};
          this.cargarDatos(true);
        },
        error: (err) => {
          this.errorMsg[ramoId] = 'Error al actualizar la evaluación.';
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    }
  }

  recalcularPromedioLocal(ramoId: number) {
    const ramo = this.ramos.find(r => r.id === ramoId);
    if (!ramo) return;

    const evs = this.evaluacionesPorRamo[ramoId] || [];
    let sumNotasPonderadas = 0;
    let sumPonderacionesConNota = 0;

    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumNotasPonderadas += ev.nota * ev.ponderacion;
        sumPonderacionesConNota += ev.ponderacion;
      }
    });

    if (sumPonderacionesConNota > 0) {
      let finalNota = sumNotasPonderadas / sumPonderacionesConNota;
      finalNota = Math.round(finalNota * 100.0) / 100.0;
      ramo.nota = finalNota;
    } else {
      ramo.nota = undefined;
    }
  }

  ordenarEvaluaciones(evs: Evaluacion[]): Evaluacion[] {
    return evs.sort((a, b) => {
      // 1. Comparar fechas (si existen)
      const fechaA = a.fecha ? (Array.isArray(a.fecha) ? this.arrayToDateString(a.fecha) : a.fecha) : null;
      const fechaB = b.fecha ? (Array.isArray(b.fecha) ? this.arrayToDateString(b.fecha) : b.fecha) : null;

      if (fechaA && fechaB) {
        if (fechaA !== fechaB) {
          return fechaA.localeCompare(fechaB);
        }
      } else if (fechaA && !fechaB) {
        return -1; // Con fecha va primero
      } else if (!fechaA && fechaB) {
        return 1;
      }

      // 2. Comparar pesos lógicos por nombre si no tienen fecha o tienen la misma fecha
      const pesoA = this.getLogicalWeight(a.nombre);
      const pesoB = this.getLogicalWeight(b.nombre);

      if (pesoA !== pesoB) {
        return pesoA - pesoB;
      }

      // 3. Fallback a ID
      return (a.id || 0) - (b.id || 0);
    });
  }

  private getLogicalWeight(nombre: string): number {
    const nom = nombre.toLowerCase();
    if (nom.includes('certamen 1')) return 1;
    if (nom.includes('certamen 2')) return 2;
    if (nom.includes('certamen 3')) return 3;
    if (nom.includes('taller')) return 4;
    return 100;
  }

  private arrayToDateString(fechaArr: number[]): string {
    const [y, m, d] = fechaArr;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  trackByRamo(index: number, ramo: Ramo): number {
    return ramo.id!;
  }

  trackByEv(index: number, ev: Evaluacion): number {
    return ev.id!;
  }
}
