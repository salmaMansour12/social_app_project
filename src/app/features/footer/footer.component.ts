import { Component ,Input} from '@angular/core';
import{RouterLink}from'@angular/router';
@Component({
  imports: [RouterLink],
  selector: 'app-footer',
  styleUrl: './footer.component.css',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  @Input() message:string="Don't have an account? Sign up";
  @Input() linkText:string="Sign up";
  @Input() linkUrl:string="/register";
}
