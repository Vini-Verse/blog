"use client";

import { useEffect } from "react";
import { highlight } from "sugar-high";

export function Article({ html }: { html: string }) {
  const handleFormatCode = () => {
    const codes = document.querySelectorAll("pre code");
    codes.forEach((code) => {
      const html = highlight(code.textContent as string);
      code.innerHTML = html;
    });

    const titles = document.querySelectorAll("h2");
    titles.forEach((title) => {
      title.id = title.textContent?.toLowerCase().replace(/\s/g, "-") as string;
    });

    const links = document.querySelectorAll("article a") as NodeListOf<HTMLAnchorElement>;
    links.forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  };
  useEffect(handleFormatCode, []);
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
