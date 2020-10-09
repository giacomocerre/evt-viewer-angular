import { Injectable } from '@angular/core';
import { AttributesMap } from 'ng-dynamic-component';
import { AppConfig } from '../app.config';
import { EditorialConvention, EditorialConventionLayouts } from '../models/evt-models';

// List of handled editorial convention
export type EditorialConventionDefaults = string; // TODO: Add here key of handled EVT defaults

@Injectable({
  providedIn: 'root',
})
export class EditorialConventionsService {
  defaultLayouts: { [T in EditorialConventionDefaults]: Partial<EditorialConventionLayouts> } = {
  };

  getLayouts(name: string, attributes: AttributesMap, defaultsKey: EditorialConventionDefaults) {
    const defaultKeys = this.defaultLayouts[defaultsKey];
    let layouts: Partial<EditorialConventionLayouts> = defaultKeys;

    const externalLayouts = this._getExternalConfigs().find(c => {
      return c.element === name &&
        (!attributes || Object.keys(attributes).concat(Object.keys(c.attributes)).every(k => attributes[k] === c.attributes[k]));
    })?.layouts ?? undefined;

    if (externalLayouts) {
      Object.keys(externalLayouts).forEach(editionLevel => {
        layouts = {
          ...defaultKeys || {},
          [editionLevel]: {
            ...defaultKeys ? defaultKeys[editionLevel] : {},
            ...externalLayouts[editionLevel],
          },
        };
      });
    }

    return layouts;
  }

  private _getExternalConfigs(): EditorialConvention[] {
    const customs = AppConfig.evtSettings.editorialConventions;

    return Object.keys(customs).map((key) => ({
      element: customs[key].markup?.element ?? key,
      attributes: customs[key].markup?.attributes ?? {},
      layouts: customs[key].layouts ?? {},
    }));
  }
}