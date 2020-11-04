import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnotatorService implements OnDestroy {
  public textSelection = new Subject<object>();
  public imageSelection = new Subject<object>();
  public osdCurrentPage:string;

  getTextSelection() {
    console.log(document.getSelection())
    this.textSelection.next(document.getSelection());
  }

  getImageSelection(viewer, page){
    this.osdCurrentPage = page
    this.imageSelection.next(viewer)
  }
  
  ngOnDestroy(): void{
    this.textSelection.unsubscribe()
    this.imageSelection.unsubscribe()
    
  }

}
