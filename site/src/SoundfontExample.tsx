import { useState } from "react";
import { Reverb, Soundfont, getSoundfontKits, getSoundfontNames } from "smplr";
import { getAudioContext } from "./audio-context";
import { ConnectMidi } from "./ConnectMidi";
import { PianoKeyboard } from "./PianoKeyboard";
import { LoadWithStatus, useStatus } from "./useStatus";

let reverb: Reverb | undefined;

export function SoundfontExample({ className }: { className?: string }) {
  const [status, setStatus] = useStatus();
  const [libraryName, setLibraryName] = useState(getSoundfontKits()[0]);
  const [instrumentName, setInstrumentName] = useState("marimba");
  const [instrument, setInstrument] = useState<Soundfont | undefined>(
    undefined
  );
  const [reverbMix, setReverbMix] = useState(0.0);
  const [volume, setVolume] = useState(100);

  function loadSoundfont(kit: string, instrument: string) {
    const context = getAudioContext();
    reverb ??= new Reverb(context);
    const soundfont = new Soundfont(context, {
      kit,
      instrument,
    });
    soundfont.output.addEffect("reverb", reverb, 0.0);
    soundfont
      .loaded()
      .then(() => {
        setStatus("ready");
        setInstrument(soundfont);
      })
      .catch((err) => {
        setStatus("error");
        console.log("Instrument error", err);
      });
  }

  return (
    <div className={className}>
      <div className="flex gap-2 items-end mb-2">
        <h1 className="text-3xl">Soundfont</h1>
        <LoadWithStatus
          status={status}
          onClick={() => {
            loadSoundfont(libraryName, instrumentName);
          }}
        />
        <ConnectMidi instrument={instrument} />
      </div>
      <div
        className={status !== "ready" ? "opacity-30 no-select" : "no-select"}
      >
        <div className="flex gap-4 mb-2">
          <select
            className="appearance-none bg-zinc-700 text-zinc-200 rounded border border-gray-400 py-2 px-3 leading-tight focus:outline-none focus:border-blue-500"
            value={libraryName}
            onChange={(e) => {
              const libraryName = e.target.value;
              loadSoundfont(libraryName, instrumentName);
              setLibraryName(libraryName);
            }}
          >
            {getSoundfontKits().map((libName) => (
              <option key={libName} value={libName}>
                {libName}
              </option>
            ))}
          </select>
          <select
            className="appearance-none bg-zinc-700 text-zinc-200 rounded border border-gray-400 py-2 px-3 leading-tight focus:outline-none focus:border-blue-500"
            value={instrumentName}
            onChange={(e) => {
              const instrumentName = e.target.value;
              loadSoundfont(libraryName, instrumentName);
              setInstrumentName(instrumentName);
            }}
          >
            {getSoundfontNames().map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            className="bg-zinc-700 rounded px-3 py-0.5 shadow"
            onClick={() => {
              instrument?.stop();
            }}
          >
            Stop all
          </button>
        </div>
        <div className="flex gap-4 mb-2">
          <div>Volume:</div>
          <input
            type="range"
            min={0}
            max={127}
            step={1}
            value={volume}
            onChange={(e) => {
              const volume = e.target.valueAsNumber;
              instrument?.output.setVolume(volume);
              setVolume(volume);
            }}
          />
          <div>Reverb:</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={reverbMix}
            onChange={(e) => {
              const mix = e.target.valueAsNumber;
              instrument?.output.sendEffect("reverb", mix);
              setReverbMix(mix);
            }}
          />
        </div>
        <PianoKeyboard
          borderColor="border-teal-600"
          onPress={(note) => {
            if (!instrument) return;
            note.time = (note.time ?? 0) + instrument.context.currentTime;
            instrument.start(note);
          }}
          onRelease={(midi) => {
            instrument?.stop({ stopId: midi });
          }}
        />
      </div>
    </div>
  );
}
