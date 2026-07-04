// app/components/LegalPage.tsx

import { PageEntry } from "./StudioMotion";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow?: string;
  title: string;
  intro?: string[];
  sections: LegalSection[];
};

export function LegalPage({ eyebrow, title, intro = [], sections }: LegalPageProps) {
  return (
    <PageEntry className="page-shell legal-page" id="top">
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
