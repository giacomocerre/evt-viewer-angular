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
       this.anno.on('createAnnotation', (a:Annotation) => {
         this.createAnnotation(a)
      });
      this.db.getAll().then((annotations: Array<AnnotationID>) => {
        // this.annotator.getImageAnnotation(this.anno, annotations)
        this.anno.setAnnotations(annotations)
        this.annotator.osdCurrentPage.subscribe((page) => {
          this.annotator.anchoringImage(page)
        })
        if((Array.from(this.annotationContent).length <= 1)){
          this.toggleAnnotation(this.viewNotes)
        }
      });
      Array.from(this.annotationDraws).map(g => {
        Array.from(g.childNodes).map((child: HTMLElement) => {
          child.onclick = function() {console.log("aa")}

        })
      })
    })
  }

  openNote(){
    
  }

  toggleAnnotation(show){
    this.viewNotes = show;
    this.anno.setDrawingEnabled(show)
    Array.from(this.annotationContent)[0].setAttribute("style", `display:${show ? "block": "none"}`)
  }

  setDrawType(type){
    console.log(this.anno)
    this.toggleAnnotation(true);
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
    this.annotator.addAnnotation(annotation)
    
  }

}
