import { useEffect } from "react";
import Highlighter from "react-highlight-words";

type FAQHighlighterProps = {
  id: number;
  searchText: string;
  textToHighlight: string;
  textCallback: (id: number, count: number) => void;
  wordWeight?: number;
};

export const FAQHighlighter: React.FC<FAQHighlighterProps> = ({
  id,
  searchText,
  textToHighlight,
  textCallback,
  wordWeight = 1,
}) => {
  useEffect(() => {
    if (searchText === "") return;

    const count =
      textToHighlight.toLowerCase().split(searchText.toLowerCase()).length - 1;

    textCallback(id, count * wordWeight);
  }, [searchText, textToHighlight]);

  return (
    <Highlighter
      highlightClassName="faq-header-highlight-class"
      searchWords={[searchText]}
      autoEscape={true}
      textToHighlight={textToHighlight}
    />
  );
};
