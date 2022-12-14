import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRoomSettingComponent } from './dialog-room-setting.component';

describe('DialogRoomSettingComponent', () => {
  let component: DialogRoomSettingComponent;
  let fixture: ComponentFixture<DialogRoomSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogRoomSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRoomSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
