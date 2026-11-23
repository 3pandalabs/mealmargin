import type { Metadata } from "next";
import { A, H3, LegalPage, Mail, Section, UL } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | MealMargin by 3PandaLabs",
  description:
    "MealMargin has no accounts and no database: your choices stay in your own browser. What little the hosting provider sees, and who to contact.",
  alternates: { canonical: "/privacy" },
};

const TOC = [
  { id: "summary", title: "The short version" },
  { id: "device", title: "What stays on your device" },
  { id: "collect", title: "What we and our providers receive" },
  { id: "not-collect", title: "What we never collect" },
  { id: "use", title: "How we use it" },
  { id: "processors", title: "Who processes it for us" },
  { id: "security", title: "How it's protected" },
  { id: "retention", title: "How long it's kept" },
  { id: "rights", title: "Your rights, including under India's DPDP Act" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact and grievances" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      toc={TOC}
      intro={
        <p>
          MealMargin is a service of 3PandaLabs LLC, a New Jersey limited liability company (&ldquo;3PandaLabs&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;). It compares what one food order would cost on Swiggy, Zomato, the ONDC network and at the counter, using a
          modelled dataset. Every price is worked out in your browser, so there is very little to say here, and this policy says exactly that.
        </p>
      }
    >
      <Section id="summary" title="1. The short version">
        <UL>
          <li>There are no accounts, no sign-up and no database. We don&apos;t ask for your name, email, phone number or address.</li>
          <li>
            The choices you make (your area, delivery or pickup, memberships, cards, diet and the promo toggle) are saved only in your own
            browser so the page remembers them. They are never sent to us.
          </li>
          <li>MealMargin doesn&apos;t place orders, take payments, or connect to Swiggy, Zomato, ONDC or any bank.</li>
          <li>We use no analytics, no advertising, no tracking cookies and no third-party scripts.</li>
          <li>Our hosting provider sees standard request data (such as your IP address) when your browser loads the site.</li>
        </UL>
      </Section>

      <Section id="device" title="2. What stays on your device">
        <p>
          MealMargin stores one entry in your browser&apos;s local storage, named <code>mealmargin.prefs.v2</code>. It holds:
        </p>
        <UL>
          <li>the locality you picked from our list (we don&apos;t use your device&apos;s location);</li>
          <li>whether you chose delivery or pickup, and whether the peak-hour toggle is on;</li>
          <li>which delivery memberships you said you have, and which bank or card offers you ticked;</li>
          <li>your diet filter and whether promos are applied.</li>
        </UL>
        <p>
          Your basket of dishes is not saved. This entry never leaves your browser, and we can&apos;t see it. You can delete it at any time by
          clearing this site&apos;s data in your browser settings. MealMargin then simply starts with its defaults.
        </p>
      </Section>

      <Section id="collect" title="3. What we and our providers receive">
        <H3>Technical request data</H3>
        <p>
          Like any website, loading MealMargin means your browser sends a request to our hosting provider, Cloudflare. That request
          includes your IP address, browser type, the page requested and the time. Cloudflare processes it to deliver the site and protect
          it from abuse, and we use Cloudflare&apos;s request logs only for debugging and security. These logs don&apos;t contain your
          preferences or basket, because those never leave your browser.
        </p>
        <H3>Emails you send us</H3>
        <p>
          If you email <Mail />, we receive your email address and whatever you write, and use it only to reply to you.
        </p>
      </Section>

      <Section id="not-collect" title="4. What we never collect">
        <UL>
          <li>Names, phone numbers, delivery addresses or any account details. There are no accounts.</li>
          <li>Card numbers, UPI IDs or any payment details. Ticking a bank offer stores only which offer you ticked, on your device.</li>
          <li>Your logins for Swiggy, Zomato, ONDC apps or any bank.</li>
          <li>Your device&apos;s location, contacts or photos.</li>
          <li>Analytics, advertising or cross-site tracking data.</li>
        </UL>
      </Section>

      <Section id="use" title="5. How we use it">
        <UL>
          <li>To serve the website to you.</li>
          <li>To keep the service secure, prevent abuse and fix problems.</li>
          <li>To reply to emails you send us.</li>
        </UL>
        <p>We don&apos;t sell or rent data, and we don&apos;t use it for advertising or to build profiles of anyone.</p>
      </Section>

      <Section id="processors" title="6. Who processes it for us">
        <p>We use a small number of service providers, each only for the job listed:</p>
        <UL>
          <li>
            <strong>Cloudflare, Inc.</strong> (USA): hosts and serves the website, keeps short-lived request logs, and receives email sent to
            our MealMargin address.
          </li>
          <li>
            <strong>Google LLC</strong> (USA): our email inbox. Mail sent to <Mail /> is forwarded to a Google-hosted mailbox, where we read
            and answer it.
          </li>
        </UL>
        <p>
          These providers process data outside India. We transfer data only to countries not restricted by the Government of India under
          the DPDP Act, and we rely on providers&apos; own commitments to protect it.
        </p>
        <p>We may also disclose data if the law requires it, or to protect the rights and safety of our users or of 3PandaLabs.</p>
      </Section>

      <Section id="security" title="7. How it's protected">
        <UL>
          <li>All traffic uses HTTPS.</li>
          <li>We hold no database of user data, so there is no store of personal data to breach.</li>
          <li>Access to our hosting and email accounts is limited to the 3PandaLabs team and protected by multi-factor authentication.</li>
        </UL>
        <p>No system is perfectly secure. If a breach affects your data, we&apos;ll notify you and the authorities as the law requires.</p>
      </Section>

      <Section id="retention" title="8. How long it's kept">
        <UL>
          <li>
            <strong>Preferences on your device:</strong> until you clear this site&apos;s data. We never hold a copy.
          </li>
          <li>
            <strong>Request logs:</strong> kept by Cloudflare for a short period (days, not months) and then deleted automatically.
          </li>
          <li>
            <strong>Emails you send us:</strong> kept as long as needed to deal with your message. Ask us and we&apos;ll delete them.
          </li>
        </UL>
      </Section>

      <Section id="rights" title="9. Your rights, including under India's DPDP Act">
        <p>
          If you are in India, the Digital Personal Data Protection Act, 2023 gives you the right to access a summary of your personal data,
          to correct and complete it, to have it erased, to nominate someone to exercise your rights if you die or become incapacitated, and
          to grievance redressal. Because MealMargin keeps your choices only on your own device, you can see, change or erase them yourself at
          any time: change them on the page, or clear this site&apos;s data in your browser.
        </p>
        <p>
          For anything else, including emails you&apos;ve sent us, email <Mail />. We answer within 30 days. If you&apos;re not satisfied, you
          can complain to the Data Protection Board of India or your local data protection authority.
        </p>
      </Section>

      <Section id="children" title="10. Children">
        <p>
          MealMargin isn&apos;t directed at children, and we don&apos;t knowingly collect personal data from anyone under 18. If you believe a
          child has emailed us, tell us and we&apos;ll delete the message.
        </p>
      </Section>

      <Section id="changes" title="11. Changes">
        <p>
          If MealMargin ever adds accounts, saved baskets or live prices, this policy will change first. We&apos;ll post the new version here,
          and the date at the top shows the latest one. See also our <A href="/terms">Terms of Use</A>.
        </p>
      </Section>

      <Section id="contact" title="12. Contact and grievances">
        <p>
          3PandaLabs LLC, New Jersey, USA. Email <Mail /> for privacy questions, data requests and grievances (our Grievance Officer reads
          this mailbox), or call +1 (332) 316-8453. This policy is governed by the laws of the State of New Jersey, USA, without affecting
          any rights you have under the laws of the country where you live.
        </p>
      </Section>
    </LegalPage>
  );
}
