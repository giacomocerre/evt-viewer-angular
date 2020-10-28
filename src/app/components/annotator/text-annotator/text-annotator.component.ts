import { Component, OnInit } from '@angular/core';
import { Annotation } from 'src/app/models/evt-models';
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
  public selectedText: string;
  public noteSettings = {adder: {x:0,y:0}};
  public span = document.getElementsByClassName('try');

  constructor(
    private annotator: AnnotatorService,
    private db: IdbService
  ) { }

  ngOnInit(): void {
    this.annotator.textSelection.subscribe((selection) => {
      this.selectedText = selection.toString();
      /\S/.test(selection.toString())
        ?(
          this.openAdder(),
          this.closeNoteCreator(),
          this.temporarySelection(selection, false),
          this.initializeTextNote(selection)
        )
        : (
          this.closeAdder(),
          this.closeNoteCreator(),
          this.temporarySelection(selection, false)
        );
    })
  }

  initializeTextNote(sel) {
    const range = sel.getRangeAt(0);
    // this.temporarySelection(range, true)
    const rect = range.getBoundingClientRect();
    const regex = new RegExp(`(.{0,32})${this.selectedText.replace(/\n|\r/g, '')}(.{0,32})`);
    this.noteSettings = textAnnotationSettings(sel, range, rect, regex);
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
    this.showCreator = true;
  }

  closeNoteCreator(){
    this.showCreator = false;
  }

  temporarySelection(range, selected){
    if(selected){
      const selectedText = range.extractContents();
      const span = document.createElement("span");
      span.setAttribute("class","tmp-selection");
      span.style.background = "yellow"
      span.style.padding = "5px 0px"
      span.appendChild(selectedText);
      range.insertNode(span);
    }else{
      document.querySelectorAll(".tmp-selection").forEach((span:HTMLElement) => 
        span.style.background = "transparent" 
      )
    }
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
        format:"ttext/html",
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
            type:'TextPositionSelector',
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
    this.closeAdder();
    this.closeNoteCreator()

  }

}
