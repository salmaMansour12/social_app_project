import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErroMessageComponent } from './erro-message.component';

describe('ErroMessageComponent', () => {
  let component: ErroMessageComponent;
  let fixture: ComponentFixture<ErroMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErroMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErroMessageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
