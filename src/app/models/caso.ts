import { Demandante } from './demandante';
import { Demandado } from './demandado';
import { Hijo } from './hijo';
import { Gastos } from './gastos';
import { Abogado } from './abogado';

export interface Caso {

  numeroExpediente: string;

  demandante: Demandante;

  demandado: Demandado;

  hijos: Hijo[];

  gastos: Gastos;

  abogado: Abogado;

}
