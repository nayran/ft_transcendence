import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAvatarComponent } from './dialog-avatar.component';

describe('DialogContentComponent', () => {
  let component: DialogAvatarComponent;
  let fixture: ComponentFixture<DialogAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogAvatarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
