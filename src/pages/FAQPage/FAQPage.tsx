import React from "react";
import Highlighter from "react-highlight-words";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  StylizedContentBlock,
  AdsComponentManager,
  FAQBrowser,
  StatIcon,
} from "../../components";
import "./style.scss";

const faqContents = [
  {
    question: "What is CV? | How is CV calculated on Akasha?",
    answer: (searchText: string) => (
      <>
        <div className="faq-split">
          <div>
            <p>
              <Highlighter
                highlightClassName="faq-header-highlight-class"
                searchWords={[searchText]}
                autoEscape={true}
                textToHighlight={`
                      CV (Crit Value) is a very basic basic
                      investment metric that assumes crits are infinitely more important
                      than any other stat. Using CV in vaccum with no other context is
                      very naive approach. Due to its popularity, as well as lack of any
                      better alternatives, it was chosen as default sort for most Akasha
                      tables.`}
              />
            </p>
            <p>
              <Highlighter
                highlightClassName="faq-header-highlight-class"
                searchWords={[searchText]}
                autoEscape={true}
                textToHighlight={`Following formula is used to calculate Crit Value:`}
              />

              <div className="desc-formula">
                2 * <StatIcon name="Crit RATE" />
                <Highlighter
                  highlightClassName="faq-header-highlight-class"
                  searchWords={[searchText]}
                  autoEscape={true}
                  textToHighlight={`Crit RATE`}
                />{" "}
                + <StatIcon name="Crit DMG" />
                <Highlighter
                  highlightClassName="faq-header-highlight-class"
                  searchWords={[searchText]}
                  autoEscape={true}
                  textToHighlight={`Crit DMG`}
                />
              </div>
            </p>
            <p>
              <Highlighter
                highlightClassName="faq-header-highlight-class"
                searchWords={[searchText]}
                autoEscape={true}
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
      </>
    ),
  },
  {
    question: "What is RV? | How is RV calculated on Akasha?",
    answer: (searchText: string) => (
      <>
        <div className="faq-split">
          <div>
            <p>
              <Highlighter
                highlightClassName="faq-header-highlight-class"
                searchWords={[searchText]}
                autoEscape={true}
                textToHighlight={`RV (Roll Value) is a metric that can be used to rate or
                  sort (soon™) artifact and build substats. Genshin Optimizer
                  describes RV as follows: "`}
              />
              <i>
                <Highlighter
                  highlightClassName="faq-header-highlight-class"
                  searchWords={[searchText]}
                  autoEscape={true}
                  textToHighlight={`The Roll Value (RV) of a substat is a percentage of the current
                  value over the highest potential 5 value`}
                />
              </i>
              ".
            </p>
            <p>
              <Highlighter
                highlightClassName="faq-header-highlight-class"
                searchWords={[searchText]}
                autoEscape={true}
                textToHighlight={`For example a HP% roll of 5.3% equals to 90% RV. That is because
                  maximum roll value of HP% is 5.8%, therefore: 5.3/5.8 ~ 90%.`}
              />
            </p>
          </div>
          {/* @TODO: host the img */}
          <img
            className="expandable-img"
            src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
          />
        </div>
      </>
    ),
  },
  {
    question: "Some question goes here",
    answer: (searchText: string) => (
      <>
        <p>And then some answer goes right here</p>
      </>
    ),
  },
];

export const FAQPage: React.FC = () => {
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

            <FAQBrowser contents={faqContents} />
          </div>
        </div>
      </div>
    </div>
  );
};
