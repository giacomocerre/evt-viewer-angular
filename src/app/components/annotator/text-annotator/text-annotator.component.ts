import { Component, OnInit } from '@angular/core';
import { Annotation } from 'src/app/models/evt-models';
import { AnnotatorService } from 'src/app/services/annotator/annotator.service';
import { textAnnotationSettings } from 'src/app/utils/annotation-utils';

@Component({
  selector: 'evt-text-annotator',
  templateUrl: './text-annotator.component.html',
  styleUrls: ['./text-annotator.component.scss']
})
export class TextAnnotatorComponent implements OnInit {
  public showAdder: boolean = false;
  public selectedText: string;
  public settings = {};

  constructor(
    private annotator: AnnotatorService,
  ) { }

  ngOnInit(): void {
    this.annotator.textSelection.subscribe((selection) => {
      this.selectedText = selection.toString();
      /\S/.test(selection.toString())
        ?(this.openAdder(), this.initializeNote(selection))
        : this.showAdder = false;
    })
  }


  initializeNote(sel) {
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const regex = new RegExp(`(.{0,32})${this.selectedText.replace(/\n|\r/g, '')}(.{0,32})`);
    this.settings = textAnnotationSettings(range, rect, regex);
  }

  openAdder(){
    this.showAdder = true;
  }

  createAnnotation(){
    let annotation: Annotation = {
      '@context': 'http:www.w3.org/ns/anno.jsonld',
      id:"aa",
      type:"Annotation",
      created: new Date().toISOString(),
      body: {
        type:"TextualBody",
        value:"my note",
        format:"ttext/html"
      },
      target: {
        source: window.location.href,
        type:"text",
        selector: [
          {
            type:'TextQuoteSelector',
            exact: this.selectedText,
            prefix: this.settings["annotation"].prefix,
            suffix: this.settings["annotation"].suffix
          },
          {
            type:'TextPositionSelector',
            start: this.settings["annotation"].startOffset,
            end: this.settings["annotation"].endOffset
          },
          {
            type: 'RangeSelector',
            startSelector: {
              type:'XpathSelector',
              value: this.settings["annotation"].startXpath
            },
            endSelector: {
              type:'XpathSelector',
              value: this.settings["annotation"].endXpath
            }
          }
        ]
      }
    }
    this.annotator.addAnnotation(annotation)
    this.showAdder = false;
  }

}
