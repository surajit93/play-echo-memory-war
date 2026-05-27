import { FIXED_DT, BASE_FOV, SPRINT_FOV, MAX_ANGULAR_VELOCITY } from './constants.js';
import { DeterministicRNG, buildSeedPipeline } from './rng.js';
import { StateMachine, RuntimeStates } from '../runtime/stateMachine.js';
import { ECSWorld, Components } from '../entities/ecs.js';
import { InputSystem } from '../systems/inputSystem.js';
import { MutationSystem } from '../systems/mutationSystem.js';
import { ReplayEngine } from '../replay/replayEngine.js';
import { Telemetry } from '../telemetry/telemetry.js';
import { AdaptationProfile } from '../adaptation/profile.js';
import { validateFairness } from '../validation/fairnessValidator.js';
import { buildReplayDiff } from '../tools/replayDiffTool.js';
import { AudioEngine } from '../audio/audioEngine.js';
import { buildChamber01 } from '../chambers/chamber01.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const ui = { state:document.getElementById('state-label'), timer:document.getElementById('phase-timer'), conf:document.getElementById('confidence'), debug:document.getElementById('debug-panel') };

const sm = new StateMachine();
const world = new ECSWorld();
const sessionSeed = 13371337;
const seedPipeline = buildSeedPipeline(sessionSeed);
const rng = new DeterministicRNG(seedPipeline.replaySeed);
const replay = new ReplayEngine(seedPipeline);
const mutation = new MutationSystem(rng);
const telemetry = new Telemetry();
const profile = new AdaptationProfile();
const input = new InputSystem(canvas);
const audio = new AudioEngine();
const chamber = buildChamber01(world, Components);

const replayWorker = new Worker('./js/workers/replayWorker.js', { type:'module' });
replayWorker.onmessage = ({ data }) => telemetry.capture('replay_worker', data);

let accum = 0; let last = performance.now(); let frame = 0; let phaseTimer = 0; let cameraFov = BASE_FOV; let humiliationStreak = 0;
const phaseDurations = new Map([[RuntimeStates.ObservationIntro,1.2],[RuntimeStates.ObservationActive,4.0],[RuntimeStates.ObservationFreeze,0.5],[RuntimeStates.ReplayPreparation,0.6],[RuntimeStates.ReplayPlayback,3.0],[RuntimeStates.SuspicionSelection,2.0],[RuntimeStates.ConfidenceSelection,2.0]]);

function advanceState() {
  const order = [RuntimeStates.PlayerProfileLoad,RuntimeStates.ChamberLoad,RuntimeStates.ObservationIntro,RuntimeStates.ObservationActive,RuntimeStates.ObservationFreeze,RuntimeStates.ReplayPreparation,RuntimeStates.ReplayPlayback,RuntimeStates.SuspicionSelection,RuntimeStates.ConfidenceSelection,RuntimeStates.PsychologicalResponse,RuntimeStates.AdaptationUpdate,RuntimeStates.RewardAllocation,RuntimeStates.HintStore,RuntimeStates.ChamberTransition,RuntimeStates.ChamberLoad];
  const next = order[order.indexOf(sm.state)+1]; if (next) sm.transition(next);
  phaseTimer = 0;
}
advanceState(); advanceState();

function fixedUpdate(dt) {
  phaseTimer += dt; frame++;
  const inp = input.sample();
  cameraFov += ((inp.sprint ? SPRINT_FOV : BASE_FOV) - cameraFov) * Math.min(1, dt / 0.18);
  if (inp.angVel > MAX_ANGULAR_VELOCITY) world.get(chamber.anchorEntity).mutation.frozen = true;

  replay.recordFrame(frame, [{...world.get(chamber.anchorEntity).transform}], inp);
  telemetry.capture('frame', { state: sm.state, fov: cameraFov, angVel: inp.angVel });

  if (phaseTimer > (phaseDurations.get(sm.state) || 1)) {
    if (sm.state === RuntimeStates.ReplayPlayback) {
      const picked = mutation.chooseOverlay();
      replay.applyMutationOverlay({ frame, picked });
      audio.playCriticalCue(880);
    }
    if (sm.state === RuntimeStates.ConfidenceSelection) {
      const failed = rng.next() > 0.4;
      humiliationStreak = failed ? humiliationStreak + 1 : 0;
      profile.updateFromRound({ accusations:rng.next(), confidence:rng.next(), failed });
    }
    advanceState();
  }

  if (sm.state === RuntimeStates.ChamberTransition) {
    const serialized = replay.serialize();
    replayWorker.postMessage({ type:'compressReplay', payload: serialized });
    const fairness = validateFairness({ VisibilityDetectability:0.86, AudioRecognitionWindow:0.61, MutationReadabilityScore:76, ImpossiblePerceptionRate:0.01, ConfusionSaturation:0.52, ReplayTrustScore:0.9 });
    const diff = buildReplayDiff(serialized.observationLog, serialized.observationLog.map((f,i)=> i%15===0 ? {...f, entitiesSnapshot:[{x:(f.entitiesSnapshot[0]?.x||0)+0.01}], mutations:['positional']} : f));
    localStorage.setItem('echo:last-fairness', JSON.stringify(fairness));
    localStorage.setItem('echo:last-diff', JSON.stringify(diff));
    advanceState();
  }
}

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#091426'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#66f2b2';
  const t = world.get(chamber.anchorEntity).transform;
  ctx.fillRect(canvas.width * 0.5 + t.x * 30, canvas.height * 0.5 + t.y * 30, 18, 18);

  const conf = Math.round(profile.metrics.confidence_bias * 100);
  ui.state.textContent = `State: ${sm.state}`;
  ui.timer.textContent = `Phase: ${phaseTimer.toFixed(2)}s Frame ${frame}`;
  ui.conf.textContent = `Confidence: ${conf}% | Paranoia ${(profile.metrics.paranoia_index*100).toFixed(0)}%`;
  ui.debug.textContent = JSON.stringify({ adaptationConfidence: profile.adaptationConfidence(), humiliationStreak, replayFrames: replay.observationLog.length, overlayCount: replay.overlayEvents.length, telemetry: telemetry.summarize() }, null, 2);
}

function loop(now) {
  accum += Math.min(0.25, (now - last) / 1000); last = now;
  while (accum >= FIXED_DT) { fixedUpdate(FIXED_DT); accum -= FIXED_DT; }
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
