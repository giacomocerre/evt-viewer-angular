import { Injectable } from '@angular/core';

import { PageData, XMLElement } from '../../models/evt-models';
import { getElementsAfterTreeNode, getElementsBetweenTreeNode } from '../../utils/dom-utils';
import { Map } from '../../utils/js-utils';
import { GenericParserService } from './generic-parser.service';

@Injectable({
  providedIn: 'root',
})
export class StructureXmlParserService {
  constructor(
    private genericParserService: GenericParserService,
  ) {
  }

  parsePages(document: XMLElement) {
    const pages: Map<PageData> = {};
    const pagesIndexes: string[] = [];
    const pageTagName = 'pb';

    if (document) {
      const pageElements = document.querySelectorAll(pageTagName);
      const l = pageElements.length;
      if (l > 0) {
        for (let i = 0; i < l; i++) {
          const element = pageElements[i];
          let pageContent: XMLElement[] = [];
          if (i < l - 1) { // TODO: handle last page
            if (i === 0) {
              pageContent = getElementsBetweenTreeNode(element.closest('body'), pageElements[i + 1]);
            } else {
              pageContent = getElementsBetweenTreeNode(element, pageElements[i + 1]);
            }
          } else {
            pageContent = getElementsAfterTreeNode(element);
          }
          // Exclude nodes in <front>
          pageContent = pageContent.filter(el => {
            if (el.nodeType === 3) {
              return !el.parentElement.closest('front') && el.parentElement.tagName !== 'front';
            }
            if (el.nodeType === 1) {
              return !el.closest('front') && el.tagName !== 'front';
            }

            return false;
          });

          const page: PageData = {
            id: element.getAttribute('xml:id') || 'page_' + (pagesIndexes.length + 1),
            label: element.getAttribute('n') || 'Page ' + (pagesIndexes.length + 1),
            originalContent: pageContent,
            parsedContent: pageContent.map(child => this.genericParserService.parse(child as XMLElement)),
          };
          pages[page.id] = page;
          pagesIndexes.push(page.id);
        }
      } else {
        // No <pb> used => TODO: Decide how to handle text division
        console.warn('TODO: Decide how to handle text division when there are no <pb>s');
        const mainText = document.querySelector('text');
        const content = Array.from(mainText.childNodes);
        const page: PageData = {
          id: `page_${new Date().getTime()}`,
          label: 'Main Text',
          originalContent: content as XMLElement[],
          parsedContent: content.map(child => this.genericParserService.parse(child as XMLElement))
            // tslint:disable-next-line: no-string-literal
            .filter(c => !!c['content']), // TODO: FIXME: fix property access
        };
        pages[page.id] = page;
        pagesIndexes.push(page.id);
      }
      console.log(pages);
    }

    return {
      pages,
      pagesIndexes,
    };
  }
}
