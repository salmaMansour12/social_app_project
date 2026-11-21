import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { merge, Subscription } from 'rxjs';

@Component({
  selector: 'app-erro-message',
  standalone: true,
  templateUrl: './erro-message.component.html',
  styleUrl: './erro-message.component.css',
})
export class ErroMessageComponent implements OnInit, OnDestroy {
  @Input() control: AbstractControl | null = null;
  @Input() label = '';

  message = '';
  private sub?: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.control) return;

    this.update();
    this.sub = merge(
      this.control.statusChanges,
      this.control.valueChanges
    ).subscribe(() => this.update());
  }

  // بيتنادى كمان من markAllAsTouched
  ngDoCheck() {
    this.update();
  }

  private update() {
    const next = this.getMessage();
    if (next !== this.message) {
      this.message = next;
      this.cdr.markForCheck();
    }
  }

  private getMessage(): string {
    const c = this.control;
    if (!c || !(c.touched || c.dirty)) return '';

    if (c.hasError('required')) return `${this.label} is required`;
    if (c.hasError('minlength'))
      return `${this.label} must be at least ${c.getError('minlength').requiredLength} characters`;
    if (c.hasError('email')) return 'Please enter a valid email address';
    if (c.hasError('pattern')) return `${this.label} format is invalid`;
    return '';
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
