# Delimitación de formularios y plantillas DOCX

DocuJurado captura datos con formularios distintos según el escrito y sustituye etiquetas
`{{...}}` en una copia de la plantilla `.docx` que la persona selecciona. El texto jurídico fijo
permanece en el Word de origen; la aplicación solo completa sus campos variables.

Los modelos comparten una base de datos de persona para los campos comunes, mientras cada rol
mantiene sus atributos propios. Los datos específicos de divorcio, separación y pensión permanecen
en sus modelos documentales independientes. La lista de conceptos de gasto es la fuente central de
sus nombres y periodicidades; para incorporar un nuevo concepto, actualiza esa definición y su
control de importe.

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
{{demandante.ingresosMensuales}}
{{demandante.clabeInterbancaria}}
{{demandante.banco}}

{{demandado.nombre}}
{{demandado.edad}}
{{demandado.ocupacion}}
{{demandado.escolaridad}}
{{demandado.direccion}}
{{demandado.lugarNacimiento}}
{{demandado.fechaNacimiento}}
{{demandado.curp}}
{{demandado.nss}}
{{demandado.rfc}}
{{demandado.nombreEmpresa}}
{{demandado.domicilioEmpresa}}
{{demandado.ingresosMensuales}}

{{hijos.0.nombre}}
{{hijos.0.nombres}}
{{hijos.0.apellidoPaterno}}
{{hijos.0.apellidoMaterno}}
{{hijos.0.edad}}
{{hijos.0.escolaridad}}
{{hijos.0.generoGramatical}}
{{hijos.0.fechaNacimiento}}
{{hijos.0.actaNacimiento.numeroActa}}
{{hijos.0.actaNacimiento.libro}}
{{hijos.0.actaNacimiento.oficialia}}
{{hijos.0.actaNacimiento.oficial}}
{{hijos.0.actaNacimiento.numeroCertificado}}
{{hijos.0.identificadorElectronicoNacimiento}}
{{hijos.nombres}}
{{hijos.nombresSeparados}}
{{hijos.apellidosCompartidos}}
{{hijos.nombresConApellidos}}
{{hijos.cantidad}}
{{hijos.referencia}}
{{numeroExpediente}}
{{abogado.fechaRecepcionPapeleria}}
{{abogado.nombreReceptora}}
```

La fecha de nacimiento y los datos registrales de cada hija o hijo solo se solicitan para pensión
sin relación laboral. La aplicación no solicita CURP/RFC de la promovente. Algunos campos de esta
lista solo aplican a un documento o modalidad; fuera de ella, sus etiquetas se reemplazan por texto
vacío para evitar arrastrar datos de otro escrito.

`hijos.0` representa a la primera hija o hijo; el índice comienza en cero. Para mostrar nombres y
cantidades variables, se puede usar `{{hijos.nombres}}` y `{{hijos.cantidad}}`. También se admite un
bloque de repetición:

```text
{{#hijos}}
{{nombre}} — {{edad}} años — {{escolaridad}} — {{identificadorElectronicoNacimiento}}
{{/hijos}}
```

Para plantillas personalizadas, los nombres se capturan en partes sin retirar `{{hijos.0.nombre}}`,
que sigue representando el nombre completo por compatibilidad. Si el formulario contiene Nombre(s),
apellido paterno o apellido materno, esos componentes forman el nombre completo. Usa
`{{hijos.nombresSeparados}} de apellidos {{hijos.apellidosCompartidos}}` cuando todas las hijas e
hijos compartan ambos apellidos; si no, usa `{{hijos.nombresConApellidos}}`, que conserva los
apellidos de cada persona. Para plantillas que necesiten control fino, dentro del bloque repetible
están disponibles `{{nombres}}`, `{{apellidoPaterno}}` y `{{apellidoMaterno}}`.

`{{hijos.referencia}}` construye una forma coherente para expresiones como «mi menor hija»,
«mi menor hijo», «mis hijas menores» o «mis hijos menores», usando la cantidad de personas
capturadas y el género gramatical indicado en su formulario. Si no se especifica, usa una forma
neutral («mi hija o hijo menor» / «mis hijas e hijos menores»); no intenta deducirlo a partir del
nombre. Usa esta etiqueta en lugar de escribir literalmente una referencia que podría quedar en
singular o plural incorrecto.

La pensión con relación laboral solo utiliza el identificador electrónico del acta de nacimiento.
La plantilla de pensión sin relación laboral también admite fecha de nacimiento y datos del acta
por hija o hijo:

```text
{{hijos.0.fechaNacimiento}}
{{hijos.0.actaNacimiento.numeroActa}}
{{hijos.0.actaNacimiento.libro}}
{{hijos.0.actaNacimiento.oficialia}}
{{hijos.0.actaNacimiento.oficial}}
{{hijos.0.actaNacimiento.numeroCertificado}}
```

Dentro de un bloque `{{#hijos}}...{{/hijos}}`, se omite el prefijo de índice; por ejemplo,
`{{actaNacimiento.numeroActa}}`. Estos datos solo se incluyen en la variante sin relación laboral.

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
En esta modalidad también se capturan los datos bancarios de la promovente para las etiquetas
`{{demandante.clabeInterbancaria}}` y `{{demandante.banco}}`.

## Pensión alimenticia sin relación laboral

Usa una plantilla diferente. No debe incluir datos de empresa ni la planilla de gastos:

```text
{{datosPension.situacionLaboralDemandado}}
{{datosPension.porcentajeSolicitado}}
{{datosPension.montoSolicitado}}
```

Los campos compartidos de promovente, demandado e hijos siguen disponibles para esta variante.
En particular, la ficha de pensión recoge lugar y fecha de nacimiento, CURP, NSS y RFC del
demandado; la CURP es especialmente relevante en la modalidad sin relación laboral.

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
El formulario de divorcio también captura los ingresos aproximados mensuales de la parte
promovente; se pueden usar `{{demandante.ingresosMensuales}}` y
`{{demandado.ingresosMensuales}}` cuando aparezcan en la plantilla aplicable.

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
- Los datos bancarios se capturan en la aplicación únicamente para pensión con relación laboral.
  No los incluyas en plantillas de otras modalidades si no son necesarios.
- Los campos opcionales vacíos se sustituyen por texto vacío. Una etiqueta desconocida produce un
  error visible para evitar descargar un documento con reemplazos pendientes.
- La generación trabaja localmente en el navegador. Revisa el Word resultante antes de usarlo.
