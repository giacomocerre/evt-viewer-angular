import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Annotation, AnnotationID } from 'src/app/models/evt-models';
import { IdbService } from '../idb.service';

@Injectable({
  providedIn: 'root',
})
export class AnnotatorService {
  textSelection = new Subject<object>();
  imageSelection = new Subject<object>();
  annotationsList: Array<Annotation> = [];
  osdCurrentPage: string;

  constructor(private db: IdbService){}

  getTextSelection() {
    this.textSelection.next(window.getSelection());
  }

  getImageSelection(viewer){
    this.imageSelection.next(viewer)
  }

  anchoringImage(page){
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      const g_draw = Array.from(document.getElementsByClassName("a9s-annotation"));
      g_draw.forEach((g,i) => {
        if( annotations[i] !== undefined){
          if(page === annotations[i].target.source) {
            Array.from(g.childNodes).map((child: HTMLElement) => {
              child.setAttribute("style", "fill:red; fill-opacity: .2")
            })
          }else{
            Array.from(g.childNodes).map((child: HTMLElement) => {
              child.setAttribute("style", "stroke-width: 0px; stroke: transparent")
            })
          }
        }
      });
    })
  }


  addAnnotation(annotation: Annotation){
    this.db
    .add(annotation)
    .then((annotationID) => {
      this.annotationsList = [...this.annotationsList, Object.assign({}, annotation, { annotationID })];
    });
  }
}
