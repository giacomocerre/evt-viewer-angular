import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Annotation } from 'src/app/models/evt-models';
import { IdbService } from '../idb.service';

@Injectable({
  providedIn: 'root',
})
export class AnnotatorService {
  textSelection = new Subject<object>();
  imageSelection = new Subject<object>();
  annotationsList: Array<Annotation> = [];

  constructor(private db: IdbService){}

  getTextSelection() {
    this.textSelection.next(window.getSelection());
  }

  getImageSelection(viewer){
    this.imageSelection.next(viewer)
  }

  addAnnotation(annotation: Annotation){
    this.db
    .add(annotation)
    .then((annotationID) => {
      this.annotationsList = [...this.annotationsList, Object.assign({}, annotation, { annotationID })];
    });
  }
}
