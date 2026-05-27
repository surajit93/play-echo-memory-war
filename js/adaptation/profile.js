export class AdaptationProfile {
  constructor() {
    this.metrics = { trust_score:0.8, accusation_rate:0, confidence_bias:0.5, pattern_fixation:0, peripheral_attention:0.5, temporal_accuracy:0.5, audio_dependency:0.5, adaptation_awareness:0.2, paranoia_index:0.2, fatigue_risk:0.1 };
  }
  updateFromRound(round) {
    this.metrics.accusation_rate = round.accusations;
    this.metrics.confidence_bias = round.confidence;
    this.metrics.paranoia_index = Math.min(1, this.metrics.paranoia_index + (round.failed ? 0.08 : -0.03));
  }
  adaptationConfidence() {
    const behavior = 1 - this.metrics.pattern_fixation;
    const bias = 1 - Math.abs(this.metrics.confidence_bias - 0.5);
    const heat = this.metrics.peripheral_attention;
    return behavior * 0.4 + bias * 0.3 + heat * 0.3;
  }
}
