import { Type } from '@angular/core';
import { ParseResult } from '../services/xml-parsers/parser-models';
import { Map } from '../utils/js-utils';

export type ParsedElement = HTMLData | TextData | GenericElementData | CommentData | NoteData | NamedEntitiesList | LbData | AttributesData
    | NamedEntityRefData;

export class GenericElementData {
    // tslint:disable-next-line: no-any
    type: Type<any>;
    path?: string;
    class?: string;
    attributes: AttributesData;
    content: Array<ParseResult<GenericElementData>>;
}

export type XMLElement = HTMLElement;
export type OriginalEncodingNodeType = XMLElement;

export interface EditionStructure {
    pages: Map<PageData>;
    pagesIndexes: string[];
}

export interface PageData {
    id: string;
    label: string;
    originalContent: OriginalEncodingNodeType[];
    parsedContent: Array<ParseResult<GenericElementData>>;
}

export interface NamedEntities {
    all: {
        lists: NamedEntitiesList[];
        entities: NamedEntity[];
    };
    persons: {
        lists: NamedEntitiesList[];
        entities: NamedEntity[];
    };
    places: {
        lists: NamedEntitiesList[];
        entities: NamedEntity[];
    };
    organizations: {
        lists: NamedEntitiesList[];
        entities: NamedEntity[];
    };
    relations: Relation[];
    events: {
        lists: NamedEntitiesList[];
        entities: NamedEntity[];
    };
}

export interface AttributesData { [key: string]: string; }

export interface OriginalEncodingData {
    originalEncoding: OriginalEncodingNodeType;
}

export type NamedEntityType = 'person' | 'place' | 'org' | 'relation' | 'event' | 'generic';
export class NamedEntitiesList extends GenericElementData {
    id: string;
    label: string;
    namedEntityType: NamedEntityType;
    description?: Description;
    sublists: NamedEntitiesList[];
    content: NamedEntity[];
    relations: Relation[];
    originalEncoding: OriginalEncodingNodeType;
}

export class NamedEntity extends GenericElementData {
    id: string;
    sortKey: string;
    label: NamedEntityLabel;
    namedEntityType: NamedEntityType | 'personGrp';
    content: NamedEntityInfo[];
    originalEncoding: OriginalEncodingNodeType;
}

export type NamedEntityLabel = string;

export class NamedEntityInfo extends GenericElementData {
    label: string;
    // content: Array<GenericElementData | NamedEntitiesList>;
}

export interface NamedEntityOccurrence {
    pageId: string;
    pageLabel: string;
    refsByDoc: NamedEntityOccurrenceRef[];
}
export interface NamedEntityOccurrenceRef {
    docId: string;
    docLabel: string;
    refs: GenericElementData[];
}

export class Relation extends GenericElementData {
    name?: string;
    activeParts: string[]; // Pointers to entities involved in relation
    mutualParts: string[]; // Pointers to entities involved in relation
    passiveParts: string[]; // Pointers to entities involved in relation
    description: Description;
    relationType?: string;
}

export type Description = Array<ParseResult<GenericElementData>>;

export class NamedEntityRefData extends GenericElementData {
    entityId: string;
    entityType: NamedEntityType;
}

export interface WitnessesData {
    witnesses: Map<Witness>;
    groups: Map<WitnessGroup>;
}

export interface Witness {
    id: string;
    name: GenericElementData[];
    attributes: AttributesData;
    content: Array<ParseResult<GenericElementData>>;
    groupId: string;
}

export interface WitnessGroup {
    id: string;
    name: string;
    attributes: AttributesData;
    witnesses: string[];
    groupId: string;
}
export class ApparatusEntry extends GenericElementData {
    id: string;
    content: Reading[];
    notes: NoteData[];
    variance: number;
    originalEncoding: string;
}

export class Reading extends GenericElementData {
    id: string;
    witIDs: string[];
    significant: boolean;
}

export interface GridItem {
    url: string;
    name: string;
    active: boolean;
}

export type HTMLData = GenericElementData & {
    content: OriginalEncodingNodeType[];
};

export class TextData extends GenericElementData {
    text: string;
}
export type NoteLayout = 'popover' | 'plain-text';
export class NoteData extends GenericElementData {
    noteLayout: NoteLayout;
    noteType: string;
    exponent: string;
}

export class ParagraphData extends GenericElementData {
    n: string;
}

export class LbData extends GenericElementData {
    id: string;
    n?: string;
    facs?: string; // Needed to handle ITL
    rend?: string;
}

export type CommentData = GenericElementData;
