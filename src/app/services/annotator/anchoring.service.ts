import { Injectable } from '@angular/core';
import { AnnotationID } from 'src/app/models/evt-models';
import { IdbService } from '../idb.service';
import { AnnotatorService } from './annotator.service';

@Injectable({
  providedIn: 'root',
})
export class AnchoringService {

  public noteID: string;
  constructor(private annotator: AnnotatorService, private db: IdbService) {}

  anchoringImage(page) {
    this.annotator.osdCurrentPage = page;
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      const view = { rect: [], poly: [] };
      const g_draw = Array.from(
        document.getElementsByClassName('a9s-annotation')
      );
      g_draw.map((g) => {
        const svg_id = g.getAttribute('data-id');
        Array.from(g.childNodes).map((g_child: HTMLElement) => {
          g_child.removeAttribute('points');
          g_child.removeAttribute('heigth');
          g_child.removeAttribute('width');
        });
        annotations
          .filter((x) => x.id === svg_id && x.target.source === page)
          .map((anno) => {
            if (anno.target.selector[0].type === 'FragmentSelector') {
              view.rect.push({
                g,
                position: {
                  width: anno.target.selector[0].value.split(',')[2],
                  heigth: anno.target.selector[0].value.split(',')[3],
                },
              });
            } else {
              view.poly.push({
                g,
                position: {
                  points: anno.target.selector[0].value.split('"')[1],
                },
              });
            }
          });
      });
      view.rect.map((el) => {
        Array.from(el.g.childNodes).map((g_child: HTMLElement) => {
          g_child.setAttribute('width', el.position.width);
          g_child.setAttribute('heigth', el.position.heigth);
        });
      });
      view.poly.map((el) => {
        Array.from(el.g.childNodes).map((g_child: HTMLElement) => {
          g_child.setAttribute('points', el.position.points);
        });
      });
    });
  }

  anchoringText(editionLevel?) {
    if(editionLevel){
      this.resetAnnotation()
    }
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      annotations = annotations.filter((anno) => anno.target.type === 'text');
      annotations = annotations.filter( anno => anno.target.source === window.location.href)
      annotations.map((annotation) => {
        setTimeout(() => {
          this.highlightRange(annotation.target.selector, annotation.body.purpose, annotation.id)
        }, 500);
      });
    });
  }

  resetAnnotation(){
    let annotations = Array.from(document.getElementsByTagName("evt-highlight-note"));
    annotations.map((anno:HTMLElement) => {
      const child = anno.innerText
      anno.innerHTML = child
    })
  }

  highlightRange(annotation, type, id) {
    var sel = window.getSelection();
    sel.removeAllRanges();
    let range = document.createRange()
    let start_node = document.evaluate( annotation[3].startSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let end_node = document.evaluate( annotation[3].endSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; 
    try {
      range.setStart(start_node.firstChild, annotation[2].start);
      range.setEnd(end_node.firstChild, annotation[2].end);
      sel.addRange(range)
      const selectedText = range.extractContents();
      const span = document.createElement("evt-annotation");
      span.setAttribute("class",`${type}`);
      span.setAttribute("data-id",`${id}`);
      span.appendChild(selectedText);
      range.insertNode(span);
    } catch (error) {
      null;
    }

  }

  orphans() {
    console.log('orphans');
  }
}
