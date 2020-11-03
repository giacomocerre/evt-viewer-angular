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

  where(index){
    return this.db.where(index);
  }

  getAll() {
    return this.db.toArray();
  }

  add(annotation) {
    return this.db.add(annotation);
  }

  update(id, annotation) {
    return this.db.update(id, annotation);
  }

  remove(id) {
    return this.db.delete(id);
  }
}
