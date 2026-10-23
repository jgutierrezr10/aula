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
}
