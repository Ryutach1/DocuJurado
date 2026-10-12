import { DatosPropuestasFamiliares } from './datos-propuestas-familiares';

export interface DatosSeparacion extends DatosPropuestasFamiliares {
  domicilioPropuestoDemandante: string;
  domicilioPropuestoDemandado: string;
  medidasSolicitadas: string;
  observaciones: string;
}
