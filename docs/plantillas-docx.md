# Delimitación de formularios y plantillas DOCX

DocuJurado captura datos con formularios distintos según el escrito y sustituye etiquetas
`{{...}}` en una copia de la plantilla `.docx` que la persona selecciona. El texto jurídico fijo
permanece en el Word de origen; la aplicación solo completa sus campos variables.

## Datos compartidos de las partes

Estos son los datos generales que la aplicación solicita en los formularios:

```text
{{demandante.nombre}}
{{demandante.edad}}
{{demandante.ocupacion}}
{{demandante.escolaridad}}
{{demandante.telefono}}
{{demandante.correo}}
{{demandante.direccion}}

{{demandado.nombre}}
{{demandado.edad}}
{{demandado.ocupacion}}
{{demandado.escolaridad}}
{{demandado.direccion}}
{{demandado.ingresosMensuales}}

{{hijos.0.nombre}}
{{hijos.0.edad}}
{{hijos.0.escolaridad}}
{{hijos.0.identificadorElectronicoNacimiento}}
{{hijos.nombres}}
{{hijos.cantidad}}
{{numeroExpediente}}
{{abogado.fechaRecepcionPapeleria}}
{{abogado.nombreReceptora}}
```

Los datos que no se solicitan en estos formularios —por ejemplo, fecha de nacimiento de los hijos,
CURP/RFC de la promovente, o ingreso de la promovente— no forman parte de las etiquetas admitidas
para estas plantillas.

`hijos.0` representa a la primera hija o hijo; el índice comienza en cero. Para mostrar nombres y
cantidades variables, se puede usar `{{hijos.nombres}}` y `{{hijos.cantidad}}`. También se admite un
bloque de repetición:

```text
{{#hijos}}
{{nombre}} — {{edad}} años — {{escolaridad}} — {{identificadorElectronicoNacimiento}}
{{/hijos}}
```

El identificador electrónico del acta de nacimiento es el único dato de esa acta que se captura
para el cuerpo probatorio de las plantillas de pensión. Oficialía, libro, número de acta y municipio
no se piden para cada hija o hijo ni deben etiquetarse en esas demandas.

## Pensión alimenticia con relación laboral

Usa una plantilla propia que contemple empleo, empresa y gastos:

```text
{{demandado.nombreEmpresa}}
{{demandado.domicilioEmpresa}}
{{datosPension.porcentajeSolicitado}}
{{datosPension.montoSolicitado}}
{{datosPension.situacionLaboralDemandado}}

{{gastos.habitacion.monto}}
{{gastos.habitacion.periodicidad}}
{{gastos.higiene.monto}}
{{gastos.higiene.periodicidad}}
{{gastos.transporte.monto}}
{{gastos.transporte.periodicidad}}
{{gastos.vestido.monto}}
{{gastos.vestido.periodicidad}}
{{gastos.despensa.monto}}
{{gastos.despensa.periodicidad}}
{{gastos.salud.monto}}
{{gastos.salud.periodicidad}}
```

Esta es la única variante de pensión que solicita y muestra el desglose de gastos en la interfaz.

## Pensión alimenticia sin relación laboral

Usa una plantilla diferente. No debe incluir datos de empresa ni la planilla de gastos:

```text
{{datosPension.situacionLaboralDemandado}}
{{datosPension.porcentajeSolicitado}}
{{datosPension.montoSolicitado}}
```

Los campos compartidos de promovente, demandado e hijos siguen disponibles para esta variante.

## Divorcio incausado

El formulario de divorcio añade los datos del vínculo matrimonial. El régimen patrimonial se
conserva como antecedente del caso, pero no se captura ni se inserta en el texto de la plantilla.
Para la copia del acta de matrimonio se pueden usar estos campos:

```text
{{datosMatrimonio.fechaCelebracion}}
{{datosMatrimonio.lugarCelebracion}}
{{datosMatrimonio.domicilioConyugal}}
{{datosMatrimonio.fechaSeparacion}}
{{datosMatrimonio.registro.numeroActa}}
{{datosMatrimonio.registro.libro}}
{{datosMatrimonio.registro.oficialia}}
{{datosMatrimonio.registro.municipio}}

{{datosDivorcio.domicilioConyugal}}
{{datosDivorcio.fechaSeparacion}}
{{datosDivorcio.duracionSeparacion}}
{{datosDivorcio.hijasHijosVivenCon}}
{{datosDivorcio.embarazoDemandado}}
{{datosDivorcio.dedicacionHogarCuidado}}
{{datosDivorcio.propuestaGuardaCustodia}}
{{datosDivorcio.propuestaConvivencia}}
{{datosDivorcio.propuestaPension}}
{{datosDivorcio.bienesComunes}}
{{datosDivorcio.observaciones}}
```

De la información del acta matrimonial se capturan número de acta, libro, oficialía y municipio.
No se solicita identificador electrónico para el acta de matrimonio.

## Separación provisional

Es un escrito adicional y opcional, no un requisito para generar el divorcio. Solo se habilita si
el domicilio de la parte promovente y el de la parte demandada coinciden. La comparación ignora
mayúsculas, acentos, espacios repetidos y puntuación común.

```text
{{datosSeparacion.domicilioConyugal}}
{{datosSeparacion.domicilioPropuestoDemandante}}
{{datosSeparacion.domicilioPropuestoDemandado}}
{{datosSeparacion.fechaSeparacion}}
{{datosSeparacion.propuestaGuardaCustodia}}
{{datosSeparacion.propuestaConvivencia}}
{{datosSeparacion.propuestaPension}}
{{datosSeparacion.medidasSolicitadas}}
{{datosSeparacion.observaciones}}
```

## Notas para preparar una plantilla

- Cada etiqueta se escribe exactamente, incluyendo mayúsculas, puntos y llaves dobles.
- Mantén el texto fijo y reemplaza únicamente el dato variable por su etiqueta.
- Crea y selecciona una plantilla distinta para pensión con empleo, pensión sin empleo, divorcio y,
  cuando aplique, separación provisional.
- Deja los datos bancarios entre corchetes para completar manualmente. No se capturan en la app.
- Los campos opcionales vacíos se sustituyen por texto vacío. Una etiqueta desconocida produce un
  error visible para evitar descargar un documento con reemplazos pendientes.
- La generación trabaja localmente en el navegador. Revisa el Word resultante antes de usarlo.
