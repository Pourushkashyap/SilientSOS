export const calculateThreatScore = (stressResult, keywordResult, gpsData, motionData) => {
  let score = 1;
  const reasons = [];

  // Stress weight
  if (stressResult.label === 'stressed') { score += 2; reasons.push('High vocal stress detected'); }
  if (stressResult.label === 'angry') { score += 2.5; reasons.push('Aggressive vocal pattern detected'); }
  if (stressResult.label === 'fearful') { score += 3; reasons.push('Fearful vocal pattern detected'); }

  // Keyword weight
  if (keywordResult.detected) {
    score += 2;
    reasons.push(`Panic keyword heard: ${keywordResult.keyword}`);
  }

  // Time weight
  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 6) {
    score += 0.5;
    reasons.push(`Night time context (+0.5)`);
  }

  // GPS accuracy weight
  if (gpsData && gpsData.accuracy > 50) {
    score += 0.2;
    reasons.push(`Low GPS accuracy (Likely indoors)`);
  }

  score = Math.min(Math.max(score, 1), 5);

  return { score, reasons };
};
