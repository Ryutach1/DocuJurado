import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormArray, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocumentLoader } from './components/document-manager/document-loader';
import { CasoService } from './services/caso.service';
import { Caso, Demandante, Demandado, Hijo, Gastos } from './models';
import { RevisionCaso } from './components/revision-caso/revision-caso';
import { MusicPlayer } from './components/music-player/music-player';


@Component({
  selector: 'app-root',
  imports: [
    DocumentLoader,
    ReactiveFormsModule,
    RevisionCaso,
    MusicPlayer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private casoService = inject(CasoService);
  protected readonly title = signal('DocuJurado');

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

    direccion: new FormControl('', { nonNullable: true })
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

    ingresosMensuales: new FormControl(0, { nonNullable: true })

  });

  formularioHijos = new FormArray<FormGroup<{
    nombre: FormControl<string>;
    edad: FormControl<number>;
    escolaridad: FormControl<string>;
  }>>([]);

  get hijos() {
    return this.formularioHijos.controls;
  }


  agregarHijo(): void {

    this.formularioHijos.push(

      new FormGroup({

        nombre: new FormControl('', { nonNullable: true }),

        edad: new FormControl(0, { nonNullable: true }),

        escolaridad: new FormControl('', { nonNullable: true }),

      })

    );
  }
  eliminarHijo(indice: number): void {

    this.formularioHijos.removeAt(indice);

  }

  formularioGastos = new FormGroup({

    habitacion: new FormGroup({

      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true })

    }),
    higiene: new FormGroup({

      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true })

    }),
    transporte: new FormGroup({

      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true })

    }),
    vestido: new FormGroup({

      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Por temporada', { nonNullable: true })

    }),
    despensa: new FormGroup({

      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Semanal', { nonNullable: true })

    }),
    salud: new FormGroup({

      monto: new FormControl(0, { nonNullable: true }),

      periodicidad: new FormControl('Mensual', { nonNullable: true })

    })
  });

  conceptosGasto = [
    {
      clave: 'habitacion',
      nombre: 'Habitación',
      descripcion: 'Servicios públicos y mantenimiento del hogar',
      periodo: 'Mensual'
    },
    {
      clave: 'higiene',
      nombre: 'Higiene',
      descripcion: 'Artículos de higiene personal',
      periodo: 'Mensual'
    },
    {
      clave: 'transporte',
      nombre: 'Transporte',
      descripcion: 'Traslados de los menores',
      periodo: 'Mensual'
    },
    {
      clave: 'vestido',
      nombre: 'Vestido y calzado',
      descripcion: 'Vestuario de los menores',
      periodo: 'Por temporada'
    },
    {
      clave: 'despensa',
      nombre: 'Despensa',
      descripcion: 'Alimentación básica',
      periodo: 'Semanal'
    },
    {
      clave: 'salud',
      nombre: 'Salud',
      descripcion: 'Consultas, medicamentos y tratamientos',
      periodo: 'Mensual'
    }
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
        console.log(this.casoService.obtenerDemandante());
        break;

      case 2:
        const demandado: Demandado = this.formularioDemandado.getRawValue();
        this.casoService.actualizarDemandado(demandado);
        console.log(this.casoService.obtenerDemandado());
        break;

      case 3:
        const hijos: Hijo[] = this.formularioHijos.getRawValue();
        this.casoService.actualizarHijos(hijos);
        console.log(this.casoService.obtenerHijos());
        break;

      case 4:
        const gastos: Gastos = this.formularioGastos.getRawValue();
        this.casoService.actualizarGastos(gastos);
        console.log(this.casoService.obtenerGastos());
        break;

      case 5:
        const caso: Caso = this.casoService.obtenerCaso();
        console.log('Caso final:', caso);
        return;

    }

    this.pasoActual++;
  }
  volver(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }
}

