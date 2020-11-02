import { xpath } from 'src/app/utils/dom-utils';

export function textAnnotationSettings(sel, range, rect, regex){
    const y = rect.top + (rect.bottom - rect.top);
    const x = rect.left;
    let prefix;
    let suffix;
    console.log(range.commonAncestorContainer.innerText)
    if (range.commonAncestorContainer.innerText != undefined) {
      prefix = range.commonAncestorContainer.innerText.replace(/\n|\r/g, '').match(regex)[1];
      suffix = range.commonAncestorContainer.innerText.replace(/\n|\r/g, '').match(regex)[2]; 
    }else {
      prefix = range.commonAncestorContainer.textContent.replace(/\n|\r/g, '').match(regex)[1];
      suffix = range.commonAncestorContainer.textContent.replace(/\n|\r/g, '').match(regex)[2];
    }
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const startXpath = formattingXpath(xpath(range.startContainer.parentNode));
    const endXpath   = formattingXpath(xpath(range.endContainer.parentNode));
    console.log(startXpath, endXpath)
    return {adder: {x, y}, annotation:{prefix, suffix, startOffset, endOffset, startXpath, endXpath}}
}

function formattingXpath(string) {
    return string 
      .replace(/ - /g,'/')
      .replace(/([0-9]+)/g, '[$1]')
      .replace(/\/evt-text /, '')
}