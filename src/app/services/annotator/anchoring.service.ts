import { Injectable } from '@angular/core';
import { AnnotationID } from 'src/app/models/evt-models';
import { IdbService } from '../idb.service';

@Injectable({
  providedIn: 'root',
})
export class AnchoringService {

  constructor(private db: IdbService){}

  anchoringImage(page){
    this.db.getAll().then((annotations: Array<AnnotationID>) => {
        const view = {rect:[], poly:[]}
        const g_draw = Array.from(document.getElementsByClassName("a9s-annotation"));
        g_draw.map( g => {
            const svg_id = g.getAttribute('data-id');
            Array.from(g.childNodes).map((g_child: HTMLElement) => {
                g_child.removeAttribute("points")
                g_child.removeAttribute("heigth")
                g_child.removeAttribute("width")
            })
            annotations.filter( x => x.id === svg_id && x.target.source === page).map( anno => {
                if(anno.target.selector[0].type === "FragmentSelector"){
                    view.rect.push({
                        g,
                        position: {
                            width: anno.target.selector[0].value.split(',')[2],
                            heigth: anno.target.selector[0].value.split(',')[3]
                        }
                    })
                }else{
                    view.poly.push({
                        g,
                        position: {
                            points: anno.target.selector[0].value.split('\"')[1]
                        }
                    })
                }
            })
        })
        view.rect.map( el => {
            Array.from(el.g.childNodes).map((g_child: HTMLElement) => {
                g_child.setAttribute("width", el.position.width)
                g_child.setAttribute("heigth", el.position.heigth)
            })
        })
        view.poly.map( el => {
            Array.from(el.g.childNodes).map((g_child: HTMLElement) => {
                g_child.setAttribute("points", el.position.points)
            })
        })
    })
  }
}
