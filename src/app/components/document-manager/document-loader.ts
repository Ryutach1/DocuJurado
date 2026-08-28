import { Component } from '@angular/core';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Component({
  selector: 'app-document-loader',
  imports: [],
  templateUrl: './document-loader.html',
  styleUrl: './document-loader.css',
})
export class DocumentLoader {
  private template?: Docxtemplater;

  private templateName = '';
  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {

      const arrayBuffer = reader.result as ArrayBuffer;
      const zip = new PizZip(arrayBuffer);
      const documentXml = zip.file("word/document.xml");
      if (!documentXml) {

        console.error("No se encontró document.xml");

        return;

      }
      const xml = documentXml.asText();
      console.log(xml.includes("{{"));
      console.log(xml.indexOf("nombre"));
      const matches = xml.match(/{{(.*?)}}/g) || [];
      const variables = [...new Set(
        matches.map(v => v.replace(/[{}]/g, ""))
      )];
      console.log(variables);
      const posicion = xml.indexOf("nombre");
      console.log(
        xml.substring(posicion - 100, posicion + 100)
      );
    };

    reader.readAsArrayBuffer(file);

  }
}
