import { Component, OnInit } from '@angular/core';
import { AnnotatorService } from 'src/app/services/annotator/annotator.service';
import { AnchoringService } from 'src/app/services/annotator/anchoring.service';
import { IdbService } from 'src/app/services/idb.service';
import * as Annotorious from '@recogito/annotorious-openseadragon';
import { Annotation } from 'src/app/models/evt-models';

@Component({
  selector: 'evt-image-annotator',
  templateUrl: './image-annotator.component.html',
  styleUrls: ['./image-annotator.component.scss']
})
export class ImageAnnotatorComponent implements OnInit {

  public annotorious;
  public annotationContent = document.getElementsByClassName("a9s-annotationlayer");
  public viewNotes: boolean = false

  constructor(
    private anchoring: AnchoringService,
    private annotator: AnnotatorService,
    private db: IdbService
  ) { }
  
  ngOnInit(): void {
    this.annotator.imageSelection.subscribe((viewer) => {
      viewer
        ? this.annotorious = Annotorious(viewer, {})
        : null
      //creation
      this.annotorious.on('createAnnotation', (annotation:Annotation) => {
         this.createAnnotation(annotation)
      });
      //update
      this.annotorious.on('updateAnnotation', (annotation:Annotation, {}) => {
        this.db.update(annotation.id, annotation)
      });
      //delete
      this.annotorious.on('deleteAnnotation', (annotation: Annotation) => {
        this.db.remove(annotation.id)
      });
      this.initializeImageNotes()
    });
  }

  initializeImageNotes(){
    const collection = this.db.where("target.type").equals("image").toArray();
    collection.then((annotations: Array<Annotation>) => {
      this.annotorious.setAnnotations(annotations)
      this.toggleAnnotations(this.viewNotes)
    });
  }

  toggleAnnotations(show:boolean){
    this.viewNotes = show;
    console.log(this.annotationContent)
    Array.from(this.annotationContent)[0].setAttribute("style", `display:${show ? "block": "none"}`)
  }

  setDrawType(type:string){
    this.toggleAnnotations(true);
    this.annotorious.setDrawingEnabled(true)
    this.annotorious.setDrawingTool(type); 
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
    //add
    this.db.add(annotation);
    this.anchoring.anchoringImage(this.annotator.osdCurrentPage)
  }

}
