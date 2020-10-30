import { Component, OnInit } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import { map } from 'rxjs/operators';
import { Page } from 'src/app/models/evt-models';
import { AnchoringService } from 'src/app/services/annotator/anchoring.service';
import { EVTStatusService } from 'src/app/services/evt-status.service';
import { EditionLevel } from '../../app.config';

@Component({
  selector: 'evt-image-text',
  templateUrl: './image-text.component.html',
  styleUrls: ['./image-text.component.scss'],
})
export class ImageTextComponent implements OnInit {
  public layoutOptions: GridsterConfig = {};
  public imagePanelItem: GridsterItem = { cols: 1, rows: 1, y: 0, x: 0 };
  public textPanelItem: GridsterItem = { cols: 1, rows: 1, y: 0, x: 1 };

  public currentPageID$ = this.evtStatusService.currentStatus$.pipe(
    map(({ page }) => page.id),
  );

  public currentEditionLevel$ = this.evtStatusService.currentStatus$.pipe(
    map(({ editionLevels }) => editionLevels[0]),
  );

  constructor(
    private anchoring: AnchoringService,
    private evtStatusService: EVTStatusService,
  ) {
  }

  ngOnInit() {
    this.anchoring.anchoringText()
    this.initGridster();
  }

  changePage(selectedPage: Page) {
    this.evtStatusService.updatePage$.next(selectedPage);
    this.anchoring.anchoringText()
  }

  changeEditionLevel(editionLevel: EditionLevel) {
    this.evtStatusService.updateEditionLevels$.next([editionLevel?.id]);
    this.anchoring.anchoringText("edition")
  }

  private initGridster() {
    this.layoutOptions = {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.None,
      margin: 0,
      maxCols: 2,
      maxRows: 1,
      draggable: {
        enabled: true,
        ignoreContent: true,
        dragHandleClass: 'panel-header',
      },
      resizable: {
        enabled: false,
      },
    };
  }
}
