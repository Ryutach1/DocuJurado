export interface Demandado {
  nombre: string;

  edad: number;

  ocupacion: string;

  escolaridad: string;

  fechaNacimiento: Date;

  CURP: string;

  NSS?: string;

  RFC?: string;

  direccion: string;

  nombreEmpresa: string;

  domicilioEmpresa: string;

  ingresosMensuales?: number;

  nacionalidad?: string;

  estadoCivil?: string;
}
