import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../features/navbar/navbar.component';

@Component({
  imports: [RouterOutlet, NavbarComponent],
  selector: 'app-main',
  styleUrl: './main.component.css',
  templateUrl: './main.component.html',
})
export class MainComponent {}
