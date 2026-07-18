"use client";

import { LanguageAwareBookingLink } from "./LanguageAwareBookingLink";
import { LocalizedPublicLink } from "./LocalizedPublicLink";
import { usePublicLocale } from "./usePublicLocale";
import {
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  Phone,
} from "lucide-react";
import { directionsUrl, mapEmbedUrl, serviceItems } from "../../data/site";
import { sharedCopy } from "../i18n";

const phoneNumber = "+41 77 268 33 88";
const email = "jcdetailinglucerne@gmail.com";
const whatsappUrl = "https://wa.me/41772683388";
const instagramUrl =
  "https://www.instagram.com/jcdetailinglucerne?igsh=amJoendmanBiMWVr&utm_source=qr";
const tiktokUrl = "https://www.tiktok.com/@jcdetailinglucerne";

export function Footer() {
  const locale = usePublicLocale();
  const nav = sharedCopy[locale].nav;
  const copy = {
    de: {
      description:
        "Professionelle Autoaufbereitung, Innenreinigung, Aussenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
      appointment: "Termine nach Vereinbarung",
      navigation: "Navigation",
      services: "Leistungen",
      contact: "Kontakt",
      legal: "Rechtliches",
      directions: "Route anzeigen",
      terms: "AGB",
      imprint: "Impressum",
      privacy: "Datenschutz",
      rights: "Alle Rechte vorbehalten.",
      locationLine:
        "Autoaufbereitung in Wauwil · Kanton Luzern · Zentralschweiz",
    },
    en: {
      description:
        "Professional vehicle detailing, interior and exterior cleaning, polishing and ceramic coating in Wauwil, Canton of Lucerne.",
      appointment: "Appointments by arrangement",
      navigation: "Navigation",
      services: "Services",
      contact: "Contact",
      legal: "Legal",
      directions: "Get directions",
      terms: "Terms",
      imprint: "Legal notice",
      privacy: "Privacy",
      rights: "All rights reserved.",
      locationLine:
        "Vehicle detailing in Wauwil · Canton of Lucerne · Central Switzerland",
    },
    fr: {
      description:
        "Préparation automobile professionnelle, nettoyage intérieur et extérieur, polissage et protection céramique à Wauwil, canton de Lucerne.",
      appointment: "Rendez-vous sur demande",
      navigation: "Navigation",
      services: "Services",
      contact: "Contact",
      legal: "Mentions légales",
      directions: "Afficher l’itinéraire",
      terms: "CGV",
      imprint: "Mentions légales",
      privacy: "Confidentialité",
      rights: "Tous droits réservés.",
      locationLine:
        "Préparation automobile à Wauwil · Canton de Lucerne · Suisse centrale",
    },
    it: {
      description:
        "Detailing professionale, pulizia interna ed esterna, lucidatura e rivestimento ceramico a Wauwil, Canton Lucerna.",
      appointment: "Appuntamenti su richiesta",
      navigation: "Navigazione",
      services: "Servizi",
      contact: "Contatti",
      legal: "Note legali",
      directions: "Mostra indicazioni",
      terms: "Condizioni",
      imprint: "Impressum",
      privacy: "Privacy",
      rights: "Tutti i diritti riservati.",
      locationLine:
        "Detailing auto a Wauwil · Canton Lucerna · Svizzera centrale",
    },
  }[locale];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <p>{copy.description}</p>

          <div className="footer-business-info">
            <a
              href={directionsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MapPin size={16} />
              Sternmatt 4, 6242 Wauwil
            </a>

            <a href={`tel:${phoneNumber.replace(/\s/g, "")}`}>
              <Phone size={16} />
              {phoneNumber}
            </a>

            <a href={`mailto:${email}`}>
              <Mail size={16} />
              {email}
            </a>

            <span>{copy.appointment}</span>
          </div>
        </div>

        <div className="footer-link-groups">
          <div className="footer-links">
            <strong>{copy.navigation}</strong>
            <LocalizedPublicLink href="/">{nav.home}</LocalizedPublicLink>
            <LocalizedPublicLink href="/leistungen#services-grid">
              {nav.services}
            </LocalizedPublicLink>
            <LocalizedPublicLink href="/angebote#offers-grid">
              {nav.offers}
            </LocalizedPublicLink>
            <LocalizedPublicLink href="/gallery#gallery-grid">
              {nav.gallery}
            </LocalizedPublicLink>
            <LanguageAwareBookingLink>
              {nav.booking}
            </LanguageAwareBookingLink>
          </div>

          <div className="footer-links">
            <strong>{copy.services}</strong>
            {serviceItems.map((service) => (
              <LocalizedPublicLink key={service.id} href={service.path}>
                {sharedCopy[locale].serviceNav[service.id][0]}
              </LocalizedPublicLink>
            ))}
          </div>

          <div className="footer-links">
            <strong>{copy.contact}</strong>

            <a
              href={whatsappUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>

            <a
              href={instagramUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Instagram size={16} />
              Instagram
            </a>

            <a
              href={tiktokUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Music2 size={16} />
              TikTok
            </a>

            <a
              href={directionsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Navigation size={16} />
              {copy.directions}
            </a>
          </div>

          <div className="footer-links">
            <strong>{copy.legal}</strong>
            <LocalizedPublicLink href="/agb">
              {copy.terms}
            </LocalizedPublicLink>
            <LocalizedPublicLink href="/impressum">
              {copy.imprint}
            </LocalizedPublicLink>
            <LocalizedPublicLink href="/datenschutz">
              {copy.privacy}
            </LocalizedPublicLink>
          </div>
        </div>

        <div className="footer-map">
          <iframe
            height="230"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            title="JC Detailing Wauwil"
            width="600"
          />

          <a
            className="map-directions"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Navigation size={15} />
            {copy.directions}
          </a>

          <span>
            <MapPin size={16} />
            Sternmatt 4, 6242 Wauwil
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 JC Detailing. {copy.rights}</p>
        <p>{copy.locationLine}</p>
      </div>
    </footer>
  );
}
