import { Pipe, PipeTransform } from '@angular/core';
import { Ramo } from '../models/ramo.model';

@Pipe({ name: 'aprobados', standalone: true })
export class AprobadosPipe implements PipeTransform {
  transform(ramos: Ramo[]): number {
    return ramos.filter(r => r.aprobado).length;
  }
}