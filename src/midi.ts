import { getMidiControls } from './eg-midi-fields';
import { mainState, startAutoTransition } from './state';
import { subscribeMidiEvents } from './eg-midi-server';

export function initMidiController() {
  let midiDashboard = getMidiControls(mainState.get());

  mainState.subscribe((state) => {
    if (!state) return;
    midiDashboard = getMidiControls(state);
  });

  const midiLiveButtons = [23, 24, 25, 26];
  const midiReadyButtons = [27, 28, 29, 30];
  const midiLiveSliders = [3, 4, 5, 6, 14, 15, 16, 17];
  const midiReadySliders = [7, 8, 9, 10, 18, 19, 20, 21];

  subscribeMidiEvents((event) => {
    // Chanel Number Map
    //                   1️⃣ 2️⃣  3️⃣ 4️⃣  5️⃣ 6️⃣  7️⃣ 8️⃣  🔽
    // 67   program  64  14  15  16  17  18  19  20  21  22 <- Knobs
    // 🅰️   change  🅱️    3   4   5   6   7   8   9  10  11 <- Sliders
    //      - 60 +       23  24  25  26  27  28  29  30  31 <- Buttons
    // Bank         1  2           49 47 48  46 45 44       <- Extra Buttons
    //                             🔁 ⏪ ⏩  ⏹️  ▶️  ⏺️
    const { key } = event;
    if (key === 'bank') return;
    if (key === 'program') return;
    const { channel, value } = event;
    if (channel === 67 && value == 1) {
      startAutoTransition();
    }
    // if (channel === 60) {
    //   if (isMidiTouchingManualTransition) {
    //     midiSetManualTransition(value);
    //     return;
    //   }
    //   const currentManualValue = mainState.transitionState?.manual ?? 0;
    //   const offsetFromCurrentState = Math.abs(value - currentManualValue);
    //   if (offsetFromCurrentState < SliderGrabDelta) {
    //     isMidiTouchingManualTransition = true;
    //     midiSetManualTransition(value);
    //   }
    // }
    const liveButton = midiLiveButtons.indexOf(channel);
    if (liveButton !== -1) {
      const midiControl = midiDashboard.live.buttons[liveButton];
      if (!midiControl) return;
      midiControl.onPress();
      return;
    }

    const readyButton = midiReadyButtons.indexOf(channel);
    if (readyButton !== -1) {
      const midiControl = midiDashboard.ready.buttons[readyButton];
      if (!midiControl) return;
      midiControl.onPress();
      return;
    }
    const liveSlider = midiLiveSliders.indexOf(channel);
    if (liveSlider !== -1) {
      const midiControl = midiDashboard.live.sliders[liveSlider];
      if (!midiControl) return;
      midiControl.onValue(value);

      return;
    }
    const readySlider = midiReadySliders.indexOf(channel);
    if (readySlider !== -1) {
      const midiControl = midiDashboard.ready.sliders[readySlider];
      if (!midiControl) return;
      midiControl.onValue(value);
      return;
    }
    console.log('midi event', event);
  });
}
