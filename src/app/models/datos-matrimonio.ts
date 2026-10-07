import { DatosRegistroCivil } from './datos-registro-civil';

export interface DatosMatrimonio {
  registro: DatosRegistroCivil;
  fechaCelebracion: string;
  lugarCelebracion: string;
  regimenPatrimonial: string;
  domicilioConyugal: string;
  fechaSeparacion: string;
}
