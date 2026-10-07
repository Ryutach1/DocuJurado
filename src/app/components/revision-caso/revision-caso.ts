import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
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
  readonly isGenerating = signal(false);
  readonly generationMessage = signal('');
  readonly generationError = signal(false);

  private readonly casoService = inject(CasoService);
  private readonly documentGenerator = inject(DocumentGeneratorService);

  readonly caso = this.casoService.obtenerCaso();

  async generateDocument(): Promise<void> {
    const template = this.templateFile();

    if (!template || this.isGenerating()) {
      return;
    }

    this.isGenerating.set(true);
    this.generationMessage.set('Generando el documento localmente…');
    this.generationError.set(false);

    try {
      const document = await this.documentGenerator.generateDocument(template, this.caso);
      this.documentGenerator.downloadDocument(document);
      this.generationMessage.set(
        'Documento generado y descargado. Revisa el archivo antes de usarlo.',
      );
    } catch (error) {
      this.generationMessage.set(
        error instanceof Error ? error.message : 'No se pudo generar el documento.',
      );
      this.generationError.set(true);
    } finally {
      this.isGenerating.set(false);
    }
  }
}
