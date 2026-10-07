import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-document-loader',
  imports: [],
  templateUrl: './document-loader.html',
  styleUrl: './document-loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentLoader {
  readonly templateSelected = output<File | null>();
  readonly fileFeedback = signal('');
  readonly fileError = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    this.templateSelected.emit(null);
    this.fileFeedback.set('Validando el archivo localmente…');
    this.fileError.set(false);

    if (!file.name.toLowerCase().endsWith('.docx')) {
      this.fileFeedback.set('Selecciona una plantilla con extensión .docx.');
      this.fileError.set(true);
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (!(reader.result instanceof ArrayBuffer)) {
        this.fileFeedback.set('No se pudo leer el archivo seleccionado.');
        this.fileError.set(true);
        return;
      }

      try {
        const { default: PizZip } = await import('pizzip');
        const documentXml = new PizZip(reader.result).file('word/document.xml');

        if (!documentXml) {
          this.fileFeedback.set(
            'El archivo no contiene la estructura esperada de un documento Word.',
          );
          this.fileError.set(true);
          return;
        }

        this.templateSelected.emit(file);
        this.fileFeedback.set(
          `${file.name} está lista. Se procesará localmente al generar el documento.`,
        );
        this.fileError.set(false);
      } catch {
        this.fileFeedback.set(
          'No se pudo validar el archivo. Comprueba que sea un documento .docx válido.',
        );
        this.fileError.set(true);
      }
    };

    reader.onerror = () => {
      this.fileFeedback.set('No se pudo leer el archivo seleccionado.');
      this.fileError.set(true);
    };

    reader.readAsArrayBuffer(file);
    input.value = '';
  }
}
