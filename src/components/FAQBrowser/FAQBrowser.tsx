import Highlighter from "react-highlight-words";
import { useMemo, useState } from "react";
import "./style.scss";

type FAQBrowserProps = {
  contents: {
    question: string;
    answer: any;
  }[];
};

export const FAQBrowser: React.FC<FAQBrowserProps> = ({ contents }) => {
  const [searchText, setSearchTest] = useState("");

  const memoizedContents = useMemo(() => {
    return contents.map((entry) => {
      const _answer = entry.answer(searchText);

      const _question = (
        <h2>
          {entry.question.split(" | ").map((q) => {
            return (
              <span key={q}>
                <Highlighter
                  highlightClassName="faq-header-highlight-class"
                  searchWords={[searchText]}
                  autoEscape={true}
                  textToHighlight={q}
                />
              </span>
            );
          })}
        </h2>
      );

      return (
        <div key={entry.question}>
          {_question}
          {_answer}
        </div>
      );
    });
  }, [searchText, contents]);

  return (
    <div className={`faq-browser`}>
      <div className="faq-input">
        {/* <label>What are you looking for?</label> */}
        <input
          type="text"
          placeholder="what are you looking for?"
          onChange={(e) => setSearchTest(e.currentTarget.value)}
        />
      </div>
      {memoizedContents}
    </div>
  );
};
