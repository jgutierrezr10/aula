import { Injectable } from '@angular/core';

export type ModoVista = 'completo' | 'compacto';

@Injectable({ providedIn: 'root' })
export class VistaService {
  modoActual: ModoVista = this.leerModoInicial();

  constructor() {
    this.aplicarModo();
  }

  setModo(modo: ModoVista): void {
    if (this.modoActual === modo) return;
    this.modoActual = modo;
    try {
      localStorage.setItem('aula_modo_vista', modo);
    } catch {
      // La preferencia sigue aplicándose aunque el navegador bloquee el almacenamiento local.
    }
    this.aplicarModo();
  }

  get esCompacto(): boolean {
    return this.modoActual === 'compacto';
  }

  private leerModoInicial(): ModoVista {
    try {
      const guardado = localStorage.getItem('aula_modo_vista');
      if (guardado === 'completo' || guardado === 'compacto') return guardado;
    } catch {
      // Se usa un modo por defecto si el almacenamiento local no está disponible.
    }
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(max-width: 768px)').matches
      ? 'compacto'
      : 'completo';
  }

  private aplicarModo(): void {
    if (typeof document !== 'undefined') {
      document.body.dataset['viewMode'] = this.modoActual;
    }
  }
}
