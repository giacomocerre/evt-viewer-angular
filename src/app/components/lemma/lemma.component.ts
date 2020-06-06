import { Component, Input } from '@angular/core';
import { Reading } from 'src/app/models/evt-models';
import { register } from 'src/app/services/component-register.service';

@Component({
  selector: 'evt-lemma',
  templateUrl: './lemma.component.html',
  styleUrls: ['./lemma.component.scss'],
})
@register(Reading)
export class LemmaComponent {
  @Input() data: Reading;
}
