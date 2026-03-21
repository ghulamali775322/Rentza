import vision from '@google-cloud/vision';
import path from 'path';

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(process.cwd(), 'google-credentials.json'), 
});

export const moderateImage = async (filePath) => {
  try {
    // 1. Ask Google for BOTH SafeSearch (Gore/Adult) AND Label Detection (Objects)
    const [result] = await client.annotateImage({
      image: { source: { filename: filePath } },
      features: [
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'LABEL_DETECTION' }
      ]
    });

    const safeSearch = result.safeSearchAnnotation;
    const labels = result.labelAnnotations;

    // --- TEST 1: SAFESEARCH (Gore, Adult content) ---
    const categoriesToCheck = ['adult', 'violence', 'racy'];
    let isClearFail = false;
    let isGrayArea = false;

    for (const category of categoriesToCheck) {
      const level = safeSearch[category];
      if (level === 'LIKELY' || level === 'VERY_LIKELY') {
        isClearFail = true;
        break; 
      }
      if (level === 'POSSIBLE' || level === 'UNKNOWN') {
        isGrayArea = true;
      }
    }

    if (isClearFail) return 'rejected';

    // --- TEST 2: OBJECT DETECTION (Guns, Weapons) ---
    // Define the exact words you want your platform to block
    const forbiddenObjects = [
  // 🔫 Firearms & Weapons
  'gun', 'weapon', 'firearm', 'pistol', 'rifle', 'handgun', 'shotgun', 
  'assault rifle', 'sniper', 'machine gun', 'revolver', 'ammunition', 
  'bullet', 'cartridge', 'magazine',

  // 💣 Explosives & Tactical
  'explosive', 'bomb', 'grenade', 'dynamite', 'molotov cocktail', 
  'brass knuckles', 'taser', 'stun gun', 'pepper spray', 'mace',

  // 🔪 Bladed Weapons (Be careful: 'knife' alone might block kitchen knives)
  'sword', 'dagger', 'machete', 'switchblade', 'butterfly knife', 'combat knife',

  // 💊 Drugs & Paraphernalia
  'drug', 'narcotic', 'marijuana', 'cannabis', 'weed', 'bong', 'pipe', 
  'hookah', 'methamphetamine', 'cocaine', 'heroin', 'drug paraphernalia', 
  'syringe', 'needle', // (Note: Syringe might block medical equipment if you allow that)

  // 🔞 Adult Objects (Backup for SafeSearch)
  'sex toy', 'vibrator', 'dildo', 'erotic toy', 'pornography', 'adult material',

  // ☠️ Dangerous/Hazardous Materials
  'poison', 'toxic', 'hazardous material', 'radioactive', 'biohazard'
];
    
    if (labels) {
      for (const label of labels) {
        // Convert Google's label to lowercase to easily match our list
        const detectedWord = label.description.toLowerCase();
        
        // If Google's description includes any of our forbidden words, reject it!
        if (forbiddenObjects.some(forbidden => detectedWord.includes(forbidden))) {
          console.log(`Blocked! AI detected a forbidden object: ${detectedWord}`);
          return 'rejected';
        }
      }
    }

    // --- TEST 3: THE GRAY AREA ---
    if (isGrayArea) return 'pending';
    
    // If it survives all the tests, it is safe to rent!
    return 'approved';

  } catch (error) {
    console.error("Google Vision API Error:", error);
    return 'pending'; 
  }
};