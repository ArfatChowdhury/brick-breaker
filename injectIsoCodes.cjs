const fs = require('fs');
const path = require('path');

const flagMap = {
  Argentina: 'ar',
  Australia: 'au',
  Bangladesh: 'bd',
  Brazil: 'br',
  Canada: 'ca',
  Switzerland: 'ch',
  China: 'cn',
  Colombia: 'co',
  Cuba: 'cu',
  Germany: 'de',
  Egypt: 'eg',
  Spain: 'es',
  France: 'fr',
  UK: 'gb',
  Greece: 'gr',
  Ireland: 'ie',
  India: 'in',
  Italy: 'it',
  Jamaica: 'jm',
  Japan: 'jp',
  Kenya: 'ke',
  SouthKorea: 'kr',
  Morocco: 'ma',
  Mexico: 'mx',
  Netherlands: 'nl',
  Nepal: 'np',
  Pakistan: 'pk',
  Palestine: 'ps',
  Portugal: 'pt',
  Russia: 'ru',
  SaudiArabia: 'sa',
  Sweden: 'se',
  Thailand: 'th',
  Turkey: 'tr',
  USA: 'us',
  Vietnam: 'vn',
  SouthAfricaMaze: 'za',
};

const levelsDir = path.join(__dirname, 'src', 'levels');

Object.keys(flagMap).forEach(country => {
  const filePath = path.join(levelsDir, `${country}.ts`);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Checking if already injected
  if (content.includes(`isoCode: '${flagMap[country]}'`)) {
    console.log(`Skipping (already injected): ${country}`);
    return;
  }
  
  // InjectisoCode right before name:
  content = content.replace(/name:/, `isoCode: '${flagMap[country]}',\n  name:`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Injected ${flagMap[country]} into ${country}.ts`);
});

console.log("Done injecting isoCodes.");
