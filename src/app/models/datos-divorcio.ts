import { DatosPropuestasFamiliares } from './datos-propuestas-familiares';

export interface DatosDivorcio extends DatosPropuestasFamiliares {
  duracionSeparacion: string;
  hijasHijosVivenCon: string;
  embarazoDemandado: string;
  dedicacionHogarCuidado: string;
  bienesComunes: string;
  solicitarSeparacionProvisional: boolean;
  observaciones: string;
}
