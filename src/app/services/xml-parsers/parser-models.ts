import { AttributesMap } from 'ng-dynamic-component';
import { AttributesData, Description, GenericElementData, HTMLData, XMLElement } from 'src/app/models/evt-models';
import { xpath } from 'src/app/utils/dom-utils';

export type ParseResult<T extends GenericElementData> = T | HTMLData | GenericElementData | AttributesData | Description | AttributesMap;

export interface Parser<T> { parse(data: T): ParseResult<GenericElementData>; }

// TODO: check if args are needed and if this can manage singleton instances
// TODO: maybe a simple new is enough?
export type ParseFn = (d: XMLElement) => ParseResult<GenericElementData>;
export function createParser<U, T extends Parser<U>>(c: new (raw: ParseFn) => T, data: ParseFn): T { return new c(data); }

export function getID(xml: XMLElement) { return xml.getAttribute('xml:id') || xpath(xml); }
export function getClass(xml: XMLElement) { return xml.tagName ? xml.tagName.toLowerCase() : ''; }
export function parseChildren(xml: XMLElement, parseFn: ParseFn) {
    return complexElements(xml.childNodes).map(child => parseFn(child as XMLElement));
}

function complexElements(nodes: NodeListOf<ChildNode>): ChildNode[] { return Array.from(nodes).filter((n) => n.nodeType !== 8); }
