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

  anchoringText() {
    console.log(window.location.href)
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
      annotations = annotations.filter((anno) => anno.target.type === 'text');
      annotations = annotations.filter( anno => anno.target.source === window.location.href)
      console.log(annotations)

      annotations.map((annotation) => {
        setTimeout(() => {
          this.RangeSelector(annotation.target.selector, annotation.id)
        }, 500);
      });
    });
  }

  RangeSelector(annotation, id) {
    let start_node = document.evaluate( annotation[2].startSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let end_node = document.evaluate( annotation[2].endSelector.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; 
    if(start_node && end_node){
      this.getNode(start_node, end_node, annotation[0].exact, 0, id)
    }else{
      this.orphans()
    }
  }

  getNode(node, target, note, nodeCounter, id) {
    if (node.contains(target)) {
      this.highlightRange(target, "node", note, id)
      return true
    } else {
      this.highlightRange(node, "node", note, id)
      if (node.nextElementSibling) {
        this.getNode(
          node.nextElementSibling,
          target,
          note,
          (nodeCounter += 1),
          id
        );
      } else {
        this.getNode(
          node.parentNode.nextElementSibling,
          target,
          note,
          (nodeCounter += 1),
          id
        );
      }
    }
  }

  highlightRange(normedRange, cssClass, text, id) {
    console.log(id)
    const white = /^\s*$/;
  
    // Find text nodes within the range to highlight.
    const textNodes = this.textNodes(normedRange);
  
    // Group text nodes into spans of adjacent nodes. If a group of text nodes are
    // adjacent, we only need to create one highlight element for the group.
    let textNodeSpans = [];
    let prevNode = null;
    let currentSpan = null;
    let match: string;
    textNodes.forEach(node => {
      match = this.getCommonString(node.textContent, text)
      if (prevNode && prevNode.nextSibling === node) {
        currentSpan.push(node);
      } else {
        currentSpan = [node];
        textNodeSpans.push(currentSpan);
      }
      prevNode = node;
    });
  
    // Filter out text node spans that consist only of white space. This avoids
    // inserting highlight elements in places that can only contain a restricted
    // subset of nodes such as table rows and lists.
    textNodeSpans = textNodeSpans.filter(span =>
      // Check for at least one text node with non-space content.
      span.some(node => !white.test(node.nodeValue))
    );
  
    // Wrap each text node span with a `<hypothesis-highlight>` element.
    const highlights = [];
    textNodeSpans.forEach(nodes => {
      // A custom element name is used here rather than `<span>` to reduce the
      // likelihood of highlights being hidden by page styling.
  
      /** @type {HighlightElement} */
      const highlightEl = document.createElement('evt-highlight-note');
      highlightEl.className = cssClass;
      highlightEl.setAttribute("data-id", id)
  
      nodes[0].parentNode.replaceChild(highlightEl, nodes[0]);
      nodes.forEach(node => highlightEl.appendChild(node));
  
      highlights.push(highlightEl);
    });

    const notes = document.getElementsByTagName('evt-highlight-note');
    Array.from(notes).map(n => {
      const regex = new RegExp(match)
      const span = n.innerHTML.replace(regex, `<evt-annotation class='note'>${match}</evt-annotation >`)
      if (span != n.innerHTML) {
          n.innerHTML = span;
      }
    })

    return highlights;
  }

  textNodes(container) {
    const nodes = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }
    return nodes;
  }

  //fix the common path
  getCommonString(par, sel){
    par = par.split(" ").filter(p => p !== "");
    sel = sel.split(" ").filter(p => p !== "");
    let result = ""
    sel.map((s,i) => {
      par.map((p,j) => {
        if(s === p){
          if(par.length <= 2){
            result === "" ? result += s : result += " "+s
          }else{
            if(i === 0){
              if(sel[i+1] === par[j+1]){
                result === "" ? result += s : result += " "+s
              }
            }else{
              if(sel[i-1] === par[j-1] && sel[i+1] === par[j+1]){
                result === "" ? result += s : result += " "+s
              }else if(sel[i-1] === par[j-1]){
                result === "" ? result += s : result += " "+s
              }
            }
          }
        }
      })
    })
    return result;
  }

  orphans() {
    console.log('orphans');
  }
}
