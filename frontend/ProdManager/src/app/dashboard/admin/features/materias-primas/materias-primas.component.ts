import { Component } from '@angular/core';
import { MateriaPrima } from './materias-primas.model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-materias-primas',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './materias-primas.component.html',
  styleUrl: './materias-primas.component.css'
})
export class MateriasPrimasComponent {

  constructor(private formBuilder: FormBuilder){

    
  }

  materiasPrimas: MateriaPrima[] = [
    {
      id: 'MP-001',
      nombre: 'Tablero MDF 18mm',
      categoria: 'Madera',
      unidad: 'unidad',
      stockTotal: 120,
      stockDisponible: 100,
      nivelMinimo: 50,
      estado: 'optimo'
    },
    {
      id: 'MP-002',
      nombre: 'Melamina Blanca',
      categoria: 'Láminas',
      unidad: 'm²',
      stockTotal: 250,
      stockDisponible: 220,
      nivelMinimo: 100,
      estado: 'optimo'
    },
    {
      id: 'MP-003',
      nombre: 'Canto PVC Blanco',
      categoria: 'Accesorios',
      unidad: 'metros',
      stockTotal: 480,
      stockDisponible: 450,
      nivelMinimo: 200,
      estado: 'optimo'
    },
    {
      id: 'MP-004',
      nombre: 'Tornillo 3.5x16mm',
      categoria: 'Ferretería',
      unidad: 'unidad',
      stockTotal: 850,
      stockDisponible: 800,
      nivelMinimo: 300,
      estado: 'optimo'
    },
    {
      id: 'MP-005',
      nombre: 'Pegamento de Contacto',
      categoria: 'Adhesivos',
      unidad: 'litros',
      stockTotal: 15,
      stockDisponible: 10,
      nivelMinimo: 20,
      estado: 'bajo_minimo'
    },
    {
      id: 'MP-006',
      nombre: 'Barniz Transparente',
      categoria: 'Acabados',
      unidad: 'litros',
      stockTotal: 5,
      stockDisponible: 4,
      nivelMinimo: 10,
      estado: 'bajo_minimo'
    },
    {
      id: 'MP-007',
      nombre: 'Lija Grano 120',
      categoria: 'Abrasivos',
      unidad: 'unidad',
      stockTotal: 0,
      stockDisponible: 0,
      nivelMinimo: 50,
      estado: 'sin_stock'
    },
    {
      id: 'MP-008',
      nombre: 'Clavo 1"',
      categoria: 'Ferretería',
      unidad: 'kg',
      stockTotal: 2.5,
      stockDisponible: 1.0,
      nivelMinimo: 5,
      estado: 'bajo_minimo'
    }
  ];
}
