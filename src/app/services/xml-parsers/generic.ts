import { CommentData, HTMLData, ParsedElement, XMLElement } from 'src/app/models/evt-models';

type SupportedTagNames = 'app' | 'event' | 'geogname' | 'lb' | 'note' | 'orgname' | 'p' | 'persname' | 'placename' | 'ptr';

const parseF: { [T in SupportedTagNames]: (x: XMLElement) => ParsedElement } = {
    event: this.parseNamedEntityRef,
    geogname: this.parseNamedEntityRef,
    lb: this.parseLb,
    note: this.parseNote,
    orgname: this.parseNamedEntityRef,
    p: this.parseParagrah,
    persname: this.parseNamedEntityRef,
    placename: this.parseNamedEntityRef,
    ptr: this.parsePtr,
    app: this.parseApp,
};

export function parse(xml: XMLElement): ParsedElement {
    if (!xml) { return { content: [xml] } as HTMLData; }
    // Text Node
    if (xml.nodeType === 3) { return this.parseText(xml); }
    // Comment
    if (xml.nodeType === 8) { return {} as CommentData; }
    const tagName = xml.tagName.toLowerCase();
    const parseFunction = parseF[tagName] || this.parseElement;

    return parseFunction.call(this, xml);
}

