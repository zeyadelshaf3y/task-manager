import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {animate, group, style, transition, trigger} from '@angular/animations';
import {BoardData, List, UserData} from '../../model/model';
import {NgForm} from '@angular/forms';
import {CookieService} from 'ngx-cookie-service';
import {BoardService} from '../../services/board.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

declare const $: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('scaleFade', [
      transition('* => void', [
        style({
          opacity: 1,
          transform: 'scale(1)'
        }), group([
          animate(80, style({
            opacity: 0
          })), animate(80, style({
            transform: 'scale(0.9)'
          }))
        ])
      ]),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'scale(0.9)'
        }), group([
          animate(80, style({
            opacity: 1
          })), animate(80, style({
            transform: 'scale(1)'
          }))
        ])
      ])
    ]),
    trigger('scale', [
      transition('* => void', [
        style({
          opacity: 1,
          transform: 'scale(1) translateY(-18vh)'
        }), group([
          animate(80, style({
            opacity: 0
          })), animate(80, style({
            transform: 'scale(0.9) translateY(-18vh)'
          }))
        ])
      ]),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'scale(0.9) translateY(-18vh)'
        }), group([
          animate(80, style({
            opacity: 1
          })), animate(80, style({
            transform: 'scale(1) translateY(-18vh)'
          }))
        ])
      ])
    ])
  ]
})
export class MainComponent implements OnInit, AfterViewInit {

  @ViewChild('todo_list') public todoList: ElementRef;
  @ViewChild('progress_list') public progressList: ElementRef;
  @ViewChild('review_list') public reviewList: ElementRef;
  @ViewChild('completed_list') public completedList: ElementRef;


  // Variables
  firstScreen = false;
  secondScreen = false;
  thirdScreen = false;

  todoForm = false;
  progressForm = false;
  reviewForm = false;
  completedForm = false;
  currentDate: Date;

  todoModalOpen = false;
  todoDescOpen = false;

  progressModalOpen = false;
  progressDesOpen = false;

  reviewModalOpen = false;
  reviewDesOpen = false;

  completedModalOpen = false;
  completedDesOpen = false;

  currentEditedValue = '';
  deleteIsOpen = false;

  // Objects
  boardData: BoardData = {
    todo: [],
    inProgress: [],
    review: [],
    completed: []
  };

  userData: UserData = {
    id: null,
    username: '',
    dateFormat: ''
  };

  editContainer: List = {
    id: '',
    status: null,
    description: '',
    date: null,
    title: ''
  };

  constructor(private cdr: ChangeDetectorRef, private board: BoardService) {
  }

  ngOnInit(): void {
    this.currentDate = new Date();
    this.getUserData();
    this.getBoardData();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  clearList(listName: string) {
    if (listName === 'todo') {
      this.boardData.todo = [];
    } else if (listName === 'progress') {
      this.boardData.inProgress = [];
    } else if (listName === 'review') {
      this.boardData.review = [];
    } else {
      this.boardData.completed = [];
    }
    this.saveBoardData();
    this.getBoardData();

  }

  showSettings() {
    this.secondScreen = false;
    setTimeout(() => {
      this.thirdScreen = true;
    }, 80);
  }

  showBoard() {
    this.thirdScreen = false;
    this.firstScreen = false;
    setTimeout(() => {
      this.getUserData();
      this.secondScreen = true;
    }, 80);
  }

  saveUserName(username: HTMLInputElement) {
    if (username.value.trim().length > 0) {
      this.board.saveUserData(this.userData);
      this.firstScreen = false;
      this.thirdScreen = false;
    }
    this.thirdScreen = false;
    setTimeout(() => {
      this.secondScreen = true;
      this.getUserData();
    }, 80);
  }

  getUserData() {
    try {
      this.userData = this.board.getUserData();
      this.secondScreen = true;
    } catch (e) {
      this.secondScreen = false;
      this.thirdScreen = false;
      this.resetBoard();
      setTimeout(() => {
        this.firstScreen = true;
      }, 80);
    }
  }

  saveBoardData() {
    this.board.saveBoardData(this.boardData);
  }

  getBoardData() {
    try {
      this.boardData = this.board.getBoardData();
    } catch (err) {
      this.saveBoardData();
    }
  }

  focus(ele: HTMLInputElement) {
    setTimeout(() => {
      ele.focus();
    }, 10);
  }

  desFocus(ele: HTMLTextAreaElement) {
    setTimeout(() => {
      ele.focus();
      ele.select();
    });
  }

  blur(input: HTMLInputElement, form: NgForm) {
    if (input.value.trim().length > 0) {
      if (input.name === 'todo_title') {
        this.addNewTodo(input.value, form);
        this.scrollBottom(this.todoList);
      } else if (input.name === 'progress_title') {
        this.addNewProgress(input.value, form);
        this.scrollBottom(this.progressList);
      } else if (input.name === 'review_title') {
        this.addNewReview(input.value, form);
        this.scrollBottom(this.reviewList);
      } else {
        this.addNewCompletedTask(input.value, form);
        this.scrollBottom(this.completedList);
      }
      this.focus(input);
    } else {
      this.closeAllInputs();
    }
  }

  desBlur(input: HTMLTextAreaElement, item: List) {
    if (input.value.trim().length > 0) {
      if (input.name === 'todo_des') {
        this.editTodoDes(input.value, item);
      }
    }
    this.closeAllTextAreas();
  }

  // todo edit operations

  editTodoDes(des: string, item: List) {
    if (des.trim().length > 0) {
      for (const todo of this.boardData.todo) {
        if (item.id === todo.id) {
          console.log('easy');
          todo.description = des;
          this.saveBoardData();
          this.currentEditedValue = '';
          return false;
        }
      }
    } else {
      for (const todo of this.boardData.todo) {
        if (item.id === todo.id) {
          todo.description = '';
          this.saveBoardData();
          this.editContainer.description = '';
          this.currentEditedValue = '';
          return false;
        }
      }
    }
  }

  editTodoTitle(title: HTMLInputElement, item: List) {
    if (title.value.trim().length > 0) {
      for (const todo  of this.boardData.todo) {
        if (item.id === todo.id) {
          todo.title = title.value;
          this.saveBoardData();
          title.blur();
        }
      }
    }
  }

  titleBlur(title: HTMLInputElement) {
    if (title.value.trim().length === 0) {
      this.editContainer.title = this.currentEditedValue;
      return false;
    } else {
      if (title.name === 'todo_title') {
        this.editTodoTitle(title, this.editContainer);
      } else if (title.name === 'progress_title') {
        this.editProgressTitle(title, this.editContainer);
      } else if (title.name === 'review_title') {

      } else {

      }
    }
  }

  deleteTodo() {
    for (let i = 0; i < this.boardData.todo.length; i++) {
      if (this.boardData.todo[i].id === this.editContainer.id) {
        this.boardData.todo.splice(i, 1);
        this.saveBoardData();
        this.deleteIsOpen = false;
        this.todoModalOpen = false;
        $('.alert').fadeIn(200);
        setTimeout(() => {
          $('.alert').fadeOut(200);
        }, 8000);
        return false;
      }
    }
  }


  // progress edit operations
  editProgressDes(des: string, item: List) {
    if (des.trim().length > 0) {
      for (const progress of this.boardData.inProgress) {
        if (item.id === progress.id) {
          progress.description = des;
          this.saveBoardData();
          this.currentEditedValue = '';
          return false;
        }
      }
    } else {
      for (const progress of this.boardData.inProgress) {
        if (item.id === progress.id) {
          progress.description = '';
          this.saveBoardData();
          this.editContainer.description = '';
          this.currentEditedValue = '';
          return false;
        }
      }
    }
  }

  editProgressTitle(title: HTMLInputElement, item: List) {
    if (title.value.trim().length > 0) {
      for (const progress  of this.boardData.inProgress) {
        if (item.id === progress.id) {
          progress.title = title.value;
          this.saveBoardData();
          title.blur();
        }
      }
    }
  }

  deleteProgress() {
    for (let i = 0; i < this.boardData.inProgress.length; i++) {
      if (this.boardData.inProgress[i].id === this.editContainer.id) {
        this.boardData.inProgress.splice(i, 1);
        this.saveBoardData();
        this.deleteIsOpen = false;
        this.progressModalOpen = false;
        $('.alert').fadeIn(200);
        setTimeout(() => {
          $('.alert').fadeOut(200);
        }, 8000);
        return false;
      }
    }
  }


  // progress edit operations
  editReviewDes(des: string, item: List) {
    if (des.trim().length > 0) {
      for (const review of this.boardData.review) {
        if (item.id === review.id) {
          review.description = des;
          this.saveBoardData();
          this.currentEditedValue = '';
          return false;
        }
      }
    } else {
      for (const review of this.boardData.review) {
        if (item.id === review.id) {
          review.description = '';
          this.saveBoardData();
          this.editContainer.description = '';
          this.currentEditedValue = '';
          return false;
        }
      }
    }
  }

  editReviewTitle(title: HTMLInputElement, item: List) {
    if (title.value.trim().length > 0) {
      for (const review  of this.boardData.review) {
        if (item.id === review.id) {
          review.title = title.value;
          this.saveBoardData();
          title.blur();
        }
      }
    }
  }

  deleteReview() {
    for (let i = 0; i < this.boardData.review.length; i++) {
      if (this.boardData.review[i].id === this.editContainer.id) {
        this.boardData.review.splice(i, 1);
        this.saveBoardData();
        this.deleteIsOpen = false;
        this.reviewModalOpen = false;
        $('.alert').fadeIn(200);
        setTimeout(() => {
          $('.alert').fadeOut(200);
        }, 8000);
        return false;
      }
    }
  }


  // completed edit operations
  editCompletedDes(des: string, item: List) {
    if (des.trim().length > 0) {
      for (const completed of this.boardData.completed) {
        if (item.id === completed.id) {
          completed.description = des;
          this.saveBoardData();
          this.currentEditedValue = '';
          return false;
        }
      }
    } else {
      for (const completed of this.boardData.completed) {
        if (item.id === completed.id) {
          completed.description = '';
          this.saveBoardData();
          this.editContainer.description = '';
          this.currentEditedValue = '';
          return false;
        }
      }
    }
  }

  editCompletedTitle(title: HTMLInputElement, item: List) {
    if (title.value.trim().length > 0) {
      for (const completed  of this.boardData.completed) {
        if (item.id === completed.id) {
          completed.title = title.value;
          this.saveBoardData();
          title.blur();
        }
      }
    }
  }

  deleteCompleted() {
    for (let i = 0; i < this.boardData.completed.length; i++) {
      if (this.boardData.completed[i].id === this.editContainer.id) {
        this.boardData.completed.splice(i, 1);
        this.saveBoardData();
        this.deleteIsOpen = false;
        this.completedModalOpen = false;
        $('.alert').fadeIn(200);
        setTimeout(() => {
          $('.alert').fadeOut(200);
        }, 8000);
        return false;
      }
    }
  }


  // add new todo task
  addNewTodo(title: string, form: NgForm) {
    const newItem: List = {
      id: this.randomIdGenerator() + '-' + this.randomIdGenerator(),
      title,
      date: new Date(),
      description: '',
      badge: '',
      status: true
    };
    if (title.trim().length > 0) {
      this.boardData.todo.push(newItem);
      this.saveBoardData();
      form.reset();
    }
  }

  // add new in progress task
  addNewProgress(title: string, form: NgForm) {
    const newItem: List = {
      id: this.randomIdGenerator() + '-' + this.randomIdGenerator(),
      title,
      date: new Date(),
      description: '',
      badge: '',
      status: true
    };
    if (title.trim().length > 0) {
      this.boardData.inProgress.push(newItem);
      this.saveBoardData();
      form.reset();
    }
  }

  // add new review task
  addNewReview(title: string, form: NgForm) {
    const newItem: List = {
      id: this.randomIdGenerator() + '-' + this.randomIdGenerator(),
      title,
      date: new Date(),
      description: '',
      badge: '',
      status: true
    };
    if (title.trim().length > 0) {
      this.boardData.review.push(newItem);
      this.saveBoardData();
      form.reset();
    }
  }

  // add new completed task
  addNewCompletedTask(title: string, form: NgForm) {
    const newItem: List = {
      id: this.randomIdGenerator() + '-' + this.randomIdGenerator(),
      title,
      date: new Date(),
      description: '',
      badge: '',
      status: true
    };
    if (title.trim().length > 0) {
      this.boardData.completed.push(newItem);
      this.saveBoardData();
      form.reset();
      this.scrollBottom(this.todoList);
    }
  }

  fillContainer(itemList: List) {
    const {id, title, date, description}: List = itemList;
    this.editContainer = {
      description,
      id,
      title,
      date
    };
  }


  trackByFn(index, item: List) {
    return item.id;
  }

  scrollBottom(list: ElementRef): void {
    try {
      setTimeout(() => {
        // list.nativeElement.scrollTop = list.nativeElement.scrollHeight;
        list.nativeElement.scrollTo({left: 0, top: list.nativeElement.scrollHeight, behavior: 'smooth'});
      });
      this.cdr.detectChanges();

    } catch (err) {
    }
  }

  // this method generated random id
  randomIdGenerator(): string {
    return Math.floor((1 + Math.random()) * 0x8000)
      .toString(16)
      .substring(1);
  }

  closeAllInputs() {
    this.todoForm = false;
    this.progressForm = false;
    this.reviewForm = false;
    this.completedForm = false;
  }

  closeAllTextAreas() {
    this.todoDescOpen = false;
    this.progressDesOpen = false;
    this.reviewDesOpen = false;
    this.completedDesOpen = false;
  }

  resetBoard() {
    this.boardData = {
      todo: [],
      inProgress: [],
      review: [],
      completed: []
    };

    this.saveBoardData();
  }

  // ******** Drag and Drop ******** //
  drop(event: CdkDragDrop<List[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.saveBoardData();
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      this.saveBoardData();
    }
  }

}
