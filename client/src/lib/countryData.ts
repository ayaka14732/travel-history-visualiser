/**
 * countryData.ts
 *
 * Comprehensive country/territory code registry.
 * - `code`    : ISO 3166-1 alpha-2 (or custom for special territories)
 * - `names`   : canonical display names per locale
 * - `aliases` : all recognised input strings (case-insensitive) that map to this code
 *
 * Parsing strategy (in travelParser.ts):
 *   1. Normalise input: trim + lower-case
 *   2. Look up in ALIAS_MAP (built at module load)
 *   3. If found → use code; if not → keep original string as-is
 *
 * To add a new locale: add a key to `names` in each entry, then add
 * the locale key to the `CountryLocale` type.
 */

export type CountryLocale = "zh-TW" | "en-GB" | "fr-CH" | "da-DK";

export interface CountryEntry {
  code: string;
  names: Record<CountryLocale, string>;
  /** Lower-cased aliases used for input matching */
  aliases: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build an entry concisely
// ─────────────────────────────────────────────────────────────────────────────
function c(
  code: string,
  zhTW: string,
  enGB: string,
  frCH: string,
  daDK: string,
  extraAliases: string[] = []
): CountryEntry {
  // Auto-generate aliases from all display names + the code itself
  const nameAliases = [zhTW, enGB, frCH, daDK].map((n) => n.toLowerCase());
  const allAliases = Array.from(
    new Set([code.toLowerCase(), ...nameAliases, ...extraAliases.map((a) => a.toLowerCase())])
  );
  return {
    code,
    names: { "zh-TW": zhTW, "en-GB": enGB, "fr-CH": frCH, "da-DK": daDK },
    aliases: allAliases,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Country / Territory list
// ─────────────────────────────────────────────────────────────────────────────
export const COUNTRIES: CountryEntry[] = [
  // ── A ────────────────────────────────────────────────────────────────────
  c("AF", "阿富汗", "Afghanistan", "Afghanistan", "Afghanistan"),
  c("AL", "阿爾巴尼亞", "Albania", "Albanie", "Albanien", ["阿尔巴尼亚"]),
  c("DZ", "阿爾及利亞", "Algeria", "Algérie", "Algeriet", ["阿尔及利亚"]),
  c("AD", "安道爾", "Andorra", "Andorre", "Andorra", ["安道尔"]),
  c("AO", "安哥拉", "Angola", "Angola", "Angola"),
  c("AG", "安地卡及巴布達", "Antigua and Barbuda", "Antigua-et-Barbuda", "Antigua og Barbuda", ["安提瓜和巴布达", "安地卡和巴布達"]),
  c("AR", "阿根廷", "Argentina", "Argentine", "Argentina"),
  c("AM", "亞美尼亞", "Armenia", "Arménie", "Armenien", ["亚美尼亚"]),
  c("AU", "澳大利亞", "Australia", "Australie", "Australien", ["澳洲", "australia"]),
  c("AT", "奧地利", "Austria", "Autriche", "Østrig", ["奥地利"]),
  c("AZ", "亞塞拜然", "Azerbaijan", "Azerbaïdjan", "Aserbajdsjan", ["阿塞拜疆", "亚塞拜然"]),

  // ── B ────────────────────────────────────────────────────────────────────
  c("BS", "巴哈馬", "Bahamas", "Bahamas", "Bahamas", ["巴哈马"]),
  c("BH", "巴林", "Bahrain", "Bahreïn", "Bahrain"),
  c("BD", "孟加拉", "Bangladesh", "Bangladesh", "Bangladesh", ["孟加拉国"]),
  c("BB", "巴貝多", "Barbados", "Barbade", "Barbados", ["巴巴多斯"]),
  c("BY", "白俄羅斯", "Belarus", "Biélorussie", "Hviderusland", ["白俄罗斯"]),
  c("BE", "比利時", "Belgium", "Belgique", "Belgien", ["比利时"]),
  c("BZ", "貝里斯", "Belize", "Belize", "Belize", ["伯利兹"]),
  c("BJ", "貝南", "Benin", "Bénin", "Benin", ["贝宁"]),
  c("BT", "不丹", "Bhutan", "Bhoutan", "Bhutan"),
  c("BO", "玻利維亞", "Bolivia", "Bolivie", "Bolivia", ["玻利维亚"]),
  c("BA", "波士尼亞與赫塞哥維納", "Bosnia and Herzegovina", "Bosnie-Herzégovine", "Bosnien-Hercegovina", ["波斯尼亚和黑塞哥维那", "波黑", "波士尼亞"]),
  c("BW", "波札那", "Botswana", "Botswana", "Botswana", ["博茨瓦纳"]),
  c("BR", "巴西", "Brazil", "Brésil", "Brasilien"),
  c("BN", "汶萊", "Brunei", "Brunéi", "Brunei", ["文莱", "汶莱"]),
  c("BG", "保加利亞", "Bulgaria", "Bulgarie", "Bulgarien", ["保加利亚"]),
  c("BF", "布吉納法索", "Burkina Faso", "Burkina Faso", "Burkina Faso", ["布基纳法索"]),
  c("BI", "蒲隆地", "Burundi", "Burundi", "Burundi", ["布隆迪"]),

  // ── C ────────────────────────────────────────────────────────────────────
  c("CV", "維德角", "Cabo Verde", "Cap-Vert", "Kap Verde", ["佛得角", "维德角"]),
  c("KH", "柬埔寨", "Cambodia", "Cambodge", "Cambodja"),
  c("CM", "喀麥隆", "Cameroon", "Cameroun", "Cameroun"),
  c("CA", "加拿大", "Canada", "Canada", "Canada"),
  c("CF", "中非共和國", "Central African Republic", "République centrafricaine", "Centralafrikanske Republik", ["中非"]),
  c("TD", "查德", "Chad", "Tchad", "Tchad", ["乍得"]),
  c("CL", "智利", "Chile", "Chili", "Chile"),
  c("CN", "中國", "China", "Chine", "Kina", ["中华人民共和国", "中国大陆", "中华人民共和國", "中國大陸", "prc"]),
  c("CO", "哥倫比亞", "Colombia", "Colombie", "Colombia", ["哥伦比亚"]),
  c("KM", "葛摩", "Comoros", "Comores", "Comorerne", ["科摩罗"]),
  c("CG", "剛果共和國", "Republic of the Congo", "République du Congo", "Republikken Congo", ["刚果共和国", "刚果（布）", "剛果（布）"]),
  c("CD", "剛果民主共和國", "DR Congo", "République démocratique du Congo", "Den Demokratiske Republik Congo", ["刚果民主共和国", "刚果（金）", "剛果（金）", "民主剛果"]),
  c("CR", "哥斯大黎加", "Costa Rica", "Costa Rica", "Costa Rica", ["哥斯达黎加"]),
  c("HR", "克羅埃西亞", "Croatia", "Croatie", "Kroatien", ["克罗地亚", "克羅地亞"]),
  c("CU", "古巴", "Cuba", "Cuba", "Cuba"),
  c("CY", "賽普勒斯", "Cyprus", "Chypre", "Cypern", ["塞浦路斯"]),
  c("CZ", "捷克", "Czech Republic", "Tchéquie", "Tjekkiet", ["捷克共和国", "捷克共和國", "czechia"]),

  // ── D ────────────────────────────────────────────────────────────────────
  c("DK", "丹麥", "Denmark", "Danemark", "Danmark"),
  c("DJ", "吉布地", "Djibouti", "Djibouti", "Djibouti", ["吉布提"]),
  c("DM", "多米尼克", "Dominica", "Dominique", "Dominica"),
  c("DO", "多明尼加共和國", "Dominican Republic", "République dominicaine", "Den Dominikanske Republik", ["多明尼加", "多米尼加共和国"]),

  // ── E ────────────────────────────────────────────────────────────────────
  c("EC", "厄瓜多", "Ecuador", "Équateur", "Ecuador", ["厄瓜多尔"]),
  c("EG", "埃及", "Egypt", "Égypte", "Egypten"),
  c("SV", "薩爾瓦多", "El Salvador", "Salvador", "El Salvador", ["萨尔瓦多"]),
  c("GQ", "赤道幾內亞", "Equatorial Guinea", "Guinée équatoriale", "Ækvatorialguinea", ["赤道几内亚"]),
  c("ER", "厄利垂亞", "Eritrea", "Érythrée", "Eritrea", ["厄立特里亚"]),
  c("EE", "愛沙尼亞", "Estonia", "Estonie", "Estland", ["爱沙尼亚"]),
  c("SZ", "史瓦帝尼", "Eswatini", "Eswatini", "Eswatini", ["斯威士兰", "史瓦濟蘭"]),
  c("ET", "衣索比亞", "Ethiopia", "Éthiopie", "Etiopien", ["埃塞俄比亚", "埃塞俄比亞"]),

  // ── F ────────────────────────────────────────────────────────────────────
  c("FJ", "斐濟", "Fiji", "Fidji", "Fiji", ["斐济"]),
  c("FI", "芬蘭", "Finland", "Finlande", "Finland", ["芬兰"]),
  c("FR", "法國", "France", "France", "Frankrig"),
  c("FO", "法羅群島", "Faroe Islands", "Îles Féroé", "Færøerne", ["法罗群岛", "法羅羣島", "法罗群岛"]),

  // ── G ────────────────────────────────────────────────────────────────────
  c("GA", "加彭", "Gabon", "Gabon", "Gabon", ["加蓬"]),
  c("GM", "甘比亞", "Gambia", "Gambie", "Gambia", ["冈比亚"]),
  c("GE", "喬治亞", "Georgia", "Géorgie", "Georgien", ["格鲁吉亚", "格魯吉亞"]),
  c("DE", "德國", "Germany", "Allemagne", "Tyskland", ["德意志"]),
  c("GH", "迦納", "Ghana", "Ghana", "Ghana", ["加纳"]),
  c("GR", "希臘", "Greece", "Grèce", "Grækenland", ["希腊"]),
  c("GL", "格陵蘭", "Greenland", "Groenland", "Grønland", ["格陵兰"]),
  c("GD", "格瑞那達", "Grenada", "Grenade", "Grenada", ["格林纳达"]),
  c("GT", "瓜地馬拉", "Guatemala", "Guatemala", "Guatemala", ["危地马拉"]),
  c("GN", "幾內亞", "Guinea", "Guinée", "Guinea", ["几内亚"]),
  c("GW", "幾內亞比索", "Guinea-Bissau", "Guinée-Bissau", "Guinea-Bissau", ["几内亚比绍"]),
  c("GY", "蓋亞那", "Guyana", "Guyana", "Guyana", ["圭亚那"]),

  // ── H ────────────────────────────────────────────────────────────────────
  c("HT", "海地", "Haiti", "Haïti", "Haiti"),
  c("HN", "宏都拉斯", "Honduras", "Honduras", "Honduras", ["洪都拉斯"]),
  c("HU", "匈牙利", "Hungary", "Hongrie", "Ungarn"),
  c("HK", "香港", "Hong Kong", "Hong Kong", "Hongkong", ["hong kong", "hksar"]),

  // ── I ────────────────────────────────────────────────────────────────────
  c("IS", "冰島", "Iceland", "Islande", "Island", ["冰岛"]),
  c("IN", "印度", "India", "Inde", "Indien"),
  c("ID", "印尼", "Indonesia", "Indonésie", "Indonesien", ["印度尼西亚", "印度尼西亞"]),
  c("IR", "伊朗", "Iran", "Iran", "Iran"),
  c("IQ", "伊拉克", "Iraq", "Irak", "Irak"),
  c("IE", "愛爾蘭", "Ireland", "Irlande", "Irland", ["爱尔兰"]),
  c("IL", "以色列", "Israel", "Israël", "Israel"),
  c("IT", "義大利", "Italy", "Italie", "Italien", ["意大利", "义大利"]),
  c("CI", "象牙海岸", "Ivory Coast", "Côte d'Ivoire", "Elfenbenskysten", ["科特迪瓦", "côte d'ivoire", "cote d'ivoire"]),

  // ── J ────────────────────────────────────────────────────────────────────
  c("JM", "牙買加", "Jamaica", "Jamaïque", "Jamaica", ["牙买加"]),
  c("JP", "日本", "Japan", "Japon", "Japan"),
  c("JO", "約旦", "Jordan", "Jordanie", "Jordan", ["约旦"]),

  // ── K ────────────────────────────────────────────────────────────────────
  c("KZ", "哈薩克", "Kazakhstan", "Kazakhstan", "Kasakhstan", ["哈萨克斯坦", "哈薩克斯坦"]),
  c("KE", "肯亞", "Kenya", "Kenya", "Kenya", ["肯尼亚"]),
  c("KI", "吉里巴斯", "Kiribati", "Kiribati", "Kiribati", ["基里巴斯"]),
  c("KW", "科威特", "Kuwait", "Koweït", "Kuwait"),
  c("KG", "吉爾吉斯", "Kyrgyzstan", "Kirghizistan", "Kirgisistan", ["吉尔吉斯斯坦", "吉爾吉斯斯坦"]),

  // ── L ────────────────────────────────────────────────────────────────────
  c("LA", "寮國", "Laos", "Laos", "Laos", ["老挝", "老撾"]),
  c("LV", "拉脫維亞", "Latvia", "Lettonie", "Letland", ["拉脱维亚"]),
  c("LB", "黎巴嫩", "Lebanon", "Liban", "Libanon"),
  c("LS", "賴索托", "Lesotho", "Lesotho", "Lesotho", ["莱索托"]),
  c("LR", "賴比瑞亞", "Liberia", "Libéria", "Liberia", ["利比里亚"]),
  c("LY", "利比亞", "Libya", "Libye", "Libyen", ["利比亚"]),
  c("LI", "列支敦斯登", "Liechtenstein", "Liechtenstein", "Liechtenstein", ["列支敦士登"]),
  c("LT", "立陶宛", "Lithuania", "Lituanie", "Litauen"),
  c("LU", "盧森堡", "Luxembourg", "Luxembourg", "Luxembourg", ["卢森堡"]),

  // ── M ────────────────────────────────────────────────────────────────────
  c("MG", "馬達加斯加", "Madagascar", "Madagascar", "Madagaskar", ["马达加斯加"]),
  c("MW", "馬拉威", "Malawi", "Malawi", "Malawi", ["马拉维"]),
  c("MY", "馬來西亞", "Malaysia", "Malaisie", "Malaysia", ["马来西亚"]),
  c("MV", "馬爾地夫", "Maldives", "Maldives", "Maldiverne", ["马尔代夫"]),
  c("ML", "馬利", "Mali", "Mali", "Mali", ["马里"]),
  c("MT", "馬爾他", "Malta", "Malte", "Malta", ["马耳他"]),
  c("MH", "馬紹爾群島", "Marshall Islands", "Îles Marshall", "Marshalløerne", ["马绍尔群岛"]),
  c("MR", "茅利塔尼亞", "Mauritania", "Mauritanie", "Mauretanien", ["毛里塔尼亚"]),
  c("MU", "模里西斯", "Mauritius", "Maurice", "Mauritius", ["毛里求斯"]),
  c("MX", "墨西哥", "Mexico", "Mexique", "Mexico"),
  c("FM", "密克羅尼西亞", "Micronesia", "Micronésie", "Mikronesien", ["密克罗尼西亚"]),
  c("MD", "摩爾多瓦", "Moldova", "Moldavie", "Moldova", ["摩尔多瓦"]),
  c("MC", "摩納哥", "Monaco", "Monaco", "Monaco", ["摩纳哥"]),
  c("MN", "蒙古", "Mongolia", "Mongolie", "Mongoliet"),
  c("ME", "蒙特內哥羅", "Montenegro", "Monténégro", "Montenegro", ["黑山", "蒙特尼哥罗"]),
  c("MA", "摩洛哥", "Morocco", "Maroc", "Marokko"),
  c("MZ", "莫三比克", "Mozambique", "Mozambique", "Mozambique", ["莫桑比克"]),
  c("MM", "緬甸", "Myanmar", "Myanmar", "Myanmar", ["缅甸", "Burma", "burma"]),
  c("MO", "澳門", "Macao", "Macao", "Macao", ["macau", "澳门"]),
  c("MK", "北馬其頓", "North Macedonia", "Macédoine du Nord", "Nordmakedonien", ["马其顿", "北马其顿"]),

  // ── N ────────────────────────────────────────────────────────────────────
  c("NA", "納米比亞", "Namibia", "Namibie", "Namibia", ["纳米比亚"]),
  c("NR", "諾魯", "Nauru", "Nauru", "Nauru", ["瑙鲁"]),
  c("NP", "尼泊爾", "Nepal", "Népal", "Nepal", ["尼泊尔"]),
  c("NL", "荷蘭", "Netherlands", "Pays-Bas", "Holland", ["holland", "nederland", "低地國"]),
  c("NZ", "紐西蘭", "New Zealand", "Nouvelle-Zélande", "New Zealand", ["新西兰", "新西蘭"]),
  c("NI", "尼加拉瓜", "Nicaragua", "Nicaragua", "Nicaragua"),
  c("NE", "尼日", "Niger", "Niger", "Niger", ["尼日尔"]),
  c("NG", "奈及利亞", "Nigeria", "Nigeria", "Nigeria", ["尼日利亚"]),
  c("KP", "北韓", "North Korea", "Corée du Nord", "Nordkorea", ["朝鲜", "朝鮮"]),
  c("NO", "挪威", "Norway", "Norvège", "Norge", ["挪威"]),

  // ── O ────────────────────────────────────────────────────────────────────
  c("OM", "阿曼", "Oman", "Oman", "Oman"),

  // ── P ────────────────────────────────────────────────────────────────────
  c("PK", "巴基斯坦", "Pakistan", "Pakistan", "Pakistan"),
  c("PW", "帛琉", "Palau", "Palaos", "Palau", ["帕劳"]),
  c("PA", "巴拿馬", "Panama", "Panama", "Panama", ["巴拿马"]),
  c("PG", "巴布亞紐幾內亞", "Papua New Guinea", "Papouasie-Nouvelle-Guinée", "Papua Ny Guinea", ["巴布亚新几内亚"]),
  c("PY", "巴拉圭", "Paraguay", "Paraguay", "Paraguay"),
  c("PE", "秘魯", "Peru", "Pérou", "Peru", ["秘鲁"]),
  c("PH", "菲律賓", "Philippines", "Philippines", "Filippinerne", ["菲律宾"]),
  c("PL", "波蘭", "Poland", "Pologne", "Polen", ["波兰"]),
  c("PT", "葡萄牙", "Portugal", "Portugal", "Portugal"),
  c("PS", "巴勒斯坦", "Palestine", "Palestine", "Palæstina", ["巴勒斯坦"]),

  // ── Q ────────────────────────────────────────────────────────────────────
  c("QA", "卡達", "Qatar", "Qatar", "Qatar", ["卡塔尔"]),

  // ── R ────────────────────────────────────────────────────────────────────
  c("RO", "羅馬尼亞", "Romania", "Roumanie", "Rumænien", ["罗马尼亚"]),
  c("RU", "俄羅斯", "Russia", "Russie", "Rusland", ["俄罗斯", "俄罗斯联邦", "俄羅斯聯邦"]),
  c("RW", "盧安達", "Rwanda", "Rwanda", "Rwanda", ["卢旺达"]),

  // ── S ────────────────────────────────────────────────────────────────────
  c("KN", "聖克里斯多福及尼維斯", "Saint Kitts and Nevis", "Saint-Kitts-et-Nevis", "Saint Kitts og Nevis", ["圣基茨和尼维斯"]),
  c("LC", "聖露西亞", "Saint Lucia", "Sainte-Lucie", "Saint Lucia", ["圣卢西亚"]),
  c("VC", "聖文森及格瑞那丁", "Saint Vincent and the Grenadines", "Saint-Vincent-et-les-Grenadines", "Saint Vincent og Grenadinerne", ["圣文森特和格林纳丁斯"]),
  c("WS", "薩摩亞", "Samoa", "Samoa", "Samoa", ["萨摩亚"]),
  c("SM", "聖馬利諾", "San Marino", "Saint-Marin", "San Marino", ["圣马力诺"]),
  c("ST", "聖多美普林西比", "São Tomé and Príncipe", "Sao Tomé-et-Príncipe", "São Tomé og Príncipe", ["圣多美和普林西比"]),
  c("SA", "沙烏地阿拉伯", "Saudi Arabia", "Arabie saoudite", "Saudi-Arabien", ["沙特阿拉伯", "沙特"]),
  c("SN", "塞內加爾", "Senegal", "Sénégal", "Senegal", ["塞内加尔"]),
  c("RS", "塞爾維亞", "Serbia", "Serbie", "Serbien", ["塞尔维亚"]),
  c("SC", "塞席爾", "Seychelles", "Seychelles", "Seychellerne", ["塞舌尔"]),
  c("SL", "獅子山", "Sierra Leone", "Sierra Leone", "Sierra Leone", ["塞拉利昂"]),
  c("SG", "新加坡", "Singapore", "Singapour", "Singapore"),
  c("SK", "斯洛伐克", "Slovakia", "Slovaquie", "Slovakiet"),
  c("SI", "斯洛維尼亞", "Slovenia", "Slovénie", "Slovenien", ["斯洛文尼亚"]),
  c("SB", "索羅門群島", "Solomon Islands", "Îles Salomon", "Salomonøerne", ["所罗门群岛"]),
  c("SO", "索馬利亞", "Somalia", "Somalie", "Somalia", ["索马里"]),
  c("ZA", "南非", "South Africa", "Afrique du Sud", "Sydafrika"),
  c("SS", "南蘇丹", "South Sudan", "Soudan du Sud", "Sydsudan", ["南苏丹"]),
  c("ES", "西班牙", "Spain", "Espagne", "Spanien"),
  c("LK", "斯里蘭卡", "Sri Lanka", "Sri Lanka", "Sri Lanka", ["斯里兰卡"]),
  c("SD", "蘇丹", "Sudan", "Soudan", "Sudan"),
  c("SR", "蘇利南", "Suriname", "Suriname", "Surinam", ["苏里南"]),
  c("SE", "瑞典", "Sweden", "Suède", "Sverige"),
  c("CH", "瑞士", "Switzerland", "Suisse", "Schweiz"),
  c("SY", "敘利亞", "Syria", "Syrie", "Syrien", ["叙利亚"]),

  // ── T ────────────────────────────────────────────────────────────────────
  c("TW", "台灣", "Taiwan", "Taïwan", "Taiwan", ["臺灣", "中華民國", "中华民国", "roc"]),
  c("TJ", "塔吉克", "Tajikistan", "Tadjikistan", "Tadsjikistan", ["塔吉克斯坦"]),
  c("TZ", "坦尚尼亞", "Tanzania", "Tanzanie", "Tanzania", ["坦桑尼亚"]),
  c("TH", "泰國", "Thailand", "Thaïlande", "Thailand", ["泰国"]),
  c("TL", "東帝汶", "Timor-Leste", "Timor oriental", "Østtimor", ["东帝汶"]),
  c("TG", "多哥", "Togo", "Togo", "Togo"),
  c("TO", "東加", "Tonga", "Tonga", "Tonga", ["汤加"]),
  c("TT", "千里達及托巴哥", "Trinidad and Tobago", "Trinité-et-Tobago", "Trinidad og Tobago", [
    "特立尼达和多巴哥", "千里达和多巴哥", "特立尼達和多巴哥", "千里達和多巴哥",
    "特立尼達及多巴哥", "千里達及多巴哥",
  ]),
  c("TN", "突尼西亞", "Tunisia", "Tunisie", "Tunesien", ["突尼斯"]),
  c("TR", "土耳其", "Turkey", "Turquie", "Tyrkiet", ["土耳其", "türkiye"]),
  c("TM", "土庫曼", "Turkmenistan", "Turkménistan", "Turkmenistan", ["土库曼斯坦"]),
  c("TV", "吐瓦魯", "Tuvalu", "Tuvalu", "Tuvalu", ["图瓦卢"]),

  // ── U ────────────────────────────────────────────────────────────────────
  c("UG", "烏干達", "Uganda", "Ouganda", "Uganda", ["乌干达"]),
  c("UA", "烏克蘭", "Ukraine", "Ukraine", "Ukraine", ["乌克兰"]),
  c("AE", "阿聯酋", "United Arab Emirates", "Émirats arabes unis", "De Forenede Arabiske Emirater", ["阿联酋", "uae", "emirates"]),
  c("GB", "英國", "United Kingdom", "Royaume-Uni", "Storbritannien", ["uk", "britain", "great britain"]),
  c("US", "美國", "United States", "États-Unis", "USA", ["usa", "united states of america", "美国", "美利坚"]),
  c("UY", "烏拉圭", "Uruguay", "Uruguay", "Uruguay", ["乌拉圭"]),
  c("UZ", "烏茲別克", "Uzbekistan", "Ouzbékistan", "Usbekistan", ["乌兹别克斯坦"]),

  // ── V ────────────────────────────────────────────────────────────────────
  c("VU", "萬那杜", "Vanuatu", "Vanuatu", "Vanuatu", ["瓦努阿图"]),
  c("VA", "梵蒂岡", "Vatican City", "Vatican", "Vatikanstaten", ["holy see", "梵蒂冈"]),
  c("VE", "委內瑞拉", "Venezuela", "Venezuela", "Venezuela", ["委内瑞拉"]),
  c("VN", "越南", "Vietnam", "Viêt Nam", "Vietnam", ["越南"]),

  // ── Y ────────────────────────────────────────────────────────────────────
  c("YE", "葉門", "Yemen", "Yémen", "Yemen", ["也门"]),

  // ── Z ────────────────────────────────────────────────────────────────────
  c("ZM", "尚比亞", "Zambia", "Zambie", "Zambia", ["赞比亚"]),
  c("ZW", "辛巴威", "Zimbabwe", "Zimbabwe", "Zimbabwe", ["津巴布韦"]),

  // ── Sub-national regions (GB) ────────────────────────────────────────────
  c("GB-ENG", "英格蘭", "England", "Angleterre", "England", ["英格兰"]),
  c("GB-SCT", "蘇格蘭", "Scotland", "Écosse", "Skotland", ["苏格兰"]),
  c("GB-WLS", "威爾斯", "Wales", "Pays de Galles", "Wales", ["威尔士"]),
  c("GB-NIR", "北愛爾蘭", "Northern Ireland", "Irlande du Nord", "Nordirland", ["北爱尔兰"]),

  // ── Sub-national regions (CN) ────────────────────────────────────────────
  c("CN-BJ", "北京", "Beijing", "Pékin", "Beijing", ["peking"]),
  c("CN-SH", "上海", "Shanghai", "Shanghai", "Shanghai"),
  c("CN-GD", "廣東", "Guangdong", "Guangdong", "Guangdong", ["广东"]),

  // ── Sub-national regions (US) ────────────────────────────────────────────
  c("US-NY", "紐約", "New York", "New York", "New York", ["new york state", "纽约"]),
  c("US-CA", "加利福尼亞", "California", "Californie", "Californien", ["加州", "california"]),
  c("US-TX", "德克薩斯", "Texas", "Texas", "Texas", ["德州"]),
  c("US-FL", "佛羅里達", "Florida", "Floride", "Florida", ["佛罗里达"]),
  c("US-WA", "華盛頓州", "Washington State", "État de Washington", "Washington State", ["washington"]),
  c("US-DC", "華盛頓特區", "Washington D.C.", "Washington D.C.", "Washington D.C.", ["dc", "d.c."]),

  // ── Special territories / regions ───────────────────────────────────────
  c("XK", "科索沃", "Kosovo", "Kosovo", "Kosovo"),
  c("TF", "法屬南部領地", "French Southern Territories", "Terres australes françaises", "Franske sydlige territorier"),
  c("NC", "新喀里多尼亞", "New Caledonia", "Nouvelle-Calédonie", "Ny Kaledonien", ["新喀里多尼亚"]),
  c("PF", "法屬玻里尼西亞", "French Polynesia", "Polynésie française", "Fransk Polynesien", ["法属波利尼西亚"]),
  c("GP", "瓜德羅普", "Guadeloupe", "Guadeloupe", "Guadeloupe"),
  c("MQ", "馬提尼克", "Martinique", "Martinique", "Martinique"),
  c("RE", "留尼旺", "Réunion", "La Réunion", "Réunion", ["留尼汪"]),
  c("PM", "聖皮埃爾和密克隆", "Saint Pierre and Miquelon", "Saint-Pierre-et-Miquelon", "Saint-Pierre og Miquelon"),
  c("GF", "法屬圭亞那", "French Guiana", "Guyane française", "Fransk Guyana", ["法属圭亚那"]),
  c("YT", "馬約特", "Mayotte", "Mayotte", "Mayotte"),
  c("CW", "庫拉索", "Curaçao", "Curaçao", "Curaçao", ["库拉索"]),
  c("AW", "阿魯巴", "Aruba", "Aruba", "Aruba", ["阿鲁巴"]),
  c("SX", "荷屬聖馬丁", "Sint Maarten", "Saint-Martin (partie néerlandaise)", "Sint Maarten"),
  c("BQ", "荷蘭加勒比區", "Caribbean Netherlands", "Pays-Bas caribéens", "De Caribiske Nederlande"),
  c("AI", "安圭拉", "Anguilla", "Anguilla", "Anguilla"),
  c("BM", "百慕達", "Bermuda", "Bermudes", "Bermuda", ["百慕大"]),
  c("VG", "英屬維爾京群島", "British Virgin Islands", "Îles Vierges britanniques", "Britiske Jomfruøer", ["英属维尔京群岛"]),
  c("KY", "開曼群島", "Cayman Islands", "Îles Caïmans", "Caymanøerne", ["开曼群岛"]),
  c("FK", "福克蘭群島", "Falkland Islands", "Îles Malouines", "Falklandsøerne", ["马尔维纳斯群岛", "福克兰群岛"]),
  c("GI", "直布羅陀", "Gibraltar", "Gibraltar", "Gibraltar"),
  c("MS", "蒙特塞拉特", "Montserrat", "Montserrat", "Montserrat"),
  c("SH", "聖赫勒拿島", "Saint Helena", "Sainte-Hélène", "Sankt Helena"),
  c("TC", "特克斯和凱科斯群島", "Turks and Caicos Islands", "Îles Turques-et-Caïques", "Turks- og Caicosøerne"),
  c("IO", "英屬印度洋領地", "British Indian Ocean Territory", "Territoire britannique de l'océan Indien", "Britisk Territorium i Det Indiske Ocean"),
  c("PN", "皮特凱恩群島", "Pitcairn Islands", "Îles Pitcairn", "Pitcairn"),
  c("GS", "南喬治亞和南桑威奇群島", "South Georgia and the South Sandwich Islands", "Géorgie du Sud-et-les Îles Sandwich du Sud", "South Georgia og South Sandwich-øerne"),
  c("CX", "聖誕島", "Christmas Island", "Île Christmas", "Juleøen"),
  c("CC", "科科斯群島", "Cocos Islands", "Îles Cocos", "Kokosøerne"),
  c("NF", "諾福克島", "Norfolk Island", "Île Norfolk", "Norfolkøen"),
  c("CK", "庫克群島", "Cook Islands", "Îles Cook", "Cookøerne"),
  c("NU", "紐埃", "Niue", "Niue", "Niue"),
  c("TK", "托克勞", "Tokelau", "Tokelau", "Tokelau"),
  c("WF", "瓦利斯和富圖納", "Wallis and Futuna", "Wallis-et-Futuna", "Wallis og Futuna"),
  c("AS", "美屬薩摩亞", "American Samoa", "Samoa américaines", "Amerikansk Samoa"),
  c("GU", "關島", "Guam", "Guam", "Guam", ["关岛"]),
  c("MP", "北馬里亞納群島", "Northern Mariana Islands", "Îles Mariannes du Nord", "Nordmarianerne"),
  c("PR", "波多黎各", "Puerto Rico", "Porto Rico", "Puerto Rico"),
  c("VI", "美屬維爾京群島", "US Virgin Islands", "Îles Vierges américaines", "Amerikanske Jomfruøer"),
  c("UM", "美國本土外小島嶼", "US Minor Outlying Islands", "Îles mineures éloignées des États-Unis", "Amerikanske oversøiske øer"),

  // ── Custom / supra-national zones ────────────────────────────────────────────
  c("SCHENGEN", "申根區域", "Schengen Area", "Espace Schengen", "Schengen-området", [
    "申根", "schengen", "schengen area", "espace schengen", "schengen-området", "schengenområdet",
  ]),
];

// ─────────────────────────────────────────────────────────────────────────────
// Build lookup maps at module load time
// ─────────────────────────────────────────────────────────────────────────────

/** alias (lower-cased) → CountryEntry */
export const ALIAS_MAP: Map<string, CountryEntry> = new Map();
/** code (upper-cased) → CountryEntry */
export const CODE_MAP: Map<string, CountryEntry> = new Map();

for (const entry of COUNTRIES) {
  CODE_MAP.set(entry.code.toUpperCase(), entry);
  for (const alias of entry.aliases) {
    // First writer wins; more specific entries should come first in the list
    if (!ALIAS_MAP.has(alias)) {
      ALIAS_MAP.set(alias, entry);
    }
  }
}

/**
 * Resolve a raw location string to a CountryEntry (or null if unknown).
 * Tries:
 *   1. Exact alias match (case-insensitive)
 *   2. ISO code match (upper-cased)
 */
export function resolveLocation(raw: string): CountryEntry | null {
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;
  const byAlias = ALIAS_MAP.get(lower);
  if (byAlias) return byAlias;
  const byCode = CODE_MAP.get(raw.trim().toUpperCase());
  if (byCode) return byCode;
  return null;
}

/**
 * Get the display name for a resolved code in the given locale.
 * Falls back to en-GB, then the code itself.
 */
export function getDisplayName(code: string, locale: CountryLocale): string {
  const entry = CODE_MAP.get(code.toUpperCase());
  if (!entry) return code;
  return entry.names[locale] ?? entry.names["en-GB"] ?? code;
}

/**
 * Convert an ISO 3166-1 alpha-2 code to a flag emoji.
 * Also handles GB subdivision codes (GB-ENG, GB-SCT, GB-WLS) via Unicode Tag Sequences.
 * Returns null for codes that have no known flag (e.g. SCHENGEN, GB-NIR).
 */
export function getFlagEmoji(code: string): string | null {
  const upper = code.trim().toUpperCase();

  // Unicode Tag Sequence flags for GB subdivisions
  // Format: 🏴 + tag chars (U+E0000 + char code) + U+E007F (cancel tag)
  const TAG_BASE = 0xe0000;
  const TAG_END = 0xe007f;
  const BLACK_FLAG = "\u{1F3F4}";
  const makeTagFlag = (suffix: string) =>
    BLACK_FLAG +
    Array.from(suffix.toLowerCase()).map((c) => String.fromCodePoint(TAG_BASE + c.charCodeAt(0))).join("") +
    String.fromCodePoint(TAG_END);

  if (upper === "GB-ENG") return makeTagFlag("gbeng");
  if (upper === "GB-SCT") return makeTagFlag("gbsct");
  if (upper === "GB-WLS") return makeTagFlag("gbwls");

  // Standard ISO 3166-1 alpha-2: must be exactly 2 ASCII letters A-Z
  if (!/^[A-Z]{2}$/.test(upper)) return null;
  const [a, b] = upper.split("");
  return (
    String.fromCodePoint(0x1f1a5 + a.charCodeAt(0)) +
    String.fromCodePoint(0x1f1a5 + b.charCodeAt(0))
  );
}
