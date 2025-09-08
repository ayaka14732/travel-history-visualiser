import { JSX } from "react";

type Option<T extends string> = {
  value: T;
  label: string;
};

type RadioSelectProps<T extends string> = {
  state: T;
  setState: (value: T) => void;
  options: Option<T>[];
};

const RadioSelect = <T extends string>({ state, setState, options }: RadioSelectProps<T>): JSX.Element => {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {options.map(option => (
        <label key={option.value} className="inline-flex items-center gap-1">
          <input
            type="radio"
            value={option.value}
            checked={state === option.value}
            onChange={e => setState(e.target.value as typeof state)}
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioSelect;
