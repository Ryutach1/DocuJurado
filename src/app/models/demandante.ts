import { PersonaBase } from './persona-base';

export interface Demandante extends PersonaBase {
  telefono: string;
  correo?: string;
  ingresosMensuales?: number;
  clabeInterbancaria?: string;
  banco?: string;
}
