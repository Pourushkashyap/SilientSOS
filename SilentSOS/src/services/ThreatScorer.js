export const calculateThreatScore = (
  stressResult = {},
  keywordResult = {},
  gpsData = {},
  motionData = {}
) => {
  let score = 1;
  const reasons = [];

  const label = stressResult?.label || 'calm';
  const keywordDetected = keywordResult?.detected || false;
  const keyword = keywordResult?.keyword || '';

  // 🔥 Stress weight
  if (label === 'stressed') {
    score += 2;
    reasons.push('High vocal stress detected');
  } 
  else if (label === 'angry') {
    score += 2.5;
    reasons.push('Aggressive vocal pattern detected');
  } 
  else if (label === 'fearful') {
    score += 3;
    reasons.push('Fearful vocal pattern detected');
  }

  // 🔥 Keyword weight
  if (keywordDetected) {
    score += 2;
    reasons.push(`Panic keyword heard: ${keyword}`);
  }

  // 🔥 Time weight (night detection)
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;

  if (isNight) {
    score += 0.5;
    reasons.push('Night time context');
  }

  // 🔥 GPS accuracy weight
  if (gpsData?.accuracy && gpsData.accuracy > 50) {
    score += 0.2;
    reasons.push('Low GPS accuracy (Likely indoors)');
  }

  // 🔥 Motion detection (optional improvement)
  if (motionData?.jerk && motionData.jerk > 15) {
    score += 0.5;
    reasons.push('Sudden movement detected');
  }

  // 🔥 Clamp score between 1–5
  score = Math.max(1, Math.min(score, 5));

  // 🔥 Optional rounding (clean UI)
  score = Math.round(score * 10) / 10;

  return { score, reasons };
};