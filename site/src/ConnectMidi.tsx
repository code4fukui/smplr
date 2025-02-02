import { useEffect, useRef, useState } from "react";
import { Listener, WebMidi } from "webmidi";

function supportsMidi() {
  return (
    typeof window !== "undefined" &&
    typeof window.navigator !== "undefined" &&
    navigator.requestMIDIAccess !== undefined
  );
}

export type MidiInstrument = {
  start(note: { note: number; velocity: number }): void;
  stop(note: { stopId: number }): void;
};

export function ConnectMidi({
  instrument,
}: {
  instrument: MidiInstrument | undefined;
}) {
  const inst = useRef<MidiInstrument | null>(null);
  const [midiDeviceNames, setMidiDeviceNames] = useState<string[]>([]);
  const [midiDeviceName, setMidiDeviceName] = useState("");
  const [disconnectMidiDevice, setDisconnectMidiDevice] = useState<
    Listener[] | undefined
  >();
  const [lastNote, setLastNote] = useState("");

  useEffect(() => {
    if (!supportsMidi()) return;
    WebMidi.enable().then(() => {
      const deviceNames = WebMidi.inputs.map((device) => device.name);
      setMidiDeviceNames(deviceNames);
      setMidiDeviceName(deviceNames[0]);
    });
  }, []);

  inst.current = instrument ?? null;

  return (
    <>
      <button
        className={
          "px-1 rounded " +
          (disconnectMidiDevice ? "bg-emerald-600" : "bg-zinc-700")
        }
        onClick={() => {
          if (disconnectMidiDevice) {
            setDisconnectMidiDevice(undefined);
            disconnectMidiDevice.forEach((listener) => listener.remove());
            return;
          }
          const device = WebMidi.inputs.find(
            (device) => device.name === midiDeviceName
          );
          if (!device) return;
          const listener = device.addListener("noteon", (event) => {
            const noteOn = {
              note: event.note.number,
              velocity: (event as any).rawVelocity,
            };
            inst.current?.start(noteOn);
            setLastNote(`${noteOn.note} (${noteOn.velocity})`);
          });
          const listenerOff = device.addListener("noteoff", (event) => {
            inst.current?.stop({ stopId: event.note.number });
            setLastNote("");
          });

          setDisconnectMidiDevice([
            ...(Array.isArray(listener) ? listener : [listener]),
            ...(Array.isArray(listenerOff) ? listenerOff : [listenerOff]),
          ]);
        }}
      >
        MIDI
      </button>
      <select
        className="appearance-none bg-zinc-700 text-zinc-200 rounded border border-gray-400 py-2 px-3 leading-tight focus:outline-none focus:border-blue-500 py-[2px]"
        value={midiDeviceName}
        onChange={(e) => {
          const name = e.target.value;
          setMidiDeviceName(name);
        }}
      >
        {midiDeviceNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <div className="opacity-50">{lastNote}</div>
    </>
  );
}
