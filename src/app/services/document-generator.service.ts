import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Caso } from '../models/caso';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getTemplateErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'No se pudo generar el documento. Verifica la estructura y las variables de la plantilla.';
  }

  const properties = isRecord(error) && isRecord(error['properties']) ? error['properties'] : null;
  const errors = properties && Array.isArray(properties['errors']) ? properties['errors'] : [];
  const explanations = errors
    .map((detail: unknown) => {
      if (!isRecord(detail) || !isRecord(detail['properties'])) {
        return null;
      }

      const explanation = detail['properties']['explanation'];
      return typeof explanation === 'string' ? explanation : null;
    })
    .filter((explanation): explanation is string => explanation !== null);

  if (explanations.length > 0) {
    return `La plantilla contiene variables o etiquetas incompatibles: ${explanations.join(' ')}`;
  }

  return error.message || 'No se pudo generar el documento. Verifica la plantilla seleccionada.';
}

function formatTemplateDate(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date =
    typeof value === 'string'
      ? new Date(`${value}T12:00:00`)
      : value instanceof Date
        ? value
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('es-MX');
}

function toRomanNumeral(value: number): string {
  const numerals: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remainder = value;
  let result = '';

  for (const [amount, numeral] of numerals) {
    while (remainder >= amount) {
      result += numeral;
      remainder -= amount;
    }
  }

  return result;
}

function buildTemplateData(caso: Caso) {
  const esPension = caso.tipoDocumento === 'pension';
  const pensionConRelacionLaboral =
    esPension && caso.datosPension.modalidadLaboral === 'con-relacion-laboral';
  const pensionSinRelacionLaboral =
    esPension && caso.datosPension.modalidadLaboral === 'sin-relacion-laboral';
  const esDivorcio = caso.tipoDocumento === 'divorcio';
  const hijosParaPlantilla = caso.hijos
    .filter((hijo) => hijo.nombre.trim().length > 0)
    .map((hijo, index) => {
      const nombres = hijo.nombres?.trim() ?? '';
      const apellidoPaterno = hijo.apellidoPaterno?.trim() ?? '';
      const apellidoMaterno = hijo.apellidoMaterno?.trim() ?? '';
      const nombreCompleto =
        [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ') || hijo.nombre;
      const actaNacimiento = pensionSinRelacionLaboral
        ? {
            numeroActa: hijo.actaNacimiento?.numeroActa ?? '',
            libro: hijo.actaNacimiento?.libro ?? '',
            oficialia: hijo.actaNacimiento?.oficialia ?? '',
            municipio: hijo.actaNacimiento?.municipio ?? '',
            oficial: hijo.actaNacimiento?.oficial ?? '',
            numeroCertificado: hijo.actaNacimiento?.numeroCertificado ?? '',
          }
        : {
            numeroActa: '',
            libro: '',
            oficialia: '',
            municipio: '',
            oficial: '',
            numeroCertificado: '',
          };

      return {
        ...hijo,
        nombre: nombreCompleto,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        fechaNacimiento: pensionSinRelacionLaboral ? formatTemplateDate(hijo.fechaNacimiento) : '',
        actaNacimiento,
        identificadorElectronicoNacimiento: hijo.identificadorElectronicoNacimiento ?? '',
        numeroPruebaPension: toRomanNumeral(index + 1),
        numeroPruebaDivorcio: index + 2,
        referenciaNacimiento:
          hijo.generoGramatical === 'femenino'
            ? 'nuestra hija'
            : hijo.generoGramatical === 'masculino'
              ? 'nuestro hijo'
              : 'nuestro hijo o nuestra hija',
      };
    });
  const data: Record<string, unknown> = {
    numeroExpediente: caso.numeroExpediente,
    tipoDocumento: caso.tipoDocumento,
    'demandante.nombre': caso.demandante.nombre,
    'demandante.edad': caso.demandante.edad,
    'demandante.ocupacion': caso.demandante.ocupacion,
    'demandante.escolaridad': caso.demandante.escolaridad,
    'demandante.telefono': caso.demandante.telefono,
    'demandante.correo': caso.demandante.correo ?? '',
    'demandante.direccion': caso.demandante.direccion,
    'demandante.ingresosMensuales': esDivorcio ? (caso.demandante.ingresosMensuales ?? '') : '',
    'demandante.clabeInterbancaria': pensionConRelacionLaboral
      ? (caso.demandante.clabeInterbancaria ?? '')
      : '',
    'demandante.banco': pensionConRelacionLaboral ? (caso.demandante.banco ?? '') : '',
    'demandado.nombre': caso.demandado.nombre,
    'demandado.edad': caso.demandado.edad,
    'demandado.ocupacion': caso.demandado.ocupacion,
    'demandado.escolaridad': caso.demandado.escolaridad,
    'demandado.direccion': caso.demandado.direccion,
    'demandado.lugarNacimiento': esPension ? (caso.demandado.lugarNacimiento ?? '') : '',
    'demandado.fechaNacimiento': esPension
      ? formatTemplateDate(caso.demandado.fechaNacimiento)
      : '',
    'demandado.curp': esPension ? (caso.demandado.curp ?? '') : '',
    'demandado.nss': esPension ? (caso.demandado.nss ?? '') : '',
    'demandado.rfc': esPension ? (caso.demandado.rfc ?? '') : '',
    'demandado.nombreEmpresa': pensionConRelacionLaboral ? caso.demandado.nombreEmpresa : '',
    'demandado.domicilioEmpresa': pensionConRelacionLaboral ? caso.demandado.domicilioEmpresa : '',
    'demandado.ingresosMensuales':
      esPension || esDivorcio ? (caso.demandado.ingresosMensuales ?? '') : '',
    hijos: hijosParaPlantilla,
    'abogado.nombre': caso.abogado.nombre,
    'abogado.cedulaProfesional': caso.abogado.cedulaProfesional,
    'abogado.fechaRecepcionPapeleria': formatTemplateDate(caso.abogado.fechaRecepcionPapeleria),
    'abogado.nombreReceptora': caso.abogado.nombreReceptora ?? '',
  };

  const nombresHijos = caso.hijos
    .map((hijo) => hijo.nombre.trim())
    .filter((nombre) => nombre.length > 0);
  data['hijos.nombres'] =
    nombresHijos.length < 2
      ? (nombresHijos[0] ?? '')
      : `${nombresHijos.slice(0, -1).join(', ')} y ${nombresHijos[nombresHijos.length - 1]}`;
  const nombresSeparados = hijosParaPlantilla
    .map((hijo) => hijo.nombres)
    .filter((nombre) => nombre.length > 0);
  data['hijos.nombresSeparados'] =
    nombresSeparados.length < 2
      ? (nombresSeparados[0] ?? '')
      : `${nombresSeparados.slice(0, -1).join(', ')} y ${nombresSeparados[nombresSeparados.length - 1]}`;
  const apellidosCompletos = hijosParaPlantilla.map((hijo) =>
    [hijo.apellidoPaterno, hijo.apellidoMaterno].filter(Boolean).join(' '),
  );
  const apellidosUniformes =
    apellidosCompletos.length > 0 &&
    apellidosCompletos.every(
      (apellidos) => apellidos.length > 0 && apellidos === apellidosCompletos[0],
    );
  data['hijos.apellidosCompartidos'] = apellidosUniformes ? apellidosCompletos[0] : '';
  const nombresConApellidos = hijosParaPlantilla
    .map(
      (hijo) =>
        [hijo.nombres, hijo.apellidoPaterno, hijo.apellidoMaterno].filter(Boolean).join(' ') ||
        hijo.nombre,
    )
    .filter((nombre) => nombre.length > 0);
  data['hijos.nombresConApellidos'] =
    nombresConApellidos.length < 2
      ? (nombresConApellidos[0] ?? '')
      : `${nombresConApellidos.slice(0, -1).join(', ')} y ${nombresConApellidos[nombresConApellidos.length - 1]}`;
  data['hijos.cantidad'] = nombresHijos.length;
  const resumenEscolaridad = hijosParaPlantilla.map((hijo) => {
    const datos = [`de ${hijo.edad} años`];
    if (hijo.escolaridad.trim()) {
      datos.push(`con escolaridad de ${hijo.escolaridad.trim()}`);
    }
    return `${hijo.nombre}, ${datos.join(' y ')}`;
  });
  data['hijos.resumenEscolaridad'] =
    resumenEscolaridad.length < 2
      ? (resumenEscolaridad[0] ?? '')
      : `${resumenEscolaridad.slice(0, -1).join('; ')} y ${resumenEscolaridad[resumenEscolaridad.length - 1]}`;

  const hijosConGenero = caso.hijos.filter((hijo) => hijo.nombre.trim().length > 0);
  const generos = hijosConGenero.map((hijo) => hijo.generoGramatical);
  const sonTodasHijas = generos.every((genero) => genero === 'femenino');
  const sonTodosHijos = generos.every((genero) => genero === 'masculino');
  if (hijosConGenero.length === 1) {
    data['hijos.referencia'] =
      generos[0] === 'femenino'
        ? 'mi menor hija'
        : generos[0] === 'masculino'
          ? 'mi menor hijo'
          : 'mi hija o hijo menor';
  } else if (hijosConGenero.length > 1) {
    data['hijos.referencia'] = sonTodasHijas
      ? 'mis hijas menores'
      : sonTodosHijos
        ? 'mis hijos menores'
        : 'mis hijas e hijos menores';
  } else {
    data['hijos.referencia'] = '';
  }

  for (const [index, hijo] of hijosParaPlantilla.entries()) {
    data[`hijos.${index}.nombre`] = hijo.nombre;
    data[`hijos.${index}.nombres`] = hijo.nombres;
    data[`hijos.${index}.apellidoPaterno`] = hijo.apellidoPaterno;
    data[`hijos.${index}.apellidoMaterno`] = hijo.apellidoMaterno;
    data[`hijos.${index}.edad`] = hijo.edad;
    data[`hijos.${index}.escolaridad`] = hijo.escolaridad;
    data[`hijos.${index}.generoGramatical`] = hijo.generoGramatical ?? '';
    data[`hijos.${index}.fechaNacimiento`] = hijo.fechaNacimiento;
    data[`hijos.${index}.actaNacimiento.numeroActa`] = hijo.actaNacimiento.numeroActa;
    data[`hijos.${index}.actaNacimiento.libro`] = hijo.actaNacimiento.libro;
    data[`hijos.${index}.actaNacimiento.oficialia`] = hijo.actaNacimiento.oficialia;
    data[`hijos.${index}.actaNacimiento.municipio`] = hijo.actaNacimiento.municipio;
    data[`hijos.${index}.actaNacimiento.oficial`] = hijo.actaNacimiento.oficial;
    data[`hijos.${index}.actaNacimiento.numeroCertificado`] = hijo.actaNacimiento.numeroCertificado;
    data[`hijos.${index}.identificadorElectronicoNacimiento`] =
      hijo.identificadorElectronicoNacimiento;
    data[`hijos.${index}.numeroPruebaPension`] = hijo.numeroPruebaPension;
    data[`hijos.${index}.numeroPruebaDivorcio`] = hijo.numeroPruebaDivorcio;
    data[`hijos.${index}.referenciaNacimiento`] = hijo.referenciaNacimiento;
  }

  const { datosMatrimonio, datosPension, datosDivorcio, datosSeparacion } = caso;
  data['datosMatrimonio.fechaCelebracion'] = formatTemplateDate(datosMatrimonio.fechaCelebracion);
  data['datosMatrimonio.lugarCelebracion'] = datosMatrimonio.lugarCelebracion;
  data['datosMatrimonio.domicilioConyugal'] = datosMatrimonio.domicilioConyugal;
  data['datosMatrimonio.fechaSeparacion'] = formatTemplateDate(datosMatrimonio.fechaSeparacion);
  for (const [campo, valor] of Object.entries(datosMatrimonio.registro)) {
    data[`datosMatrimonio.registro.${campo}`] = valor;
  }

  data['datosPension.modalidadLaboral'] = datosPension.modalidadLaboral;
  data['datosPension.porcentajeSolicitado'] = datosPension.porcentajeSolicitado;
  data['datosPension.montoSolicitado'] = datosPension.montoSolicitado;
  data['datosPension.situacionLaboralDemandado'] = datosPension.situacionLaboralDemandado;
  data['datosPension.observaciones'] = datosPension.observaciones;

  for (const [campo, valor] of Object.entries(datosDivorcio)) {
    data[`datosDivorcio.${campo}`] = valor;
  }
  for (const [campo, valor] of Object.entries(datosSeparacion)) {
    data[`datosSeparacion.${campo}`] = valor;
  }

  const cantidadHijos = hijosParaPlantilla.length;
  data['pruebasPension.numeroIngresos'] = toRomanNumeral(cantidadHijos + 1);
  data['pruebasPension.numeroIMSS'] = toRomanNumeral(cantidadHijos + 2);
  data['pruebasPension.numeroSAT'] = toRomanNumeral(cantidadHijos + 3);
  data['pruebasPension.numeroRegistro'] = toRomanNumeral(cantidadHijos + 4);
  data['pruebasPension.numeroPresuncional'] = toRomanNumeral(cantidadHijos + 5);
  data['pruebasPension.numeroActuaciones'] = toRomanNumeral(cantidadHijos + 6);
  data['pruebasPension.numeroComprobantesDomicilio'] = toRomanNumeral(cantidadHijos + 1);
  data['pruebasPension.numeroTicketsGastos'] = toRomanNumeral(cantidadHijos + 2);
  data['pruebasPension.numeroActuacionesLaboral'] = toRomanNumeral(cantidadHijos + 3);
  data['pruebasPension.numeroPresuncionalLaboral'] = toRomanNumeral(cantidadHijos + 4);
  data['pruebasDivorcio.numeroActuaciones'] = cantidadHijos + 2;
  data['pruebasDivorcio.numeroPresuncional'] = cantidadHijos + 3;
  data['pruebasDivorcio.numeroInstrumental'] = cantidadHijos + 4;

  for (const [concepto, gasto] of Object.entries(caso.gastos)) {
    data[`gastos.${concepto}.monto`] = gasto.monto;
    data[`gastos.${concepto}.periodicidad`] = gasto.periodicidad;
  }
  data['gastos.total'] = Object.values(caso.gastos).reduce(
    (total, gasto) => total + gasto.monto,
    0,
  );

  return data;
}

@Injectable({ providedIn: 'root' })
export class DocumentGeneratorService {
  async generateDocument(template: File, caso: Caso): Promise<Blob> {
    if (!template.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Selecciona una plantilla con extensión .docx.');
    }

    try {
      const [arrayBuffer, { default: Docxtemplater }, { default: PizZip }] = await Promise.all([
        template.arrayBuffer(),
        import('docxtemplater'),
        import('pizzip'),
      ]);
      const zip = new PizZip(arrayBuffer);
      const documentXml = zip.file('word/document.xml');

      if (!documentXml) {
        throw new Error('El archivo seleccionado no contiene un documento Word válido.');
      }

      const doc = new Docxtemplater(zip, {
        delimiters: { start: '{{', end: '}}' },
        linebreaks: true,
        nullGetter: (part) => {
          const isOutOfRangeChildField =
            /^hijos\.\d+\.(nombre|nombres|apellidoPaterno|apellidoMaterno|edad|escolaridad|generoGramatical|fechaNacimiento|identificadorElectronicoNacimiento|numeroPruebaPension|numeroPruebaDivorcio|referenciaNacimiento|actaNacimiento\.(numeroActa|libro|oficialia|municipio|oficial|numeroCertificado))$/.test(
              part.value,
            );

          if (isOutOfRangeChildField) {
            return '';
          }

          throw new Error(`La variable {{${part.value}}} no existe en los datos del caso.`);
        },
        paragraphLoop: true,
      });

      if (!/{{\s*[^{}]+?\s*}}/.test(doc.getFullText())) {
        throw new Error(
          'No se encontraron variables {{...}} en la plantilla. Añade las etiquetas documentadas y vuelve a seleccionarla.',
        );
      }

      doc.render(buildTemplateData(caso));

      return doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } catch (error) {
      throw new Error(getTemplateErrorMessage(error), { cause: error });
    }
  }

  downloadDocument(blob: Blob, fileName = 'DocuJurado-Caso.docx'): void {
    saveAs(blob, fileName);
  }
}
