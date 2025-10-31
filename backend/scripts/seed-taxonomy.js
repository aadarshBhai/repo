import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath, override: true });

// Minimal curated villages reference by Indian state (same as routes/reference.js)
const villagesByState = {
  'Odisha': ['Bhitarkanika', 'Chilika', 'Raghurajpur', 'Lanjigarh'],
  'West Bengal': ['Chilapata', 'Raghunathpur'],
  'Chhattisgarh': ['Bastar', 'Kanker'],
  'Jharkhand': ['Netarhat'],
  'Arunachal Pradesh': ['Ziro', 'Daporijo'],
  'Assam': ['Majuli'],
  'Tripura': ['Korang'],
  'Maharashtra': ['Jawhar', 'Hirvewadi', 'Dahanu', 'Mendha Lekha'],
  'Rajasthan': ['Piplantri', 'Kumbhalgarh'],
  'Andhra Pradesh': ['Araku Valley'],
};

// Preloaded global lists
const preloadedVillages = [
  'Khonoma', 'Longwa', 'Touphema', 'Mokokchung', 'Pfutsero', 'Reiek', 'Nongriat', 'Nongkynrih', 'Ziro', 'Hong',
  'Bhitarkanika', 'Bastar', 'Patangarh', 'Tejgadh', 'Mandla', 'Dzongu', 'Mon', 'Cherrapunji', 'Tawang', 'Chilapata'
];

const preloadedTribes = [
  'Angami', 'Ao', 'Sema (Sümi)', 'Lotha', 'Chakhesang', 'Konyak', 'Rengma', 'Phom', 'Chang', 'Sangtam',
  'Khiamniungan', 'Yimchunger', 'Zeliang', 'Pochury', 'Mizo', 'Khasi', 'Garo', 'Apatani', 'Nyishi', 'Lepcha',
  'Bhil', 'Santhal', 'Bodo', 'Mishing'
];

// Minimal Taxonomy model (duplicate definition to avoid importing app modules)
import mongoosePkg from 'mongoose';
const TaxonomySchema = new mongoosePkg.Schema({
  country: { type: String, required: true },
  state: { type: String, required: true },
  tribes: { type: [String], default: [] },
  villages: { type: [String], default: [] },
}, { timestamps: true, versionKey: false });
TaxonomySchema.index({ country: 1, state: 1 }, { unique: true });
const Taxonomy = mongoosePkg.model('Taxonomy', TaxonomySchema);

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  const COUNTRY = process.env.SEED_COUNTRY || 'India';
  const STATE = process.env.SEED_STATE || 'Preloaded';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected');

  try {
    // 1) Seed a consolidated preloaded doc (country + STATE)
    const tribesLower = Array.from(new Set(preloadedTribes.map((t) => String(t).toLowerCase())));
    const villagesSet = Array.from(new Set(preloadedVillages));
    const update = {
      $setOnInsert: { country: COUNTRY, state: STATE },
      $addToSet: {
        tribes: { $each: tribesLower },
        villages: { $each: villagesSet },
      },
    };
    const doc = await Taxonomy.findOneAndUpdate(
      { country: COUNTRY, state: STATE },
      update,
      { upsert: true, new: true }
    );
    console.log(`Upserted preloaded taxonomy for ${COUNTRY}/${STATE}:`, {
      tribesAdded: tribesLower.length,
      villagesAdded: villagesSet.length,
      id: doc._id.toString(),
    });

    // 2) Seed per-state curated villages (India only)
    if (COUNTRY === 'India') {
      for (const [state, villages] of Object.entries(villagesByState)) {
        const u = {
          $setOnInsert: { country: COUNTRY, state },
          $addToSet: { villages: { $each: Array.from(new Set(villages)) } },
        };
        const sdoc = await Taxonomy.findOneAndUpdate(
          { country: COUNTRY, state },
          u,
          { upsert: true, new: true }
        );
        console.log(`Seeded villages for ${COUNTRY}/${state}: +${villages.length} villages (id=${sdoc._id.toString()})`);
      }
    }

    console.log('✅ Seeding completed');
  } catch (e) {
    console.error('❌ Seeding failed:', e);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected');
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
