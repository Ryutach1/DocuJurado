export interface DatosActaCivil {
  numeroActa: string;
  libro: string;
  oficialia: string;
}

export interface DatosRegistroCivil extends DatosActaCivil {
  municipio: string;
}

export interface DatosActaNacimiento extends DatosActaCivil {
  oficial: string;
  numeroCertificado: string;
}
