interface PromptProps {
  title: string;
  content: string;
}

export default function Feature({ title, content }: PromptProps) {
  return (
    <div>
      <p className="text-lg text-primary-5 mb-4"> {title} </p>
      <p>{content}</p>
    </div>
  );
}
