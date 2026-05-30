import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { RamoService } from '../../services/ramo.service';
import { HorarioService, BloqueHorarioDTO } from '../../services/horario.service';
import { Ramo } from '../../models/ramo.model';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  selector: 'app-horario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Navbar],
  templateUrl: './horario.html',
  styleUrl: './horario.css'
})
export class Horario implements OnInit {
  ramosCursando: Ramo[] = [];
  guardando = false;
  cargandoHorario = true;

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Nombres internos (llaves de base de datos)
  bloquesKeys = [
    'Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4',
    'Bloque 5', 'Bloque 6', 'Bloque 7', 'Bloque 8'
  ];

  // Etiquetas visuales por defecto (editables)
  etiquetasHoraPorDefecto: { [key: string]: string } = {
    'Bloque 1': '08:00 - 09:20',
    'Bloque 2': '09:30 - 10:50',
    'Bloque 3': '11:00 - 12:20',
    'Bloque 4': '12:30 - 13:50',
    'Bloque 5': '14:00 - 15:20',
    'Bloque 6': '16:00 - 17:20',
    'Bloque 7': '17:30 - 18:50',
    'Bloque 8': '19:00 - 20:10' // Aproximación para que llegue hasta las 20:00+
  };

  etiquetasHora: { [key: string]: string } = {};
  editandoBloque: string | null = null; // Guarda la llave del bloque que se está editando

  grilla: BloqueHorarioDTO[] = [];

  constructor(
    private ramoService: RamoService,
    private horarioService: HorarioService
  ) { }

  ngOnInit() {
    this.cargarEtiquetasGuardadas();
    this.inicializarGrilla();
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargandoHorario = true;
    forkJoin({
      ramos: this.ramoService.getRamos(),
      bloques: this.horarioService.obtenerHorario()
    }).subscribe({
      next: (result) => {
        this.ramosCursando = result.ramos.filter(r => r.cursando);
        
        this.grilla = this.grilla.map(b => {
          const dbBloque = result.bloques.find(db => db.dia === b.dia && db.hora === b.hora);
          if (dbBloque) {
            b.ramoId = dbBloque.ramoId;
            b.ramo2Id = dbBloque.ramo2Id;
            b.detalle1 = dbBloque.detalle1 || '';
            b.detalle2 = dbBloque.detalle2 || '';
          }
          return b;
        });

        this.cargandoHorario = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del horario:', err);
        this.cargandoHorario = false;
        Swal.fire('Atención', 'Hubo un problema al cargar tu horario', 'error');
      }
    });
  }

  cargarEtiquetasGuardadas() {
    const guardadas = localStorage.getItem('etiquetas_hora');
    if (guardadas) {
      this.etiquetasHora = JSON.parse(guardadas);
    } else {
      this.etiquetasHora = { ...this.etiquetasHoraPorDefecto };
    }
  }

  guardarEtiquetas() {
    localStorage.setItem('etiquetas_hora', JSON.stringify(this.etiquetasHora));
    this.editandoBloque = null;
  }

  iniciarEdicion(bloqueKey: string) {
    this.editandoBloque = bloqueKey;
  }

  inicializarGrilla() {
    this.grilla = [];
    for (let hora of this.bloquesKeys) {
      for (let dia of this.dias) {
        this.grilla.push({
          id: `${dia}-${hora}`,
          dia,
          hora,
          ramoId: null,
          ramo2Id: null,
          detalle1: '',
          detalle2: ''
        });
      }
    }
  }

  // Se eliminó cargarRamosCursando porque ahora está en cargarDatos

  getBloque(dia: string, hora: string): BloqueHorarioDTO {
    return this.grilla.find(b => b.dia === dia && b.hora === hora) || 
      { id: '', dia, hora, ramoId: null, ramo2Id: null, detalle1: '', detalle2: '' };
  }

  asignarRamo(bloque: BloqueHorarioDTO, value: number | null, isSegundoRamo: boolean = false) {
    if (isSegundoRamo) {
      bloque.ramo2Id = value;
    } else {
      bloque.ramoId = value;
    }
    this.guardarHorarioEnAPI();
  }

  actualizarDetalle(bloque: BloqueHorarioDTO) {
    this.guardarHorarioEnAPI();
  }

  getRamoNombre(id: number | null): string {
    if (!id) return '';
    const ramo = this.ramosCursando.find(r => r.id === id);
    return ramo ? ramo.nombre : '';
  }

  // Se eliminó cargarHorarioDesdeAPI porque ahora está en cargarDatos

  guardarHorarioEnAPI() {
    this.guardando = true;
    this.horarioService.guardarHorario(this.grilla).subscribe({
      next: () => {
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al guardar horario:', err);
        this.guardando = false;
        Swal.fire('Error', 'Ocurrió un error al guardar tu horario.', 'error');
      }
    });
  }

  limpiarHorario() {
    Swal.fire({
      title: 'Limpiar horario',
      text: '¿Estás seguro de limpiar todo tu horario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardando = true;
        this.horarioService.limpiarHorario().subscribe({
          next: () => {
            this.grilla.forEach(b => {
              b.ramoId = null;
              b.ramo2Id = null;
              b.detalle1 = '';
              b.detalle2 = '';
            });
            this.guardando = false;
          },
          error: (err) => {
            console.error('Error al limpiar horario:', err);
            this.guardando = false;
            Swal.fire('Error', 'Ocurrió un error al limpiar tu horario.', 'error');
          }
        });
      }
    });
  }
}
