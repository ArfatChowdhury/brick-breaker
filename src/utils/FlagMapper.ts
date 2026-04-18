// Map active ISO codes to their SVG assets
// React Native requires static requires for bundling assets perfectly.

const flags: Record<string, any> = {
  ar: require('../../flags/4x3/ar.svg'),
  au: require('../../flags/4x3/au.svg'),
  bd: require('../../flags/4x3/bd.svg'),
  br: require('../../flags/4x3/br.svg'),
  ca: require('../../flags/4x3/ca.svg'),
  ch: require('../../flags/4x3/ch.svg'),
  cn: require('../../flags/4x3/cn.svg'),
  co: require('../../flags/4x3/co.svg'),
  cu: require('../../flags/4x3/cu.svg'),
  de: require('../../flags/4x3/de.svg'),
  eg: require('../../flags/4x3/eg.svg'),
  es: require('../../flags/4x3/es.svg'),
  et: require('../../flags/4x3/et.svg'),
  fi: require('../../flags/4x3/fi.svg'),
  fr: require('../../flags/4x3/fr.svg'),
  gb: require('../../flags/4x3/gb.svg'),
  gr: require('../../flags/4x3/gr.svg'),
  ie: require('../../flags/4x3/ie.svg'),
  in: require('../../flags/4x3/in.svg'),
  it: require('../../flags/4x3/it.svg'),
  jm: require('../../flags/4x3/jm.svg'),
  jp: require('../../flags/4x3/jp.svg'),
  ke: require('../../flags/4x3/ke.svg'),
  kr: require('../../flags/4x3/kr.svg'),
  kw: require('../../flags/4x3/kw.svg'),
  ma: require('../../flags/4x3/ma.svg'),
  mn: require('../../flags/4x3/mn.svg'),
  mx: require('../../flags/4x3/mx.svg'),
  ng: require('../../flags/4x3/ng.svg'),
  nl: require('../../flags/4x3/nl.svg'),
  np: require('../../flags/4x3/np.svg'),
  pe: require('../../flags/4x3/pe.svg'),
  pk: require('../../flags/4x3/pk.svg'),
  ps: require('../../flags/4x3/ps.svg'),
  pt: require('../../flags/4x3/pt.svg'),
  qa: require('../../flags/4x3/qa.svg'),
  ru: require('../../flags/4x3/ru.svg'),
  sa: require('../../flags/4x3/sa.svg'),
  se: require('../../flags/4x3/se.svg'),
  sg: require('../../flags/4x3/sg.svg'),
  th: require('../../flags/4x3/th.svg'),
  tr: require('../../flags/4x3/tr.svg'),
  ua: require('../../flags/4x3/ua.svg'),
  us: require('../../flags/4x3/us.svg'),
  vn: require('../../flags/4x3/vn.svg'),
  za: require('../../flags/4x3/za.svg'),
};

export const getFlagIcon = (isoCode?: string) => {
  if (!isoCode) return null;
  const mod = flags[isoCode.toLowerCase()];
  if (!mod) return null;
  return mod.default || mod;
};
