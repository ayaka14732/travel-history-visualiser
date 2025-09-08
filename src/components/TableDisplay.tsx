import { JSX } from "react";

import { Language, Result } from "@/lib/types";
import { colourFlags, emojiFlags, svgFlags } from "@/lib/flags";
import { formatDays } from "@/lib/dateUtils";

const renderFlag = (name: string, index: number): JSX.Element => {
  const svg = svgFlags.get(name);
  if (svg) {
    const { url, alt } = svg;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="visualiser-svg-flag" src={url} alt={alt} />
    );
  }

  const emoji = emojiFlags.get(name);
  if (emoji) {
    return <span>{emoji}</span>;
  }

  return <span className="visualiser-mock-flag" style={{ backgroundColor: colourFlags[index % colourFlags.length] }} />;
};

type TableDisplayProps = {
  currentLang: Language;
  processedData: Result[];
};

const TableDisplay = ({ currentLang, processedData }: TableDisplayProps) => {
  const t = currentLang.translations;
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-700">
          <th colSpan={2} className="text-left py-1 px-4 font-medium text-gray-300">
            {t.location}
          </th>
          <th className="text-right py-1 px-4 font-medium text-gray-300">{t.totalDays}</th>
          <th className="text-right py-1 px-4 font-medium text-gray-300">{t.percentage}</th>
        </tr>
      </thead>
      <tbody>
        {processedData.map((item, index) => (
          <tr key={item.name} className="border-b border-gray-700/50">
            <td className="py-1 pl-4 w-11 text-left align-middle">{renderFlag(item.name, index)}</td>
            <td className="py-1 pr-4 flex items-center gap-3">{item.name}</td>
            <td className="py-1 px-4 text-right">{formatDays(item.days)}</td>
            <td className="py-1 px-4 text-right">{item.percentage.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableDisplay;
