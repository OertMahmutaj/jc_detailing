import type { PublicLocale } from "./i18n";

type LegalDocument = {
  title: string;
  intro?: string[];
  sections: Array<{ title: string; body: string[] }>;
};

export const termsCopy: Record<PublicLocale, LegalDocument> = {
  de: {
    title: "Allgemeine Geschäftsbedingungen",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Schweiz"],
    sections: [
      { title: "1. Geltungsbereich", body: ["Diese Allgemeinen Geschäftsbedingungen gelten für Dienstleistungen von JC Detailing im Bereich Fahrzeugaufbereitung, Innenreinigung, Aussenreinigung, Politur, Lackpflege und Keramikversiegelung."] },
      { title: "2. Terminvereinbarung", body: ["Terminanfragen über die Website sind unverbindlich, bis sie von JC Detailing bestätigt wurden.", "Der Kunde ist dafür verantwortlich, korrekte Angaben zum Fahrzeug, Zustand, gewünschter Leistung und Terminwunsch zu machen."] },
      { title: "3. Preise", body: ["Alle angegebenen Preise sind Einstiegspreise. Der finale Preis kann je nach Fahrzeuggrösse, Zustand, Verschmutzungsgrad und gewünschtem Leistungsumfang abweichen.", "Der endgültige Umfang und Preis werden vor Beginn der Arbeit mit dem Kunden abgestimmt."] },
      { title: "4. Fahrzeugzustand", body: ["Bestehende Schäden, Kratzer, Defekte, lose Teile oder empfindliche Materialien können das Ergebnis beeinflussen.", "JC Detailing übernimmt keine Haftung für bereits vorhandene Schäden oder Schäden, die durch verschlissene, beschädigte oder unsachgemäss reparierte Fahrzeugteile entstehen."] },
      { title: "5. Zahlung", body: ["Die Zahlung erfolgt, sofern nicht anders vereinbart, nach Abschluss der Dienstleistung bei Übergabe des Fahrzeugs."] },
      { title: "6. Stornierung und Terminverschiebung", body: ["Terminänderungen sollten so früh wie möglich mitgeteilt werden.", "Bei kurzfristigen Absagen oder Nichterscheinen behält sich JC Detailing vor, zukünftige Termine nur nach vorheriger Absprache anzunehmen."] },
      { title: "7. Gewährleistung", body: ["Sollte der Kunde mit einer ausgeführten Leistung nicht zufrieden sein, ist dies zeitnah nach Übergabe mitzuteilen, damit JC Detailing die Beanstandung prüfen kann."] },
      { title: "8. Kontakt", body: ["Bei Fragen zu diesen AGB kontaktieren Sie JC Detailing per E-Mail unter jcdetailinglucerne@gmail.com."] },
    ],
  },
  en: {
    title: "General Terms and Conditions",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Switzerland"],
    sections: [
      { title: "1. Scope", body: ["These General Terms and Conditions apply to services provided by JC Detailing in the areas of vehicle detailing, interior and exterior cleaning, polishing, paint care and ceramic coating."] },
      { title: "2. Appointments", body: ["Appointment requests submitted through the website are non-binding until they have been confirmed by JC Detailing.", "The customer is responsible for providing correct information about the vehicle, its condition, the desired service and preferred appointment date."] },
      { title: "3. Prices", body: ["All listed prices are starting prices. The final price may vary according to vehicle size, condition, level of soiling and the requested scope of work.", "The final scope and price will be agreed with the customer before work begins."] },
      { title: "4. Vehicle condition", body: ["Existing damage, scratches, defects, loose parts or sensitive materials may affect the result.", "JC Detailing accepts no liability for pre-existing damage or damage caused by worn, damaged or improperly repaired vehicle parts."] },
      { title: "5. Payment", body: ["Unless otherwise agreed, payment is due after completion of the service when the vehicle is handed back."] },
      { title: "6. Cancellation and rescheduling", body: ["Appointment changes should be communicated as early as possible.", "In the event of a late cancellation or no-show, JC Detailing reserves the right to accept future appointments only by prior arrangement."] },
      { title: "7. Complaints", body: ["If the customer is not satisfied with a completed service, this must be reported promptly after handover so that JC Detailing can review the concern."] },
      { title: "8. Contact", body: ["For questions about these terms, contact JC Detailing at jcdetailinglucerne@gmail.com."] },
    ],
  },
  fr: {
    title: "Conditions générales",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Suisse"],
    sections: [
      { title: "1. Champ d’application", body: ["Les présentes conditions générales s’appliquent aux services de JC Detailing dans les domaines de la préparation automobile, du nettoyage intérieur et extérieur, du polissage, de l’entretien de la peinture et de la protection céramique."] },
      { title: "2. Rendez-vous", body: ["Les demandes envoyées via le site ne sont pas contraignantes tant qu’elles n’ont pas été confirmées par JC Detailing.", "Le client doit fournir des informations correctes sur le véhicule, son état, le service souhaité et la date demandée."] },
      { title: "3. Prix", body: ["Tous les prix indiqués sont des prix de départ. Le prix final peut varier selon la taille, l’état, le niveau de saleté et l’étendue des prestations.", "L’étendue et le prix définitifs sont convenus avec le client avant le début des travaux."] },
      { title: "4. État du véhicule", body: ["Les dommages, rayures, défauts, pièces desserrées ou matériaux sensibles existants peuvent influencer le résultat.", "JC Detailing décline toute responsabilité pour les dommages préexistants ou causés par des pièces usées, endommagées ou réparées de manière inadéquate."] },
      { title: "5. Paiement", body: ["Sauf accord contraire, le paiement intervient après la prestation lors de la restitution du véhicule."] },
      { title: "6. Annulation et report", body: ["Toute modification doit être communiquée le plus tôt possible.", "En cas d’annulation tardive ou d’absence, JC Detailing se réserve le droit de n’accepter les futurs rendez-vous qu’après accord préalable."] },
      { title: "7. Réclamations", body: ["Si le client n’est pas satisfait, il doit le signaler rapidement après la restitution afin que JC Detailing puisse examiner la réclamation."] },
      { title: "8. Contact", body: ["Pour toute question concernant ces conditions, contactez JC Detailing à jcdetailinglucerne@gmail.com."] },
    ],
  },
  it: {
    title: "Condizioni generali",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Svizzera"],
    sections: [
      { title: "1. Ambito di applicazione", body: ["Le presenti condizioni generali si applicano ai servizi di JC Detailing relativi a detailing, pulizia interna ed esterna, lucidatura, cura della vernice e rivestimento ceramico."] },
      { title: "2. Appuntamenti", body: ["Le richieste inviate tramite il sito non sono vincolanti finché non vengono confermate da JC Detailing.", "Il cliente è responsabile di fornire informazioni corrette sul veicolo, sulle condizioni, sul servizio desiderato e sulla data richiesta."] },
      { title: "3. Prezzi", body: ["Tutti i prezzi indicati sono prezzi iniziali. Il prezzo finale può variare in base a dimensioni, condizioni, livello di sporco e prestazioni richieste.", "L’estensione e il prezzo definitivi vengono concordati con il cliente prima dell’inizio dei lavori."] },
      { title: "4. Condizioni del veicolo", body: ["Danni, graffi, difetti, parti allentate o materiali sensibili già presenti possono influire sul risultato.", "JC Detailing non risponde di danni preesistenti o causati da componenti usurati, danneggiati o riparati in modo improprio."] },
      { title: "5. Pagamento", body: ["Salvo accordi diversi, il pagamento avviene al termine del servizio alla riconsegna del veicolo."] },
      { title: "6. Annullamento e spostamento", body: ["Le modifiche all’appuntamento devono essere comunicate il prima possibile.", "In caso di annullamento tardivo o mancata presentazione, JC Detailing si riserva di accettare futuri appuntamenti solo previo accordo."] },
      { title: "7. Reclami", body: ["Se il cliente non è soddisfatto del servizio, deve comunicarlo tempestivamente dopo la consegna affinché JC Detailing possa verificare la segnalazione."] },
      { title: "8. Contatti", body: ["Per domande sulle condizioni, contattare JC Detailing all’indirizzo jcdetailinglucerne@gmail.com."] },
    ],
  },
};

export const imprintCopy: Record<PublicLocale, LegalDocument> = {
  de: {
    title: "Impressum",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Schweiz", "Telefon: +41 77 268 33 88", "E-Mail: jcdetailinglucerne@gmail.com"],
    sections: [
      { title: "Haftungsausschluss", body: ["Die Inhalte unserer Website wurden mit grösstmöglicher Sorgfalt erstellt. Dennoch übernehmen wir keine Gewähr für die Richtigkeit, Vollständigkeit, Aktualität oder Zuverlässigkeit der bereitgestellten Informationen.", "Haftungsansprüche gegen JC Detailing wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff auf die Website, deren Nutzung oder Nichtnutzung, durch technische Störungen oder durch missbräuchliche Nutzung der Verbindung entstehen, sind ausgeschlossen.", "Alle Angebote auf dieser Website sind unverbindlich. JC Detailing behält sich ausdrücklich vor, Inhalte jederzeit und ohne Ankündigung ganz oder teilweise zu ändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder dauerhaft einzustellen."] },
      { title: "Haftung für Links", body: ["Diese Website kann Links zu externen Websites Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss, weshalb wir dafür keine Gewähr übernehmen.", "Für die Inhalte der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich. Der Zugriff und die Nutzung solcher Websites erfolgen auf eigene Gefahr des jeweiligen Nutzers."] },
      { title: "Urheberrechte", body: ["Die Urheberrechte und alle anderen Rechte an Inhalten, Bildern, Fotos oder sonstigen Dateien auf dieser Website liegen, sofern nicht anders angegeben, bei JC Detailing bzw. Juljan Cela.", "Die Verwendung, Vervielfältigung oder Weitergabe von Inhalten jeglicher Art bedarf der vorherigen schriftlichen Zustimmung des jeweiligen Rechteinhabers."] },
    ],
  },
  en: {
    title: "Legal notice",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Switzerland", "Phone: +41 77 268 33 88", "Email: jcdetailinglucerne@gmail.com"],
    sections: [
      { title: "Disclaimer", body: ["The content of this website has been prepared with the greatest possible care. Nevertheless, we do not guarantee that the information provided is correct, complete, current or reliable.", "Claims against JC Detailing for material or immaterial damage arising from access to the website, its use or non-use, technical faults or misuse of the connection are excluded.", "All offers on this website are non-binding. JC Detailing reserves the right to change, supplement or delete content, or to suspend publication temporarily or permanently without prior notice."] },
      { title: "External links", body: ["This website may contain links to external third-party websites. We have no influence over their content and therefore accept no responsibility for it.", "The operators of the linked pages are solely responsible for their content. Access and use are at the user’s own risk."] },
      { title: "Copyright", body: ["Unless otherwise stated, copyright and all other rights to content, images, photographs and files on this website belong to JC Detailing or Juljan Cela.", "Any use, reproduction or distribution requires prior written permission from the respective rights holder."] },
    ],
  },
  fr: {
    title: "Mentions légales",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Suisse", "Téléphone: +41 77 268 33 88", "E-mail: jcdetailinglucerne@gmail.com"],
    sections: [
      { title: "Clause de non-responsabilité", body: ["Le contenu de ce site a été créé avec le plus grand soin. Nous ne garantissons toutefois pas l’exactitude, l’exhaustivité, l’actualité ou la fiabilité des informations fournies.", "Toute responsabilité de JC Detailing pour des dommages matériels ou immatériels résultant de l’accès au site, de son utilisation ou non-utilisation, de problèmes techniques ou d’une utilisation abusive de la connexion est exclue.", "Toutes les offres sont sans engagement. JC Detailing se réserve le droit de modifier, compléter ou supprimer des contenus, ou de suspendre leur publication sans préavis."] },
      { title: "Liens externes", body: ["Ce site peut contenir des liens vers des sites tiers. Nous n’avons aucune influence sur leur contenu et déclinons toute responsabilité à cet égard.", "Les exploitants des pages liées sont seuls responsables de leur contenu. L’accès et l’utilisation se font aux risques de l’utilisateur."] },
      { title: "Droits d’auteur", body: ["Sauf indication contraire, les droits d’auteur et tous les autres droits sur les contenus, images, photographies et fichiers appartiennent à JC Detailing ou Juljan Cela.", "Toute utilisation, reproduction ou diffusion nécessite l’accord écrit préalable du titulaire des droits."] },
    ],
  },
  it: {
    title: "Impressum",
    intro: ["JC Detailing", "Juljan Cela", "Sternmatt 4, 6242 Wauwil, Svizzera", "Telefono: +41 77 268 33 88", "E-mail: jcdetailinglucerne@gmail.com"],
    sections: [
      { title: "Esclusione di responsabilità", body: ["I contenuti del sito sono stati preparati con la massima cura. Non garantiamo tuttavia correttezza, completezza, attualità o affidabilità delle informazioni fornite.", "Sono escluse pretese nei confronti di JC Detailing per danni materiali o immateriali derivanti dall’accesso al sito, dal suo utilizzo o mancato utilizzo, da problemi tecnici o dall’uso improprio della connessione.", "Tutte le offerte sul sito non sono vincolanti. JC Detailing si riserva il diritto di modificare, integrare o eliminare contenuti oppure sospendere la pubblicazione senza preavviso."] },
      { title: "Link esterni", body: ["Il sito può contenere link a siti esterni di terzi. Non abbiamo alcuna influenza sui loro contenuti e non assumiamo responsabilità al riguardo.", "I gestori delle pagine collegate sono gli unici responsabili dei contenuti. L’accesso e l’utilizzo avvengono a rischio dell’utente."] },
      { title: "Diritti d’autore", body: ["Salvo diversa indicazione, i diritti d’autore e tutti gli altri diritti su contenuti, immagini, fotografie e file appartengono a JC Detailing o Juljan Cela.", "Qualsiasi utilizzo, riproduzione o distribuzione richiede il previo consenso scritto del titolare dei diritti."] },
    ],
  },
};

export const privacyCopy: Record<PublicLocale, LegalDocument> = {
  de: {
    title: "Datenschutzerklärung JC Detailing",
    sections: [
      { title: "1. Allgemeines", body: ["Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir behandeln Ihre Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften der Schweiz (revDSG)."] },
      { title: "2. Erhebung und Verarbeitung von Daten", body: ["Wir erheben personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen, z.B. durch eine Terminbuchung über unsere Website, Kontakt per E-Mail oder WhatsApp sowie Terminvereinbarung.", "Folgende Daten können erhoben werden: Name, Telefonnummer, E-Mail-Adresse und Fahrzeugdaten."] },
      { title: "3. Zweck der Datenverarbeitung", body: ["Die Daten werden verwendet für Terminvereinbarung, Kommunikation mit Kunden, Durchführung der Dienstleistungen und Rechnungsstellung."] },
      { title: "4. Weitergabe an Dritte", body: ["Ihre Daten werden nicht an Dritte weitergegeben, ausser wenn dies zur Abwicklung notwendig ist, z.B. Zahlungsanbieter oder Buchungssystem."] },
      { title: "5. Cookies & Website", body: ["Unsere Website kann Cookies verwenden, um die Benutzerfreundlichkeit zu verbessern."] },
      { title: "6. Terminbuchung über die Website", body: ["Für Terminbuchungen verarbeiten wir die Angaben, die Sie im Buchungsformular übermitteln. Dazu gehören insbesondere Name, Kontaktdaten, Fahrzeugdaten, gewünschte Leistung und gewünschter Termin."] },
      { title: "7. Ihre Rechte", body: ["Sie haben jederzeit das Recht auf Auskunft über Ihre Daten, Berichtigung und Löschung.", "Kontaktieren Sie uns dazu per E-Mail."] },
      { title: "8. Kontakt", body: ["Bei Fragen zum Datenschutz: Juljan Cela, E-Mail: jcdetailinglucerne@gmail.com"] },
    ],
  },
  en: {
    title: "JC Detailing Privacy Policy",
    sections: [
      { title: "1. General information", body: ["Protecting your personal data is important to us. We treat your data confidentially and in accordance with Swiss data protection law (revDSG)."] },
      { title: "2. Collection and processing", body: ["We collect personal data only when you provide it voluntarily, for example through an appointment request, contact by email or WhatsApp, or another appointment arrangement.", "The data may include your name, phone number, email address and vehicle information."] },
      { title: "3. Purpose of processing", body: ["The data is used to arrange appointments, communicate with customers, provide services and issue invoices."] },
      { title: "4. Disclosure to third parties", body: ["Your data is not shared with third parties unless this is necessary to process the service, for example with payment or booking providers."] },
      { title: "5. Cookies and website", body: ["Our website may use cookies to improve usability."] },
      { title: "6. Online booking", body: ["For appointment requests, we process the information submitted in the booking form, including contact details, vehicle information, requested services and preferred appointment time."] },
      { title: "7. Your rights", body: ["You may request access to, correction of or deletion of your data at any time.", "Please contact us by email."] },
      { title: "8. Contact", body: ["For privacy questions: Juljan Cela, email: jcdetailinglucerne@gmail.com"] },
    ],
  },
  fr: {
    title: "Déclaration de confidentialité JC Detailing",
    sections: [
      { title: "1. Généralités", body: ["La protection de vos données personnelles est importante pour nous. Nous les traitons de manière confidentielle conformément au droit suisse sur la protection des données (revDSG)."] },
      { title: "2. Collecte et traitement", body: ["Nous collectons des données personnelles uniquement lorsque vous nous les communiquez volontairement, par exemple via une demande de rendez-vous, un e-mail ou WhatsApp.", "Les données peuvent inclure le nom, le numéro de téléphone, l’adresse e-mail et les informations sur le véhicule."] },
      { title: "3. Finalité du traitement", body: ["Les données sont utilisées pour organiser les rendez-vous, communiquer avec les clients, fournir les services et établir les factures."] },
      { title: "4. Transmission à des tiers", body: ["Vos données ne sont pas transmises à des tiers sauf si cela est nécessaire au traitement, par exemple à un prestataire de paiement ou de réservation."] },
      { title: "5. Cookies et site web", body: ["Notre site peut utiliser des cookies afin d’améliorer son utilisation."] },
      { title: "6. Réservation en ligne", body: ["Pour les demandes de rendez-vous, nous traitons les informations transmises dans le formulaire, notamment les coordonnées, le véhicule, les services souhaités et la date demandée."] },
      { title: "7. Vos droits", body: ["Vous pouvez demander à tout moment l’accès, la rectification ou la suppression de vos données.", "Contactez-nous par e-mail."] },
      { title: "8. Contact", body: ["Pour toute question de confidentialité: Juljan Cela, e-mail: jcdetailinglucerne@gmail.com"] },
    ],
  },
  it: {
    title: "Informativa sulla privacy JC Detailing",
    sections: [
      { title: "1. Informazioni generali", body: ["La protezione dei dati personali è importante per noi. Trattiamo i dati in modo riservato e nel rispetto della legge svizzera sulla protezione dei dati (revDSG)."] },
      { title: "2. Raccolta e trattamento", body: ["Raccogliamo dati personali solo quando vengono forniti volontariamente, per esempio tramite una richiesta di appuntamento, e-mail o WhatsApp.", "I dati possono includere nome, numero di telefono, indirizzo e-mail e informazioni sul veicolo."] },
      { title: "3. Finalità del trattamento", body: ["I dati vengono utilizzati per organizzare appuntamenti, comunicare con i clienti, fornire i servizi ed emettere fatture."] },
      { title: "4. Trasmissione a terzi", body: ["I dati non vengono trasmessi a terzi salvo quando necessario per l’elaborazione, per esempio a fornitori di pagamento o prenotazione."] },
      { title: "5. Cookie e sito web", body: ["Il sito può utilizzare cookie per migliorare l’esperienza d’uso."] },
      { title: "6. Prenotazione online", body: ["Per le richieste di appuntamento trattiamo le informazioni inviate nel modulo, tra cui contatti, dati del veicolo, servizi richiesti e data preferita."] },
      { title: "7. I tuoi diritti", body: ["Puoi richiedere in qualsiasi momento accesso, rettifica o cancellazione dei dati.", "Contattaci tramite e-mail."] },
      { title: "8. Contatti", body: ["Per domande sulla privacy: Juljan Cela, e-mail: jcdetailinglucerne@gmail.com"] },
    ],
  },
};
