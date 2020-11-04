import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { Annotation } from 'src/app/models/evt-models';
import { AnchoringService } from 'src/app/services/annotator/anchoring.service';
import { AnnotatorService } from 'src/app/services/annotator/annotator.service';
import { IdbService } from 'src/app/services/idb.service';
import { textAnnotationSettings } from 'src/app/utils/annotation-utils';
import { uuid } from 'src/app/utils/js-utils';

@Component({
  selector: 'evt-text-annotator',
  templateUrl: './text-annotator.component.html',
  styleUrls: ['./text-annotator.component.scss']
})

export class TextAnnotatorComponent implements OnInit {
  public showAdder: boolean = false;
  public showCreator: boolean = false;
  public showCommands: boolean = false;
  public updateMode:boolean = false;
  public selectedText: string;
  public noteSettings = {adder: {x:0,y:0}};
  public noteInfo = [];

  constructor(
    private anchoring: AnchoringService,
    private annotator: AnnotatorService,
    private db: IdbService
  ) { }

  ngOnInit(): void {
   
    this.annotator.textSelection.subscribe((selection) => {{}
      this.selectedText = selection.toString();
      /\S/.test(selection.toString())
        ?(
          this.openAdder(),
          this.closeNoteCreator(),
          this.initializeTextNote(selection)
        )
        : (
          this.closeAdder(),
          this.closeNoteCreator()
        );
    })
    this.clickableNote()
    
  }

  clickableNote(){
    setTimeout(() => {
      let span = Array.from(document.getElementsByTagName("evt-annotation"));
      span.forEach((s:HTMLElement) => {
        fromEvent(s, 'click').subscribe( () => {
          this.noteInfo = []
          const id = s.getAttribute("data-id");
          const collection = this.db.where("id").equals(id).toArray();
          collection.then((annotations: Array<Annotation>) => {
            annotations.map(anno => {
              this.noteInfo.push(anno),
              this.selectedText = anno.target.selector[0].exact,
              this.noteSettings.adder.x = anno.target.selector[1].start,
              this.noteSettings.adder.y = anno.target.selector[1].end,
              this.openNoteCreator()
            })
          })
        })
      })
    }, 2000)
  }

  initializeTextNote(sel) {
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const regex = new RegExp(`(.{0,32})${this.selectedText.replace(/\n|\r/g, '')}(.{0,32})`);
    this.noteSettings = textAnnotationSettings(range, rect, regex);
    this.noteInfo = []
    this.updateMode = false;
  }
  // Adder and Creation functionality
  openAdder(){
    this.showAdder = true;
  }

  closeAdder(){
    this.showAdder = false;
  }

  openNoteCreator(){
    this.closeAdder()
    this.showCommands = false;
    this.showCreator = true;
  }

  closeNoteCreator(){
    this.showCreator = false;
  }

  toggleCommand(){
    this.showCommands = !this.showCommands
  }
  
  setUpdate(){
    this.updateMode = true;
  }

  updateAnnotation(note){
    const annotation = this.db.get({id:this.noteInfo[0].id}).then(annotation => {
      annotation.body.value = note
    })
    this.db.update(this.noteInfo[0].id, annotation)
    this.showCreator = false;
    this.updateMode = false;
  }

  deleteAnnotation(){
    const annotation = Array.from(document.querySelectorAll(`[data-id="${this.noteInfo[0].id}"]`))
    annotation.map((anno:HTMLElement) => {
      anno.outerHTML = anno.innerHTML
    })
    this.showCreator = false;
    this.db.remove(this.noteInfo[0].id)
  }

  createAnnotation(type, note?) {
    let annotation: Annotation =
    {
      '@context': 'http:www.w3.org/ns/anno.jsonld',
      id: uuid('#').replace('-0.',''),
      type:"Annotation",
      created: new Date().toISOString(),
      body: {
        type:"TextualBody",
        value: note ? note : '',
        format:"text/html",
        purpose: type
      },
      target: {
        source: window.location.href,
        type:"text",
        selector: [
          {
            type:'TextQuoteSelector',
            exact: this.selectedText,
            prefix: this.noteSettings["annotation"].prefix,
            suffix: this.noteSettings["annotation"].suffix
          },
          {
            type: "DataPositionSelector",
            start: this.noteSettings.adder.x,
            end: this.noteSettings.adder.y
          },
          {
            type: "TextPositionSelector",
            start: this.noteSettings["annotation"].startOffset,
            end: this.noteSettings["annotation"].endOffset
          },
          {
            type: 'RangeSelector',
            startSelector: {
              type:'XpathSelector',
              value: this.noteSettings["annotation"].startXpath
            },
            endSelector: {
              type:'XpathSelector',
              value: this.noteSettings["annotation"].endXpath
            }
          }
        ]
      }
    }
    this.db.add(annotation);
    this.clickableNote()
    this.closeAdder();
    this.closeNoteCreator()
    this.anchoring.anchoringText()
  }

}
