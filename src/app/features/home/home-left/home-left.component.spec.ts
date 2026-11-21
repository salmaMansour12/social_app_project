import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeLeftComponent } from './home-left.component';

describe('HomeLeftComponent', () => {
  let component: HomeLeftComponent;
  let fixture: ComponentFixture<HomeLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLeftComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeLeftComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
