import PizZip from 'pizzip';
import { describe, expect, it } from 'vitest';
import { Caso } from '../models/caso';
import { DocumentGeneratorService } from './document-generator.service';

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
  },
  demandado: {
    nombre: 'Luis Ejemplo',
    edad: 36,
    ocupacion: 'Empleado',
    escolaridad: 'Universidad',
    direccion: 'Avenida ficticia 456',
    nombreEmpresa: 'Empresa de prueba',
    domicilioEmpresa: 'Domicilio de prueba',
    ingresosMensuales: 20000,
  },
  hijos: [
    {
      nombre: 'Alex Ejemplo',
      edad: 8,
      escolaridad: 'Primaria',
      identificadorElectronicoNacimiento: 'ID-ELECTRONICO-1',
    },
    { nombre: 'Sam Ejemplo', edad: 5, escolaridad: 'Preescolar' },
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
  return new File([zip.generate({ type: 'uint8array' })], 'plantilla.docx');
}

describe('DocumentGeneratorService', () => {
  const service = new DocumentGeneratorService();

  it('replaces double-brace variables, nested values and indexed child data', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandante.nombre}}</w:t></w:r></w:p><w:p><w:r><w:t>{{demandado.nombre}}</w:t></w:r></w:p><w:p><w:r><w:t>{{hijos.0.nombre}}|{{hijos.1.edad}}</w:t></w:r></w:p><w:p><w:r><w:t>{{#hijos}}{{nombre}}:{{edad}};{{/hijos}}</w:t></w:r></w:p><w:p><w:r><w:t>{{gastos.habitacion.monto}}|{{numeroExpediente}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('Ana Ejemplo');
    expect(generatedXml).toContain('Luis Ejemplo');
    expect(generatedXml).toContain('Alex Ejemplo|5');
    expect(generatedXml).toContain('Alex Ejemplo:8;Sam Ejemplo:5;');
    expect(generatedXml).toContain('4500|EXP-123');
    expect(generatedXml).not.toContain('{{');
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

  it('replaces every populated field from the provided pension and divorce questionnaires', async () => {
    const template = createTemplateFile(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{demandado.ingresosMensuales}}|{{demandado.nombreEmpresa}}|{{demandado.domicilioEmpresa}}|{{hijos.0.nombre}}|{{hijos.0.edad}}|{{hijos.0.escolaridad}}|{{hijos.0.identificadorElectronicoNacimiento}}</w:t></w:r></w:p><w:p><w:r><w:t>{{datosDivorcio.domicilioConyugal}}|{{datosDivorcio.duracionSeparacion}}|{{datosDivorcio.hijasHijosVivenCon}}|{{datosDivorcio.embarazoDemandado}}|{{datosDivorcio.dedicacionHogarCuidado}}</w:t></w:r></w:p><w:p><w:r><w:t>{{abogado.fechaRecepcionPapeleria}}|{{abogado.nombreReceptora}}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>',
    );

    const result = await service.generateDocument(template, caso);
    const generatedXml = new PizZip(await result.arrayBuffer()).file('word/document.xml')?.asText();

    expect(generatedXml).toContain('20000|');
    expect(generatedXml).toContain('Empresa de prueba');
    expect(generatedXml).toContain('Domicilio de prueba');
    expect(generatedXml).toContain('Alex Ejemplo|8|Primaria|ID-ELECTRONICO-1');
    expect(generatedXml).toContain(
      '3 años|La parte promovente|No aplica|Dedicación compartida de prueba',
    );
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
