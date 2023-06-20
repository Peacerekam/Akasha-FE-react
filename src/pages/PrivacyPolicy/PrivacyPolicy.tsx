import React from "react";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";

import "./style.scss";
import { AdsComponentManager } from "../../components";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="flex">
      <AdsComponentManager
        adType="LeaderboardATF"
        dataAdSlot="6204085735"
        hybrid="desktop"
      />
      <AdsComponentManager adType="Video" />
      <div className="content-block w-100" id="content-container">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="relative">
          <AdsComponentManager
            adType="LeaderboardBTF"
            dataAdSlot="6204085735"
            hybrid="mobile"
            hideOnDesktop
          />
          <div className="privacy-policy">
            <h1>Privacy Policy</h1>

            <h2>What data does akasha.cv collect and what for</h2>
            <ul>
              <li>
                Visited url at akasha.cv, referer, browser, operating system,
                device type, visitor country via google analytics in order to
                study in what way users use the website and improve upon it. No
                personal data is ever sold or shared.
              </li>
              <li>
                akasha.cv will store your public Genshin account, character and
                artifact information. You can contact Mimee#1111 on Discord if
                you wish to delete your profile.
              </li>
              <li>
                When binding profile page to an UID, akasha.cv will save your
                Patreon and/or Discord ID required for confirming your identity.
              </li>
            </ul>

            <h2>What akasha.cv does NOT collect</h2>
            <p>akasha.cv will never save passwords, usernames, emails.</p>
            <h2>Advertisements</h2>
            <p>akasha.cv uses ads from Google Adsense to support the site.</p>

            <h2>What cookies does akasha.cv use</h2>
            <p>akasha.cv can use cookies to store session IDs.</p>
          </div>
        </div>
      </div>
      <AdsComponentManager adType="LeaderboardBTF" dataAdSlot="6204085735" />
      <AdsComponentManager adType="RichMedia" />
    </div>
  );
};
