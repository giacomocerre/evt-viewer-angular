import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnotatorService {
  textSelection: Subject<object> = new Subject();

  getTextSelection() {
    const selection = window.getSelection();
    this.textSelection.next(selection);
    console.log(this.textSelection);
  }
}
