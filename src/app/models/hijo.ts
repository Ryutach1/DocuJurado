export interface Hijo {
  nombre: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  edad: number;
  escolaridad: string;
  generoGramatical?: '' | 'femenino' | 'masculino';
  fechaNacimiento?: string;
  actaNacimiento?: {
    numeroActa: string;
    libro: string;
    oficialia: string;
    oficial: string;
    numeroCertificado: string;
  };
  identificadorElectronicoNacimiento?: string;
}
