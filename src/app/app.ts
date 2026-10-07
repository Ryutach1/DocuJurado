import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocumentLoader } from './components/document-manager/document-loader';
import { CasoService } from './services/caso.service';
import { Demandante, Demandado, Hijo, Gastos } from './models';
import { RevisionCaso } from './components/revision-caso/revision-caso';
import { MusicPlayer } from './components/music-player/music-player';
import { TipoDocumento } from './models/tipo-documento';

@Component({
  selector: 'app-root',
  imports: [DocumentLoader, ReactiveFormsModule, RevisionCaso, MusicPlayer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private casoService = inject(CasoService);
  readonly templateFile = signal<File | null>(null);
  readonly plantillasPorTipo = signal<Record<TipoDocumento, File | null>>({
    pension: null,
    divorcio: null,
    separacion: null,
  });
  readonly tipoDocumento = signal<TipoDocumento>('pension');
  readonly nombrePlantillaActual = computed(() => this.templateFile()?.name ?? null);
  readonly tiposDocumento: { id: TipoDocumento; nombre: string; detalle: string }[] = [
    { id: 'pension', nombre: 'Pensión alimenticia', detalle: 'Con o sin relación laboral' },
    { id: 'divorcio', nombre: 'Divorcio', detalle: 'Documento principal' },
    { id: 'separacion', nombre: 'Separación provisional', detalle: 'Documento opcional' },
  ];

  pasoActual = 1;
  ngOnInit(): void {
    this.agregarHijo();
  }

  formularioDemandante = new FormGroup({
    nombre: new FormControl('', { nonNullable: true }),

    edad: new FormControl(0, { nonNullable: true }),

    ocupacion: new FormControl('', { nonNullable: true }),

    escolaridad: new FormControl('', { nonNullable: true }),

    telefono: new FormControl('', { nonNullable: true }),

    correo: new FormControl('', { nonNullable: true }),

    direccion: new FormControl('', { nonNullable: true }),

    nacionalidad: new FormControl('', { nonNullable: true }),

    estadoCivil: new FormControl('', { nonNullable: true }),

    fechaNacimiento: new FormControl('', { nonNullable: true }),

    CURP: new FormControl('', { nonNullable: true }),

    RFC: new FormControl('', { nonNullable: true }),
  });

  formularioDemandado = new FormGroup({
    nombre: new FormControl('', { nonNullable: true }),

    edad: new FormControl(0, { nonNullable: true }),

    ocupacion: new FormControl('', { nonNullable: true }),

    escolaridad: new FormControl('', { nonNullable: true }),

    fechaNacimiento: new FormControl(new Date(), { nonNullable: true }),

    CURP: new FormControl('', { nonNullable: true }),

    NSS: new FormControl('', { nonNullable: true }),

    RFC: new FormControl('', { nonNullable: true }),

    direccion: new FormControl('', { nonNullable: true }),

    nombreEmpresa: new FormControl('', { nonNullable: true }),

    domicilioEmpresa: new FormControl('', { nonNullable: true }),

    ingresosMensuales: new FormControl(0, { nonNullable: true }),

    nacionalidad: new FormControl('', { nonNullable: true }),

    estadoCivil: new FormControl('', { nonNullable: true }),
  });

  formularioHijos = new FormArray<
    FormGroup<{
      nombre: FormControl<string>;
      edad: FormControl<number>;
      escolaridad: FormControl<string>;
      fechaNacimiento: FormControl<string>;
      lugarNacimiento: FormControl<string>;
      registroCivil: FormGroup<{
        numeroActa: FormControl<string>;
        libro: FormControl<string>;
        foja: FormControl<string>;
        oficialia: FormControl<string>;
        municipio: FormControl<string>;
        estado: FormControl<string>;
        fechaRegistro: FormControl<string>;
      }>;
    }>
  >([]);

  get hijos() {
    return this.formularioHijos.controls;
  }

  get tituloPaso(): string {
    switch (this.pasoActual) {
      case 1:
        return 'Datos de la parte promovente';
      case 2:
        return 'Datos de la parte demandada';
      case 3:
        return 'Hijas e hijos beneficiarios';
      case 4:
        return this.tipoDocumento() === 'pension'
          ? 'Pensión y gastos'
          : `Datos para ${this.tipoDocumentoNombre.toLowerCase()}`;
      default:
        return `Revisión de ${this.tipoDocumentoNombre.toLowerCase()}`;
    }
  }

  get tipoDocumentoNombre(): string {
    return this.tiposDocumento.find((tipo) => tipo.id === this.tipoDocumento())?.nombre ?? '';
  }

  agregarHijo(): void {
    this.formularioHijos.push(
      new FormGroup({
        nombre: new FormControl('', { nonNullable: true }),

        edad: new FormControl(0, { nonNullable: true }),

        escolaridad: new FormControl('', { nonNullable: true }),

        fechaNacimiento: new FormControl('', { nonNullable: true }),

        lugarNacimiento: new FormControl('', { nonNullable: true }),

        registroCivil: new FormGroup({
          numeroActa: new FormControl('', { nonNullable: true }),
          libro: new FormControl('', { nonNullable: true }),
          foja: new FormControl('', { nonNullable: true }),
          oficialia: new FormControl('', { nonNullable: true }),
          municipio: new FormControl('', { nonNullable: true }),
          estado: new FormControl('', { nonNullable: true }),
          fechaRegistro: new FormControl('', { nonNullable: true }),
        }),
      }),
    );
  }
  eliminarHijo(indice: number): void {
    this.formularioHijos.removeAt(indice);
  }

  formularioGastos = new FormGroup({
    habitacion: new FormGroup({
      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true }),
    }),
    higiene: new FormGroup({
      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true }),
    }),
    transporte: new FormGroup({
      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true }),
    }),
    vestido: new FormGroup({
      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Por temporada', { nonNullable: true }),
    }),
    despensa: new FormGroup({
      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Semanal', { nonNullable: true }),
    }),
    salud: new FormGroup({
      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true }),
    }),
  });

  formularioDatosMatrimonio = new FormGroup({
    fechaCelebracion: new FormControl('', { nonNullable: true }),
    lugarCelebracion: new FormControl('', { nonNullable: true }),
    regimenPatrimonial: new FormControl('', { nonNullable: true }),
    domicilioConyugal: new FormControl('', { nonNullable: true }),
    fechaSeparacion: new FormControl('', { nonNullable: true }),
    registro: new FormGroup({
      numeroActa: new FormControl('', { nonNullable: true }),
      libro: new FormControl('', { nonNullable: true }),
      foja: new FormControl('', { nonNullable: true }),
      oficialia: new FormControl('', { nonNullable: true }),
      municipio: new FormControl('', { nonNullable: true }),
      estado: new FormControl('', { nonNullable: true }),
      fechaRegistro: new FormControl('', { nonNullable: true }),
    }),
  });

  formularioDatosPension = new FormGroup({
    modalidadLaboral: new FormControl<'con-relacion-laboral' | 'sin-relacion-laboral'>(
      'con-relacion-laboral',
      { nonNullable: true },
    ),
    porcentajeSolicitado: new FormControl('', { nonNullable: true }),
    montoSolicitado: new FormControl(0, { nonNullable: true }),
    situacionLaboralDemandado: new FormControl('', { nonNullable: true }),
    observaciones: new FormControl('', { nonNullable: true }),
  });

  formularioDatosDivorcio = new FormGroup({
    domicilioConyugal: new FormControl('', { nonNullable: true }),
    fechaSeparacion: new FormControl('', { nonNullable: true }),
    duracionSeparacion: new FormControl('', { nonNullable: true }),
    propuestaGuardaCustodia: new FormControl('', { nonNullable: true }),
    propuestaConvivencia: new FormControl('', { nonNullable: true }),
    propuestaPension: new FormControl('', { nonNullable: true }),
    bienesComunes: new FormControl('', { nonNullable: true }),
    solicitarSeparacionProvisional: new FormControl(false, { nonNullable: true }),
    observaciones: new FormControl('', { nonNullable: true }),
  });

  formularioDatosSeparacion = new FormGroup({
    domicilioConyugal: new FormControl('', { nonNullable: true }),
    domicilioPropuestoDemandante: new FormControl('', { nonNullable: true }),
    domicilioPropuestoDemandado: new FormControl('', { nonNullable: true }),
    fechaSeparacion: new FormControl('', { nonNullable: true }),
    propuestaGuardaCustodia: new FormControl('', { nonNullable: true }),
    propuestaConvivencia: new FormControl('', { nonNullable: true }),
    propuestaPension: new FormControl('', { nonNullable: true }),
    medidasSolicitadas: new FormControl('', { nonNullable: true }),
    observaciones: new FormControl('', { nonNullable: true }),
  });

  conceptosGasto = [
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
  ];
  get totalGastos(): number {
    const gastos = this.formularioGastos.getRawValue();

    return (
      gastos.habitacion.monto +
      gastos.higiene.monto +
      gastos.transporte.monto +
      gastos.vestido.monto +
      gastos.despensa.monto +
      gastos.salud.monto
    );
  }

  continuar(): void {
    switch (this.pasoActual) {
      case 1:
        const demandante: Demandante = this.formularioDemandante.getRawValue();
        this.casoService.actualizarDemandante(demandante);
        break;

      case 2:
        const demandado: Demandado = this.formularioDemandado.getRawValue();
        this.casoService.actualizarDemandado(demandado);
        break;

      case 3:
        const hijos: Hijo[] = this.formularioHijos.getRawValue();
        this.casoService.actualizarHijos(hijos);
        break;

      case 4:
        const gastos: Gastos = this.formularioGastos.getRawValue();
        this.casoService.actualizarGastos(gastos);
        this.guardarDatosDocumentales();
        break;

      case 5:
        return;
    }

    this.pasoActual++;
  }
  volver(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  volverDesdeRevision(): void {
    this.pasoActual = 4;
  }

  onTemplateSelected(template: File | null): void {
    this.templateFile.set(template);
    this.plantillasPorTipo.update((plantillas) => ({
      ...plantillas,
      [this.tipoDocumento()]: template,
    }));
  }

  seleccionarTipoDocumento(tipo: TipoDocumento): void {
    this.guardarDatosDocumentales();
    this.tipoDocumento.set(tipo);
    this.casoService.actualizarTipoDocumento(tipo);
    this.templateFile.set(this.plantillasPorTipo()[tipo]);
  }

  private guardarDatosDocumentales(): void {
    this.casoService.actualizarDatosMatrimonio(this.formularioDatosMatrimonio.getRawValue());
    this.casoService.actualizarDatosPension(this.formularioDatosPension.getRawValue());
    this.casoService.actualizarDatosDivorcio(this.formularioDatosDivorcio.getRawValue());
    this.casoService.actualizarDatosSeparacion(this.formularioDatosSeparacion.getRawValue());
  }
}
