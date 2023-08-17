import { useEffect, useMemo, useState } from "react";
import { FAQHighlighter } from "./FAQHighlighter";
import "./style.scss";
import { useLocation, useNavigate } from "react-router-dom";

type FAQBrowserProps = {
  textCallback: (id: number, count: number) => void;
  clearWordHits: () => void;
  wordHits: {
    [id: number]: number;
  };
  contents: {
    id: number;
    question: string;
    answer: any;
  }[];
};

export const FAQBrowser: React.FC<FAQBrowserProps> = ({
  contents,
  wordHits,
  textCallback,
  clearWordHits,
}) => {
  const _garbo = "!@#$%!@#$";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState<string>(_garbo);

  // project text to url params e.g. :  ?q=crit%20value
  // read text from url params and fill it as default

  useEffect(() => {
    if (location.search) {
      const query = new URLSearchParams(location.search);
      const _ = query.forEach((val, key) => {
        if (key !== "q") return;
        clearWordHits();
        setSearchText(val);

        document
          .querySelector(".faq-browser")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.search]);

  useEffect(() => {
    if (searchText === _garbo) return;
    const newURL = searchText
      ? `?${new URLSearchParams([["q", searchText]])}`
      : "";
    navigate(newURL, { replace: true });
  }, [searchText]);

  const memoizedContents = useMemo(() => {
    return contents
      .sort((a, b) => {
        if (
          Object.keys(wordHits).length === 0 ||
          Object.values(wordHits).filter((a) => a > 0).length === 0
        ) {
          return a.id > b.id ? 1 : -1;
        }
        return wordHits[a.id] > wordHits[b.id]
          ? -1
          : wordHits[a.id] === wordHits[b.id]
          ? a.id > b.id
            ? -1
            : 1
          : 1;
      })
      .map((entry) => {
        const _answer = entry.answer(searchText); // @TODO ?

        const _question = (
          // <a id={"" + entry.id} href={"#" + entry.id}>
          <h2>
            {entry.question.split(" | ").map((q) => {
              return (
                <span key={q}>
                  <FAQHighlighter
                    id={entry.id}
                    searchText={searchText}
                    textToHighlight={q}
                    textCallback={textCallback}
                    wordWeight={2}
                  />
                </span>
              );
            })}
          </h2>
          // </a>
        );

        return (
          <div
            key={entry.question}
            // tabIndex={0}
          >
            {_question}
            {_answer}
          </div>
        );
      });
  }, [searchText, contents, wordHits]);

  return (
    <div className={`faq-browser`}>
      <div className="faq-input">
        {/* <label>What are you looking for?</label> */}
        <input
          type="text"
          placeholder="what are you looking for?"
          value={searchText === _garbo ? "" : searchText}
          onChange={(e) => {
            clearWordHits();
            setSearchText(e.currentTarget.value);
          }}
        />
      </div>
      {memoizedContents}
    </div>
  );
};
