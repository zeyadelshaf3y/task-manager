import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {BoardData, UserData} from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(private cookie: CookieService) { }

  saveBoardData(boardData: BoardData) {
    this.cookie.set('boardData', JSON.stringify(boardData));
  }

  getBoardData() {
    return JSON.parse(this.cookie.get('boardData'));
  }

  saveUserData(userData: UserData) {
    this.cookie.set('userData', JSON.stringify(userData));
  }

  getUserData() {
    return JSON.parse(this.cookie.get('userData'));
  }

  deleteBoardData() {
    this.cookie.delete('boardData');
  }
}
