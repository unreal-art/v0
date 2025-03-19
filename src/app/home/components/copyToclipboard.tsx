"use client";
import { CopyIcon } from "@/app/components/icons";
import { useState } from "react";

export default function CopyToClipboard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button onClick={handleCopy}>
      {copied ? "Copied!" : <CopyIcon color="#5D5D5D" />}
    </button>
  );
}
