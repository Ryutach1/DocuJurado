# Variables para plantillas DOCX

El generador usa Docxtemplater con delimitadores dobles. Escribe cada variable exactamente
como aparece aquí, incluidas las mayúsculas y los puntos:

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
{{demandado.fechaNacimiento}}
{{demandado.CURP}}
{{demandado.NSS}}
{{demandado.RFC}}
{{demandado.direccion}}
{{demandado.nombreEmpresa}}
{{demandado.domicilioEmpresa}}
{{demandado.ingresosMensuales}}

{{hijos.0.nombre}}
{{hijos.0.edad}}
{{hijos.0.escolaridad}}

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

{{numeroExpediente}}
{{abogado.nombre}}
{{abogado.cedulaProfesional}}
```

El índice de `hijos` comienza en cero: `hijos.0` es el primer hijo, `hijos.1` el segundo, y así
sucesivamente. La plantilla se puede preparar para la cantidad máxima de hijos que espere incluir,
o para una cantidad variable usando un bloque de repetición de Docxtemplater:

```text
{{#hijos}}
{{nombre}} — {{edad}} años — {{escolaridad}}
{{/hijos}}
```

Dentro del bloque se utilizan nombres relativos al hijo actual (`{{nombre}}`, `{{edad}}` y
`{{escolaridad}}`). Los bloques deben abrirse y cerrarse en la plantilla Word con las etiquetas
indicadas.

Los campos opcionales sin valor y las referencias que no existan se sustituyen por texto vacío.
Las fechas se presentan en formato local de México. Los saltos de línea de un valor se conservan.
Una variable que no forme parte de la nomenclatura documentada produce un error visible para
evitar descargar un escrito con una etiqueta mal escrita.

## Flujo de uso

1. Selecciona un archivo `.docx` en el control **Plantilla Word del caso**.
2. Completa el formulario y avanza a **Revisión del escrito**.
3. Pulsa **Generar y descargar DOCX**. La plantilla original no se modifica.

La plantilla y los datos se procesan en el navegador; no se envían a un servidor de DocuJurado.
La descarga es un borrador: revisa el resultado y su contenido antes de utilizarlo. Usa datos
ficticios o anonimizados al probar; no subas documentos de casos ni información personal al
repositorio.
