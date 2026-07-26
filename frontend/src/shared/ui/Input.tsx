interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  endAdornment?: React.ReactNode;
}

export const Input = ({ label, endAdornment, ...props }: InputProps) => (
  <label className="input-label">
    {label && <span>{label}</span>}
    <div className="input-with-adornment">
      <input className="input" {...props} />
      {endAdornment && <div className="input-adornment">{endAdornment}</div>}
    </div>
  </label>
);
