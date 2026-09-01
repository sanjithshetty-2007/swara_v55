/**
 * gestureDescriptions.ts
 *
 * Custom fingerpose GestureDescription definitions for Indian Sign Language (ISL)
 * and universal hand gestures:
 * - Number signs (0 to 9)
 * - Daily Conversational Gestures & Reactions (Thumbs Up, Thumbs Down, OK, Peace,
 *   I Love You, Rock On, Call Me, Pointing Up, Five/Open Hand, Hand Gun, Pinch, Crossed Fingers,
 *   Finger Heart, Water, etc.)
 * - Fingerspelling Alphabet Handshapes (A, B, C, D, E, F, I, L, V, W, Y)
 *
 * fingerpose constants reference:
 *   Finger: Thumb(0), Index(1), Middle(2), Ring(3), Pinky(4)
 *   FingerCurl: NoCurl(0), HalfCurl(1), FullCurl(2)
 *   FingerDirection: VerticalUp(0), VerticalDown(1), HorizontalLeft(2),
 *                    HorizontalRight(3), DiagonalUpRight(4), DiagonalUpLeft(5),
 *                    DiagonalDownRight(6), DiagonalDownLeft(7)
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fp = require("fingerpose");

const { GestureDescription, Finger, FingerCurl, FingerDirection } = fp;

export interface GestureMeta {
  name: string;
  label: string;
  emoji: string;
  category: "Reactions" | "Numbers" | "Alphabets" | "Daily Signs";
  description: string;
  hint: string;
}

// ---------------------------------------------------------------------------
// Helpers for setting curl / directions
// ---------------------------------------------------------------------------
function setFingersCurl(
  gesture: InstanceType<typeof GestureDescription>,
  fingers: number[],
  curl: number,
  contrib = 1.0
) {
  for (const finger of fingers) {
    gesture.addCurl(finger, curl, contrib);
  }
}

function setAllFourFingersCurl(
  gesture: InstanceType<typeof GestureDescription>,
  curl: number,
  contrib = 1.0
) {
  setFingersCurl(gesture, [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky], curl, contrib);
}

// ============================================================================
// 1. REACTIONS & DAILY GESTURES
// ============================================================================

// --- THUMBS_UP: Thumb extended up, others curled ---
const thumbsUpGesture = new GestureDescription("THUMBS_UP");
thumbsUpGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.85);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.85);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsUpGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
  thumbsUpGesture.addCurl(finger, FingerCurl.HalfCurl, 0.8);
}

// --- THUMBS_DOWN: Thumb pointing down, others curled ---
const thumbsDownGesture = new GestureDescription("THUMBS_DOWN");
thumbsDownGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsDownGesture.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);
thumbsDownGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.85);
thumbsDownGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.85);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsDownGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
  thumbsDownGesture.addCurl(finger, FingerCurl.HalfCurl, 0.8);
}

// --- OK: Thumb and Index forming circle (half/full curl), 3 fingers up ---
const okGesture = new GestureDescription("OK");
okGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
okGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.7);
okGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
okGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.9);
for (const finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  okGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
  okGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
  okGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.85);
  okGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 0.85);
}

// --- PEACE / VICTORY: Index & Middle up in V, others curled ---
const peaceGesture = new GestureDescription("VICTORY");
peaceGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
peaceGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
peaceGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
peaceGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
peaceGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
peaceGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9);
peaceGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
peaceGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
peaceGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.9);
peaceGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.9);
peaceGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
peaceGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- I_LOVE_YOU: Thumb, Index, Pinky extended, Middle & Ring curled ---
const iLoveYouGesture = new GestureDescription("I_LOVE_YOU");
iLoveYouGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
iLoveYouGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9);
iLoveYouGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9);
iLoveYouGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.8);
iLoveYouGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.8);
iLoveYouGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
iLoveYouGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
iLoveYouGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.85);
iLoveYouGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.85);
iLoveYouGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
iLoveYouGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.8);
iLoveYouGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
iLoveYouGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.8);
iLoveYouGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iLoveYouGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
iLoveYouGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.85);
iLoveYouGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.85);

// --- ROCK_ON: Index & Pinky extended, Thumb holding Middle & Ring ---
const rockOnGesture = new GestureDescription("ROCK_ON");
rockOnGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
rockOnGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
rockOnGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
rockOnGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
rockOnGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.85);
rockOnGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.85);
rockOnGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
rockOnGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
rockOnGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
rockOnGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
rockOnGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.85);
rockOnGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.85);

// --- CALL_ME (Shaka): Thumb & Pinky extended, Index/Middle/Ring curled ---
const callMeGesture = new GestureDescription("CALL_ME");
callMeGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
callMeGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1.0);
callMeGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
callMeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.8);
callMeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.8);
callMeGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
callMeGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
callMeGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
callMeGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
callMeGesture.addDirection(Finger.Pinky, FingerDirection.HorizontalLeft, 0.9);
callMeGesture.addDirection(Finger.Pinky, FingerDirection.HorizontalRight, 0.9);
callMeGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.8);
callMeGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.8);

// --- POINTING_UP: Index finger straight up, others curled ---
const pointingUpGesture = new GestureDescription("POINTING_UP");
pointingUpGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
pointingUpGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
pointingUpGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pointingUpGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
pointingUpGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
pointingUpGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
pointingUpGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- FIVE / OPEN_PALM: All 5 fingers extended flat up ---
const fiveGesture = new GestureDescription("FIVE");
fiveGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
setAllFourFingersCurl(fiveGesture, FingerCurl.NoCurl, 1.0);
for (const finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  fiveGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
  fiveGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.85);
  fiveGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 0.85);
}

// --- HAND_GUN: Thumb up, Index horizontal/forward, others curled ---
const handGunGesture = new GestureDescription("HAND_GUN");
handGunGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
handGunGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
handGunGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
handGunGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1.0);
handGunGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);
handGunGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.7);
handGunGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.7);
handGunGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
handGunGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
handGunGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- PINCH: Thumb & Index half-curled close together, others curled ---
const pinchGesture = new GestureDescription("PINCH");
pinchGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
pinchGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
pinchGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
pinchGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.8);
pinchGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
pinchGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- CROSSED_FINGERS: Index & Middle up and overlapping, others curled ---
const crossedFingersGesture = new GestureDescription("CROSSED_FINGERS");
crossedFingersGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
crossedFingersGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
crossedFingersGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
crossedFingersGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
crossedFingersGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
crossedFingersGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
crossedFingersGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
crossedFingersGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- FINGER_HEART: Thumb & Index crossing/pinching, middle/ring/pinky curled ---
const fingerHeartGesture = new GestureDescription("FINGER_HEART");
fingerHeartGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fingerHeartGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);
fingerHeartGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);
fingerHeartGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fingerHeartGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);
fingerHeartGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1.0);
fingerHeartGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fingerHeartGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fingerHeartGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- WATER (W-Sign): Index, Middle, Ring up, Thumb holding Pinky ---
const waterGesture = new GestureDescription("WATER");
waterGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
waterGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
waterGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
waterGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
waterGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
waterGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
waterGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
waterGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
waterGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ============================================================================
// 2. NUMBER SIGNS (0 to 9)
// ============================================================================

// --- ZERO: Closed fist ---
const zeroGesture = new GestureDescription("ZERO");
zeroGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
zeroGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
setAllFourFingersCurl(zeroGesture, FingerCurl.FullCurl, 1.0);

// --- ONE: Index finger up ---
const oneGesture = new GestureDescription("ONE");
oneGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
oneGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
oneGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
oneGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
oneGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
oneGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9);
setFingersCurl(oneGesture, [Finger.Middle, Finger.Ring, Finger.Pinky], FingerCurl.FullCurl, 1.0);

// --- TWO: Index + Middle up ---
const twoGesture = new GestureDescription("TWO");
twoGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
twoGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
twoGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
twoGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
twoGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
twoGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
twoGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
twoGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- THREE: Index + Middle + Ring up ---
const threeGesture = new GestureDescription("THREE");
threeGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
threeGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
threeGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
threeGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
threeGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
threeGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
threeGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
threeGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
threeGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- FOUR: 4 fingers extended, thumb curled ---
const fourGesture = new GestureDescription("FOUR");
fourGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
fourGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
setAllFourFingersCurl(fourGesture, FingerCurl.NoCurl, 1.0);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  fourGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// --- SIX: Pinky + Thumb or 3 middle fingers curled with thumb touching pinky ---
const sixGesture = new GestureDescription("SIX");
sixGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
sixGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1.0);
sixGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
sixGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
sixGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
sixGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
sixGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
sixGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
sixGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
sixGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
sixGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.8);

// --- SEVEN: Thumb + Index + Middle extended, Ring & Pinky curled ---
const sevenGesture = new GestureDescription("SEVEN");
sevenGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
sevenGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
sevenGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
sevenGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
sevenGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
sevenGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
sevenGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- EIGHT: Thumb, Index, Middle, Ring extended, Pinky curled ---
const eightGesture = new GestureDescription("EIGHT");
eightGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
eightGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
eightGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
eightGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
eightGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
eightGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
eightGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
eightGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- NINE: Thumb + Index forming circle, Middle, Ring, Pinky extended ---
const nineGesture = new GestureDescription("NINE");
nineGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
nineGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
nineGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
nineGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
nineGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
nineGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
nineGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
nineGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);

// ============================================================================
// 3. ALPHABET FINGERSPELLING HANDSHAPES
// ============================================================================

// --- SIGN_A: Fist with thumb standing straight along index side ---
const signAGesture = new GestureDescription("SIGN_A");
signAGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
signAGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
setAllFourFingersCurl(signAGesture, FingerCurl.FullCurl, 1.0);

// --- SIGN_B: Flat open hand, 4 fingers straight up, thumb tucked across palm ---
const signBGesture = new GestureDescription("SIGN_B");
signBGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
signBGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.9);
setAllFourFingersCurl(signBGesture, FingerCurl.NoCurl, 1.0);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  signBGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// --- SIGN_C: Curved fingers and thumb forming a 'C' arc ---
const signCGesture = new GestureDescription("SIGN_C");
signCGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
signCGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  signCGesture.addCurl(finger, FingerCurl.HalfCurl, 1.0);
  signCGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 0.9);
  signCGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.9);
}

// --- SIGN_D: Index pointing up, Thumb + Middle + Ring + Pinky touching in circle ---
const signDGesture = new GestureDescription("SIGN_D");
signDGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
signDGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
signDGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
signDGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
signDGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
signDGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- SIGN_E: Clenched fist with fingertips touching thumb ---
const signEGesture = new GestureDescription("SIGN_E");
signEGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
setAllFourFingersCurl(signEGesture, FingerCurl.HalfCurl, 1.0);
setAllFourFingersCurl(signEGesture, FingerCurl.FullCurl, 0.9);

// --- SIGN_I: Pinky pointing straight up, all others curled with thumb over ---
const signIGesture = new GestureDescription("SIGN_I");
signIGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
signIGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
signIGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
signIGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
signIGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
signIGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
signIGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);

// --- SIGN_L: L-shape: Thumb horizontal and Index vertical, others curled ---
const signLGesture = new GestureDescription("SIGN_L");
signLGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
signLGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1.0);
signLGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
signLGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
signLGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
signLGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
signLGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
signLGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- SIGN_Y: Thumb and Pinky extended, middle 3 curled ---
const signYGesture = new GestureDescription("SIGN_Y");
signYGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
signYGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9);
signYGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9);
signYGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
signYGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
signYGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
signYGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
signYGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.9);
signYGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.9);

// ---------------------------------------------------------------------------
// Gesture Metadata Map
// ---------------------------------------------------------------------------
export const GESTURE_METADATA: Record<string, GestureMeta> = {
  THUMBS_UP: {
    name: "THUMBS_UP",
    label: "Thumbs Up",
    emoji: "👍",
    category: "Reactions",
    description: "Good / Yes / Approve / Well Done",
    hint: "Thumb pointed upward with all other fingers curled into a fist.",
  },
  THUMBS_DOWN: {
    name: "THUMBS_DOWN",
    label: "Thumbs Down",
    emoji: "👎",
    category: "Reactions",
    description: "Dislike / No / Disagree / Bad",
    hint: "Thumb pointed downward with all other fingers curled.",
  },
  OK: {
    name: "OK",
    label: "OK / All Right",
    emoji: "👌",
    category: "Reactions",
    description: "All Right / Perfect / Agree / Understood",
    hint: "Thumb and index fingertips touch in a circle with middle, ring, pinky extended.",
  },
  VICTORY: {
    name: "VICTORY",
    label: "Victory / Peace",
    emoji: "✌️",
    category: "Reactions",
    description: "Peace / Victory / Number 2 / Cheers",
    hint: "Index and middle fingers extended upward spread in a 'V' shape.",
  },
  I_LOVE_YOU: {
    name: "I_LOVE_YOU",
    label: "I Love You (ILY)",
    emoji: "🤟",
    category: "Daily Signs",
    description: "I Love You / Affection / Universal Love",
    hint: "Thumb, index, and pinky extended upward with middle and ring curled down.",
  },
  ROCK_ON: {
    name: "ROCK_ON",
    label: "Rock On / Horns",
    emoji: "🤘",
    category: "Reactions",
    description: "Rock / Energy / Horns / Excitement",
    hint: "Index and pinky fingers straight up with thumb folded over middle and ring fingers.",
  },
  CALL_ME: {
    name: "CALL_ME",
    label: "Call Me / Shaka",
    emoji: "🤙",
    category: "Daily Signs",
    description: "Call Me / Hang Loose / Relax / Chill",
    hint: "Thumb and pinky stretched outwards while index, middle, and ring are curled in.",
  },
  POINTING_UP: {
    name: "POINTING_UP",
    label: "Point Up / Attention",
    emoji: "☝️",
    category: "Daily Signs",
    description: "Look Up / Attention / Number 1 / Wait",
    hint: "Index finger pointing straight up with all other fingers closed into a fist.",
  },
  FIVE: {
    name: "FIVE",
    label: "Five (5) / Open Hand",
    emoji: "✋",
    category: "Numbers",
    description: "Number 5 / Open Palm / High Five / Stop",
    hint: "All five fingers spread wide and pointing upward.",
  },
  HAND_GUN: {
    name: "HAND_GUN",
    label: "Hand Gun / Point Forward",
    emoji: "👉",
    category: "Daily Signs",
    description: "Direct / Target / Pointing Forward",
    hint: "Thumb pointed straight up and index extended outward horizontally like an 'L'.",
  },
  PINCH: {
    name: "PINCH",
    label: "Pinch / Little",
    emoji: "🤏",
    category: "Daily Signs",
    description: "Small / Little Bit / Tiny / Pinch",
    hint: "Thumb and index tips held close in a half-curl without other fingers extended.",
  },
  CROSSED_FINGERS: {
    name: "CROSSED_FINGERS",
    label: "Crossed Fingers / Wish",
    emoji: "🤞",
    category: "Reactions",
    description: "Good Luck / Hope / Wish / Best Wishes",
    hint: "Middle finger crossed over index finger straight up with thumb and others closed.",
  },
  FINGER_HEART: {
    name: "FINGER_HEART",
    label: "Finger Heart / Love",
    emoji: "🫰",
    category: "Reactions",
    description: "Mini Heart / Love / Gratitude",
    hint: "Thumb and index crossed slightly at the tips forming a mini heart.",
  },
  WATER: {
    name: "WATER",
    label: "Water / W-Sign",
    emoji: "💧",
    category: "Daily Signs",
    description: "Water / Drink / Letter W",
    hint: "Index, middle, and ring fingers extended upward in a 'W' with thumb holding pinky.",
  },
  ZERO: {
    name: "ZERO",
    label: "Zero (0) / Fist",
    emoji: "✊",
    category: "Numbers",
    description: "Number 0 / Fist / Power / None",
    hint: "All five fingers closed tightly into a solid fist.",
  },
  ONE: {
    name: "ONE",
    label: "One (1)",
    emoji: "1️⃣",
    category: "Numbers",
    description: "Number 1 / First / Single",
    hint: "Index finger pointed up with thumb and other fingers curled.",
  },
  TWO: {
    name: "TWO",
    label: "Two (2)",
    emoji: "2️⃣",
    category: "Numbers",
    description: "Number 2 / Pair / Double",
    hint: "Index and middle fingers extended up together.",
  },
  THREE: {
    name: "THREE",
    label: "Three (3)",
    emoji: "3️⃣",
    category: "Numbers",
    description: "Number 3 / Trio",
    hint: "Index, middle, and ring fingers extended straight up.",
  },
  FOUR: {
    name: "FOUR",
    label: "Four (4)",
    emoji: "4️⃣",
    category: "Numbers",
    description: "Number 4 / Quad",
    hint: "Index, middle, ring, and pinky fingers up with thumb tucked over palm.",
  },
  SIX: {
    name: "SIX",
    label: "Six (6)",
    emoji: "6️⃣",
    category: "Numbers",
    description: "Number 6",
    hint: "Thumb, index, middle, and ring up with pinky curled in.",
  },
  SEVEN: {
    name: "SEVEN",
    label: "Seven (7)",
    emoji: "7️⃣",
    category: "Numbers",
    description: "Number 7",
    hint: "Thumb, index, and middle extended with ring and pinky curled.",
  },
  EIGHT: {
    name: "EIGHT",
    label: "Eight (8)",
    emoji: "8️⃣",
    category: "Numbers",
    description: "Number 8",
    hint: "Thumb, index, middle, and ring extended with pinky curled.",
  },
  NINE: {
    name: "NINE",
    label: "Nine (9)",
    emoji: "9️⃣",
    category: "Numbers",
    description: "Number 9",
    hint: "Thumb and index touching in circle with middle, ring, pinky up.",
  },
  SIGN_A: {
    name: "SIGN_A",
    label: "Letter A",
    emoji: "🅰️",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'A'",
    hint: "Fist with thumb resting straight upward along the outer side of the index finger.",
  },
  SIGN_B: {
    name: "SIGN_B",
    label: "Letter B",
    emoji: "🅱️",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'B'",
    hint: "Four fingers flat and held tightly together pointing up, thumb folded across palm.",
  },
  SIGN_C: {
    name: "SIGN_C",
    label: "Letter C",
    emoji: "🔤",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'C'",
    hint: "Fingers and thumb curved in a half-circle resembling the letter 'C'.",
  },
  SIGN_D: {
    name: "SIGN_D",
    label: "Letter D",
    emoji: "🔤",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'D'",
    hint: "Index pointing up with thumb touching middle and ring fingers in a loop.",
  },
  SIGN_E: {
    name: "SIGN_E",
    label: "Letter E",
    emoji: "🔤",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'E'",
    hint: "All 4 fingertips curled tightly down touching the thumb edge.",
  },
  SIGN_I: {
    name: "SIGN_I",
    label: "Letter I",
    emoji: "ℹ️",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'I'",
    hint: "Pinky pointed straight up with all other fingers curled into a fist.",
  },
  SIGN_L: {
    name: "SIGN_L",
    label: "Letter L",
    emoji: "🔤",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'L'",
    hint: "Thumb and index form a 90-degree 'L' shape while other fingers are curled.",
  },
  SIGN_Y: {
    name: "SIGN_Y",
    label: "Letter Y",
    emoji: "🔤",
    category: "Alphabets",
    description: "Fingerspelling Alphabet 'Y'",
    hint: "Thumb and pinky extended wide like the letter 'Y' or a phone.",
  },
};

// ---------------------------------------------------------------------------
// Export all gestures in priority evaluation order
// ---------------------------------------------------------------------------
export const gestureList = [
  // Specific distinctive multi-finger signs first
  iLoveYouGesture,
  rockOnGesture,
  callMeGesture,
  signLGesture,
  handGunGesture,
  okGesture,
  waterGesture,
  peaceGesture,
  pointingUpGesture,
  thumbsUpGesture,
  thumbsDownGesture,
  fiveGesture,
  crossedFingersGesture,
  pinchGesture,
  fingerHeartGesture,
  signBGesture,
  signCGesture,
  signDGesture,
  signEGesture,
  signIGesture,
  signAGesture,
  signYGesture,
  // Numbers
  fourGesture,
  threeGesture,
  twoGesture,
  oneGesture,
  nineGesture,
  eightGesture,
  sevenGesture,
  sixGesture,
  zeroGesture,
];

export const gestureNames = gestureList.map(
  (g: InstanceType<typeof GestureDescription>) => g.name as string
);
