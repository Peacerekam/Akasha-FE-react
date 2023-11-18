import Highlighter from "react-highlight-words";
import { useEffect } from "react";

type FAQHighlighterProps = {
  id: number;
  searchText: string;
  textToHighlight: string;
  textCallback: (id: number, count: number) => void;
  wordWeight?: number;
  splitWords?: boolean;
};

export const FAQHighlighter: React.FC<FAQHighlighterProps> = ({
  id,
  searchText,
  textToHighlight,
  textCallback,
  wordWeight = 1,
  splitWords = true,
}) => {
  useEffect(() => {
    if (searchText === "") return;

    let count = 0;
    const a = textToHighlight.toLowerCase();

    if (splitWords) {
      const split = searchText.trim().split(" ");
      for (const word of split) {
        const b = word.toLowerCase();
        count += a.split(b).length - 1;
      }
    } else {
      const b = searchText.toLowerCase();
      count = a.split(b).length - 1;
    }

    textCallback(id, count * wordWeight);
  }, [searchText, textToHighlight]);

  return (
    <Highlighter
      highlightClassName="faq-header-highlight-class"
      searchWords={searchText.trim().split(" ")}
      autoEscape={true}
      textToHighlight={textToHighlight}
    />
  );
};
