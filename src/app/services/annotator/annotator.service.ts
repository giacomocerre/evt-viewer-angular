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
  osdCurrentPage = new Subject<string>();

  constructor(private db: IdbService){}

  getTextSelection() {
    this.textSelection.next(window.getSelection());
  }

  getImageSelection(viewer, page){
    this.osdCurrentPage.next(page)
    this.imageSelection.next(viewer)
  }

  anchoringImage(page){
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      console.log(annotations[1].target.selector)
      const g_draw = Array.from(document.getElementsByClassName("a9s-annotation"));
      g_draw.forEach((g,i) => {
        if( annotations[i] !== undefined){
          if(page === annotations[i].target.source) {
            Array.from(g.childNodes).map((g_child: HTMLElement) => {
              g_child.setAttribute("points", annotations[i].target.selector[0].value.split('\"')[1])
              g_child.setAttribute("width", annotations[i].target.selector[0].value.split(',')[2])
              g_child.setAttribute("heigth", annotations[i].target.selector[0].value.split(',')[3])
            })
          }else{
            Array.from(g.childNodes).map((g_child: HTMLElement) => {
              g_child.removeAttribute("points")
              g_child.removeAttribute("heigth")
              g_child.removeAttribute("width")
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
