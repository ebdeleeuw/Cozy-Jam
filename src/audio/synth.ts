export type SynthInstrument = 'PIANO' | 'DRUMS' | 'SYNTH';

type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
};

export class SynthEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Map<number, Voice>();

  ensureContext() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.context.destination);
    }
    return this.context;
  }

  async resume() {
    const ctx = this.ensureContext();
    if (ctx.state !== 'running') {
      await ctx.resume();
    }
  }

  private oscTypeForInstrument(inst: SynthInstrument): OscillatorType {
    switch (inst) {
      case 'DRUMS':
        return 'square';
      case 'SYNTH':
        return 'sawtooth';
      case 'PIANO':
      default:
        return 'triangle';
    }
  }

  private midiToFreq(note: number) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  noteOn(note: number, velocity: number, instrument: SynthInstrument, when?: number) {
    const ctx = this.ensureContext();
    const t = when ?? ctx.currentTime;

    // if already playing, stop existing voice
    this.noteOff(note, t);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = this.oscTypeForInstrument(instrument);
    osc.frequency.setValueAtTime(this.midiToFreq(note), t);

    const vel = Math.min(1, Math.max(0.05, velocity));
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vel * 0.6, t + 0.01);

    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(t);

    this.voices.set(note, { osc, gain });
  }

  noteOff(note: number, when?: number) {
    const ctx = this.context;
    const voice = this.voices.get(note);
    if (!ctx || !voice) return;

    const t = when ?? ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
    voice.gain.gain.linearRampToValueAtTime(0, t + 0.08);
    voice.osc.stop(t + 0.09);
    this.voices.delete(note);
  }
}
