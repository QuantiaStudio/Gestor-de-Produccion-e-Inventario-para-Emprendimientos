import { Component } from '@angular/core';
import { MateriaPrima } from '../../../../models/materia-prima/materia-prima.model';
import { MateriaPrimaService } from '../../../../services/materia-prima.service';

@Component({
  selector: 'app-materias-primas',
  standalone: true,
  imports: [],
  templateUrl: './materias-primas.component.html',
  styleUrl: './materias-primas.component.css'
})
export class MateriasPrimasComponent {
  materiasPrimas: MateriaPrima[];

  constructor(private materiaPrimaService: MateriaPrimaService) {
    this.materiasPrimas = this.materiaPrimaService.obtenerMateriasPrimas();
  }
}
