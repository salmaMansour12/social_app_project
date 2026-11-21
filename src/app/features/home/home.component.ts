import { Component } from '@angular/core';
import { HomeLeftComponent } from './home-left/home-left.component';
import { HomeRightComponent } from './home-right/home-right.component';
import{ HomeCenterComponent} from './home-center/home-center.component'

@Component({
  imports: [HomeLeftComponent, HomeRightComponent, HomeCenterComponent],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
