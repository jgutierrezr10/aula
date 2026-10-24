import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RamoService } from '../../services/ramo.service';
import { Ramo } from '../../models/ramo.model';
import { AprobadosPipe } from '../../pipes/aprobados.pipe';
import { MallaPredeterminadaDTO } from '../../models/malla-predeterminada.model';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Navbar } from '../shared/navbar/navbar';
import { EvaluacionService } from '../../services/evaluacion.service';
import { HorarioService, BloqueHorarioDTO } from '../../services/horario.service';
import { Evaluacion } from '../../models/evaluacion.model';
import { VistaService } from '../../services/vista.service';

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
  erroresImportacion: string[] = [];
  duplicadosImportacion: string[] = [];

  // Modal malla predeterminada
  mostrarModalMalla = false;
  mallasPredeterminadas: MallaPredeterminadaDTO[] = [];
  mallaSeleccionada: MallaPredeterminadaDTO | null = null;
  cargandoMalla = false;

  // Modal confirmación
  mostrarModalConfirmacion = false;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  accionConfirmacion: () => void = () => {};

  // Tutorial
  tutorialActivo = false;
  tutorialPaso = 1;
  tutorialCargando = false;

  // Dropdowns (Agregar / Importar)
  dropdownActivo: string = '';

  constructor(
    private ramoService: RamoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionService: EvaluacionService,
    private horarioService: HorarioService,
    public vistaService: VistaService
  ) {}

  get vistaMallaCompacta(): boolean {
    return this.vistaService.esCompacto;
  }

  set vistaMallaCompacta(compacta: boolean) {
    this.vistaService.setModo(compacta ? 'compacto' : 'completo');
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tutorial'] === 'true') {
        this.tutorialActivo = true;
        this.tutorialPaso = 1;
      }
    });
    this.cargarRamos();
    this.cargarMallasPredeterminadas();
  }

  cerrarTutorial() {
    this.tutorialActivo = false;
    this.authService.completarTutorial();
    this.router.navigate(['/dashboard']);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.dropdownActivo = '';
    }
  }

  toggleDropdown(menu: string) {
    if (this.dropdownActivo === menu) {
      this.dropdownActivo = '';
    } else {
      this.dropdownActivo = menu;
    }
  }

  tutorialSiguiente() {
    if (this.tutorialPaso === 2 && this.ramos.length === 0) {
      Swal.fire('Atención', 'Primero carga una malla o agrega ramos para continuar', 'warning');
      return;
    }
    if (this.tutorialPaso < 4) {
      this.tutorialPaso++;
    }
    if (this.tutorialPaso === 4) {
      this.authService.completarTutorial();
    }
    this.cdr.detectChanges();
  }

  tutorialAnterior() {
    if (this.tutorialPaso > 1) {
      this.tutorialPaso--;
    }
  }

  tutorialSaltar() {
    if (this.ramos.length > 0) {
      this.cerrarTutorial();
    } else {
      Swal.fire('Atención', 'Debes cargar al menos un ramo para continuar', 'warning');
    }
  }

  cargarMallasPredeterminadas() {
    this.ramoService.obtenerMallasPredeterminadas().subscribe({
      next: (mallas) => {
        this.mallasPredeterminadas = mallas;
      },
      error: () => {
        console.error('No se pudieron cargar las mallas predeterminadas');
      }
    });
  }

  get esElkiubs(): boolean {
    const usuario = this.authService.getUsuario();
    return usuario?.nombre?.toLowerCase() === 'elkiubs';
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
        error: () => Swal.fire('Atención', 'Error al actualizar el ramo', 'warning')
      });
    } else {
      this.ramoService.crearRamo(this.ramoActual).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.cargarRamos();
          if (this.tutorialActivo && this.tutorialPaso === 2) {
            this.tutorialPaso = 3;
            this.authService.completarTutorial();
            this.cdr.detectChanges();
          }
        },
        error: () => Swal.fire('Atención', 'Error al crear el ramo', 'warning')
      });
    }
  }

  eliminarRamo(id: number) {
    Swal.fire({
      title: 'Eliminar ramo',
      text: '¿Estás seguro de que deseas eliminar este ramo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ramoService.eliminarRamo(id).subscribe({
          next: () => {
            this.cargarRamos();
          },
          error: () => Swal.fire('Atención', 'Error al eliminar el ramo', 'warning')
        });
      }
    });
  }

  eliminarTodos() {
    Swal.fire({
      title: 'Eliminar todos los ramos',
      text: 'Se eliminarán tus ramos, evaluaciones y bloques de horario. Descargaremos un respaldo JSON antes de borrar para que puedas restaurarlo después.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar TODO',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        forkJoin({
          ramos: this.ramoService.getRamos(),
          evaluaciones: this.evaluacionService.getEvaluaciones(),
          horario1: this.horarioService.obtenerHorario(1),
          horario2: this.horarioService.obtenerHorario(2)
        }).subscribe({
          next: (res) => {
            this.descargarRespaldo({ version: 1, exportado: new Date().toISOString(), ...res });
            this.ramoService.eliminarTodos().subscribe({
              next: () => this.cargarRamos(),
              error: () => Swal.fire('Atención', 'No se pudieron eliminar los ramos. El respaldo JSON ya fue descargado.', 'warning')
            });
          },
          error: () => Swal.fire('No se pudo crear el respaldo', 'No se eliminó ningún dato. Revisa tu conexión e inténtalo otra vez.', 'error')
        });
      }
    });
  }

  private descargarRespaldo(datos: unknown) {
    const blob = new Blob([JSON.stringify(datos, null, 2) ?? '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aula-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async restaurarRespaldo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (backup.version !== 1 || !Array.isArray(backup.ramos) || !Array.isArray(backup.evaluaciones)) {
        throw new Error('El archivo no tiene el formato de respaldo AULA.');
      }
      const confirm = await Swal.fire({
        title: 'Restaurar respaldo',
        text: 'Se reemplazarán los ramos, evaluaciones y horarios actuales con los datos del respaldo seleccionado.',
        icon: 'warning', showCancelButton: true, confirmButtonText: 'Restaurar respaldo', cancelButtonText: 'Cancelar'
      });
      if (!confirm.isConfirmed) return;

      const respaldoActual = await firstValueFrom(forkJoin({
        ramos: this.ramoService.getRamos(),
        evaluaciones: this.evaluacionService.getEvaluaciones(),
        horario1: this.horarioService.obtenerHorario(1),
        horario2: this.horarioService.obtenerHorario(2)
      }));
      if (respaldoActual.ramos.length || respaldoActual.evaluaciones.length) {
        this.descargarRespaldo({ version: 1, exportado: new Date().toISOString(), ...respaldoActual });
      }
      await firstValueFrom(this.ramoService.eliminarTodos());
      const ids = new Map<number, number>();
      for (const ramo of backup.ramos as Ramo[]) {
        const nuevo = await firstValueFrom(this.ramoService.crearRamo({
          nombre: ramo.nombre, semestre: ramo.semestre, aprobado: ramo.aprobado,
          cursando: ramo.cursando, nota: ramo.nota
        }));
        if (ramo.id && nuevo.id) ids.set(ramo.id, nuevo.id);
      }
      for (const ev of backup.evaluaciones as Evaluacion[]) {
        const ramoId = ids.get(ev.ramoId);
        if (ramoId) await firstValueFrom(this.evaluacionService.crearEvaluacion({ ...ev, id: undefined, ramoId }));
      }
      for (const opcion of [1, 2]) {
        const horario = backup[`horario${opcion}`] as BloqueHorarioDTO[] | undefined;
        if (horario) {
          const restaurado = horario.map(b => ({ ...b, id: `${b.dia}-${b.hora}`, ramoId: b.ramoId ? ids.get(b.ramoId) ?? null : null, ramo2Id: b.ramo2Id ? ids.get(b.ramo2Id) ?? null : null }));
          await firstValueFrom(this.horarioService.guardarHorario(restaurado, opcion));
        }
      }
      this.cargarRamos();
      await Swal.fire('Respaldo restaurado', 'Tus ramos, evaluaciones y horarios ya están disponibles.', 'success');
    } catch (error: any) {
      Swal.fire('No se pudo restaurar', error?.message || 'El respaldo está dañado o no se pudo guardar.', 'error');
    } finally {
      input.value = '';
    }
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

    // Intentar PATCH primero, si falla hacer fallback a PUT
    this.ramoService.cambiarEstado(ramo.id!, nuevoAprobado, nuevoCursando).subscribe({
      next: () => {
        this.calcularAvance();
      },
      error: () => {
        // Fallback: intentar con PUT completo
        const actualizado = { ...ramo, aprobado: nuevoAprobado, cursando: nuevoCursando };
        this.ramoService.actualizarRamo(ramo.id!, actualizado).subscribe({
          next: () => {
            this.calcularAvance();
          },
          error: () => {
            // Revertir si ambos fallan
            ramo.aprobado = prevAprobado;
            ramo.cursando = prevCursando;
            this.cdr.detectChanges();
            Swal.fire('Atención', 'Error al actualizar el estado', 'warning');
          }
        });
      }
    });
  }

  toggleSemestre(sem: number) {
    const ramosSemestre = this.getRamosPorSemestre(sem);
    if (ramosSemestre.length === 0) return;

    // Determinar el nuevo estado basado en el primer ramo del semestre
    const primerRamo = ramosSemestre[0];
    let nuevoAprobado = false;
    let nuevoCursando = false;

    if (!primerRamo.aprobado && !primerRamo.cursando) {
      nuevoCursando = true;
    } else if (primerRamo.cursando) {
      nuevoAprobado = true;
    } else {
      nuevoAprobado = false;
      nuevoCursando = false;
    }

    // Update optimístico para todo el semestre
    ramosSemestre.forEach(ramo => {
      ramo.aprobado = nuevoAprobado;
      ramo.cursando = nuevoCursando;
    });
    this.cdr.detectChanges();

    const estadosBulk = ramosSemestre.map(ramo => ({
      id: ramo.id!,
      aprobado: nuevoAprobado,
      cursando: nuevoCursando
    }));

    this.ramoService.cambiarEstadoBulk(estadosBulk).subscribe({
      next: () => {
        this.calcularAvance();
      },
      error: () => {
        Swal.fire('Atención', 'Hubo un error al actualizar los estados del semestre. Se recargarán los datos.', 'warning');
        this.cargarRamos();
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
        if (this.tutorialActivo && this.tutorialPaso === 2) {
          this.tutorialPaso = 3;
          this.authService.completarTutorial();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        Swal.fire('Atención', 'Error al agregar algunos ramos', 'warning');
        this.cargarRamos();
      }
    });
  }

  // ─── Modal importar ──────────────────────────────────
  abrirModalImportar() {
    this.archivoSeleccionado = null;
    this.ramosImportados = [];
    this.erroresImportacion = [];
    this.duplicadosImportacion = [];
    this.mostrarPreview = false;
    this.mostrarModalImportar = true;
  }

  abrirSelectorBackup() {
    document.getElementById('aula-backup-file')?.click();
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
      Swal.fire('Atención', 'Por ahora soportamos archivos .csv o .txt\nFormato: nombre,semestre (una por línea)', 'warning');
      this.importando = false;
    }
  }

  procesarCSV(archivo: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target?.result as string;
      const nombresExistentes = new Set(this.ramos.map(r => r.nombre.trim().toLocaleLowerCase()));
      const nombresArchivo = new Set<string>();
      this.ramosImportados = [];
      this.erroresImportacion = [];
      this.duplicadosImportacion = [];
      texto.split(/\r?\n/).forEach((linea, index) => {
        if (!linea.trim()) return;
        const partes = linea.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(p => p.trim().replace(/^\"|\"$/g, ''));
        const nombre = partes[0] ?? '';
        const semestre = Number(partes[1] ?? 1);
        if (index === 0 && /nombre/i.test(nombre) && /semestre/i.test(partes[1] ?? '')) return;
        if (!nombre || !Number.isInteger(semestre) || semestre < 1 || semestre > 12) {
          this.erroresImportacion.push(`Línea ${index + 1}: nombre obligatorio y semestre entero entre 1 y 12.`);
          return;
        }
        const key = nombre.toLocaleLowerCase();
        if (nombresExistentes.has(key) || nombresArchivo.has(key)) {
          this.duplicadosImportacion.push(`Línea ${index + 1}: ${nombre}`);
          return;
        }
        nombresArchivo.add(key);
        this.ramosImportados.push({ nombre, semestre, aprobado: false, cursando: false });
      });

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
        if (this.tutorialActivo && this.tutorialPaso === 2) {
          this.tutorialPaso = 3;
          this.authService.completarTutorial();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        Swal.fire('Atención', 'Error al importar algunos ramos', 'warning');
        this.cargarRamos();
      }
    });
  }

  // ─── Modal malla predeterminada ─────────────────────
  abrirModalMalla() {
    this.mallaSeleccionada = null;
    this.mostrarModalMalla = true;
    this.cargarMallasPredeterminadas();
  }

  seleccionarMalla(malla: MallaPredeterminadaDTO) {
    this.mallaSeleccionada = malla;
  }

  eliminarMallaPredeterminada(event: Event, id: number | undefined) {
    event.stopPropagation();
    if (!id) return;
    
    Swal.fire({
      title: 'Eliminar malla',
      text: '¿Estás seguro de que deseas eliminar esta malla global?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ramoService.eliminarMallaPredeterminada(id).subscribe({
          next: () => {
            this.cargarMallasPredeterminadas();
            if (this.mallaSeleccionada?.id === id) {
              this.mallaSeleccionada = null;
            }
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la malla', 'error')
        });
      }
    });
  }

  confirmarCargarMalla() {
    if (!this.mallaSeleccionada) return;
    this.cargandoMalla = true;
    
    // Transformar a formato Ramo que espera el backend para bulk
    const ramosPayload: Ramo[] = this.mallaSeleccionada.ramos.map(r => ({
      nombre: r.nombre,
      semestre: r.semestre,
      aprobado: false,
      cursando: false
    }));

    this.ramoService.cargarMallaPredeterminada(ramosPayload).subscribe({
      next: () => {
        this.cargandoMalla = false;
        this.mostrarModalMalla = false;
        this.cargarRamos();
        if (this.tutorialActivo && this.tutorialPaso === 2) {
          this.tutorialPaso = 3;
          this.authService.completarTutorial();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.cargandoMalla = false;
        Swal.fire('Atención', 'Error al cargar la malla predeterminada', 'warning');
      }
    });
  }

  async compartirMalla() {
    if (this.ramos.length === 0) {
      Swal.fire('Atención', 'No tienes ramos para compartir', 'warning');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: '<div style="display:flex; align-items:center; justify-content:center; gap:10px;"><i class="bi bi-share-fill" style="color:#6C63FF"></i> Compartir Malla</div>',
      html: `
        <div style="text-align: left; padding: 0 5px;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 24px; line-height: 1.5; text-align: center;">
            Publica tu configuración de ramos para que otros estudiantes de tu misma carrera puedan usarla como plantilla inicial.
          </p>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 8px;">
              <i class="bi bi-mortarboard-fill" style="color: #6C63FF; margin-right: 6px;"></i> Carrera
            </label>
            <input id="swal-input-nombre" class="swal2-input" style="margin: 0; width: 100%; font-size: 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; box-sizing: border-box; box-shadow: none;" placeholder="Ej: Ingeniería Civil Informática" required>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 8px;">
              <i class="bi bi-building" style="color: #6C63FF; margin-right: 6px;"></i> Universidad o Institución
            </label>
            <input id="swal-input-univ" class="swal2-input" style="margin: 0; width: 100%; font-size: 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; box-sizing: border-box; box-shadow: none;" placeholder="Ej: Universidad de Santiago" required>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 8px;">
              <i class="bi bi-card-text" style="color: #6C63FF; margin-right: 6px;"></i> Descripción breve
            </label>
            <textarea id="swal-input-desc" class="swal2-textarea" style="margin: 0; width: 100%; height: 85px; font-size: 14px; resize: none; border-radius: 10px; border: 1.5px solid #e2e8f0; box-sizing: border-box; box-shadow: none;" placeholder="Plan 2024, incluye electivos de mención..." required></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-send-fill" style="margin-right: 6px;"></i> Publicar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#94a3b8',
      background: 'var(--bg-card, #ffffff)',
      customClass: {
        popup: 'premium-swal-popup'
      },
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input-nombre') as HTMLInputElement).value;
        const univ = (document.getElementById('swal-input-univ') as HTMLInputElement).value;
        const desc = (document.getElementById('swal-input-desc') as HTMLTextAreaElement).value;
        if (!nombre || !univ || !desc) {
          Swal.showValidationMessage('Por favor completa todos los campos para publicar');
        }
        return { nombre, univ, desc };
      }
    });

    if (formValues) {
      const payload: MallaPredeterminadaDTO = {
        nombre: formValues.nombre,
        universidad: formValues.univ,
        descripcion: formValues.desc,
        icono: 'bi-grid-3x3-gap-fill',
        totalRamos: this.ramos.length,
        semestres: Math.max(...this.ramos.map(r => r.semestre)),
        ramos: this.ramos.map(r => ({ nombre: r.nombre, semestre: r.semestre }))
      };

      this.ramoService.publicarMallaPredeterminada(payload).subscribe({
        next: (nuevaMalla) => {
          this.mallasPredeterminadas.push(nuevaMalla);
          Swal.fire('¡Éxito!', 'Tu malla ha sido compartida con todos', 'success');
        },
        error: () => {
          Swal.fire('Error', 'No se pudo publicar la malla', 'error');
        }
      });
    }
  }

  // ══════════════════════════════════════
  // IMPORTAR CON IA
  // ══════════════════════════════════════

  async importarConIA() {
    await Swal.fire({
      icon: 'info',
      title: 'La lectura de mallas con IA llegará pronto',
      text: 'Por ahora puedes importar tu malla desde un archivo CSV o TXT, o agregar los ramos manualmente.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6C63FF'
    });
  }

}
