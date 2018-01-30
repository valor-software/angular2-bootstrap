import { TimeChangeEvent, TimepickerComponentState, TimepickerControls } from '../../timepicker/timepicker.models';
import * as timepickerControlsUtil from '../../timepicker/timepicker-controls.util';

function testTime(hours?: number, minutes?: number, seconds?: number) {
  const time = new Date();
  time.setHours(hours || 0);
  time.setMinutes(minutes || 0);
  time.setSeconds(seconds || 0);

  return time;
}

describe('Util: Timepicker-controls', () => {
  let state: TimepickerComponentState;
  let controls: TimepickerControls;
  let event: TimeChangeEvent;

  beforeEach(() => {
    state = {
      min: null,
      max: null,
      hourStep: 1,
      minuteStep: 5,
      secondsStep: 10,
      readonlyInput: false,
      mousewheel: true,
      arrowkeys: true,
      showSpinners: true,
      showMeridian: true,
      showSeconds: false,
      meridians: ['AM', 'PM']
    };

    controls = {
      canIncrementHours: true,
      canIncrementMinutes: true,
      canIncrementSeconds: true,
      canDecrementHours: true,
      canDecrementMinutes: true,
      canDecrementSeconds: true,
      canToggleMeridian: true
    };

    event = {
      step: 1,
      source: ''
    };
  });

  it('canChangeValue method should return false if readonlyInput is true', () => {
    state.readonlyInput = true;

    const result = timepickerControlsUtil.canChangeValue(state, event);

    expect(result).toEqual(false);
  });

  it('canChangeValue method should return false if source is wheel and no mousewheel', () => {
    event.source = 'wheel';
    state.mousewheel = false;

    const result = timepickerControlsUtil.canChangeValue(state, event);

    expect(result).toEqual(false);
  });

  it('canChangeValue method should return false if source is key and no arrowkeys', () => {
    event.source = 'key';
    state.arrowkeys = false;

    const result = timepickerControlsUtil.canChangeValue(state, event);

    expect(result).toEqual(false);
  });

  it('canChangeValue method should return true if readonlyInput is false and event is empty', () => {
    const result = timepickerControlsUtil.canChangeValue(state, event);

    expect(result).toEqual(true);
  });

  it('canChangeValue method should return true if readonlyInput is false and no event', () => {
    const result = timepickerControlsUtil.canChangeValue(state);

    expect(result).toEqual(true);
  });

  it('canChangeHours method should validate ability to change Hours and return true', () => {
    const result = timepickerControlsUtil.canChangeHours(event, controls);

    expect(result).toEqual(true);
  });

  it('canChangeHours method should validate and return false if no step', () => {
    event.step = null;

    const result = timepickerControlsUtil.canChangeHours(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeHours method should validate and return false if canIncrementHours is false', () => {
    controls.canIncrementHours = false;

    const result = timepickerControlsUtil.canChangeHours(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeHours method should validate and return false if step < 0 and canDecrementHours is false', () => {
    controls.canDecrementHours = false;
    event.step = -2;

    const result = timepickerControlsUtil.canChangeHours(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeMinutes method should validate ability to change Minutes and return true', () => {
    const result = timepickerControlsUtil.canChangeMinutes(event, controls);

    expect(result).toEqual(true);
  });

  it('canChangeMinutes method should validate and return false if no step', () => {
    event.step = null;

    const result = timepickerControlsUtil.canChangeMinutes(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeMinutes method should validate and return false if canIncrementMinutes is false', () => {
    controls.canIncrementMinutes = false;

    const result = timepickerControlsUtil.canChangeMinutes(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeMinutes method should validate and return false if step < 0 and canDecrementMinutes is false', () => {
    controls.canDecrementMinutes = false;
    event.step = -2;

    const result = timepickerControlsUtil.canChangeMinutes(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeSeconds method should validate ability to change Seconds and return true', () => {
    const result = timepickerControlsUtil.canChangeSeconds(event, controls);

    expect(result).toEqual(true);
  });

  it('canChangeSeconds method should validate and return false if no step', () => {
    event.step = null;

    const result = timepickerControlsUtil.canChangeSeconds(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeSeconds method should validate and return false if canIncrementSeconds is false', () => {
    controls.canIncrementSeconds = false;

    const result = timepickerControlsUtil.canChangeSeconds(event, controls);

    expect(result).toEqual(false);
  });

  it('canChangeSeconds method should validate and return false if step < 0 and canDecrementSeconds is false', () => {
    controls.canDecrementSeconds = false;
    event.step = -2;

    const result = timepickerControlsUtil.canChangeSeconds(event, controls);

    expect(result).toEqual(false);
  });

  it('getControlsValue method should return TimepickerComponentState', () => {
    const result = timepickerControlsUtil.getControlsValue(state);

    expect(result).toEqual(state);
  });

  it('timepickerControls method should return default data if no value', () => {
    const result = timepickerControlsUtil.timepickerControls(null, state);

    expect(result).toEqual(controls);
  });

  it('timepickerControls method should change canIncrementHours to true', () => {
    state.max = testTime(14);

    const result = timepickerControlsUtil.timepickerControls(testTime(11), state);

    expect(result.canIncrementHours).toEqual(true);
    expect(result.canToggleMeridian).toEqual(false);
  });

  it('timepickerControls method should change canIncrementHours to false', () => {
    state.max = testTime(14);
    state.showSeconds = true;

    const result = timepickerControlsUtil.timepickerControls(testTime(17), state);

    expect(result.canIncrementHours).toEqual(false);
    expect(result.canIncrementMinutes).toEqual(false);
  });

  it('timepickerControls method should change canDecrementHours to true', () => {
    state.min = testTime(10);

    const result = timepickerControlsUtil.timepickerControls(testTime(13), state);

    expect(result.canDecrementHours).toEqual(true);
    expect(result.canToggleMeridian).toEqual(false);
  });

  it('timepickerControls method should change canIncrementHours to false', () => {
    state.min = testTime(10);
    state.showSeconds = true;

    const result = timepickerControlsUtil.timepickerControls(testTime(9), state);

    expect(result.canDecrementHours).toEqual(false);
    expect(result.canDecrementMinutes).toEqual(false);

  });
});
