import { Component, OnInit } from '@angular/core';
import { AnnotatorService } from 'src/app/services/annotator/annotator.service';
import * as Annotorious from '@recogito/annotorious-openseadragon';
import { Annotation, AnnotationID } from 'src/app/models/evt-models';
import { IdbService } from 'src/app/services/idb.service';

@Component({
  selector: 'evt-image-annotator',
  templateUrl: './image-annotator.component.html',
  styleUrls: ['./image-annotator.component.scss']
})
export class ImageAnnotatorComponent implements OnInit {
  public anno;
  public annotation;

  constructor(
    private annotator: AnnotatorService,
    private db: IdbService
  ) { }

  ngOnInit(): void {
    this.annotator.imageSelection.subscribe((viewer) => {
      viewer
       ? (this.anno = Annotorious(viewer, {}))
       : null
       this.anno.on('createAnnotation', (a:Annotation) => {
         this.createAnnotation(a)
      });
      this.db.getAll().then((annotations: Array<AnnotationID>) => {
        this.anno.setAnnotations(annotations);
      });
    })
  
  }

  setDrawType(type){
    this.anno.setDrawingEnabled(true)
    this.anno.setDrawingTool(type); 
  }

  createAnnotation(a) {
    const annotation: Annotation = {
      '@context': 'http:www.w3.org/ns/anno.jsonld',
      id:a.id,
      type:"Annotation",
      created: new Date().toISOString(),
      body: {
        type:"TextualBody",
        value:a.body[0].value,
        format:"text/html",
        purpose: a.body[0].purpose
      },
      target: {
        source: a.target.source,
        type:"image",
        selector: [a.target.selector]
      }
    }
    this.annotator.addAnnotation(annotation)
    
  }

}
