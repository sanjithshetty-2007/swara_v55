/**
 * gestureDescriptions.ts
 *
 * Custom fingerpose GestureDescription objects for ISL number signs (0-5),
 * THUMBS_UP, and OK gestures.
 *
 * Each gesture specifies expected curl and direction for each finger.
 * fingerpose constants:
 *   Finger: Thumb(0), Index(1), Middle(2), Ring(3), Pinky(4)
 *   FingerCurl: NoCurl(0), HalfCurl(1), FullCurl(2)
 *   FingerDirection: VerticalUp(0), VerticalDown(1), HorizontalLeft(2),
 *                    HorizontalRight(3), DiagonalUpRight(4), DiagonalUpLeft(5),
 *                    DiagonalDownRight(6), DiagonalDownLeft(7)
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fp = require("fingerpose");

const { GestureDescription, Finger, FingerCurl, FingerDirection } = fp;

// ---------------------------------------------------------------------------
// Helper: set all non-thumb fingers to a given curl
// ---------------------------------------------------------------------------
function setFourFingersCurl(
  gesture: InstanceType<typeof GestureDescription>,
  curl: number,
  contrib = 1.0,
) {
  for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    gesture.addCurl(finger, curl, contrib);
  }
}

// ============================================================================
// ZERO — closed fist, all fingers curled, thumb curled/half-curled
// ============================================================================
const zeroGesture = new GestureDescription("ZERO");
zeroGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
zeroGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
setFourFingersCurl(zeroGesture, FingerCurl.FullCurl, 1.0);

// ============================================================================
// ONE — index finger extended, all others curled
// ============================================================================
const oneGesture = new GestureDescription("ONE");
oneGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
oneGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
oneGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
oneGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
oneGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
oneGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9);
oneGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
oneGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
oneGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ============================================================================
// TWO — index + middle extended (victory/peace sign)
// ============================================================================
const twoGesture = new GestureDescription("TWO");
twoGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
twoGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
twoGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
twoGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
twoGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
twoGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9);
twoGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
twoGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
twoGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.9);
twoGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.9);
twoGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
twoGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// ============================================================================
// THREE — index + middle + ring extended
// ============================================================================
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

// ============================================================================
// FOUR — index + middle + ring + pinky extended, thumb curled
// ============================================================================
const fourGesture = new GestureDescription("FOUR");
fourGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
fourGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
setFourFingersCurl(fourGesture, FingerCurl.NoCurl, 1.0);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  fourGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// ============================================================================
// FIVE — all fingers extended (open palm)
// ============================================================================
const fiveGesture = new GestureDescription("FIVE");
fiveGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
setFourFingersCurl(fiveGesture, FingerCurl.NoCurl, 1.0);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  fiveGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
  fiveGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.9);
  fiveGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 0.9);
}

// ============================================================================
// THUMBS_UP — thumb extended upward, all others curled
// ============================================================================
const thumbsUpGesture = new GestureDescription("THUMBS_UP");
thumbsUpGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9);
for (const finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsUpGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
  thumbsUpGesture.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}
thumbsUpGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1.0);
thumbsUpGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);

// ============================================================================
// OK — thumb + index forming a circle, others extended
// ============================================================================
const okGesture = new GestureDescription("OK");
okGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
okGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
okGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
okGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.9);
okGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
okGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
okGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.9);
okGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.9);
okGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
okGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
okGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
okGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);

// ---------------------------------------------------------------------------
// Export all gestures as an array
// ---------------------------------------------------------------------------
export const gestureList = [
  zeroGesture,
  oneGesture,
  twoGesture,
  threeGesture,
  fourGesture,
  fiveGesture,
  thumbsUpGesture,
  okGesture,
];

export const gestureNames = gestureList.map(
  (g: InstanceType<typeof GestureDescription>) => g.name as string,
);
