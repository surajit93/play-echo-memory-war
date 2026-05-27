export function buildChamber01(world, Components) {
  const anchor = world.create({
    transform: Components.TransformComponent(), visibility: Components.VisibilityComponent(), replay: Components.ReplayStateComponent(),
    mutation: Components.MutationEligibilityComponent(), audio: Components.AudioSpatialComponent(), authority: Components.RuntimeAuthorityComponent(),
    emotion: Components.EmotionalPurposeTag('stable-anchor'), telemetry: Components.TelemetryTag()
  });
  return { id: 'chamber-01', anchorEntity: anchor, durationSec: 12 };
}
