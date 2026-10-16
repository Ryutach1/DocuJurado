import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import { describe, expect, it, vi } from 'vitest';
import { Caso } from '../models/caso';
import { DocumentGeneratorService } from './document-generator.service';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

const caso: Caso = {
  numeroExpediente: 'EXP-123',
  tipoDocumento: 'pension',
  demandante: {
    nombre: 'Ana Ejemplo',
    edad: 34,
    ocupacion: 'Comerciante',
    escolaridad: 'Preparatoria',
    telefono: '8000000000',
    direccion: 'Calle de prueba 123',
    ingresosMensuales: 15000,
    clabeInterbancaria: '012345678901234567',
    banco: 'Banco de prueba',
  },
  demandado: {
    nombre: 'Luis Ejemplo',
    edad: 36,
    ocupacion: 'Empleado',
    escolaridad: 'Universidad',
    direccion: 'Avenida ficticia 456',
    lugarNacimiento: 'Ciudad de prueba',
    fechaNacimiento: '1990-01-01',
    curp: 'CURP-DE-PRUEBA',
    nss: 'NSS-DE-PRUEBA',
    rfc: 'RFC-DE-PRUEBA',
    nombreEmpresa: 'Empresa de prueba',
    domicilioEmpresa: 'Domicilio de prueba',
    ingresosMensuales: 20000,
  },
  hijos: [
    {
      nombre: 'Alex Ejemplo',
      edad: 8,
      escolaridad: 'Primaria',
      generoGramatical: 'femenino',
      identificadorElectronicoNacimiento: 'ID-ELECTRONICO-1',
    },
    {
      nombre: 'Sam Ejemplo',
      edad: 5,
      escolaridad: 'Preescolar',
    },
  ],
  gastos: {
    habitacion: { monto: 4500, periodicidad: 'Mensual' },
    higiene: { monto: 350, periodicidad: 'Mensual' },
    transporte: { monto: 600, periodicidad: 'Mensual' },
    vestido: { monto: 1200, periodicidad: 'Por temporada' },
    despensa: { monto: 900, periodicidad: 'Semanal' },
    salud: { monto: 500, periodicidad: 'Mensual' },
  },
  abogado: {
    nombre: 'Lic. Ejemplo',
    cedulaProfesional: 12345,
    fechaRecepcionPapeleria: '2026-09-30',
    nombreReceptora: 'Lic. Prueba',
  },
  datosMatrimonio: {
    registro: {
      numeroActa: '1',
      libro: '2',
      oficialia: '4',
      municipio: 'Ciudad de prueba',
    },
    fechaCelebracion: '2010-04-12',
    lugarCelebracion: 'Ciudad de prueba',
    domicilioConyugal: 'Domicilio de prueba',
    fechaSeparacion: '2020-08-10',
  },
  datosPension: {
    modalidadLaboral: 'con-relacion-laboral',
    porcentajeSolicitado: '25%',
    montoSolicitado: 5000,
    situacionLaboralDemandado: 'Empleado de prueba',
    observaciones: '',
  },
  datosDivorcio: {
    domicilioConyugal: 'Domicilio de prueba',
    fechaSeparacion: '2020-08-10',
    duracionSeparacion: '3 años',
    hijasHijosVivenCon: 'La parte promovente',
    embarazoDemandado: 'No aplica',
    dedicacionHogarCuidado: 'Dedicación compartida de prueba',
    propuestaGuardaCustodia: 'Propuesta de prueba',
    propuestaConvivencia: 'Propuesta de prueba',
    propuestaPension: 'Propuesta de prueba',
    bienesComunes: 'Sin bienes de prueba',
    solicitarSeparacionProvisional: false,
    observaciones: '',
  },
  datosSeparacion: {
    domicilioConyugal: 'Domicilio de prueba',
    domicilioPropuestoDemandante: 'Domicilio de prueba',
    domicilioPropuestoDemandado: 'Domicilio de prueba',
    fechaSeparacion: '2020-08-10',
    propuestaGuardaCustodia: 'Propuesta de prueba',
    propuestaConvivencia: 'Propuesta de prueba',
    propuestaPension: 'Propuesta de prueba',
    medidasSolicitadas: 'Medidas de prueba',
    observaciones: '',
  },
};

function createTemplateFile(xml: string): File {
  const zip = new PizZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  );
  zip.file('word/document.xml', xml);
  return new File([zip.generate({ type: 'arraybuffer' })], 'plantilla.docx');
}

describe('DocumentGeneratorService', () => {
  const service = new DocumentGeneratorService();

  it('replaces double-brace variables, nested values and indexed child data', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.nombre}}</w:t></w:r></w:p><w:p><w:r><w:t>{{demandado.nombre}}</w:t></w:r></w:p><w:p><w:r><w:t>{{hijos.0.nombre}}|{{hijos.1.edad}}</w:t></w:r></w:p><w:p><w:r><w:t>{{#hijos}}{{nombre}}:{{edad}};{{/hijos}}</w:t></w:r></w:p><w:p><w:r><w:t>{{gastos.habitacion.monto}}|{{numeroExpediente}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const casoConRegistroVacio = {
      ...caso,
      hijos: [...caso.hijos, { nombre: '', edad: 0, escolaridad: '' }],
    };
    const result = await service.generateDocument(template, casoConRegistroVacio);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('Ana Ejemplo');
    expect(generatedXml).toContain('Luis Ejemplo');
    expect(generatedXml).toContain('Alex Ejemplo|5');
    expect(generatedXml).toContain('Alex Ejemplo:8;Sam Ejemplo:5;');
    expect(generatedXml).toContain('4500|EXP-123');
    expect(generatedXml).not.toContain('{{');
  });

  it('renders the generated DOCX into a browser-local preview', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.nombre}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const result = await service.generateDocument(template, caso);
    const container = document.createElement('div');
    const { renderAsync } = await import('docx-preview');

    await renderAsync(result, container);

    expect(container.textContent).toContain('Ana Ejemplo');
    expect(container.querySelector('.docx')).not.toBeNull();
  });

  it('uses FileSaver to download the generated DOCX', () => {
    const generatedDocument = new Blob(['generated docx']);

    service.downloadDocument(generatedDocument, 'DocuJurado-pension.docx');

    expect(saveAs).toHaveBeenCalledWith(generatedDocument, 'DocuJurado-pension.docx');
  });

  it('renders missing optional and out-of-range child data as blank', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.correo}}|{{hijos.4.nombre}}|{{hijos.4.identificadorElectronicoNacimiento}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('|');
    expect(generatedXml).not.toContain('{{');
  });

  it('renders marriage, divorce, separation and pension-specific values', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{datosMatrimonio.registro.numeroActa}}|{{datosMatrimonio.fechaCelebracion}}|{{datosPension.modalidadLaboral}}|{{datosDivorcio.propuestaGuardaCustodia}}|{{datosSeparacion.medidasSolicitadas}}|{{hijos.0.identificadorElectronicoNacimiento}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain(
      '|con-relacion-laboral|Propuesta de prueba|Medidas de prueba|ID-ELECTRONICO-1',
    );
    expect(generatedXml).toContain('1|');
    expect(generatedXml).not.toContain('{{');
  });

  it('joins a variable number of child names with Spanish punctuation', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{hijos.nombres}}|{{hijos.cantidad}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('Alex Ejemplo y Sam Ejemplo|2');
  });

  it('builds grammatically matching child references from count and indicated grammatical gender', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{hijos.referencia}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('mis hijas e hijos menores');
  });

  it('numbers repeating birth evidence and shifts later proof numbers for each child', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{#hijos}}</w:t></w:r></w:p><w:p><w:r><w:t>{{numeroPruebaPension}}|{{numeroPruebaDivorcio}}|{{referenciaNacimiento}};</w:t></w:r></w:p><w:p><w:r><w:t>{{/hijos}}</w:t></w:r></w:p><w:p><w:r><w:t>{{pruebasPension.numeroIngresos}}|{{pruebasPension.numeroIMSS}}|{{pruebasPension.numeroSAT}}|{{pruebasPension.numeroRegistro}}|{{pruebasPension.numeroPresuncional}}|{{pruebasPension.numeroActuaciones}}|{{pruebasDivorcio.numeroActuaciones}}|{{pruebasDivorcio.numeroPresuncional}}|{{pruebasDivorcio.numeroInstrumental}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const casoConRegistroVacio = {
      ...caso,
      hijos: [...caso.hijos, { nombre: '', edad: 0, escolaridad: '' }],
    };
    const result = await service.generateDocument(template, casoConRegistroVacio);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();
    const generatedText = generatedXml?.replace(/<[^>]+>/g, '');

    expect(generatedText).toContain(
      'I|2|nuestra hija;II|3|nuestro hijo o nuestra hija;III|IV|V|VI|VII|VIII|4|5|6',
    );
    expect(generatedText).not.toContain('{{');
  });

  it('uses a singular child reference when one child is captured', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{hijos.referencia}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const casoIndividual = { ...caso, hijos: [{ ...caso.hijos[0] }] };
    const result = await service.generateDocument(template, casoIndividual);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('mi menor hija');
  });

  it('maps identity, birth, bank and applicant income fields', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandado.curp}}|{{demandado.nss}}|{{demandado.rfc}}|{{demandado.lugarNacimiento}}|{{demandado.fechaNacimiento}}|{{demandante.clabeInterbancaria}}|{{demandante.banco}}|{{demandante.ingresosMensuales}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain(
      'CURP-DE-PRUEBA|NSS-DE-PRUEBA|RFC-DE-PRUEBA|Ciudad de prueba|1/1/1990|012345678901234567|Banco de prueba|',
    );
  });

  it('maps the applicant income only for divorce documents', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.ingresosMensuales}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const casoDivorcio = { ...caso, tipoDocumento: 'divorcio' as const };
    const result = await service.generateDocument(template, casoDivorcio);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('15000');
  });

  it('maps birth certificate details only for the pension without employment variant', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{hijos.0.nombres}}|{{hijos.0.apellidoPaterno}}|{{hijos.0.apellidoMaterno}}|{{hijos.0.fechaNacimiento}}|{{hijos.0.actaNacimiento.numeroActa}}|{{hijos.0.actaNacimiento.libro}}|{{hijos.0.actaNacimiento.oficialia}}|{{hijos.0.actaNacimiento.municipio}}|{{hijos.0.actaNacimiento.oficial}}|{{hijos.0.actaNacimiento.numeroCertificado}}|{{hijos.0.identificadorElectronicoNacimiento}}|{{hijos.nombresSeparados}}|{{hijos.apellidosCompartidos}}|{{hijos.nombresConApellidos}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const casoSinRelacion = {
      ...caso,
      hijos: [
        {
          ...caso.hijos[0],
          nombres: 'Alex',
          apellidoPaterno: 'Ejemplo',
          apellidoMaterno: 'Prueba',
          fechaNacimiento: '2018-06-05',
          actaNacimiento: {
            numeroActa: 'ACTA-PRUEBA-1',
            libro: 'LIBRO-PRUEBA-1',
            oficialia: 'OFICIALIA-PRUEBA-1',
            municipio: 'MUNICIPIO-PRUEBA-1',
            oficial: 'OFICIAL-PRUEBA-1',
            numeroCertificado: 'CERTIFICADO-PRUEBA-1',
          },
        },
        {
          ...caso.hijos[1],
          nombres: 'Sam',
          apellidoPaterno: 'Ejemplo',
          apellidoMaterno: 'Prueba',
        },
      ],
      datosPension: { ...caso.datosPension, modalidadLaboral: 'sin-relacion-laboral' as const },
    };
    const resultadoSinRelacion = await service.generateDocument(template, casoSinRelacion);
    const xmlSinRelacion = new PizZip(await resultadoSinRelacion.arrayBuffer())
      .file('word/document.xml')
      ?.asText();
    expect(xmlSinRelacion).toContain(
      'ACTA-PRUEBA-1|LIBRO-PRUEBA-1|OFICIALIA-PRUEBA-1|MUNICIPIO-PRUEBA-1|OFICIAL-PRUEBA-1|CERTIFICADO-PRUEBA-1|ID-ELECTRONICO-1|Alex y Sam|Ejemplo Prueba|Alex Ejemplo Prueba y Sam Ejemplo Prueba',
    );
    expect(xmlSinRelacion).toMatch(/Alex\|Ejemplo\|Prueba\|[^|]+\|ACTA-PRUEBA-1/);

    const casoConRelacion = {
      ...casoSinRelacion,
      datosPension: {
        ...casoSinRelacion.datosPension,
        modalidadLaboral: 'con-relacion-laboral' as const,
      },
    };
    const resultadoConRelacion = await service.generateDocument(template, casoConRelacion);
    const xmlConRelacion = new PizZip(await resultadoConRelacion.arrayBuffer())
      .file('word/document.xml')
      ?.asText();
    expect(xmlConRelacion).toMatch(/Alex\|Ejemplo\|Prueba(?:\|){8}ID-ELECTRONICO-1/);
    expect(xmlConRelacion).not.toContain('ACTA-PRUEBA-1');
  });

  it('does not carry bank or applicant income data into unrelated document variants', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.clabeInterbancaria}}|{{demandante.banco}}|{{demandante.ingresosMensuales}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );
    const casoSinRelacion = {
      ...caso,
      datosPension: { ...caso.datosPension, modalidadLaboral: 'sin-relacion-laboral' as const },
    };
    const result = await service.generateDocument(template, casoSinRelacion);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('||');
  });

  it('replaces every populated field from the provided pension and divorce questionnaires', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandado.ingresosMensuales}}|{{demandado.nombreEmpresa}}|{{demandado.domicilioEmpresa}}|{{hijos.0.nombre}}|{{hijos.0.edad}}|{{hijos.0.escolaridad}}|{{hijos.0.identificadorElectronicoNacimiento}}</w:t></w:r></w:p><w:p><w:r><w:t>{{datosDivorcio.domicilioConyugal}}|{{datosDivorcio.duracionSeparacion}}|{{datosDivorcio.hijasHijosVivenCon}}|{{datosDivorcio.embarazoDemandado}}|{{datosDivorcio.dedicacionHogarCuidado}}</w:t></w:r></w:p><w:p><w:r><w:t>{{abogado.fechaRecepcionPapeleria}}|{{abogado.nombreReceptora}}</w:t></w:r></w:p><w:p><w:r><w:t>{{hijos.resumenEscolaridad}}|{{pruebasPension.numeroComprobantesDomicilio}}|{{pruebasPension.numeroTicketsGastos}}|{{pruebasPension.numeroActuacionesLaboral}}|{{pruebasPension.numeroPresuncionalLaboral}}</w:t></w:r></w:p><w:p><w:r><w:t>{{gastos.total}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('20000|');
    expect(generatedXml).toContain('Empresa de prueba');
    expect(generatedXml).toContain('Domicilio de prueba');
    expect(generatedXml).toContain('Alex Ejemplo|8|Primaria|ID-ELECTRONICO-1');
    expect(generatedXml).toContain(
      'Alex Ejemplo, de 8 años y con escolaridad de Primaria y Sam Ejemplo, de 5 años y con escolaridad de Preescolar',
    );
    expect(generatedXml).toContain('III|IV|V|VI');
    expect(generatedXml).toContain(
      '3 años|La parte promovente|No aplica|Dedicación compartida de prueba',
    );
    expect(generatedXml).toContain('8050');
    const fechaRecepcion = new Date('2026-09-30T12:00:00').toLocaleDateString('es-MX');
    expect(generatedXml).toContain(`${fechaRecepcion}|Lic. Prueba`);
    expect(generatedXml).not.toContain('{{');
  });

  it('reports misspelled variables instead of silently generating blanks', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.nombe}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    await expect(service.generateDocument(template, caso)).rejects.toThrow(
      'La variable {{demandante.nombe}} no existe en los datos del caso.',
    );
  });

  it('rejects a DOCX without template variables', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Documento de prueba sin variables</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    await expect(service.generateDocument(template, caso)).rejects.toThrow(
      'No se encontraron variables {{...}} en la plantilla.',
    );
  });

  it('rejects files that are not DOCX templates', async () => {
    const file = new File(['not a word file'], 'not-a-template.txt');

    await expect(service.generateDocument(file, caso)).rejects.toThrow(
      'Selecciona una plantilla con extensión .docx.',
    );
  });
});
