import "./style.scss";

import React, { useContext } from "react";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import { StylizedContentBlock } from "../../components";

export const PrivacyPolicyPage: React.FC = () => {
  const { adProvider } = useContext(AdProviderContext);

  const advertismentsText = adProvider
    ? {
        playwire: (
          <>
            <p>
              All or partial advertising on this Website or App is managed by
              Playwire LLC. If Playwire publisher advertising services are used,
              Playwire LLC may collect and use certain aggregated and anonymized
              data for advertising purposes. To learn more about the types of
              data collected, how data is used and your choices as a user,
              please visit{" "}
              <a href="https://www.playwire.com/privacy-policy">
                https://www.playwire.com/privacy-policy
              </a>
              .
            </p>
            <p>
              <strong>For EU Users only:</strong> If you are located in
              countries that are part of the European Economic Area, in the
              United Kingdom or Switzerland, and publisher advertising services
              are being provided by Playwire LLC, you were presented with
              messaging from our Consent Management Platform (CMP) around your
              privacy choices as a user in regards to digital advertising,
              applicable vendors, cookie usage and more. If you’d like to
              revisit the choices you have made previously on this Website or
              App, please{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  (window as any).ramp.showCmpModal();
                }}
              >
                click here
              </a>
              .
            </p>
          </>
        ),
        google: (
          <p>akasha.cv uses ads from Google Adsense to support the site.</p>
        ),
        venatus: (
          <p>akasha.cv uses ads from Venatus Media to support the site.</p>
        ),
        snigel: (
          <>
            <p>
              akasha.cv uses ads from Publisher Collective to support the site.
            </p>
            <p>
              <strong>For EU Users only:</strong> If you are located in
              countries that are part of the European Economic Area, in the
              United Kingdom or Switzerland, you were presented with messaging
              from our Consent Management Platform (CMP) around your privacy
              choices as a user in regards to digital advertising, applicable
              vendors, cookie usage and more.
            </p>
            <p>
              If you’d like to revisit the choices you have made previously on
              this website you can manage your cookie settings{" "}
              <a className="nn-cmp-show" href="?cmpscreen">
                here
              </a>
              .
            </p>
          </>
        ),
        publift: (
          <>
            <p>akasha.cv uses ads from Publift to support the site.</p>
            <p>
              California Consumer Privacy Act (“CCPA”) Under CCPA, Californian
              residents have the right to declare their preferences on the sale
              of data for advertising and marketing purposes. If you wish to
              change your preferences, click this link to launch our preference
              portal:
              <div id="fuse-privacy-tool" data-fuse-privacy-tool></div>
            </p>
            <p>
              We use a third-party to provide monetisation technologies for our
              site. You can review their privacy and cookie policy at
              https://publift.com/privacy-policy/.
            </p>
          </>
        ),
      }[adProvider]
    : "";

  return (
    <div className="flex ">
      <div className="content-block w-100" id="content-container">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="relative privacy-policy-content-wrapper">
          {/* <AdsComponentManager
            adType="LeaderboardBTF"
            dataAdSlot="6204085735"
            hybrid="mobile"
            hideOnDesktop
          /> */}
          {/* <AdsComponentManager adType="Video" /> */}
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
                artifact information. You can contact @mimee (previously
                Mimee#1111) on Discord if you wish to delete your profile. If
                you want to prevent people from refreshing your profile there is
                a refresh lock setting available after binding your akasha
                profile to Discord or Patreon.
              </li>
              <li>
                When binding profile page to a UID, akasha.cv will save your
                Patreon and/or Discord ID required for confirming your identity.
              </li>
            </ul>

            <h2>What akasha.cv does NOT collect</h2>
            <p>akasha.cv will never save passwords, usernames, emails.</p>

            <h2>What cookies does akasha.cv use</h2>
            <p>akasha.cv can use cookies to store session IDs.</p>

            <h2>Advertisements</h2>
            {advertismentsText}
          </div>
        </div>
      </div>
    </div>
  );
};
