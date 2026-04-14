interface ButtonProps {
  disabled?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  label?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

function Button({
  disabled = false,
  pending = false,
  pendingLabel = 'Loading...',
  label = 'Button',
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      onClick={onClick}
      className={`bg-primary text-white py-2 px-4 rounded-md shadow max-w-80 ${
        disabled || pending ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export default Button;
