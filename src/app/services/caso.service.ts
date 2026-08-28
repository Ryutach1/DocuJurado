import { Injectable } from '@angular/core';

import { Caso } from '../models/caso';
import { Demandante } from '../models/demandante';
import { Demandado } from '../models/demandado';
import { Hijo } from '../models/hijo';
import { Gastos } from '../models/gastos';
import { Abogado } from '../models/abogado';
import { ConceptoGasto } from '../models/concepto-gasto';

@Injectable({
  providedIn: 'root'
})
export class CasoService {

  private caso: Caso = {

    numeroExpediente: '',

    demandante: {
      nombre: '',
      edad: 0,
      ocupacion: '',
      escolaridad: '',
      telefono: '',
      correo: '',
      direccion: ''
    },

    demandado: {
      nombre: '',
      edad: 0,
      ocupacion: '',
      escolaridad: '',
      fechaNacimiento: new Date(),
      CURP: '',
      NSS: '',
      RFC: '',
      direccion: '',
      nombreEmpresa: '',
      domicilioEmpresa: '',
      ingresosMensuales: 0
    },

    hijos: [],

    gastos: {
      habitacion: {
        monto: 0,
        periodicidad: 'Mensual'
      },
      higiene: {
        monto: 0,
        periodicidad: 'Mensual'
      },
      transporte: {
        monto: 0,
        periodicidad: 'Mensual'
      },
      vestido: {
        monto: 0,
        periodicidad: 'Por temporada'
      },
      despensa: {
        monto: 0,
        periodicidad: 'Semanal'
      },
      salud: {
        monto: 0,
        periodicidad: 'Mensual'
      }
    },

    abogado: {
      nombre: '',
      cedulaProfesional: 0
    }

  };

  //====================================================
  // GETTERS
  //====================================================

  obtenerCaso(): Caso {
    return this.caso;
  }

  obtenerDemandante(): Demandante {
    return this.caso.demandante;
  }

  obtenerDemandado(): Demandado {
    return this.caso.demandado;
  }

  obtenerHijos(): Hijo[] {
    return this.caso.hijos;
  }

  obtenerGastos(): Gastos {
    return this.caso.gastos;
  }

  obtenerAbogado(): Abogado {
    return this.caso.abogado;
  }

  //====================================================
  // SETTERS
  //====================================================

  actualizarCaso(caso: Caso): void {
    this.caso = caso;
  }

  actualizarDemandante(demandante: Demandante): void {
    this.caso.demandante = demandante;
  }

  actualizarDemandado(demandado: Demandado): void {
    this.caso.demandado = demandado;
  }

  actualizarHijos(hijos: Hijo[]): void {
    this.caso.hijos = hijos;
  }

  agregarHijo(hijo: Hijo): void {
    this.caso.hijos.push(hijo);
  }

  eliminarHijo(indice: number): void {
    this.caso.hijos.splice(indice, 1);
  }

  actualizarGastos(gastos: Gastos): void {
    this.caso.gastos = gastos;
  }

  actualizarAbogado(abogado: Abogado): void {
    this.caso.abogado = abogado;
  }

  actualizarNumeroExpediente(numero: string): void {
    this.caso.numeroExpediente = numero;
  }

  //====================================================
  // UTILIDADES
  //====================================================

  limpiarCaso(): void {

    this.caso = {

      numeroExpediente: '',

      demandante: {
        nombre: '',
        edad: 0,
        ocupacion: '',
        escolaridad: '',
        telefono: '',
        correo: '',
        direccion: ''
      },

      demandado: {
        nombre: '',
        edad: 0,
        ocupacion: '',
        escolaridad: '',
        fechaNacimiento: new Date(),
        CURP: '',
        NSS: '',
        RFC: '',
        direccion: '',
        nombreEmpresa: '',
        domicilioEmpresa: '',
        ingresosMensuales: 0
      },

      hijos: [],

      gastos: {
        habitacion: {
          monto: 0,
          periodicidad: 'Mensual'
        },
        higiene: {
          monto: 0,
          periodicidad: 'Mensual'
        },
        transporte: {
          monto: 0,
          periodicidad: 'Mensual'
        },
        vestido: {
          monto: 0,
          periodicidad: 'Por temporada'
        },
        despensa: {
          monto: 0,
          periodicidad: 'Semanal'
        },
        salud: {
          monto: 0,
          periodicidad: 'Mensual'
        }

      },

      abogado: {
        nombre: '',
        cedulaProfesional: 0
      }

    };

  }

}
