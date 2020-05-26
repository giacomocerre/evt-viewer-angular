import { Component, Input } from '@angular/core';
import { ParagraphData } from 'src/app/models/evt-models';
import { HighlightableComponent } from '../../highlightable/highlightable.component';
import { register } from '../../services/component-register.service';

@Component({
  selector: 'evt-paragraph',
  templateUrl: './paragraph.component.html',
  styleUrls: ['./paragraph.component.scss'],
})

@register(ParagraphData)
export class ParagraphComponent extends HighlightableComponent {
  @Input() data: ParagraphData;
}
