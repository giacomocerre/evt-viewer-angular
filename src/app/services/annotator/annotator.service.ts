import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as Annotorious from '@recogito/annotorious-openseadragon';

@Injectable({
  providedIn: 'root',
})
export class AnnotatorService {
  textSelection = new Subject<object>();
  imageSelection = new Subject<object>();

  getTextSelection() {
    const selection = window.getSelection();
    this.textSelection.next(selection);
  }

  getImageSelection(viewer){
    const selection = Annotorious(viewer,{})
    this.imageSelection.next(selection);
  //   const config = {};
  //   const anno = Annotorious(viewer, config);
  //   let annotationType = 'polygon'
  //   anno.setDrawingTool(annotationType);
    selection.on('createAnnotation', function(a) {
      console.log(a)
    });
  }
}
