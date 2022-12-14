import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUsernameComponent } from './dialog-username.component';

describe('DialogUsernameComponent', () => {
  let component: DialogUsernameComponent;
  let fixture: ComponentFixture<DialogUsernameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogUsernameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
