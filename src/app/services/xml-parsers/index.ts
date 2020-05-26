import { CommentData, GenericElementData, HTMLData, XMLElement } from 'src/app/models/evt-models';
import { AppParser } from './app-parser';
import { ElementParser, LBParser, NoteParser, ParagraphParser, PtrParser, TextParser } from './basic-parsers';
import {
    NamedEntityRefParser, OrganizationParser,
    PersonGroupParser, PersonParser, PlaceParser,
} from './named-entity-parsers';
import { createParser, Parser, ParseResult } from './parser-models';

type SupportedTagNames = 'app' | 'event' | 'geogname' | 'lb' | 'note' | 'orgname' | 'p' | 'persname' | 'placename' | 'ptr' |
    'person' | 'personGrp' | 'place' | 'org';

export const parseF: { [T in SupportedTagNames]: Parser<XMLElement> } = {
    event: createParser(NamedEntityRefParser, parse),
    geogname: createParser(NamedEntityRefParser, parse),
    lb: createParser(LBParser, parse),
    note: createParser(NoteParser, parse),
    orgname: createParser(NamedEntityRefParser, parse),
    p: createParser(ParagraphParser, parse),
    persname: createParser(NamedEntityRefParser, parse),
    placename: createParser(NamedEntityRefParser, parse),
    ptr: createParser(PtrParser, parse),
    app: createParser(AppParser, parse),
    person: createParser(PersonParser, parse),
    personGrp: createParser(PersonGroupParser, parse),
    place: createParser(PlaceParser, parse),
    org: createParser(OrganizationParser, parse),
    // event: createParser(EventParser), // TODO: check event parser
};

export function parse(xml: XMLElement): ParseResult<GenericElementData> {
    if (!xml) { return { content: [xml] } as HTMLData; }
    // Text Node
    if (xml.nodeType === 3) { return createParser(TextParser, parse).parse(xml); }
    // Comment
    if (xml.nodeType === 8) { return {} as CommentData; }
    const tagName = xml.tagName.toLowerCase();
    const parser: Parser<XMLElement> = parseF[tagName] || createParser(ElementParser, parse);

    return parser.parse(xml);
}
