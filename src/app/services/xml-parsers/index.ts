import { Comment, GenericElement, HTML, XMLElement } from '../../models/evt-models';
import { AppParser, RdgParser } from './app-parser';
import {
    DamageParser, ElementParser, GapParser, LBParser, NoteParser, ParagraphParser,
    PtrParser, SuppliedParser, TextParser, VerseParser, VersesGroupParser,
} from './basic-parsers';
import { CharParser, GlyphParser, GParser } from './character-declarations-parser';
import { ChoiceParser } from './choice-parser';
import { SurplusParser } from './editorial-parsers';
import { GraphicParser, SurfaceParser, ZoneParser } from './facsimile-parser';
import {
    NamedEntityRefParser, OrganizationParser,
    PersonGroupParser, PersonParser, PlaceParser,
} from './named-entity-parsers';
import { createParser, Parser, ParseResult } from './parser-models';

type SupportedTagNames = 'app' | 'char' | 'choice' | 'damage' | 'event' | 'g' | 'gap' | 'geogname' | 'glyph' | 'graphic' | 'l' | 'lb' |
    'lem' | 'lg' | 'note' | 'orgname' | 'p' | 'persname' | 'placename' | 'ptr' | 'person' | 'personGrp' | 'place' | 'org' | 'rdg' | 'surface' |
    'supplied' | 'surplus' | 'zone';

export const parseF: { [T in SupportedTagNames]: Parser<XMLElement> } = {
    app: createParser(AppParser, parse),
    char: createParser(CharParser, parse),
    choice: createParser(ChoiceParser, parse),
    damage: createParser(DamageParser, parse),
    event: createParser(NamedEntityRefParser, parse),
    g: createParser(GParser, parse),
    gap: createParser(GapParser, parse),
    geogname: createParser(NamedEntityRefParser, parse),
    glyph: createParser(GlyphParser, parse),
    graphic: createParser(GraphicParser, parse),
    l: createParser(VerseParser, parse),
    lb: createParser(LBParser, parse),
    lg: createParser(VersesGroupParser, parse),
    lem: createParser(RdgParser, parse),
    note: createParser(NoteParser, parse),
    org: createParser(OrganizationParser, parse),
    orgname: createParser(NamedEntityRefParser, parse),
    p: createParser(ParagraphParser, parse),
    persname: createParser(NamedEntityRefParser, parse),
    placename: createParser(NamedEntityRefParser, parse),
    ptr: createParser(PtrParser, parse),
    person: createParser(PersonParser, parse),
    personGrp: createParser(PersonGroupParser, parse),
    place: createParser(PlaceParser, parse),
    rdg: createParser(RdgParser, parse),
    // event: createParser(EventParser), // TODO: check event parser
    surface: createParser(SurfaceParser, parse),
    supplied: createParser(SuppliedParser, parse),
    surplus: createParser(SurplusParser, parse),
    zone: createParser(ZoneParser, parse),
};

export function parse(xml: XMLElement): ParseResult<GenericElement> {
    if (!xml) { return { content: [xml] } as HTML; }
    // Text Node
    if (xml.nodeType === 3) { return createParser(TextParser, parse).parse(xml); }
    // Comment
    if (xml.nodeType === 8) { return {} as Comment; }
    const tagName = xml.tagName.toLowerCase();
    const parser: Parser<XMLElement> = parseF[tagName] || createParser(ElementParser, parse);

    return parser.parse(xml);
}
