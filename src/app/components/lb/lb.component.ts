import { Component, Input } from '@angular/core';

import { LbData } from 'src/app/models/evt-models';
import { register } from '../../services/component-register.service';

@register(LbData)
@Component({
  selector: 'evt-lb',
  templateUrl: './lb.component.html',
  styleUrls: ['./lb.component.scss'],
})
export class LbComponent {
  @Input() data: LbData;
}
