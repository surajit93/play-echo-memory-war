export function buildReplayDiff(original, replayed) {
  const deltas = original.map((frame, i) => {
    const other = replayed[i] || frame;
    return { frame: i, positionalDelta: Math.abs((frame.entitiesSnapshot[0]?.x || 0) - (other.entitiesSnapshot[0]?.x || 0)), audioDriftMs: Math.abs((frame.t - other.t) * 1000), mutationCount: (other.mutations || []).length };
  });
  const risk = deltas.reduce((a, d) => a + d.positionalDelta, 0) / Math.max(1, deltas.length);
  return { deltas, riskScore: risk };
}
