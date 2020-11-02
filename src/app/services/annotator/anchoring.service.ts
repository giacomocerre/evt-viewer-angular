import { Injectable } from '@angular/core';
import { AnnotationID } from 'src/app/models/evt-models';
import { IdbService } from '../idb.service';
import { AnnotatorService } from './annotator.service';

@Injectable({
  providedIn: 'root',
})
export class AnchoringService {

  constructor(
    private annotator: AnnotatorService,
    private db: IdbService
  ) {}

  anchoringImage(page) {
    this.annotator.osdCurrentPage = page;
    const collection = this.db.where("target.type").equals("image").toArray();
    collection.then((annotations: Array<AnnotationID>) => {
      const view = { rect: [], poly: [] };
      console.log(annotations)
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
    setTimeout(() => {
    const collection = this.db.where("target.source").equals(window.location.href).toArray();
    collection.then((annotations: Array<AnnotationID>) => {
      annotations.map((annotation) => {
          this.highlightRange(annotation.target.selector, annotation.body.purpose, annotation.id)
      });
    });
  }, 1000);
  }

  resetAnnotation(){
    let annotations = Array.from(document.getElementsByTagName("evt-annotation"));
    annotations.map((anno:HTMLElement) => {
      anno.outerHTML = anno.innerHTML
    })
  }

  highlightRange(annotation, type, id) {
    let range = document.createRange()
    let startNode = document.evaluate( annotation[3].startSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let endNode = document.evaluate( annotation[3].endSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; 
    try {
      range.setStart(startNode.firstChild, annotation[2].start);
      range.setEnd(endNode.firstChild, annotation[2].end);
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
}
