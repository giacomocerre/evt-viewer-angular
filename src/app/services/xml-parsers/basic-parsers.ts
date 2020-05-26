import { AttributesMap } from 'ng-dynamic-component';
import { AttributesData, GenericElementData, LbData, NoteData, NoteLayout, ParagraphData, TextData, XMLElement } from 'src/app/models/evt-models';
import { isNestedInElem, xpath } from 'src/app/utils/dom-utils';
import { replaceMultispaces } from 'src/app/utils/xml-utils';
import { createParser, getClass, getID, parseChildren, ParseFn, Parser } from './parser-models';

export class EmptyParser {
    genericParse: ParseFn;
    constructor(parseFn: ParseFn) { this.genericParse = parseFn; }
}

export class AttributeParser extends EmptyParser implements Parser<XMLElement> {
    parse(data: HTMLElement): AttributesData {
        return Array.from(data.attributes)
            .map(({ name, value }) => ({ [name === 'xml:id' ? 'id' : name.replace(':', '-')]: value }))
            .reduce((x, y) => ({ ...x, ...y }), {});
    }
}
export class AttributeMapParser extends EmptyParser implements Parser<XMLElement> {
    parse(xml: XMLElement) {
        const attributes: AttributesMap = {};
        Array.from(xml.attributes).forEach((attr) => {
            attributes[attr.name] = attr.value;
        });

        return attributes;
    }
}

export class TextParser implements Parser<XMLElement> {
    parse(xml: XMLElement): TextData {
        return {
            type: TextData,
            text: replaceMultispaces(xml.textContent),
            attributes: {},
        } as TextData;
    }
}

export class ParagraphParser extends EmptyParser implements Parser<XMLElement> {
    attributeParser = createParser(AttributeParser, this.genericParse);
    parse(xml: XMLElement): ParagraphData {
        const attributes = this.attributeParser.parse(xml);
        const paragraphComponent: ParagraphData = {
            type: ParagraphData,
            content: parseChildren(xml, this.genericParse),
            attributes,
            n: attributes.n ?? '-1', // TODO: Check it this can become a number
        };

        return paragraphComponent;
    }
}

export class LBParser extends EmptyParser implements Parser<XMLElement> {
    attributeParser = createParser(AttributeParser, this.genericParse);
    parse(xml: XMLElement): LbData {
        const attributes = this.attributeParser.parse(xml);
        const { n, rend, facs } = attributes;

        return {
            id: getID(xml),
            n: n || '', // TODO: check why paragraph defaults to -1 and lbs do not
            rend,
            facs,
            type: LbData,
            content: [],
            attributes,
        };
    }
}

export class ElementParser extends EmptyParser implements Parser<XMLElement> {
    attributeParser = createParser(AttributeParser, this.genericParse);
    parse(xml: XMLElement): GenericElementData {
        const genericElement: GenericElementData = {
            type: GenericElementData,
            class: getClass(xml),
            content: parseChildren(xml, this.genericParse),
            attributes: this.attributeParser.parse(xml),
        };

        return genericElement;
    }
}

export class NoteParser extends EmptyParser implements Parser<XMLElement> {
    attributeParser = createParser(AttributeParser, this.genericParse);
    parse(xml: XMLElement): NoteData {
        const noteLayout: NoteLayout = this.isFooterNote(xml) || this.isNamedEntityNote(xml)
            || ['person', 'place', 'app'].some((v) => isNestedInElem(xml, v))
            ? 'plain-text'
            : 'popover';

        const noteType = !!xml.getAttribute('type') && isNestedInElem(xml, 'app')
            ? 'critical'
            : 'comment';

        const attributes = this.attributeParser.parse(xml);
        const noteElement = {
            type: NoteData,
            noteType,
            noteLayout,
            exponent: attributes.n,
            path: xpath(xml),
            content: parseChildren(xml, this.genericParse),
            attributes,
        };

        return noteElement;
    }

    private isFooterNote(xml: XMLElement) { return isNestedInElem(xml, 'div', [{ key: 'type', value: 'footer' }]); }
    private isNamedEntityNote(xml: XMLElement) { return isNestedInElem(xml, 'relation') || isNestedInElem(xml, 'event'); }
}

export class PtrParser extends EmptyParser implements Parser<XMLElement> {
    noteParser = createParser(NoteParser, this.genericParse);
    elementParser = createParser(ElementParser, this.genericParse);
    parse(xml: XMLElement): GenericElementData {
        if (xml.getAttribute('type') === 'noteAnchor' && xml.getAttribute('target')) {
            const noteId = xml.getAttribute('target').replace('#', '');
            const rootNode = xml.closest('TEI');
            const noteEl = rootNode.querySelector<XMLElement>(`note[*|id="${noteId}"]`);

            return noteEl ? this.noteParser.parse(noteEl) : this.elementParser.parse(xml);
        }

        return this.elementParser.parse(xml);
    }
}