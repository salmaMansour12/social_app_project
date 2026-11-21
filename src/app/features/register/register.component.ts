import { Component, inject } from '@angular/core';
import { InputAppComponent } from '../../shared/component/input-app/input-app.component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { email } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../core/auth/services/auth-service.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  imports: [InputAppComponent,ReactiveFormsModule,FooterComponent],
  selector: 'app-register',
  styleUrl: './register.component.css',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
message:string="I already have an account";
linkText:string="Log in";
linkUrl:string="login";


private readonly authServiceService= inject(AuthServiceService) ;
private readonly router=inject(Router);


navigateToLogin() {
  this.router.navigate(['/login']);
}

  registerForm=new FormGroup({
    name:new FormControl("",[Validators.required,Validators.minLength(3 )]),
   username:new FormControl(""),
   email:new FormControl("",[Validators.required,Validators.email]),
   gender:new FormControl("",Validators.required),
   dateOfBirth:new FormControl("",Validators.required),
   password:new FormControl ("",[Validators.required,Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
   rePassword:new FormControl("",Validators.required)
  },{validators:this.confirm_password
    ,updateOn:'submit'});



 formRegister() {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();

  }
  
else{
  console.log("Form Submitted",this.registerForm.value);
  this.authServiceService.registerFormService(this.registerForm.value).subscribe({
    next:(response)=>{
      console.log("Registration successful:", response);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('token', response.token);
    },
    error:(error)=>{
      console.error("Registration failed:", error);
    },
    complete:()=>{
      console.log("Registration request completed.");
      this.router.navigate(['/login']);
    }
  });
}
}


confirm_password(form:AbstractControl){
 const passowrd =form.get('password')?.value;
const rePassword =form.get('rePassword')?.value;
if(passowrd!==rePassword){
  form.get('rePassword')?.setErrors({passwordMismatch:true});
  return {passwordMismatch:true};
}
else{
  form.get('rePassword')?.setErrors(null);
  return null;
}
}

}
