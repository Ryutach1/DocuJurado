export interface ConceptoGasto {
  monto: number;
  periodicidad: string;
}

export const CONCEPTOS_GASTO = [
  {
    clave: 'habitacion',
    nombre: 'Habitación',
    descripcion: 'Servicios públicos y mantenimiento del hogar',
    periodo: 'Mensual',
  },
  {
    clave: 'higiene',
    nombre: 'Higiene',
    descripcion: 'Artículos de higiene personal',
    periodo: 'Mensual',
  },
  {
    clave: 'transporte',
    nombre: 'Transporte',
    descripcion: 'Traslados de los menores',
    periodo: 'Mensual',
  },
  {
    clave: 'vestido',
    nombre: 'Vestido y calzado',
    descripcion: 'Vestuario de los menores',
    periodo: 'Por temporada',
  },
  {
    clave: 'despensa',
    nombre: 'Despensa',
    descripcion: 'Alimentación básica',
    periodo: 'Semanal',
  },
  {
    clave: 'salud',
    nombre: 'Salud',
    descripcion: 'Consultas, medicamentos y tratamientos',
    periodo: 'Mensual',
  },
] as const;

export type GastoClave = (typeof CONCEPTOS_GASTO)[number]['clave'];
