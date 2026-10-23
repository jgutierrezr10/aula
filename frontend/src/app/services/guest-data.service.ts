import { Injectable } from '@angular/core';
import { Ramo } from '../models/ramo.model';
import { Evaluacion } from '../models/evaluacion.model';
import type { BloqueHorarioDTO } from './horario.service';

/** Datos temporales del modo invitado: viven solo en memoria y se descartan al salir/recargar. */
@Injectable({ providedIn: 'root' })
export class GuestDataService {
  ramos: Ramo[] = [];
  evaluaciones: Evaluacion[] = [];
  horarios = new Map<number, BloqueHorarioDTO[]>();
  etiquetasHora: Record<string, string> = {};
  private nextRamoId = 1;
  private nextEvaluacionId = 1;

  reset(): void {
    this.ramos = [];
    this.evaluaciones = [];
    this.horarios.clear();
    this.etiquetasHora = {};
    this.nextRamoId = 1;
    this.nextEvaluacionId = 1;
  }

  addRamo(ramo: Ramo): Ramo {
    const creado = { ...ramo, id: this.nextRamoId++ };
    this.ramos.push(creado);
    return creado;
  }

  addEvaluacion(ev: Evaluacion): Evaluacion {
    const creada = { ...ev, id: this.nextEvaluacionId++ };
    this.evaluaciones.push(creada);
    return creada;
  }

  removeRamo(id: number): void {
    this.ramos = this.ramos.filter(r => r.id !== id);
    this.evaluaciones = this.evaluaciones.filter(ev => ev.ramoId !== id);
    this.horarios.forEach((bloques, opcion) => {
      this.horarios.set(opcion, bloques.map(b => {
        const actualizado = { ...b };
        if (actualizado.ramoId === id) { actualizado.ramoId = null; actualizado.detalle1 = ''; }
        if (actualizado.ramo2Id === id) { actualizado.ramo2Id = null; actualizado.detalle2 = ''; }
        return actualizado;
      }));
    });
  }
}
