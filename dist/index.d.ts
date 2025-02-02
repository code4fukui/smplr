type AudioInsert = {
    input: AudioNode;
    output: AudioNode;
};

type ChannelOptions = {
    destination: AudioNode;
    volume: number;
    volumeToGain: (volume: number) => number;
};
/**
 * @private
 */
declare class Channel {
    #private;
    readonly context: AudioContext;
    readonly setVolume: (vol: number) => void;
    readonly input: AudioNode;
    constructor(context: AudioContext, options: Partial<ChannelOptions>);
    addInsert(effect: AudioNode | AudioInsert): void;
    addEffect(name: string, effect: AudioNode | {
        input: AudioNode;
    }, mixValue: number): void;
    sendEffect(name: string, mix: number): void;
    disconnect(): void;
}

type AudioBuffers = Record<string | number, AudioBuffer | undefined>;

type StopSample = {
    stopId?: string | number;
    time?: number;
};

/**
 * A function that downloads audio
 */
type SamplerAudioLoader = (context: AudioContext, buffers: AudioBuffers) => Promise<void>;
type SamplerConfig = {
    detune: number;
    volume: number;
    velocity: number;
    decayTime?: number;
    lpfCutoffHz?: number;
    destination: AudioNode;
    buffers: Record<string | number, string | AudioBuffers> | SamplerAudioLoader;
    volumeToGain: (volume: number) => number;
    noteToSample: (note: SamplerNote, buffers: AudioBuffers, config: SamplerConfig) => [string | number, number];
};
type SamplerNote = {
    decayTime?: number;
    detune?: number;
    duration?: number;
    lpfCutoffHz?: number;
    note: string | number;
    onEnded?: (note: SamplerNote | string | number) => void;
    stopId?: string | number;
    time?: number;
    velocity?: number;
};
/**
 * A Sampler instrument
 *
 * @private
 */
declare class Sampler {
    #private;
    readonly context: AudioContext;
    readonly output: Omit<Channel, "input">;
    readonly buffers: AudioBuffers;
    constructor(context: AudioContext, options: Partial<SamplerConfig>);
    loaded(): Promise<this>;
    start(note: SamplerNote | string | number): (time?: number | undefined) => void;
    stop(note?: StopSample | string | number): void;
}

declare function getDrumMachineNames(): string[];
type DrumMachineConfig = {
    instrument: string;
    destination: AudioNode;
    detune: number;
    volume: number;
    velocity: number;
    decayTime?: number;
    lpfCutoffHz?: number;
};
declare class DrumMachine extends Sampler {
    #private;
    constructor(context: AudioContext, options: Partial<DrumMachineConfig>);
    get sampleNames(): string[];
    getVariations(name: string): string[];
}

type SfzInstrument = {
    name: string;
    formats?: string[];
    baseUrl?: string;
    websfzUrl: string;
    tags?: string[];
};

type Websfz = {
    global: Record<string, string | number>;
    groups: WebsfzGroup[];
    meta: {
        name?: string;
        description?: string;
        license?: string;
        source?: string;
        baseUrl?: string;
        websfzUrl?: string;
        formats?: string[];
        tags?: string[];
    };
};
type WebsfzGroup = {
    group_label?: string;
    group?: number;
    hikey?: number;
    hivel?: number;
    lokey?: number;
    lovel?: number;
    off_by?: number;
    off_mode?: "normal";
    pitch_keycenter?: number;
    regions: WebsfzRegion[];
    seq_length?: number;
    trigger?: "first" | "legato";
    volume?: number;
    amp_velcurve_83?: number;
    locc64?: number;
    hicc64?: number;
    hicc107?: number;
    locc107?: number;
    pan_oncc122?: number;
    tune_oncc123?: number;
    eg06_time1_oncc109?: number;
    ampeg_attack_oncc100?: number;
};
type WebsfzRegion = {
    end?: number;
    group?: number;
    hivel?: number;
    lovel?: number;
    hikey?: number;
    key?: number;
    lokey?: number;
    off_by?: number;
    pitch_keycenter?: number;
    region_label?: number;
    sample: string;
    seq_position?: number;
    trigger?: "first" | "legato";
    volume?: number;
    locc64?: number;
    hicc64?: number;
    ampeg_attack_oncc100?: number;
    eg06_time1_oncc109?: number;
    pan_oncc122?: number;
    tune_oncc123?: number;
};

/**
 * Splendid Grand Piano options
 */
type SfzSamplerConfig = {
    instrument: SfzInstrument | Websfz | string;
    destination: AudioNode;
    volume: number;
    velocity: number;
    detune: number;
    decayTime: number;
    lpfCutoffHz?: number;
};
declare class SfzSampler {
    #private;
    readonly context: AudioContext;
    readonly output: Omit<Channel, "input">;
    readonly buffers: AudioBuffers;
    constructor(context: AudioContext, options: Partial<SfzSamplerConfig> & Pick<SfzSamplerConfig, "instrument">);
    loaded(): Promise<this>;
    start(note: SamplerNote | string | number): (time?: number) => void;
    stop(note?: StopSample | string | number): void;
    disconnect(): void;
}

declare function getElectricPianoNames(): string[];
declare class ElectricPiano extends SfzSampler {
    readonly tremolo: Readonly<{
        level: (value: number) => void;
    }>;
    constructor(context: AudioContext, options: Partial<SfzSamplerConfig> & {
        instrument: string;
    });
}

declare function getMalletNames(): string[];
declare class Mallet extends SfzSampler {
    constructor(context: AudioContext, options: Partial<SfzSamplerConfig> & {
        instrument: string;
    });
}
declare const NAME_TO_PATH: Record<string, string | undefined>;

declare const PARAMS: readonly ["preDelay", "bandwidth", "inputDiffusion1", "inputDiffusion2", "decay", "decayDiffusion1", "decayDiffusion2", "damping", "excursionRate", "excursionDepth", "wet", "dry"];
declare class Reverb {
    #private;
    readonly input: AudioNode;
    constructor(context: AudioContext);
    get paramNames(): readonly ["preDelay", "bandwidth", "inputDiffusion1", "inputDiffusion2", "decay", "decayDiffusion1", "decayDiffusion2", "damping", "excursionRate", "excursionDepth", "wet", "dry"];
    getParam(name: (typeof PARAMS)[number]): AudioParam | undefined;
    get isReady(): boolean;
    ready(): Promise<this>;
    connect(output: AudioNode): void;
}

type SoundfontConfig = {
    kit: "FluidR3_GM" | "MusyngKite" | string;
    instrument: string;
    destination: AudioNode;
    detune: number;
    volume: number;
    velocity: number;
    decayTime?: number;
    lpfCutoffHz?: number;
    extraGain?: number;
};
declare class Soundfont extends Sampler {
    constructor(context: AudioContext, options: Partial<SoundfontConfig> & {
        instrument: string;
    });
}
declare function getSoundfontKits(): string[];
declare function getSoundfontNames(): string[];

/**
 * Splendid Grand Piano options
 */
type SplendidGrandPianoConfig = {
    baseUrl: string;
    destination: AudioNode;
    detune: number;
    volume: number;
    velocity: number;
    decayTime?: number;
    lpfCutoffHz?: number;
};
declare class SplendidGrandPiano extends Sampler {
    constructor(context: AudioContext, options: Partial<SplendidGrandPianoConfig>);
}
declare const LAYERS: ({
    name: string;
    vel_range: number[];
    cutoff: number;
    samples: (string | number)[][];
} | {
    name: string;
    vel_range: number[];
    samples: (string | number)[][];
    cutoff?: undefined;
})[];

export { DrumMachine, DrumMachineConfig, ElectricPiano, LAYERS, Mallet, NAME_TO_PATH, Reverb, Sampler, SamplerAudioLoader, SamplerConfig, SamplerNote, Soundfont, SoundfontConfig, SplendidGrandPiano, SplendidGrandPianoConfig, getDrumMachineNames, getElectricPianoNames, getMalletNames, getSoundfontKits, getSoundfontNames };
