import { Injectable } from '@angular/core';
import {
  timepickerReducer,
  TimepickerState,
  initialState
} from './timepicker.reducer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Action } from '../../mini-ngrx/index';
import { MiniStore } from '../../mini-ngrx/store.class';
import { MiniState } from '../../mini-ngrx/state.class';

@Injectable()
export class TimepickerStore extends MiniStore<TimepickerState> {
  constructor() {
    const _dispatcher = new BehaviorSubject<Action>({
      type: '[mini-ngrx] dispatcher init'
    });
    const state = new MiniState<TimepickerState>(
      initialState,
      _dispatcher,
      timepickerReducer
    );
    super(_dispatcher, timepickerReducer, state);
  }
}
