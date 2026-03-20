import type { Translation } from "./types";

const frCH: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: "Visualiseur d'historique de voyage",
  langLabel: "Français",
  languageSectionLabel: "Langue",

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: "Données de voyage",
  dataInputPlaceholder: "Collez les données de voyage ici (séparées par tabulation)…",
  expandEditorBtn: "Éditeur plein écran",
  editorDialogTitle: "Modifier les enregistrements",
  editorDialogApply: "Appliquer",
  editorDialogCancel: "Annuler",

  formatHelpBtn: "Guide de format ?",

  displayModeLabel: "Mode d'affichage",
  modeDetailed: "Mode sous-lieu",
  modeOverview: "Mode lieu principal",

  parseBtn: "Analyser et afficher",
  showCalendarBtn: "Afficher le calendrier",

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: "Plage d'affichage",
  dataRangePrefix: "Données : ",
  rangeModeStartEnd: "Début–Fin",
  rangeModeStartDuration: "Début+Jours",
  rangeModeEndDuration: "Fin+Jours",
  startDateLabel: "Date de début",
  endDateLabel: "Date de fin",
  durationLabel: "Jours (défaut 180)",
  displayRangeInfo: (start, end, days) => `Affichage : ${start} — ${end} (${days} jours)`,
  prevDayTitle: "Jour précédent",
  nextDayTitle: "Jour suivant",

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: "Statistiques",
  statsTotalDays: "Jours totaux",
  statsRecordedDays: "Enregistrés",
  statsLocations: "Lieux",
  statsDaysSuffix: "j",

  // ── Errors ────────────────────────────────────────────────────────────────
  errorsLabel: "Erreurs",
  errorDialogTitle: "Erreur d'analyse",
  errorDialogClose: "Fermer",

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: "Calendrier",
  calendarDaysSuffix: " jours",

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: "Collez vos données et cliquez sur « Analyser et afficher »",
  emptyDesc: "Trois formats sont pris en charge : groupes multi-lignes (lieu principal + sous-lieux), ligne unique avec sous-lieu, et ligne unique lieu principal uniquement. Des données d'exemple sont préchargées à gauche.",
  emptyHelpLink: "Voir le guide de format →",

  // ── Weekdays (Sun–Sat) ────────────────────────────────────────────────────
  weekdays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `La date de début ne peut pas être antérieure au ${date}`,
  errStartTooLate: (date) => `La date de début ne peut pas être postérieure au ${date}`,
  errEndTooLate: (date) => `La date de fin ne peut pas être postérieure au ${date}`,
  errEndBeforeStart: "La date de fin ne peut pas être antérieure à la date de début",

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: "Guide du format d'enregistrement",
  helpCloseBtn: "Fermer",
  helpIntro: "Chaque enregistrement est composé d'une ou plusieurs lignes, avec des champs séparés par",
  helpTabNote: "Tab (⇥)",
  helpIntroCont: " pour séparer 6 champs par ligne. Trois formats sont pris en charge :",
  helpEmptyCell: "vide",

  helpType1Title: "Format 1 : Groupe multi-lignes (lieu principal + sous-lieux)",
  helpType1Desc: "La première ligne contient les dates de début/fin globales, le nom du lieu principal et le premier sous-lieu. Les lignes suivantes commencent par trois champs vides et listent les sous-lieux supplémentaires.",
  helpType1ColHeader: "Champs : [Début groupe] [Fin groupe] [Lieu principal] [Sous-lieu] [Début sous] [Fin sous]",
  helpType1Note: "Cela signifie du 29 au 30 juin 2024 dans l'Espace Schengen (lieu principal) ; sous-lieux : Suisse et France le 29 juin, Suisse du 29 au 30 juin.",

  helpType2Title: "Format 2 : Ligne unique avec lieu principal et sous-lieu",
  helpType2Desc: "Une seule ligne. Le champ 4 contient le sous-lieu ; les champs 5 et 6 sont vides. La plage de dates du sous-lieu correspond à celle du lieu principal.",
  helpType2ColHeader: "Champs : [Début] [Fin] [Lieu principal] [Sous-lieu] [vide] [vide]",
  helpType2Note: "Cela signifie du 30 juin au 5 juillet 2024 au Royaume-Uni (lieu principal), sous-lieu Angleterre, même plage de dates.",

  helpType3Title: "Format 3 : Ligne unique, lieu principal uniquement",
  helpType3Desc: "Une seule ligne. Les champs 4, 5 et 6 sont tous vides. Le sous-lieu prend par défaut la même valeur que le lieu principal.",
  helpType3ColHeader: "Champs : [Début] [Fin] [Lieu principal] [vide] [vide] [vide]",
  helpType3Note: "Cela signifie du 18 au 21 juillet 2024 en Chine ; le lieu principal et le sous-lieu sont tous deux la Chine.",

  helpNotesTitle: "Remarques",
  helpNote1: "Le format de date est AAAAMMJJ (8 chiffres, sans séparateurs).",
  helpNote2: "Les champs sont séparés par Tab (\u21e5) ou virgule (,) — les deux fonctionnent, mais ne mélangez pas les deux sur la même ligne.",
  helpNote3: "Si le même jour apparaît dans plusieurs enregistrements de sous-lieux (ex. 20240224 Danemark), il n'est compté qu'une seule fois.",
  helpNote4: "Le « Mode sous-lieu » utilise les sous-lieux ; le « Mode lieu principal » utilise les lieux principaux.",
  helpNote5: "Les lignes vides entre les enregistrements sont ignorées.",

  helpExampleTitle: "Exemple complet",
  helpExSchengen: "Espace Schengen",
  helpExSwitzerland: "Suisse",
  helpExFrance: "France",
  helpExUK: "Royaume-Uni",
  helpExEngland: "Angleterre",
  helpExChina: "Chine",

  helpExampleData: [
    "20240629,20240630,Espace Schengen,Suisse,20240629,20240629",
    ",,,France,20240629,20240629",
    ",,,Suisse,20240629,20240630",
    "20240630,20240705,Royaume-Uni,Angleterre,,",
    "20240705,20240708,Espace Schengen,France,,",
    "20240708,20240717,Royaume-Uni,Angleterre,,",
    "20240718,20240721,Chine,,,",
  ].join("\n"),

  defaultSampleData: [
    "20240629,20240630,Espace Schengen,Suisse,20240629,20240629",
    ",,,France,20240629,20240629",
    ",,,Suisse,20240629,20240630",
    "20240630,20240705,Royaume-Uni,Angleterre,,",
    "20240705,20240708,Espace Schengen,France,,",
    "20240708,20240717,Royaume-Uni,Angleterre,,",
    "20240718,20240721,Chine,,,",
  ].join("\n"),

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: "×",
};

export default frCH;
