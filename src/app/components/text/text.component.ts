import { Component, Input } from '@angular/core';
import { TextData } from 'src/app/models/evt-models';
import { register } from '../../services/component-register.service';

@Component({
  selector: 'evt-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
@register(TextData)
export class TextComponent {
  @Input() data: TextData;
}
