/**
 * Compute field status — pure function, never stored.
 *
 * Rules:
 *   completed  → stage is 'harvested'
 *   at_risk    → stage is 'planted' or 'growing' AND
 *                  (no update in the last 14 days  OR  planted 90+ days ago and not yet 'ready')
 *   active     → everything else
 */
function computeStatus(field) {
  const { current_stage, planting_date, last_updated_at } = field;

  if (current_stage === 'harvested') return 'completed';

  const now = Date.now();
  const plantedMs = new Date(planting_date).getTime();
  const lastUpdateMs = last_updated_at ? new Date(last_updated_at).getTime() : plantedMs;

  const daysSincePlanted = (now - plantedMs) / 86_400_000;
  const daysSinceUpdate = (now - lastUpdateMs) / 86_400_000;

  const isStale = daysSinceUpdate >= 14;
  const isOverdue = daysSincePlanted >= 90 && current_stage !== 'ready';

  if ((current_stage === 'planted' || current_stage === 'growing') && (isStale || isOverdue)) {
    return 'at_risk';
  }

  return 'active';
}

module.exports = { computeStatus };
