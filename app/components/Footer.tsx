// app/components/Footer.tsx

import Link from "next/link";
import { Instagram, MapPin, MessageCircle, Music2, Navigation } from "lucide-react";
import { directionsUrl, mapEmbedUrl } from "../data/site";

const whatsappUrl = "https://wa.me/41772683388";
const tiktokUrl = "https://www.tiktok.com/";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-logo">JC</div>
          <p>Professionelle Fahrzeugaufbereitung in der Zentralschweiz.</p>
          <a href="https://www.jcdetailing.ch/" target="_blank">
            Current website
          </a>
        </div>

        <div className="footer-link-groups">
          <div className="footer-links">
            <strong>Navigation</strong>
            <Link href="/leistungen">Leistungen</Link>
            <Link href="/angebote/de">Angebote DE</Link>
            <Link href="/angebote/en">Offers EN</Link>
            <Link href="/#contact">Kontakt</Link>
          </div>

          <div className="footer-links">
            <strong>Rechtliches</strong>
            <Link href="/agb">AGB</Link>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>

          <div className="footer-links">
            <strong>Social</strong>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a href="https://www.instagram.com/jcdetailinglucerne?igsh=amJoendmanBiMWVr&utm_source=qr" target="_blank" rel="noopener noreferrer">
              <Instagram size={16} />
              Instagram
            </a>
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              <Music2 size={16} />
              TikTok
            </a>
          </div>
        </div>

        <div className="footer-map">
          <iframe title="JC Detailing location" src={mapEmbedUrl} loading="lazy" />
          <a className="map-directions" href={directionsUrl} target="_blank">
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
        <p>(c) 2026 JC Detailing. All rights reserved.</p>
        <p>DEU / ENG / FRA / ITA / ALB</p>
      </div>
    </footer>
  );
}
