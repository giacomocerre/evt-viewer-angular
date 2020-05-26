import { AppConfig } from 'src/app/app.config';
import { ApparatusEntry, NoteData, Reading, XMLElement } from 'src/app/models/evt-models';
import { getOuterHTML } from 'src/app/utils/dom-utils';
import { removeSpaces } from 'src/app/utils/xml-utils';
import { AttributeParser, EmptyParser, NoteParser } from './basic-parsers';
import { createParser, getID, Parser } from './parser-models';

export class RdgParser extends EmptyParser implements Parser<XMLElement> {
    private readingGroupTagName = 'rdgGrp';
    private appEntryTagName = 'app';
    attributeParser = createParser(AttributeParser, this.genericParse);

    public parse(rdg: XMLElement): Reading {
        return {
            type: Reading,
            id: getID(rdg),
            attributes: this.attributeParser.parse(rdg),
            witIDs: this.parseReadingWitnesses(rdg) || [],
            content: this.parseAppReadingContent(rdg),
            significant: this.readingIsSignificant(rdg),
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
                        id: getID(child),
                        attributes: {},
                        content: [],
                    };
                }

                return this.genericParse(child);
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
        return !Array.from(attributes).some(({ name, value }) => {
            return notSignificantReading.includes(`${name}=${value}`);
        });
    }
}

export class LemmaParser extends EmptyParser implements Parser<XMLElement> {
    rdgParser = createParser(RdgParser, this.genericParse);

    public parse(rdg: XMLElement): Reading {
        return {
            ...this.rdgParser.parse(rdg),
            significant: true,
        };
    }
}

export class AppParser extends EmptyParser implements Parser<XMLElement> {
    private noteTagName = 'note';
    private readingTagName = 'rdg';

    attributeParser = createParser(AttributeParser, this.genericParse);
    noteParser = createParser(NoteParser, this.genericParse);
    rdgParser = createParser(RdgParser, this.genericParse);

    public parse(appEntry: XMLElement): ApparatusEntry {
        const content = this.parseAppReadings(appEntry);

        return {
            type: ApparatusEntry,
            id: getID(appEntry),
            attributes: this.attributeParser.parse(appEntry),
            content,
            notes: this.parseAppNotes(appEntry),
            variance: 0,
            originalEncoding: getOuterHTML(appEntry),
        };
    }

    private parseAppNotes(appEntry: XMLElement): NoteData[] {
        const notes = Array.from(appEntry.children)
            .filter(({ tagName }) => tagName === this.noteTagName)
            .map((note: XMLElement) => this.noteParser.parse(note));

        return notes;
    }

    private parseAppReadings(appEntry: XMLElement): Reading[] {
        return Array.from(appEntry.querySelectorAll(this.readingTagName))
            .map((rdg: XMLElement) => this.rdgParser.parse(rdg));
    }
}
