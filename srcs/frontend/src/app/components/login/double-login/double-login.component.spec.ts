import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubleLoginComponent } from './double-login.component';

describe('DoubleLoginComponent', () => {
  let component: DoubleLoginComponent;
  let fixture: ComponentFixture<DoubleLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoubleLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoubleLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
