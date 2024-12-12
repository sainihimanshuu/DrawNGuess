export enum ButtonTypes {
  button = "button",
  submit = "submit",
  reset = "reset",
}

export const Button = ({
  children,
  type = ButtonTypes.button,
  className = "",
  ...props
}: {
  children: string;
  type?: ButtonTypes;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <button
      type={type}
      {...props}
      className={`${className} bg-wedgewood text-biscay font-bold rounded-md border-2 border-astronaut transition duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px]`}
    >
      {children}
    </button>
  );
};
