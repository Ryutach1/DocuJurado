import { Demandante } from './demandante';
import { Demandado } from './demandado';
import { Hijo } from './hijo';
import { Gastos } from './gastos';
import { Abogado } from './abogado';
import { DatosDivorcio } from './datos-divorcio';
import { DatosMatrimonio } from './datos-matrimonio';
import { DatosPension } from './datos-pension';
import { DatosSeparacion } from './datos-separacion';
import { TipoDocumento } from './tipo-documento';

export interface Caso {
  numeroExpediente: string;

  tipoDocumento: TipoDocumento;

  demandante: Demandante;

  demandado: Demandado;

  hijos: Hijo[];

  gastos: Gastos;

  abogado: Abogado;

  datosMatrimonio: DatosMatrimonio;

  datosPension: DatosPension;

  datosDivorcio: DatosDivorcio;

  datosSeparacion: DatosSeparacion;
}
