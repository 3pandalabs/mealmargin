import type { Metadata } from "next";
import { A, LegalPage, Mail, Section, UL } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Use | MealMargin by 3PandaLabs",
  description:
    "The terms for using MealMargin, a fee-structure simulator that compares one food order across Swiggy, Zomato, ONDC and pickup.",
  alternates: { canonical: "/terms" },
};

const TOC = [
  { id: "service", title: "The service" },
  { id: "estimates", title: "Modelled prices, not live quotes" },
  { id: "affiliation", title: "No affiliation" },
  { id: "use", title: "Acceptable use" },
  { id: "price", title: "Price" },
  { id: "liability", title: "Disclaimers and liability" },
  { id: "changes", title: "Changes to the service" },
  { id: "law", title: "Governing law" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      toc={TOC}
      intro={
        <p>
          These terms are an agreement between you and 3PandaLabs LLC, a New Jersey limited liability company (&ldquo;3PandaLabs&rdquo;,
          &ldquo;we&rdquo;), for using MealMargin. By using the site you agree to them and to our <A href="/privacy">Privacy Policy</A>.
        </p>
      }
    >
      <Section id="service" title="1. The service">
        <p>
          MealMargin lets you pick a locality and a basket of dishes, and shows what that basket would cost at nearby kitchens on Swiggy, on
          Zomato, on the ONDC network and by picking it up yourself, itemised down to commission, fees, packaging, taxes, memberships,
          coupons and card offers. It doesn&apos;t place orders, take payments, or connect to any delivery app, restaurant or bank. There are
          no accounts.
        </p>
      </Section>

      <Section id="estimates" title="2. Modelled prices, not live quotes">
        <p>
          Every number on MealMargin comes from a modelled dataset, not a live price feed. Menu prices, commission rates, platform and delivery
          fees, packaging, surge, coupons and bank offers are representative of publicly reported structures, and the restaurants shown are
          invented examples, not real businesses. A real checkout will differ. Use MealMargin to understand how the channels compare, and
          always check the actual price in the app or at the counter before you pay. It isn&apos;t financial advice.
        </p>
      </Section>

      <Section id="affiliation" title="3. No affiliation">
        <p>
          Swiggy, Zomato, ONDC, and the bank and card names shown are trademarks of their respective owners. MealMargin and 3PandaLabs are
          not affiliated with, endorsed by or sponsored by any of them, and naming them describes the comparison only.
        </p>
      </Section>

      <Section id="use" title="4. Acceptable use">
        <UL>
          <li>Don&apos;t try to break, overload or disrupt the service, or reach parts of it that aren&apos;t public.</li>
          <li>Don&apos;t present MealMargin&apos;s modelled figures as real prices of a real restaurant or app.</li>
          <li>Don&apos;t use the service for anything unlawful.</li>
        </UL>
      </Section>

      <Section id="price" title="5. Price">
        <p>MealMargin is free. If we ever introduce paid features, we&apos;ll say so clearly first, and you won&apos;t be charged without agreeing.</p>
      </Section>

      <Section id="liability" title="6. Disclaimers and liability">
        <p>
          MealMargin is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, to the fullest extent the
          law allows. To the fullest extent the law allows, 3PandaLabs isn&apos;t liable for indirect, incidental or consequential losses, or
          for decisions you make based on MealMargin (including any difference between a figure shown here and what you actually pay), and
          our total liability for any claim is limited to US$100. Nothing in these terms limits liability that can&apos;t be limited by law.
        </p>
      </Section>

      <Section id="changes" title="7. Changes to the service">
        <p>
          We may change, pause or shut down MealMargin at any time. Because nothing is stored with us, there is no data to export first.
        </p>
      </Section>

      <Section id="law" title="8. Governing law">
        <p>
          These terms are governed by the laws of the State of New Jersey, USA, without regard to conflict-of-law rules. Courts located in New
          Jersey have jurisdiction, except where the law of the country you live in gives you the right to bring a claim locally. We may
          update these terms; the date at the top shows the latest version.
        </p>
      </Section>

      <Section id="contact" title="9. Contact">
        <p>
          Questions: <Mail /> or +1 (332) 316-8453.
        </p>
      </Section>
    </LegalPage>
  );
}
