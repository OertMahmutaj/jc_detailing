// app/components/Footer.tsx

import Link from "next/link";
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

const phoneNumber = "+41 77 268 33 88";
const email = "jcdetailinglucerne@gmail.com";
const whatsappUrl = "https://wa.me/41772683388";
const instagramUrl =
  "https://www.instagram.com/jcdetailinglucerne?igsh=amJoendmanBiMWVr&utm_source=qr";
const tiktokUrl = "https://www.tiktok.com/";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-logo">JC</div>

          <p>
            Professionelle Autoaufbereitung, Innenreinigung, Aussenreinigung,
            Politur und Keramikversiegelung in Wauwil, Kanton Luzern.
          </p>

          <div className="footer-business-info">
            <span>
              <MapPin size={16} />
              Sternmatt 4, 6242 Wauwil
            </span>

            <a href={`tel:${phoneNumber.replace(/\s/g, "")}`}>
              <Phone size={16} />
              {phoneNumber}
            </a>

            <a href={`mailto:${email}`}>
              <Mail size={16} />
              {email}
            </a>

            <span>Termine nach Vereinbarung</span>
          </div>
        </div>

        <div className="footer-link-groups">
          <div className="footer-links">
            <strong>Navigation</strong>
            <Link href="/">Startseite</Link>
            <Link href="/leistungen">Leistungen</Link>
            <Link href="/angebote/de">Pakete & Preise</Link>
            <Link href="/gallery">Galerie</Link>
            <Link href="/buchen">Termin buchen</Link>
          </div>

          <div className="footer-links">
            <strong>Leistungen</strong>
            {serviceItems.map((service) => (
              <Link key={service.id} href={service.path}>
                {service.title}
              </Link>
            ))}
          </div>

          <div className="footer-links">
            <strong>Kontakt</strong>

            <a href={whatsappUrl} rel="noopener noreferrer" target="_blank">
              <MessageCircle size={16} />
              WhatsApp
            </a>

            <a href={instagramUrl} rel="noopener noreferrer" target="_blank">
              <Instagram size={16} />
              Instagram
            </a>

            <a href={tiktokUrl} rel="noopener noreferrer" target="_blank">
              <Music2 size={16} />
              TikTok
            </a>

            <a href={directionsUrl} rel="noopener noreferrer" target="_blank">
              <Navigation size={16} />
              Route anzeigen
            </a>
          </div>

          <div className="footer-links">
            <strong>Rechtliches</strong>
            <Link href="/agb">AGB</Link>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>

        <div className="footer-map">
          <iframe
            loading="lazy"
            src={mapEmbedUrl}
            title="JC Detailing Standort in Wauwil"
          />

          <a
            className="map-directions"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Navigation size={15} />
            Route anzeigen
          </a>

          <span>
            <MapPin size={16} />
            Sternmatt 4, 6242 Wauwil
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 JC Detailing. Alle Rechte vorbehalten.</p>
        <p>Autoaufbereitung in Wauwil · Kanton Luzern · Zentralschweiz</p>
      </div>
    </footer>
  );
}