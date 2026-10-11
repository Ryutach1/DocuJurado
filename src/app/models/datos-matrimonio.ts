import { DatosRegistroCivil } from './datos-registro-civil';

export interface DatosMatrimonio {
  registro: DatosRegistroCivil;
  fechaCelebracion: string;
  lugarCelebracion: string;
  domicilioConyugal: string;
  fechaSeparacion: string;
}
