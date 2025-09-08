import { JSX, useId } from "react";
import clsx from "clsx";

type Option<T extends string> = {
  value: T;
  label: string;
};

type RadioSelectProps<T extends string> = {
  state: T;
  setState: (value: T) => void;
  options: Option<T>[];
  wrap?: boolean;
};

const RadioSelect = <T extends string>({
  state,
  setState,
  options,
  wrap = false,
}: RadioSelectProps<T>): JSX.Element => {
  const groupName = useId();

  return (
    <div className={clsx(wrap ? "space-y-2" : "flex flex-wrap gap-x-2 gap-y-2", "items-center")}>
      {options.map(option => (
        <label key={option.value} className={clsx(wrap ? "flex" : "inline-flex", "items-center gap-1")}>
          <input
            type="radio"
            name={groupName}
            value={option.value}
            checked={state === option.value}
            onChange={() => setState(option.value)}
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioSelect;
