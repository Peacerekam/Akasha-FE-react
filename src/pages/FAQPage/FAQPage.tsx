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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

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
                    "Artifact Details" screen in-game.`}
                  />
                </p>
              </div>
              {/* @TODO: host the img */}
              <img
                loading="lazy"
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
                loading="lazy"
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
              />
            </div>
          </div>
        ),
      },
      {
        id: 3,
        question: "My profile has old data | is not updating",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div className="faq-split">
              <div>
                <p>
                  <FAQHighlighter
                    id={3}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                Refreshing your character and artifact data on Akasha System although simple, is not an automatic process.
                When on akasha profile page, press the following button in the top right corner:
                  `}
                  />
                  <FontAwesomeIcon
                    style={{ margin: "0 5px" }}
                    icon={faRotateRight}
                    size="1x"
                  />
                  .
                </p>
                <p>
                  <FAQHighlighter
                    id={3}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  New profile data is fetched through Enka.Network API, this means Akasha System has the same limitations:
                  `}
                  />
                </p>
                <ul>
                  <li>
                    <FAQHighlighter
                      id={3}
                      searchText={searchText}
                      textCallback={handleTextCallback}
                      textToHighlight={`
                  Only UP TO 8 currently showcased characters can be fetched (Akasha only sees what Enka sees)`}
                    />
                  </li>
                  <li>
                    <FAQHighlighter
                      id={3}
                      searchText={searchText}
                      textCallback={handleTextCallback}
                      textToHighlight={`
                  It can take up to 5 minutes for the new data to propagate on Mihoyo servers.`}
                    />
                  </li>
                </ul>

                <p>
                  <FAQHighlighter
                    id={3}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  The last point can be mitigated by logging in and out of the game, or by entering and leaving your teapot.
                  `}
                  />
                </p>
              </div>
              <img
                loading="lazy"
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
              />
            </div>
          </div>
        ),
      },
      {
        id: 4,
        question: "How do I save/add more characters to my profile?",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div className="faq-split">
              <div>
                <p>
                  <FAQHighlighter
                    id={4}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  Adding more characters is simple - Akasha remembers all past builds, meaning 
                  by cycling your characters through showcase and refreshing your profile each time you will keep populating
                  your profile with new characters.
                    `}
                  />
                </p>
                <p>
                  <FAQHighlighter
                    id={4}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  If you wish to save a particular build then you need to go through process called binding account first
                  (see: `}
                  />
                  <i>
                    <Link
                      to={`?${new URLSearchParams([
                        [
                          "q",
                          "How do I bind my account?",
                        ],
                      ])}`}
                    >
                      {/* onClick={() => setSearchTest("How do I bind my account")} */}
                      <FAQHighlighter
                        id={4}
                        searchText={searchText}
                        textCallback={handleTextCallback}
                        textToHighlight={`"How do I bind my account?"`}
                      />
                    </Link>
                  </i>
                  <FAQHighlighter
                    id={4}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                   ). This way you can prevent profile refreshes from changing your builds
                  or even have multiple builds of the same character saved at the same time.
                    `}
                  />
                </p>
              </div>
              <img
                loading="lazy"
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
              />
            </div>
          </div>
        ),
      },
      {
        id: 5,
        question: "How to delete my profile/data?",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div className="faq-split">
              <div>
                <p>
                  <FAQHighlighter
                    id={5}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  Individual characters and artifacts can be managed on your own after binding to an authenticated account
                  (see: `}
                  />
                  <i>
                    <Link
                      to={`?${new URLSearchParams([
                        [
                          "q",
                          "How do I save/add more characters to my profile?",
                        ],
                      ])}`}
                    >
                      <FAQHighlighter
                        id={5}
                        searchText={searchText}
                        textCallback={handleTextCallback}
                        textToHighlight={`"How do I save/add more characters to my profile?"`}
                      />
                    </Link>
                    {")."}
                  </i>
                </p>
                <p>
                  <FAQHighlighter
                    id={5}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  Deleting all of your characters and artifacts this way is effectively the same
                  as deleting your profile, however you can still DM me on discord `}
                  />
                  <code style={{ margin: "0 3px" }}>
                    <FAQHighlighter
                      id={5}
                      searchText={searchText}
                      textCallback={handleTextCallback}
                      textToHighlight={`@mimee`}
                    />
                  </code>
                  <FAQHighlighter
                    id={5}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  and I will try to delete your data manually as soon as it's possible. 
                  In the future there will be an automated mechanism for this.`}
                  />
                </p>
              </div>
              <img
                loading="lazy"
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
              />
            </div>
          </div>
        ),
      },
      {
        id: 6,
        question:
          "I can't see my character's ranking | There is no chart on the character card",
        answer: (searchText: string) => (
          <div className="faq-grid">
            <div className="faq-split">
              <div>
                <p>
                  <FAQHighlighter
                    id={6}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`
                  If you do not see your character's ranking at all and there is no chart visible on the character card,
                  then chances are this character does not have a leaderboard coded yet. 
                  Charts are missing because they are generated based on top 1% player data in a specific leaderboard.`}
                  />
                </p>
                <p>
                  <FAQHighlighter
                    id={6}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`List of currently available leaderboards can be found here: `}
                  />
                  <a href="https://akasha.cv/leaderboards">
                    https://akasha.cv/leaderboards
                  </a>
                </p>
                <p>
                  <FAQHighlighter
                    id={6}
                    searchText={searchText}
                    textCallback={handleTextCallback}
                    textToHighlight={`All characters are planned to eventually have a leaderboard.`}
                  />
                </p>
              </div>
              <img
                loading="lazy"
                className="expandable-img"
                src="https://cdn.discordapp.com/attachments/282208855289495554/1140306303202365450/image.png"
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
