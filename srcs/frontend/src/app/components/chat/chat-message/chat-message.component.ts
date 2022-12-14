import { Component, Input, OnInit } from '@angular/core';
import { MessageInterface } from 'src/app/model/message.interface';
import { UserInterface } from 'src/app/model/user.interface';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input()
  message!: MessageInterface;

  @Input()
  myUser!: UserInterface;
  avatar!: string;
  created_at!: Date;
  today = new Date();
  username!: string;
  
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.username = this.message.member.user.username;
    this.avatar = this.message.member.user.avatar_url;
    this.created_at = this.message.created_at ?? new Date();
  }

  isMyUser() {
    return (this.message.member.user.username &&
      this.message.member.user.username == this.myUser.username);
  }
}
