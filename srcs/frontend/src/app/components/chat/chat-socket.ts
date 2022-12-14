import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { AuthService } from 'src/app/auth/auth.service';
import { getUserId } from "../../auth/auth.module"

@Injectable()
export class ChatSocket extends Socket {

  constructor(private authService: AuthService) {
    super({
      url: '/chat', options: {
        autoConnect: false,
        extraHeaders: { userid: getUserId() ?? "null" }
      }
    })
  }
}
