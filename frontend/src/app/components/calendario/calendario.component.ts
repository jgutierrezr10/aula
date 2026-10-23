import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class CalendarioComponent implements OnInit, OnDestroy {
  ramos: Ramo[] = [];
  ramosCursando: Ramo[] = [];
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
  cargaError = false;
  ramoFiltro = '';
  readonly recordatorios = [0, 10, 30, 60, 1440];
  permisoNotificaciones: NotificationPermission | 'unsupported' = typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
  private reminderInterval: ReturnType<typeof setInterval> | null = null;

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
    this.loading = true;
    forkJoin({
      ramos: this.ramoService.getRamos(),
      evaluaciones: this.evaluacionService.getEvaluaciones()
    }).subscribe({
      next: (res) => {
        this.cargaError = false;
        this.ramos = res.ramos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.ramosCursando = this.ramos.filter(r => r.cursando);
        
        if (this.ramosCursando.length > 0) {
          this.nuevaEv.ramoId = this.ramosCursando[0].id;
        }

        this.evaluaciones = res.evaluaciones.map(ev => {
          if (Array.isArray(ev.fecha)) {
            const [y, m, d] = ev.fecha;
            ev.fecha = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          }
          return ev;
        });
        
        this.buildCalendar();
        this.planificarRevisionRecordatorios();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.cargaError = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.reminderInterval) clearInterval(this.reminderInterval);
  }

  async activarRecordatorios() {
    if (typeof Notification === 'undefined') return;
    this.permisoNotificaciones = await Notification.requestPermission();
    if (this.permisoNotificaciones === 'granted') this.planificarRevisionRecordatorios();
  }

  private planificarRevisionRecordatorios() {
    if (this.reminderInterval) clearInterval(this.reminderInterval);
    if (this.permisoNotificaciones !== 'granted') return;
    this.revisarRecordatorios();
    this.reminderInterval = setInterval(() => this.revisarRecordatorios(), 30_000);
  }

  private revisarRecordatorios() {
    const ahora = Date.now();
    for (const ev of this.evaluaciones) {
      if (!ev.id || !ev.fecha || !ev.hora || !ev.recordatorioMinutos) continue;
      const horaEvento = new Date(`${ev.fecha}T${ev.hora}:00`).getTime();
      const horaAviso = horaEvento - ev.recordatorioMinutos * 60_000;
      const key = `aula-recordatorio-${ev.id}-${ev.fecha}-${ev.hora}`;
      if (ahora >= horaAviso && ahora < horaEvento && !sessionStorage.getItem(key)) {
        new Notification(`Recordatorio: ${ev.nombre}`, { body: `${this.getRamoNombre(ev.ramoId)} · ${this.formatFechaAgenda(ev.fecha)} a las ${ev.hora}` });
        sessionStorage.setItem(key, '1');
      }
    }
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
        this.planificarRevisionRecordatorios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.cargaError = true;
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
    const evsDia = this.evaluaciones.filter(ev => ev.fecha === dateStr && (!this.ramoFiltro || String(ev.ramoId) === this.ramoFiltro));
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

  cambiarFiltroRamo(value: string) {
    this.ramoFiltro = value;
    this.buildCalendar();
  }

  get eventosAgenda(): Evaluacion[] {
    const hoy = this.toDateStr(new Date());
    return this.evaluaciones
      .filter(ev => !!ev.fecha && ev.fecha >= hoy && (!this.ramoFiltro || String(ev.ramoId) === this.ramoFiltro))
      .sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora || '99:99').localeCompare(b.hora || '99:99'));
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
      ramoId: this.ramosCursando.length > 0 ? this.ramosCursando[0].id : undefined,
      tipoEvento: 'evaluacion',
      hora: '',
      recordatorioMinutos: 0
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
    if ((this.nuevaEv.recordatorioMinutos || 0) > 0 && !this.nuevaEv.hora) {
      this.errorMsg = 'Indica una hora para poder activar el recordatorio.';
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
      ramoId: this.nuevaEv.ramoId!,
      tipoEvento: this.tipoEvento,
      hora: this.nuevaEv.hora || undefined,
      recordatorioMinutos: this.nuevaEv.recordatorioMinutos || 0
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

  formatFechaAgenda(fecha?: string): string {
    if (!fecha) return 'Fecha por definir';
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  textoRecordatorio(minutos?: number): string {
    if (!minutos) return 'Sin recordatorio';
    if (minutos < 60) return `${minutos} minutos antes`;
    if (minutos < 1440) return `${minutos / 60} hora${minutos === 60 ? '' : 's'} antes`;
    return '1 día antes';
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

    const partsAfterDot = val.split('.');
    if (partsAfterDot.length === 2 && partsAfterDot[1].length > 1) {
      val = partsAfterDot[0] + '.' + partsAfterDot[1].slice(-1);
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
