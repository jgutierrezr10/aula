import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RamoService } from '../../services/ramo.service';
import { HorarioService, BloqueHorarioDTO } from '../../services/horario.service';
import { Ramo } from '../../models/ramo.model';

@Component({
  selector: 'app-horario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './horario.html',
  styleUrl: './horario.css'
})
export class Horario implements OnInit {
  ramosCursando: Ramo[] = [];
  guardando = false;
  
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horas = [
    '08:10 - 09:30',
    '09:40 - 11:00',
    '11:10 - 12:30',
    '13:30 - 14:50',
    '15:00 - 16:20',
    '16:30 - 17:50'
  ];

  grilla: BloqueHorarioDTO[] = [];

  constructor(
    private ramoService: RamoService,
    private horarioService: HorarioService
  ) {}

  ngOnInit() {
    this.inicializarGrilla();
    this.cargarRamosCursando();
    this.cargarHorarioDesdeAPI();
  }

  inicializarGrilla() {
    this.grilla = [];
    for (let hora of this.horas) {
      for (let dia of this.dias) {
        this.grilla.push({
          id: `${dia}-${hora}`,
          dia,
          hora,
          ramoId: null
        });
      }
    }
  }

  cargarRamosCursando() {
    this.ramoService.getRamos().subscribe((ramos: Ramo[]) => {
      this.ramosCursando = ramos.filter(r => r.cursando);
    });
  }

  getBloque(dia: string, hora: string): BloqueHorarioDTO {
    return this.grilla.find(b => b.dia === dia && b.hora === hora) || { id: '', dia, hora, ramoId: null };
  }

  asignarRamo(bloque: BloqueHorarioDTO, event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    bloque.ramoId = value ? Number(value) : null;
    this.guardarHorarioEnAPI();
  }

  getRamoNombre(id: number | null): string {
    if (!id) return '';
    const ramo = this.ramosCursando.find(r => r.id === id);
    return ramo ? ramo.nombre : '';
  }

  cargarHorarioDesdeAPI() {
    this.horarioService.obtenerHorario().subscribe(bloques => {
      this.grilla = this.grilla.map(b => {
        const dbBloque = bloques.find(db => db.dia === b.dia && db.hora === b.hora);
        if (dbBloque) {
          b.ramoId = dbBloque.ramoId;
        }
        return b;
      });
    });
  }

  guardarHorarioEnAPI() {
    this.guardando = true;
    this.horarioService.guardarHorario(this.grilla).subscribe({
      next: () => {
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al guardar horario:', err);
        this.guardando = false;
        alert('Ocurrió un error al guardar tu horario.');
      }
    });
  }

  limpiarHorario() {
    if (confirm('¿Estás seguro de limpiar todo tu horario?')) {
      this.guardando = true;
      this.horarioService.limpiarHorario().subscribe({
        next: () => {
          this.grilla.forEach(b => b.ramoId = null);
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al limpiar horario:', err);
          this.guardando = false;
          alert('Ocurrió un error al limpiar tu horario.');
        }
      });
    }
  }
}
