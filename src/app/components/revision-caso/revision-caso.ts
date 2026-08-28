import { Component, inject } from '@angular/core';
import { CasoService } from '../../services/caso.service';

@Component({
  selector: 'app-revision-caso',
  standalone: true,
  templateUrl: './revision-caso.html',
  styleUrl: './revision-caso.css'
})
export class RevisionCaso {

  private casoService = inject(CasoService);

  caso = this.casoService.obtenerCaso();

}
