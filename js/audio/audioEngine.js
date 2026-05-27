export class AudioEngine {
  constructor() { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  playCriticalCue(freq = 660, duration = 0.08) {
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.frequency.value = freq; gain.gain.value = 0.06;
    osc.connect(gain).connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + duration);
  }
}
