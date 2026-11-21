import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputAppComponent } from './input-app.component';

describe('InputAppComponent', () => {
  let component: InputAppComponent;
  let fixture: ComponentFixture<InputAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputAppComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
