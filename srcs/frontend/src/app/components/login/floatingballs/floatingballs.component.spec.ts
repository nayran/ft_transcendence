import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingballsComponent } from './floatingballs.component';

describe('FloatingballsComponent', () => {
  let component: FloatingballsComponent;
  let fixture: ComponentFixture<FloatingballsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingballsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingballsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
