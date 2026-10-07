import { DatosRegistroCivil } from './datos-registro-civil';

export interface Hijo {
  nombre: string;

  edad: number;

  escolaridad: string;

  fechaNacimiento?: string;

  lugarNacimiento?: string;

  registroCivil?: DatosRegistroCivil;
}
