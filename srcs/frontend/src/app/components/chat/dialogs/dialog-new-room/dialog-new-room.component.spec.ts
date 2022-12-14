import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewRoomComponent } from './dialog-new-room.component';

describe('DialogNewRoomComponent', () => {
  let component: DialogNewRoomComponent;
  let fixture: ComponentFixture<DialogNewRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewRoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogNewRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
