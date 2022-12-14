import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from './chat.service';
import { ChatSocket } from './chat-socket';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule
  ],
  providers: [
    ChatService,
    ChatSocket
  ]
})
export class ChatModule {
}
