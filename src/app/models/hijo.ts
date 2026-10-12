import { DatosActaNacimiento } from './datos-registro-civil';

export interface Hijo {
  nombre: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  edad: number;
  escolaridad: string;
  generoGramatical?: '' | 'femenino' | 'masculino';
  fechaNacimiento?: string;
  actaNacimiento?: DatosActaNacimiento;
  identificadorElectronicoNacimiento?: string;
}
