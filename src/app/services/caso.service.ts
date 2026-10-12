import { Injectable } from '@angular/core';

import { Caso } from '../models/caso';
import { Demandante } from '../models/demandante';
import { Demandado } from '../models/demandado';
import { Hijo } from '../models/hijo';
import { Gastos } from '../models/gastos';
import { Abogado } from '../models/abogado';
import { CONCEPTOS_GASTO } from '../models/concepto-gasto';
import { TipoDocumento } from '../models/tipo-documento';

function crearGastosVacios(): Gastos {
  return Object.fromEntries(
    CONCEPTOS_GASTO.map(({ clave, periodo }) => [clave, { monto: 0, periodicidad: periodo }]),
  ) as Gastos;
}

function crearCasoVacio(): Caso {
  return {
    numeroExpediente: '',
    tipoDocumento: 'pension',
    demandante: {
      nombre: '',
      edad: 0,
      ocupacion: '',
      escolaridad: '',
      telefono: '',
      correo: '',
      direccion: '',
      ingresosMensuales: 0,
      clabeInterbancaria: '',
      banco: '',
    },
    demandado: {
      nombre: '',
      edad: 0,
      ocupacion: '',
      escolaridad: '',
      direccion: '',
      lugarNacimiento: '',
      fechaNacimiento: '',
      curp: '',
      nss: '',
      rfc: '',
      nombreEmpresa: '',
      domicilioEmpresa: '',
      ingresosMensuales: 0,
    },
    hijos: [],
    gastos: crearGastosVacios(),
    abogado: {
      nombre: '',
      cedulaProfesional: 0,
      fechaRecepcionPapeleria: '',
      nombreReceptora: '',
    },
    datosMatrimonio: {
      registro: {
        numeroActa: '',
        libro: '',
        oficialia: '',
        municipio: '',
      },
      fechaCelebracion: '',
      lugarCelebracion: '',
      domicilioConyugal: '',
      fechaSeparacion: '',
    },
    datosPension: {
      modalidadLaboral: 'con-relacion-laboral',
      porcentajeSolicitado: '',
      montoSolicitado: 0,
      situacionLaboralDemandado: '',
      observaciones: '',
    },
    datosDivorcio: {
      domicilioConyugal: '',
      fechaSeparacion: '',
      duracionSeparacion: '',
      hijasHijosVivenCon: '',
      embarazoDemandado: '',
      dedicacionHogarCuidado: '',
      propuestaGuardaCustodia: '',
      propuestaConvivencia: '',
      propuestaPension: '',
      bienesComunes: '',
      solicitarSeparacionProvisional: false,
      observaciones: '',
    },
    datosSeparacion: {
      domicilioConyugal: '',
      domicilioPropuestoDemandante: '',
      domicilioPropuestoDemandado: '',
      fechaSeparacion: '',
      propuestaGuardaCustodia: '',
      propuestaConvivencia: '',
      propuestaPension: '',
      medidasSolicitadas: '',
      observaciones: '',
    },
  };
}

@Injectable({
  providedIn: 'root',
})
export class CasoService {
  private caso: Caso = crearCasoVacio();

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

  actualizarTipoDocumento(tipoDocumento: TipoDocumento): void {
    this.caso.tipoDocumento = tipoDocumento;
  }

  actualizarDatosMatrimonio(datos: Caso['datosMatrimonio']): void {
    this.caso.datosMatrimonio = datos;
  }

  actualizarDatosPension(datos: Caso['datosPension']): void {
    this.caso.datosPension = datos;
  }

  actualizarDatosDivorcio(datos: Caso['datosDivorcio']): void {
    this.caso.datosDivorcio = datos;
  }

  actualizarDatosSeparacion(datos: Caso['datosSeparacion']): void {
    this.caso.datosSeparacion = datos;
  }

  //====================================================
  // UTILIDADES
  //====================================================

  limpiarCaso(): void {
    this.caso = crearCasoVacio();
  }
}
