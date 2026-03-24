import type { Translation } from './types';

const frCH: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: "Visualiseur d'historique de voyage",
  langLabel: 'Français',
  languageSectionLabel: 'Langue',

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: 'Données de voyage',
  editDataBtn: 'Modifier les données',
  editorDialogTitle: 'Modifier les enregistrements',
  editorDialogApply: 'Appliquer',
  editorDialogCancel: 'Annuler',

  formatHelpBtn: 'Guide de format ?',
  helpBtn: 'Aide',
  aboutBtn: 'À propos',
  aboutTitle: 'À propos',
  aboutDescription: "Un visualiseur de l'historique de voyage personnel basé sur un calendrier.",
  builtWith: 'Construit avec',
  builtWithSep: ', ',
  builtWithSuffix: ' et ❤️',
  sponsorLabel: 'Soutenez-moi',
  sponsorDesc1:
    "Visualiseur d'historique de voyage vous aide à tenir un relevé précis des jours passés dans chaque pays et région, y compris les calculs pour l'espace Schengen, afin de planifier vos voyages en toute sérénité et d'éviter de dépasser la durée de séjour autorisée.",
  sponsorDesc2:
    "Cet outil a été développé grâce au vibe coding combiné à un débogage manuel minutieux. Le vibe coding repose sur l'assistance de l'IA, ce qui engendre des coûts réels en tokens à chaque itération. Le débogage manuel, quant à lui, exige du temps et de la patience à chaque étape. S'il vous a été utile, je vous serais sincèrement reconnaissant de votre soutien. Même un petit geste, de quoi offrir une tasse de café, compte beaucoup et aide le projet à vivre.",
  sponsorDesc3: 'Merci pour votre soutien.',

  displayModeLabel: "Mode d'affichage",
  modeDetailed: 'Mode petit lieu',
  modeOverview: 'Mode grand lieu',

  weekStartLabel: 'Début de semaine',
  weekStartSun: 'Dimanche',
  weekStartMon: 'Lundi',

  showCalendarBtn: 'Afficher le calendrier',

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: "Plage d'affichage",
  dataRangePrefix: 'Données : ',
  rangeModeStartEnd: 'Début–Fin',
  rangeModeStartDuration: 'Début+Jours',
  rangeModeEndDuration: 'Fin+Jours',
  startDateLabel: 'Date de début',
  endDateLabel: 'Date de fin',
  durationLabel: 'Jours (défaut 180)',
  displayRangeInfo: (start, end, days) => `Affichage : ${start} — ${end} (${days} jours)`,
  prevDayTitle: 'Jour précédent',
  nextDayTitle: 'Jour suivant',

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: 'Statistiques',
  statsTotalDays: 'Jours totaux',
  statsRecordedDays: 'Enregistrés',
  statsLocations: 'Lieux',
  statsDaysSuffix: 'j',

  // ── Toast notifications ───────────────────────────────────────────────────
  parseSuccess: (days: number) => `Analyse réussie : ${days} jours`,

  // ── Errors ────────────────────────────────────────────────────────────────
  errorsLabel: 'Erreurs',
  errorDialogTitle: "Erreur d'analyse",
  errorDialogClose: 'Fermer',

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: 'Calendrier',
  calendarDaysSuffix: ' jours',

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: 'Collez vos données pour les visualiser',
  emptyDesc:
    "Trois formats sont pris en charge : groupes multi-lignes (grand lieu + petits lieux), ligne unique avec petit lieu, et ligne unique grand lieu uniquement. Des données d'exemple sont préchargées et se mettent à jour automatiquement lors de la saisie.",
  emptyHelpLink: 'Voir le guide de format →',

  // ── Weekdays (Sun–Sat) ────────────────────────────────────────────────────
  weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `La date de début ne peut pas être antérieure au ${date}`,
  errStartTooLate: (date) => `La date de début ne peut pas être postérieure au ${date}`,
  errEndTooLate: (date) => `La date de fin ne peut pas être postérieure au ${date}`,
  errEndBeforeStart: 'La date de fin ne peut pas être antérieure à la date de début',

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: "Guide du format d'enregistrement",
  helpCloseBtn: 'Fermer',
  helpIntro: "Chaque enregistrement est composé d'une ou plusieurs lignes, avec des champs séparés par",
  helpTabNote: 'Tab (⇥) ou virgule (,)',
  helpIntroCont: ' pour séparer 6 champs par ligne. Trois formats sont pris en charge :',
  helpEmptyCell: 'vide',

  helpType1Title: 'Format 1 : Groupe multi-lignes (grand lieu + petits lieux)',
  helpType1Desc:
    'La première ligne contient les dates de début/fin globales, le nom du grand lieu et le premier petit lieu. Les lignes suivantes commencent par trois champs vides et listent les petits lieux supplémentaires.',
  helpType1ColHeader: 'Champs : [Début groupe] [Fin groupe] [Grand lieu] [Petit lieu] [Début petit] [Fin petit]',
  helpType1Note:
    "Cela signifie du 29 au 30 juin 2024 dans l'Espace Schengen (grand lieu) ; petits lieux : Suisse et France le 29 juin, Suisse du 29 au 30 juin.",

  helpType2Title: 'Format 2 : Ligne unique avec grand lieu et petit lieu',
  helpType2Desc:
    'Une seule ligne. Le champ 4 contient le petit lieu ; les champs 5 et 6 sont vides. La plage de dates du petit lieu correspond à celle du grand lieu.',
  helpType2ColHeader: 'Champs : [Début] [Fin] [Grand lieu] [Petit lieu] [vide] [vide]',
  helpType2Note:
    'Cela signifie du 30 juin au 5 juillet 2024 au Royaume-Uni (grand lieu), petit lieu Angleterre, même plage de dates.',

  helpType3Title: 'Format 3 : Ligne unique, grand lieu uniquement',
  helpType3Desc:
    'Une seule ligne. Les champs 4, 5 et 6 sont tous vides. Le petit lieu prend par défaut la même valeur que le grand lieu.',
  helpType3ColHeader: 'Champs : [Début] [Fin] [Grand lieu] [vide] [vide] [vide]',
  helpType3Note:
    'Cela signifie du 18 au 21 juillet 2024 en Chine ; le grand lieu et le petit lieu sont tous deux la Chine.',

  helpNotesTitle: 'Remarques',
  helpNote1: 'Le format de date est AAAAMMJJ (8 chiffres, sans séparateurs).',
  helpNote2:
    'Les champs sont séparés par Tab (\u21e5) ou virgule (,) — les deux fonctionnent, mais ne mélangez pas les deux sur la même ligne.',
  helpNote3:
    "Si le même jour apparaît dans plusieurs enregistrements de petits lieux (ex. 20240224 Danemark), il n'est compté qu'une seule fois.",
  helpNote4: 'Le « Mode petit lieu » utilise les petits lieux ; le « Mode grand lieu » utilise les grands lieux.',
  helpNote5: 'Les lignes vides entre les enregistrements sont ignorées.',

  helpExampleTitle: 'Exemple complet',
  helpExSchengen: 'Espace Schengen',
  helpExSwitzerland: 'Suisse',
  helpExFrance: 'France',
  helpExUK: 'Royaume-Uni',
  helpExEngland: 'Angleterre',
  helpExChina: 'Chine',

  helpExampleData: [
    '20240629,20240630,Espace Schengen,Suisse,20240629,20240629',
    ',,,France,20240629,20240629',
    ',,,Suisse,20240629,20240630',
    '20240630,20240705,Royaume-Uni,Angleterre,,',
    '20240705,20240708,Espace Schengen,France,,',
    '20240708,20240717,Royaume-Uni,Angleterre,,',
    '20240718,20240721,Chine,,,',
  ].join('\n'),

  defaultSampleData: [
    '20240629,20240630,Espace Schengen,Suisse,20240629,20240629',
    ',,,France,20240629,20240629',
    ',,,Suisse,20240629,20240630',
    '20240630,20240705,Royaume-Uni,Angleterre,,',
    '20240705,20240708,Espace Schengen,France,,',
    '20240708,20240717,Royaume-Uni,Angleterre,,',
    '20240718,20240721,Chine,,,',
  ].join('\n'),

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: '×',
};

export default frCH;
