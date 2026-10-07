import { Injectable } from '@angular/core';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
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

function buildTemplateData(caso: Caso) {
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
    'demandante.nacionalidad': caso.demandante.nacionalidad ?? '',
    'demandante.estadoCivil': caso.demandante.estadoCivil ?? '',
    'demandante.fechaNacimiento': formatTemplateDate(caso.demandante.fechaNacimiento),
    'demandante.CURP': caso.demandante.CURP ?? '',
    'demandante.RFC': caso.demandante.RFC ?? '',
    'demandado.nombre': caso.demandado.nombre,
    'demandado.edad': caso.demandado.edad,
    'demandado.ocupacion': caso.demandado.ocupacion,
    'demandado.escolaridad': caso.demandado.escolaridad,
    'demandado.fechaNacimiento': formatTemplateDate(caso.demandado.fechaNacimiento),
    'demandado.CURP': caso.demandado.CURP ?? '',
    'demandado.NSS': caso.demandado.NSS ?? '',
    'demandado.RFC': caso.demandado.RFC ?? '',
    'demandado.direccion': caso.demandado.direccion,
    'demandado.nombreEmpresa': caso.demandado.nombreEmpresa,
    'demandado.domicilioEmpresa': caso.demandado.domicilioEmpresa,
    'demandado.ingresosMensuales': caso.demandado.ingresosMensuales ?? 0,
    'demandado.nacionalidad': caso.demandado.nacionalidad ?? '',
    'demandado.estadoCivil': caso.demandado.estadoCivil ?? '',
    hijos: caso.hijos.map((hijo) => ({ ...hijo })),
    'abogado.nombre': caso.abogado.nombre,
    'abogado.cedulaProfesional': caso.abogado.cedulaProfesional,
  };

  const nombresHijos = caso.hijos
    .map((hijo) => hijo.nombre.trim())
    .filter((nombre) => nombre.length > 0);
  data['hijos.nombres'] =
    nombresHijos.length < 2
      ? (nombresHijos[0] ?? '')
      : `${nombresHijos.slice(0, -1).join(', ')} y ${nombresHijos[nombresHijos.length - 1]}`;
  data['hijos.cantidad'] = nombresHijos.length;

  for (const [index, hijo] of caso.hijos.entries()) {
    data[`hijos.${index}.nombre`] = hijo.nombre;
    data[`hijos.${index}.edad`] = hijo.edad;
    data[`hijos.${index}.escolaridad`] = hijo.escolaridad;
    data[`hijos.${index}.fechaNacimiento`] = formatTemplateDate(hijo.fechaNacimiento);
    data[`hijos.${index}.lugarNacimiento`] = hijo.lugarNacimiento ?? '';
    for (const [campo, valor] of Object.entries(hijo.registroCivil ?? {})) {
      data[`hijos.${index}.registroCivil.${campo}`] = valor;
    }
  }

  const { datosMatrimonio, datosPension, datosDivorcio, datosSeparacion } = caso;
  data['datosMatrimonio.fechaCelebracion'] = formatTemplateDate(datosMatrimonio.fechaCelebracion);
  data['datosMatrimonio.lugarCelebracion'] = datosMatrimonio.lugarCelebracion;
  data['datosMatrimonio.regimenPatrimonial'] = datosMatrimonio.regimenPatrimonial;
  data['datosMatrimonio.domicilioConyugal'] = datosMatrimonio.domicilioConyugal;
  data['datosMatrimonio.fechaSeparacion'] = formatTemplateDate(datosMatrimonio.fechaSeparacion);
  for (const [campo, valor] of Object.entries(datosMatrimonio.registro)) {
    data[`datosMatrimonio.registro.${campo}`] =
      campo === 'fechaRegistro' ? formatTemplateDate(String(valor)) : valor;
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

  for (const [concepto, gasto] of Object.entries(caso.gastos)) {
    data[`gastos.${concepto}.monto`] = gasto.monto;
    data[`gastos.${concepto}.periodicidad`] = gasto.periodicidad;
  }

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
            /^hijos\.\d+\.(nombre|edad|escolaridad|fechaNacimiento|lugarNacimiento|registroCivil\.(numeroActa|libro|foja|oficialia|municipio|estado|fechaRegistro))$/.test(
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
    const pageDocument = globalThis.document;
    const view = pageDocument?.defaultView;

    if (!view) {
      throw new Error('No se encontró el navegador para descargar el documento.');
    }

    const objectUrl = view.URL.createObjectURL(blob);
    const link = pageDocument.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';
    pageDocument.body.appendChild(link);
    link.click();
    link.remove();
    view.setTimeout(() => view.URL.revokeObjectURL(objectUrl), 1000);
  }
}
