import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { AnnotationID } from '../models/evt-models';

@Injectable({
  providedIn: 'root',
})

export class IdbService extends Dexie {
  public db: Dexie.Table<AnnotationID ,number>;
  constructor() {
    super('EVT-Annotator');
    this.version(1).stores({
      Annotations: 'id, target.type, target.source',
    });
    this.db = this.table('Annotations');
  }


  get(id) {
    return this.db.get(id);
  }

  where(options){
    return this.db.where(options);
  }

  getAll() {
    return this.db.toArray();
  }

  add(data) {
    return this.db.add(data);
  }

  update(id, data) {
    return this.db.update(id, data);
  }

  remove(id) {
    return this.db.delete(id);
  }
}
