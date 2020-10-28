import { Injectable } from '@angular/core';
import { AnnotationID } from 'src/app/models/evt-models';
import { IdbService } from '../idb.service';
import { AnnotatorService } from './annotator.service';

@Injectable({
  providedIn: 'root',
})
export class AnchoringService {
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

  anchoringText() {
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      annotations = annotations.filter((anno) => anno.target.type === 'text');
      annotations.map((annotation) => {
        setTimeout(() => {
          if (this.RangeSelector(annotation.target.selector)) {
            console.log('range sel');
            return;
          } else if (this.TextPositionSelector(annotation.target.selector)) {
            console.log('text position');
            return;
          } else if (this.TextQuoteSelector(annotation.target.selector)) {
            console.log('text quote');
            return;
          } else if (this.fuzzySearch(annotation.target.selector)) {
            console.log('fuzzy');
            return;
          } else {
            this.orphans();
          }
        }, 3000);
      });
    });
  }

  createSpan(node, text, position) {
    console.log(position);
    const words = node.textContent.split(' ').filter((s) => s != '').length;
    let tmp = text.split(' ');
    let search = [];
    tmp.map((a) => {
      search.push(a);
    });
    search = search.filter((s) => s != '');
    if (position === 0 || position === 'target') {
      search.map((s, i) => {
        let ttt;
        // `${search[i-1]?search[i-1]:''} ${s} ${search[i+1]?search[i+1]:''}`
        // const regex2 = new RegExp(try2,"g")
        if (words <= 2) {
          const word = s;
          const regex = new RegExp(word, 'g');
          ttt = node.innerHTML.replace( regex, `<span class='note' data-id='asd'>${word}</span>`);
        } else {
          const words = `${search[i - 1] ? search[i - 1] + ' ' : ''}${s}${search[i + 1] ? ' ' + search[i + 1] : ''}`;
          console.log(words)
          const regex = new RegExp(`${words}`, 'g');
          console.log(regex);
          ttt = node.innerHTML.replace( regex, `<span class='note' data-id='asd'>${words}</span>`);
        }
        if (ttt != node.innerHTML) {
          node.innerHTML = ttt;
        }
      });
    } else {
      const span = document.createElement('span');
      span.setAttribute('class', 'note');
      node.after(span);
      span.appendChild(node);
    }
  }

  getNode(node, target, note, nodeCounter) {
    if (node && target) {
      if (node.contains(target)) {
        this.createSpan(target, note, 'target');
        return true;
      } else {
        this.createSpan(node, note, nodeCounter);
        if (node.nextElementSibling) {
          this.getNode(
            node.nextElementSibling,
            target,
            note,
            (nodeCounter += 1)
          );
        } else {
          console.log(node);
          this.getNode(
            node.parentNode.nextElementSibling,
            target,
            note,
            (nodeCounter += 1)
          );
        }
      }
    } else {
      return false;
    }
  }

  // metodi di match.
  RangeSelector(annotation) {
    let start_node = document.evaluate( annotation[2].startSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let end_node = document.evaluate(annotation[2].endSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return this.getNode(start_node, end_node, annotation[0].exact, 0);
    // return true
  }

  TextPositionSelector(annotaion) {
    const start_node = document.elementFromPoint(annotaion[1].start, annotaion[1].end);
    // const end_node = document.elementFromPoint();
    console.log(start_node, annotaion[1].start, annotaion[1].end)
    this.getNode(start_node, start_node, annotaion[0].exact, 0)
    return false;
  }

  TextQuoteSelector(annotation) {
    return false;
  }

  fuzzySearch(annotation) {
    return false;
  }

  orphans() {
    console.log('orphans');
  }
}
