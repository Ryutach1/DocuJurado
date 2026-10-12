import { PersonaBase } from './persona-base';

export interface Demandado extends PersonaBase {
  lugarNacimiento?: string;
  fechaNacimiento?: string;
  curp?: string;
  nss?: string;
  rfc?: string;
  nombreEmpresa: string;
  domicilioEmpresa: string;
  ingresosMensuales?: number;
}
