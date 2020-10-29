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
    const startXpath = formattingXpath(xpath(sel.anchorNode.parentNode.parentNode));
    const endXpath   = formattingXpath(xpath(sel.focusNode.parentNode.parentNode));
    console.log(startXpath, endXpath)
    return {adder: {x, y}, annotation:{prefix, suffix, startXpath, endXpath}}
}

function formattingXpath(string) {
    return string 
      .replace(/ - /g,'/')
      .replace(/([0-9]+)/g, '[$1]')
      .replace(/\/evt-text /, '')
}