import { Component } from '@angular/core';
import { NavbarComponent } from '../../../public/navbar/navbar.component';
import { FooterComponent } from '../../../public/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [NavbarComponent,FooterComponent,RouterOutlet],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {

}
