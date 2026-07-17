// app/components/LegalPage.tsx

import { PageEntry } from "./StudioMotion";
import { intlLocales, type PublicLocale } from "../i18n";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  locale: PublicLocale;
  eyebrow?: string;
  title: string;
  intro?: string[];
  sections: LegalSection[];
};

export function LegalPage({ locale, eyebrow, title, intro = [], sections }: LegalPageProps) {
  return (
    <PageEntry className="page-shell legal-page" id="top" lang={intlLocales[locale]}>
      <section className="sub-hero legal-hero">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <section className="legal-content">
        {sections.map((section) => (
          <article className="legal-block" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>
    </PageEntry>
  );
}
