# Variables para plantillas DOCX

El generador reemplaza etiquetas con llaves dobles (`{{...}}`) y descarga una copia de la
plantilla seleccionada. Los nombres distinguen mayúsculas, minúsculas y puntos.

## Expediente y partes

```text
{{numeroExpediente}}
{{tipoDocumento}}

{{demandante.nombre}}
{{demandante.edad}}
{{demandante.ocupacion}}
{{demandante.escolaridad}}
{{demandante.telefono}}
{{demandante.correo}}
{{demandante.direccion}}
{{demandante.nacionalidad}}
{{demandante.estadoCivil}}
{{demandante.fechaNacimiento}}
{{demandante.CURP}}
{{demandante.RFC}}

{{demandado.nombre}}
{{demandado.edad}}
{{demandado.ocupacion}}
{{demandado.escolaridad}}
{{demandado.fechaNacimiento}}
{{demandado.CURP}}
{{demandado.NSS}}
{{demandado.RFC}}
{{demandado.direccion}}
{{demandado.nombreEmpresa}}
{{demandado.domicilioEmpresa}}
{{demandado.ingresosMensuales}}
{{demandado.nacionalidad}}
{{demandado.estadoCivil}}

{{abogado.nombre}}
{{abogado.cedulaProfesional}}
```

## Hijas e hijos

Los índices comienzan en cero. Los datos del acta de nacimiento son opcionales:

```text
{{hijos.0.nombre}}
{{hijos.0.edad}}
{{hijos.0.escolaridad}}
{{hijos.0.fechaNacimiento}}
{{hijos.0.lugarNacimiento}}
{{hijos.0.registroCivil.numeroActa}}
{{hijos.0.registroCivil.libro}}
{{hijos.0.registroCivil.foja}}
{{hijos.0.registroCivil.oficialia}}
{{hijos.0.registroCivil.municipio}}
{{hijos.0.registroCivil.estado}}
{{hijos.0.registroCivil.fechaRegistro}}
{{hijos.nombres}}
{{hijos.cantidad}}
```

Para una cantidad variable de hijos se puede usar un bloque de repetición:

```text
{{#hijos}}
{{nombre}} — {{edad}} años — {{escolaridad}}
{{/hijos}}
```

Dentro del bloque, los nombres son relativos a cada hijo. Para evitar que las etiquetas de un
índice que no existe detengan la generación, el generador las deja vacías.

## Matrimonio y registro civil

```text
{{datosMatrimonio.fechaCelebracion}}
{{datosMatrimonio.lugarCelebracion}}
{{datosMatrimonio.regimenPatrimonial}}
{{datosMatrimonio.domicilioConyugal}}
{{datosMatrimonio.fechaSeparacion}}
{{datosMatrimonio.registro.numeroActa}}
{{datosMatrimonio.registro.libro}}
{{datosMatrimonio.registro.foja}}
{{datosMatrimonio.registro.oficialia}}
{{datosMatrimonio.registro.municipio}}
{{datosMatrimonio.registro.estado}}
{{datosMatrimonio.registro.fechaRegistro}}
```

## Datos específicos del documento

Pensión alimenticia:

```text
{{datosPension.modalidadLaboral}}
{{datosPension.porcentajeSolicitado}}
{{datosPension.montoSolicitado}}
{{datosPension.situacionLaboralDemandado}}
{{datosPension.observaciones}}
```

Divorcio:

```text
{{datosDivorcio.domicilioConyugal}}
{{datosDivorcio.fechaSeparacion}}
{{datosDivorcio.duracionSeparacion}}
{{datosDivorcio.propuestaGuardaCustodia}}
{{datosDivorcio.propuestaConvivencia}}
{{datosDivorcio.propuestaPension}}
{{datosDivorcio.bienesComunes}}
{{datosDivorcio.solicitarSeparacionProvisional}}
{{datosDivorcio.observaciones}}
```

Separación provisional:

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

Gastos de manutención:

```text
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

## Uso y privacidad

1. Elige la pestaña del documento que vas a preparar.
2. Selecciona en esa pestaña su archivo `.docx`; las plantillas quedan asociadas por documento
   mientras la aplicación permanece abierta.
3. Completa el formulario y avanza a la revisión para generar la copia.
4. Cambia a otra pestaña para preparar otro documento del mismo expediente. La separación
   provisional es opcional.

La variante laboral de Pensión se selecciona dentro de sus datos específicos. La separación y el
divorcio pueden compartir las partes e hijos del expediente, pero tienen datos y plantillas propias.
Los datos bancarios escritos entre corchetes en las plantillas se conservan como marcadores
manuales: no se capturan ni guardan en el modelo.

Los campos opcionales vacíos se sustituyen por texto vacío. Las fechas se presentan con el formato
local del navegador; los saltos de línea se conservan. Una etiqueta desconocida produce un error
visible en lugar de descargar un documento incompleto. La plantilla y los datos se procesan en el
navegador y no se envían al servidor. Usa datos ficticios o anonimizados al probar y revisa el
documento generado antes de utilizarlo.
