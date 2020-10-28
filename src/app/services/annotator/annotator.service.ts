import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Annotation } from 'src/app/models/evt-models';

@Injectable({
  providedIn: 'root',
})
export class AnnotatorService {
  textSelection = new Subject<object>();
  imageSelection = new Subject<object>();
  annotationsList: Array<Annotation> = [];
  osdCurrentPage:string;;

  getTextSelection() {
    this.textSelection.next(document.getSelection());
  }

  getImageSelection(viewer, page){
    this.osdCurrentPage = page
    this.imageSelection.next(viewer)
  }
}
