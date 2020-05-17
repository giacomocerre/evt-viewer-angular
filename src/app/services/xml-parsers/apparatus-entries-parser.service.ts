import { Injectable } from '@angular/core';
import { NoteData } from 'src/app/models/parsed-elements';
import { AppConfig } from '../../../app/app.config';
import { ApparatusEntry, Reading, XMLElement } from '../../models/evt-models';
import { getOuterHTML, xpath } from '../../utils/dom-utils';
import { removeSpaces } from '../../utils/xml-utils';
import { GenericParserService } from './generic-parser.service';

@Injectable({
  providedIn: 'root',
})
export class ApparatusEntriesParserService {
  private appEntryTagName = 'app';
  private readingTagName = 'rdg';
  private readingGroupTagName = 'rdgGrp';
  private noteTagName = 'note';

  constructor(
    private genericParserService: GenericParserService,
  ) {
  }

  public parseAppEntries(document: XMLElement) {
    const appEntries = Array.from(document.querySelectorAll<XMLElement>(this.appEntryTagName));

    return appEntries.map((appEntry) => this.parseAppEntry(appEntry));
  }

  public parseAppEntry(appEntry: XMLElement): ApparatusEntry {
    const content = this.parseAppReadings(appEntry);

    return {
      type: ApparatusEntry,
      id: appEntry.getAttribute('xml:id') || xpath(appEntry),
      attributes: this.genericParserService.parseAttributes(appEntry),
      content,
      notes: this.parseAppNotes(appEntry),
      variance: 0,
      originalEncoding: getOuterHTML(appEntry),
    };
  }

  private parseAppReadings(appEntry: XMLElement): Reading[] {
    return Array.from(appEntry.querySelectorAll(this.readingTagName))
      .map((rdg: XMLElement) => {
        return this.parseReading(rdg);
      });
  }

  public parseReading(rdg: XMLElement): Reading {
    return {
      type: Reading,
      id: rdg.getAttribute('xml:id') || xpath(rdg),
      attributes: this.genericParserService.parseAttributes(rdg),
      witIDs: this.parseReadingWitnesses(rdg) || [],
      content: this.parseAppReadingContent(rdg),
      significant: this.readingIsSignificant(rdg),
    };
  }

  public parseLemma(rdg: XMLElement): Reading {
    return {
      ...this.parseReading(rdg),
      significant: true,
    };
  }

  private parseReadingWitnesses(rdg: XMLElement) {
    return rdg.getAttribute('wit')?.split('#')
      .map((el) => removeSpaces(el))
      .filter((el) => el.length !== 0);
  }

  private parseAppReadingContent(rdg: XMLElement) {
    return Array.from(rdg.childNodes)
      .map((child: XMLElement) => {
        if (child.nodeName === this.appEntryTagName) {
          return {
            type: ApparatusEntry,
            id: child.getAttribute('xml:id') || xpath(child),
            attributes: {},
            content: [],
          };
        }

        return this.genericParserService.parse(child);
      });
  }

  private readingIsSignificant(rdg: XMLElement): boolean {
    const notSignificantReadings = AppConfig.evtSettings.edition.notSignificantVariants;
    let isSignificant = true;

    if (notSignificantReadings.length > 0) {
      isSignificant = this.isSignificant(notSignificantReadings, rdg.attributes);
      if (isSignificant && rdg.parentElement.tagName === this.readingGroupTagName) {
        isSignificant = this.isSignificant(notSignificantReadings, rdg.parentElement.attributes);
      }
    }

    return isSignificant;
  }

  private isSignificant(notSignificantReading: string[], attributes: NamedNodeMap): boolean {
    return !Array.from(attributes).some(({name, value}) => {
      return notSignificantReading.includes(`${name}=${value}`);
    });
  }

  private parseAppNotes(appEntry: XMLElement): NoteData[] {
    const notes  = Array.from(appEntry.children)
      .filter(({tagName}) => tagName === this.noteTagName)
      .map((note: XMLElement) => this.genericParserService.parse(note));

    return notes as NoteData[];
  }
}
