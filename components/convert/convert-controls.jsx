import FormatSelector from "./format-selector";

export default function ConvertControls({ format, setFormat, formatOptions }) {
  return (
    <FormatSelector
      format={format}
      setFormat={setFormat}
      formatOptions={formatOptions}
    />
  );
}
