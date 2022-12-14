import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelChatRoomComponent } from './panel-chat-room.component';

describe('PanelChatRoomComponent', () => {
  let component: PanelChatRoomComponent;
  let fixture: ComponentFixture<PanelChatRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelChatRoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelChatRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
