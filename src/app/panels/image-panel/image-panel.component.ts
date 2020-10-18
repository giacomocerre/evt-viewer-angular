import { AfterViewInit, Component } from '@angular/core';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'evt-image-panel',
  templateUrl: './image-panel.component.html',
  styleUrls: ['./image-panel.component.scss'],
})
export class ImagePanelComponent implements AfterViewInit {
  manifest = AppConfig.evtSettings.files.manifestURL !== '' && !!AppConfig.evtSettings.files.manifestURL
    ? AppConfig.evtSettings.files.manifestURL
    : undefined;
  ngAfterViewInit(): void {
   
  setTimeout(() => {

  }, 5000);
  }
}
