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
  public annotationContent = document.getElementsByClassName("a9s-annotationlayer");
  public annotationDraws = document.getElementsByClassName("a9s-annotation");
  public svgSelection= document.getElementsByClassName("a9s-selection");
  public viewNotes: boolean = false

  constructor(
    private annotator: AnnotatorService,
    private db: IdbService
  ) { }
  
  ngOnInit(): void {
    this.annotator.imageSelection.subscribe((viewer) => {
      viewer
        ? (this.anno = Annotorious(viewer, {}))
        : null
      //creation
      this.anno.on('createAnnotation', (a:Annotation) => {
         this.createAnnotation(a)
      });
      //update
      this.anno.on('updateAnnotation', (annotation, {}) => {
        this.db.update(annotation.id, annotation)
      });
      //delete
      this.anno.on('deleteAnnotation', (annotation) => {
        this.db.remove(annotation.id)
      });
      //selection
      this.anno.on('selectAnnotation', (annotation) => {
        console.log('selected', annotation);
      });
      this.uploadImgAnnotation()
    });
  }

  uploadImgAnnotation(){
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      this.anno.setAnnotations(annotations)
      if((Array.from(this.annotationContent).length <= 1)){
        this.toggleAnnotation(this.viewNotes)
      }
    });
  }

  toggleAnnotation(show){
    this.viewNotes = show;
    Array.from(this.annotationContent)[0].setAttribute("style", `display:${show ? "block": "none"}`)
  }

  setDrawType(type){
    this.toggleAnnotation(true);
    this.anno.setDrawingEnabled(true)
    this.anno.setDrawingTool(type); 
  }

  createAnnotation(a) {
    console.log(a.target.selector)
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
    //add
    this.db.add(annotation);
    
  }

}
