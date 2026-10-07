import { ModalidadLaboral } from './tipo-documento';

export interface DatosPension {
  modalidadLaboral: ModalidadLaboral;
  porcentajeSolicitado: string;
  montoSolicitado: number;
  situacionLaboralDemandado: string;
  observaciones: string;
}
