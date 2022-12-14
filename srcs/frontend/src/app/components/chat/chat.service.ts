import { Injectable } from '@angular/core';
import { UserInterface } from '../../model/user.interface';
import { RoomInterface } from '../../model/room.interface';
import { RoomPaginateInterface } from '../../model/room.interface';
import { HttpClient } from '@angular/common/http';
import { MessageInterface, MessagePaginateInterface } from '../../model/message.interface';
import { ChatSocket } from './chat-socket';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MemberInterface } from '../../model/member.interface';

@Injectable()
export class ChatService {

  constructor(
    private socket: ChatSocket,
    private router: Router,
    private http: HttpClient) {
  }

  isSocketActive = false;

  addUserToRoom(room: RoomInterface, user: UserInterface): Observable<any> {
    return this.http.post('/backend/chat/add_user_to_room/', { roomId: room.id, userId: user.id }, { withCredentials: true });
  }

  blockUser(userId: number): Observable<any> {
    return this.http.post('/backend/chat/block_user/', { blockedUserId: userId }, { withCredentials: true });
  }

  checkRoomNameNotTaken(roomName: string) {
    if (roomName && roomName.length > 2) {
      return this.http.get('/backend/chat/is-room-name-taken/' + roomName);
    }
    return of(false);
  }

  connect() {
    this.socket.on("double_login", () => {
      this.router.navigate(['doublelogin']);
    });
    this.socket.connect();
    this.isSocketActive = true;
  }

  createRoom(room: RoomInterface): Observable<any> {
    return this.http.post('/backend/chat/create_room/', room, { withCredentials: true });
  }

  createDirectRoom(room: RoomInterface, user_id: number): Observable<any> {
    return this.http.post('/backend/chat/create_direct_room/', { room: room, user_id: user_id }, { withCredentials: true });
  }

  changeSettingsRoom(roomId: number, data: any): Observable<any> {
    return this.http.post('/backend/chat/change_settings_room/', { roomId: roomId, name: data.name, description: data.description, password: data.password, radioPassword: data.radioPassword }, { withCredentials: true });
  }

  disconnect() {
    this.socket.disconnect();
    this.isSocketActive = false;
  }

  sendMessage(message: string, room: RoomInterface): Observable<any> {
	return this.http.post('/backend/chat/add_message/', { message: message, room: room }, { withCredentials: true });
  }

  getMessages(): Observable<MessageInterface[]> {
    return this.socket.fromEvent<MessageInterface[]>('messages');
  }

  getMyChatRoomsPaginate(): Observable<RoomPaginateInterface> {
    return this.socket.fromEvent<RoomPaginateInterface>('rooms_nondirect');
  }

  getMyDirectRoomsPaginate(): Observable<RoomPaginateInterface> {
    return this.socket.fromEvent<RoomPaginateInterface>('rooms_direct');
  }

  joinRoom(room: RoomInterface): Observable<any> {
    return this.http.post('/backend/chat/join_room/', { roomId: room.id }, { withCredentials: true });
  }

  emitPaginateRooms(limit: number, page: number) {
    this.socket.emit('paginate_rooms', { limit, page });
  }

  emitPaginatePublicRooms(limit: number, page: number) {
    this.socket.emit('paginate_public_and_protected_rooms', { limit, page });
  }

  emitGetAllMyRooms() {
    this.socket.emit('get_all_my_rooms');
  }

  emitGetPublicRooms() {
    this.socket.emit('get_all_public_rooms');
  }

  getPublicRooms(): Observable<RoomPaginateInterface> {
    return this.socket.fromEvent<RoomPaginateInterface>('publicRooms');
  }

  leaveRoom(room: RoomInterface) {
    this.socket.emit('leave_room', room.id);
  }

  getAllMyRooms() {
    return this.socket.fromEvent<RoomInterface[]>('all_my_rooms');
  }

  getAllPublicRooms() {
    return this.socket.fromEvent<RoomInterface[]>('all_public_rooms');
  }

  requestMessages(roomId: number) {
    this.socket.emit('messages', roomId);
  }

  getAddedMessage(): Observable<MessageInterface> {
    return this.socket.fromEvent<MessageInterface>('message_added')
  }

  getAllUsers(): Observable<UserInterface[]> {
    return this.socket.fromEvent<UserInterface[]>('all_users');
  }

  getNonAddedUsers(): Observable<UserInterface[]> {
    return this.http.get<UserInterface[]>('/backend/chat/get_non_added_users/', { withCredentials: true });
  }

  getUserList(filter: string): Observable<any> {
    if (filter.length >= 3)
      return this.http.get('/backend/chat/searchusers/' + filter, { withCredentials: true });
    return of([]);
  }

  emitGetMembersOfRooms(roomId: number) {
    this.socket.emit('members_room', roomId);
  }

  getMembersOfRoom() {
    return this.socket.fromEvent<MemberInterface[]>('members_room');
  }

  getMyMemberOfRoom(roomId: number): Observable<MemberInterface> {
    return this.http.get<MemberInterface>('/backend/chat/get_my_member_of_room/' + roomId, { withCredentials: true });
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.post('/backend/chat/unblock_user/', { blockedUserId: userId }, { withCredentials: true });
  }

  isBlockedUser(userId: number) {
    return this.http.get<boolean>('/backend/chat/is_blocked/' + userId, { withCredentials: true });
  }

  getBlockedUsers() {
    return this.socket.fromEvent<number[]>('blocked_users');
  }

  getBlockerUsers() {
    return this.socket.fromEvent<number[]>('blocker_users');
  }

  emitGetBlockedUsers() {
    this.socket.emit('blocked_users');
  }

  emitGetBlockerUsers() {
    this.socket.emit('blocker_users');
  }

  setAsAdmin(userId: number, roomId: number): Observable<any> {
    return this.http.post('/backend/chat/set_as_admin/', { userId: userId, roomId: roomId }, { withCredentials: true });
  }

  unsetAdmin(userId: number, roomId: number): Observable<any> {
    return this.http.post('/backend/chat/unset_as_admin/', { userId: userId, roomId: roomId }, { withCredentials: true });
  }

  setMute(memberId: number, roomId: number, muteTime: Date): Observable<any> {
    return this.http.post('/backend/chat/set_mute/', { memberId: memberId, roomId: roomId, muteTime: muteTime }, { withCredentials: true });
  }

  setBan(memberId: number, roomId: number, banTime: Date): Observable<any> {
    return this.http.post('/backend/chat/set_ban/', { memberId: memberId, roomId: roomId, banTime: banTime }, { withCredentials: true });
  }

  verifyPassword(room: RoomInterface, password: string): Observable<any> {
    let body = {
      roomId: room.id,
      password: password
    }
    return this.http.post("/backend/chat/verify_password/", body, { withCredentials: true });
  }

  updateRoom() {
    return this.socket.fromEvent<RoomInterface>('update_room');
  }

  emitReadMessage(message_id: number) {
    this.socket.emit('read_message', message_id);
  }

  emitReadRoomMessages(room_id: number, member_id: number) {
	this.socket.emit('read_room_message', room_id, member_id)
  }

  getUnreadRooms(): Observable<any> {
	return this.socket.fromEvent<any>('unread_rooms');
  }

  emitGetUnreadRooms(): Observable<any> {
	return this.socket.emit('my_unread_rooms');
  }

  emitMessage(chat_room: number) {
	this.socket.emit('get_unreadmessages', chat_room);
  }
}
