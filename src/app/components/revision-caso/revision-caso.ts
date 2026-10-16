import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CasoService } from '../../services/caso.service';
import { DocumentGeneratorService } from '../../services/document-generator.service';

@Component({
  selector: 'app-revision-caso',
  standalone: true,
  templateUrl: './revision-caso.html',
  styleUrl: './revision-caso.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevisionCaso {
  readonly backToEdit = output<void>();
  readonly templateFile = input<File | null>(null);
  readonly tipoDocumentoNombre = input('documento');
  readonly isGenerating = signal(false);
  readonly generationMessage = signal('');
  readonly generationError = signal(false);
  readonly generatedDocument = signal<Blob | null>(null);
  readonly previewContainer = viewChild.required<ElementRef<HTMLDivElement>>('previewContainer');

  private readonly casoService = inject(CasoService);
  private readonly documentGenerator = inject(DocumentGeneratorService);

  readonly caso = this.casoService.obtenerCaso();

  constructor() {
    effect(() => {
      this.templateFile();
      this.generatedDocument.set(null);
      this.generationMessage.set('');
      this.generationError.set(false);
    });
  }

  async generatePreview(): Promise<void> {
    const template = this.templateFile();

    if (!template || this.isGenerating()) {
      return;
    }

    this.isGenerating.set(true);
    this.generationMessage.set('Generando la vista previa localmente…');
    this.generationError.set(false);
    this.generatedDocument.set(null);

    try {
      const document = await this.documentGenerator.generateDocument(template, this.caso);
      if (this.templateFile() !== template) {
        return;
      }

      const container = this.previewContainer().nativeElement;
      container.replaceChildren();

      try {
        const { renderAsync } = await import('docx-preview');
        await renderAsync(document, container);
        this.generatedDocument.set(document);
        this.generationMessage.set(
          'Vista previa generada desde la plantilla. Revisa el documento antes de descargarlo.',
        );
      } catch (error) {
        container.replaceChildren();
        this.generatedDocument.set(document);
        this.generationMessage.set(
          `El documento se generó, pero no se pudo mostrar la vista previa. Aún puedes descargarlo.${error instanceof Error ? ` Detalle: ${error.message}` : ''}`,
        );
        this.generationError.set(true);
      }
    } catch (error) {
      this.generationMessage.set(
        error instanceof Error ? error.message : 'No se pudo generar el documento.',
      );
      this.generationError.set(true);
    } finally {
      this.isGenerating.set(false);
    }
  }

  downloadDocument(): void {
    const document = this.generatedDocument();
    if (!document) {
      return;
    }

    try {
      this.documentGenerator.downloadDocument(
        document,
        `DocuJurado-${this.tipoDocumentoNombre().toLowerCase().replaceAll(' ', '-')}.docx`,
      );
      this.generationMessage.set('Documento descargado. Revisa el archivo antes de usarlo.');
      this.generationError.set(false);
    } catch (error) {
      this.generationMessage.set(
        error instanceof Error ? error.message : 'No se pudo descargar el documento.',
      );
      this.generationError.set(true);
    }
  }
}
