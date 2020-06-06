import { Component, Input } from '@angular/core';
import { register } from 'src/app/services/component-register.service';
import { ApparatusEntry } from '../../models/evt-models';

@Component({
  selector: 'evt-apparatus-entry',
  templateUrl: './apparatus-entry.component.html',
  styleUrls: ['./apparatus-entry.component.scss'],
})
@register(ApparatusEntry)
export class ApparatusEntryComponent {
  @Input() data: ApparatusEntry;
}
