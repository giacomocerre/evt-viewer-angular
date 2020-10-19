import { Component, OnInit } from '@angular/core';
import { AnnotatorService } from 'src/app/services/annotator/annotator.service';
import * as Annotorious from '@recogito/annotorious-openseadragon';

@Component({
  selector: 'evt-image-annotator',
  templateUrl: './image-annotator.component.html',
  styleUrls: ['./image-annotator.component.scss']
})
export class ImageAnnotatorComponent implements OnInit {
  public startAnnotation: boolean = false;
  public anno;

  constructor(
    private annotator: AnnotatorService
  ) { }

  ngOnInit(): void {
    this.annotator.imageSelection.subscribe((viewer) => {
       this.anno = Annotorious(viewer, {})
    })
  }

  initializeImgAnnotation(){
    this.startAnnotation = !this.startAnnotation
    this.anno.setDrawingEnabled(this.startAnnotation)
  }

  setDrawType(type){
    this.anno.setDrawingEnabled(true)
    this.anno.setDrawingTool(type);
  }

}
