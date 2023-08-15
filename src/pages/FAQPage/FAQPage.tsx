import React, { useCallback, useMemo, useState } from "react";
import Highlighter from "react-highlight-words";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  StylizedContentBlock,
  AdsComponentManager,
  StatIcon,
} from "../../components";
import { FAQHighlighter } from "./FAQHighlighter";
import { FAQBrowser } from "./FAQBrowser";
import "./style.scss";
import { debounce } from "lodash";

export const FAQPage: React.FC = () => {
  const [_wordHits, _setWordHits] = useState<{
    [id: number]: number;
  }>({});

  const [wordHits, setWordHits] = useState<{
    [id: number]: number;
  }>({});

  const debouncedSetWordHits = useCallback(debounce(setWordHits, 50), []);

  const handleTextCallback = (id: number, count: number) => {
    _setWordHits((prev: any) => {
      const _new = {
        ...prev,
        [id]: (prev[id] || 0) + count,
      };

      debouncedSetWordHits(_new);
      return _new;
    });
  };

  const handleClearWordHits = () => {
    _setWordHits({});
  };

  const faqContents = useMemo(
    () => [
      {
        id: 0,
        question: "What is CV? | How is CV calculated on Akasha?",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div className="faq-split">
              <div>
                <p>
                  <FAQHighlighter
                    id={0}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  CV (Crit Value) is a very basic 
                  investment metric that assumes crits are infinitely more important
                  than any other stat. Using CV in vaccum with no other context is
                  very naive approach. Due to its popularity, as well as lack of any
                  better alternatives, it was chosen as default sort for most Akasha
                  tables.`}
                  />
                </p>
                <p>
                  <FAQHighlighter
                    id={0}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`Following formula is used to calculate Crit Value:`}
                  />

                  <div className="desc-formula">
                    2 * <StatIcon name="Crit RATE" />
                    <FAQHighlighter
                      id={0}
                      searchText={searchText}
                      textCallback={handleTextCallback}
                      textToHighlight={`Crit RATE`}
                    />{" "}
                    + <StatIcon name="Crit DMG" />
                    <FAQHighlighter
                      id={0}
                      searchText={searchText}
                      textCallback={handleTextCallback}
                      textToHighlight={`Crit DMG`}
                    />
                  </div>
                </p>
                <p>
                  <FAQHighlighter
                    id={0}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`Crit Value on Akasha counts crit stats gained from artifacts only,
                    meaning crits gained from character's ascension stats or crit
                    weapons are ignored. This approach in consistent with the
                    "Artifact Details" screen in-game (see the gif).`}
                  />
                </p>
              </div>
              {/* @TODO: host the img */}
              <img
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
              />
            </div>
          </div>
        ),
      },
      {
        id: 1,
        question: "What is RV? | How is RV calculated on Akasha?",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div className="faq-split">
              <div>
                <p>
                  <FAQHighlighter
                    id={1}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`RV (Roll Value) is a metric that can be used to rate or
                    sort (soon™?) artifact and build substats. Genshin Optimizer
                    describes RV as follows: "`}
                  />
                  <i>
                    <FAQHighlighter
                      id={1}
                      searchText={searchText}
                      textCallback={handleTextCallback}
                      textToHighlight={`The Roll Value (RV) of a substat is a percentage of the current
                    value over the highest potential 5 value`}
                    />
                  </i>
                  ".
                </p>
                <p>
                  <FAQHighlighter
                    id={1}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`For example a HP% roll of 5.3% equals to 90% RV. That is because
                    maximum roll value of HP% is 5.8%, therefore: 5.3/5.8 ~ 90%. RV is not a perfect metric either,
                    it does not measure artifact main stats and values every substat the same when they obviously are not. Akasha has some specific substats
                    already picked per character for RV calculation, but due to various different playstyles this does not 
                    have to be correct - you can select any substats you you want to include or exclude from RV calculation.`}
                  />
                </p>
              </div>
              {/* @TODO: host the img */}
              <img
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
              />
            </div>
          </div>
        ),
      },
      {
        id: 3,
        question: "Help, my profile is not updating / shows old data",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div>
              <FAQHighlighter
                id={3}
                searchText={searchText}
                textCallback={handleTextCallback}
                textToHighlight={`Help, my profile is not updating / shows old data.`}
              />
            </div>
          </div>
        ),
      },
      {
        id: 4,
        question: "How to delete my profile/characters/artifacts/data?",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div>
              <FAQHighlighter
                id={4}
                searchText={searchText}
                textCallback={handleTextCallback}
                textToHighlight={`How to delete my profile/characters/artifacts/data.`}
              />
            </div>
          </div>
        ),
      },
      {
        id: 5,
        question: "How do I save/add more characters to my profile?",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div>
              <FAQHighlighter
                id={5}
                searchText={searchText}
                textCallback={handleTextCallback}
                textToHighlight={`How do I add more characters to my profile.`}
              />
            </div>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex ">
      <div className="content-block w-100" id="content-container">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="relative faq-page-content-wrapper">
          <AdsComponentManager adType="Video" />

          <div className="faq-page">
            <div className="faq-main-header">
              <h1 className="the-faq">FAQ</h1>
              <h1>Frequently Asked Questions</h1>
              <p>
                You use the text input below to look up questions related to
                Akasha System.
              </p>
            </div>

            <FAQBrowser
              contents={faqContents}
              wordHits={wordHits}
              textCallback={handleTextCallback}
              clearWordHits={handleClearWordHits}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
