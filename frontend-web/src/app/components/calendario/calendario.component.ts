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

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  evaluaciones: Evaluacion[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  ramos: Ramo[] = [];
  evaluaciones: Evaluacion[] = [];

  // Calendar state
  currentDate = new Date();
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  fullWeekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Selected day modal
  selectedDay: CalendarDay | null = null;
  mostrarModal = false;

  // New evaluation form
  nuevaEv: Partial<Evaluacion> = {};
  tipoEvento: 'evaluacion' | 'actividad' = 'evaluacion';
  errorMsg = '';
  guardando = false;

  loading = true;

  constructor(
    private ramoService: RamoService,
    private evaluacionService: EvaluacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Build calendar immediately so it always shows
    this.buildCalendar();
    this.loading = false;
    // Then load data in background
    this.cargarDatos();
  }

  cargarDatos() {
    this.ramoService.getRamos().subscribe({
      next: (ramos) => {
        this.ramos = ramos
          .filter(r => r.cursando)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        // Pre-select first ramo in form
        if (this.ramos.length > 0) {
          this.nuevaEv.ramoId = this.ramos[0].id;
        }
        this.cargarEvaluaciones();
      },
      error: (err) => {
        console.error('Error al cargar ramos', err);
        // Calendar already showing, just ignore
        this.cdr.detectChanges();
      }
    });
  }

  cargarEvaluaciones() {
    this.evaluacionService.getEvaluaciones().subscribe({
      next: (evs) => {
        // Normalize fecha from backend in case it's an array [YYYY, MM, DD]
        this.evaluaciones = evs.map(ev => {
          if (Array.isArray(ev.fecha)) {
            const [y, m, d] = ev.fecha;
            ev.fecha = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          }
          return ev;
        });
        
        this.buildCalendar();
        // Refresh modal if open
        if (this.selectedDay) {
          const dateStr = this.toDateStr(this.selectedDay.date);
          const refreshed = this.calendarDays.find(d => this.toDateStr(d.date) === dateStr);
          if (refreshed) this.selectedDay = refreshed;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        // Calendar already showing, just no events loaded
        this.cdr.detectChanges();
      }
    });
  }

  buildCalendar() {
    const days: CalendarDay[] = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const today = new Date();

    // Day of week for first day (0=Sun, make it Mon-based: 1=Mon...0=Sun->6)
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0 ... Sun=6

    // Fill leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(this.currentYear, this.currentMonth, -i);
      days.push(this.createDay(d, false, today));
    }

    // Fill current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      days.push(this.createDay(date, true, today));
    }

    // Fill trailing days to complete weeks
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(this.currentYear, this.currentMonth + 1, i);
      days.push(this.createDay(d, false, today));
    }

    this.calendarDays = days;

    // If modal is open for a day, refresh it
    if (this.selectedDay) {
      const dateStr = this.toDateStr(this.selectedDay.date);
      const refreshed = days.find(d => this.toDateStr(d.date) === dateStr);
      if (refreshed) this.selectedDay = refreshed;
    }
  }

  createDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dateStr = this.toDateStr(date);
    const evsDia = this.evaluaciones.filter(ev => ev.fecha === dateStr);
    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: this.toDateStr(date) === this.toDateStr(today),
      evaluaciones: evsDia
    };
  }

  toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar();
  }

  goToToday() {
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.buildCalendar();
  }

  clickDay(day: CalendarDay) {
    this.selectedDay = day;
    this.mostrarModal = true;
    this.errorMsg = '';
    this.resetForm(day);
  }

  resetForm(day: CalendarDay) {
    this.tipoEvento = 'evaluacion';
    this.nuevaEv = {
      nombre: '',
      ponderacion: 20,
      nota: undefined,
      fecha: this.toDateStr(day.date),
      ramoId: this.ramos.length > 0 ? this.ramos[0].id : undefined
    };
  }

  onTipoEventoChange() {
    if (this.tipoEvento === 'actividad') {
      this.nuevaEv.ponderacion = 0;
      this.nuevaEv.nota = undefined;
    } else {
      this.nuevaEv.ponderacion = 20;
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.selectedDay = null;
    this.errorMsg = '';
  }

  guardarEvaluacion() {
    this.errorMsg = '';
    if (!this.nuevaEv.nombre || this.nuevaEv.nombre.trim() === '') {
      this.errorMsg = 'El nombre de la evaluación es requerido.';
      return;
    }
    if (!this.nuevaEv.ramoId) {
      this.errorMsg = 'Debes seleccionar un ramo.';
      return;
    }

    if (this.tipoEvento === 'evaluacion') {
      if (this.nuevaEv.ponderacion === undefined || this.nuevaEv.ponderacion === null || this.nuevaEv.ponderacion <= 0 || this.nuevaEv.ponderacion > 100) {
        this.errorMsg = 'La ponderación debe estar entre 1% y 100%.';
        return;
      }
    } else {
      this.nuevaEv.ponderacion = 0;
      this.nuevaEv.nota = undefined;
    }

    this.guardando = true;
    const ev: Evaluacion = {
      nombre: this.nuevaEv.nombre,
      ponderacion: this.nuevaEv.ponderacion,
      nota: this.nuevaEv.nota || undefined,
      fecha: this.nuevaEv.fecha,
      ramoId: this.nuevaEv.ramoId!
    };

    this.evaluacionService.crearEvaluacion(ev).subscribe({
      next: () => {
        this.guardando = false;
        this.cargarEvaluaciones();
        // Re-open selected day after reload (handled in buildCalendar)
      },
      error: () => {
        this.guardando = false;
        this.errorMsg = 'Error al guardar la evaluación.';
      }
    });
  }

  eliminarEvaluacion(evId: number) {
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
          next: () => { this.cargarEvaluaciones(); },
          error: () => { 
            this.errorMsg = 'Error al eliminar.'; 
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  getRamoNombre(ramoId: number): string {
    return this.ramos.find(r => r.id === ramoId)?.nombre || 'Ramo';
  }

  get monthLabel(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  getColorClass(index: number): string {
    const classes = ['ev-indigo', 'ev-emerald', 'ev-amber', 'ev-rose', 'ev-violet'];
    return classes[index % classes.length];
  }

  formatNotaDisplay(nota?: number): string {
    if (nota === undefined || nota === null) return '';
    return nota.toFixed(1);
  }

  onNotaInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    val = val.replace(/[^0-9.]/g, '');

    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
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
      this.nuevaEv.nota = undefined;
    } else if (/^[1-7](\.[0-9])?$/.test(val)) {
      this.nuevaEv.nota = parseFloat(val);
    }
  }

  onNotaBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.trim();

    if (val === '') {
      this.nuevaEv.nota = undefined;
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
    this.nuevaEv.nota = num;
  }
}
