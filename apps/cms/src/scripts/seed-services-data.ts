/**
 * Seed sample data — 4 entries per service collection:
 * WaterActivities, Yachts, Restaurants, Venues.
 *
 * Idempotent: upsert by slug. Aman run berulang.
 * Requires: destinations sudah di-seed + minimal 1 media di-upload.
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-services-data.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

// Simple Lexical richtext factory (paragraph)
const richText = (text: string) => ({
  root: {
    type: 'root', version: 1, format: '', indent: 0, direction: null,
    children: [{
      type: 'paragraph', version: 1, format: '', indent: 0, direction: null, textFormat: 0, textStyle: '',
      children: [{ type: 'text', version: 1, format: 0, mode: 'normal', style: '', text, detail: 0 }],
    }],
  },
})

const run = async () => {
  const payload = await getPayload({ config })

  // Fetch supporting data
  const destsRes = await payload.find({ collection: 'destinations', limit: 20 })
  const destMap: Record<string, number> = {}
  for (const d of destsRes.docs) destMap[d.slug ?? ''] = d.id as number
  if (Object.keys(destMap).length === 0) {
    process.stderr.write('❌ No destinations found. Run `pnpm seed` first.\n')
    process.exit(1)
  }

  const mediaRes = await payload.find({ collection: 'media', limit: 20 })
  if (mediaRes.docs.length === 0) {
    process.stderr.write('❌ No media found. Upload at least 1 image via CMS admin first.\n')
    process.exit(1)
  }
  const mediaIds = mediaRes.docs.map((m) => m.id as number)
  const pickMedia = (i: number) => mediaIds[i % mediaIds.length]

  const destLembongan = destMap['lembongan'] ?? Object.values(destMap)[0]
  const destPenida = destMap['nusa-penida'] ?? Object.values(destMap)[0]
  const destBali = destMap['mainland-bali'] ?? Object.values(destMap)[0]
  const destCeningan = destMap['ceningan'] ?? destLembongan

  const upsert = async (collection: string, slug: string, data: any) => {
    const existing = await payload.find({ collection: collection as any, where: { slug: { equals: slug } }, limit: 1 })
    if (existing.docs[0]) {
      await payload.update({ collection: collection as any, id: existing.docs[0].id, data })
      log(`✓ updated ${collection}/${slug}`)
    } else {
      await payload.create({ collection: collection as any, data })
      log(`✓ created ${collection}/${slug}`)
    }
  }

  // ── Water Activities (4) ────────────────────────────────────
  const waterData = [
    { slug: 'snorkeling-manta-point', title: 'Snorkeling with Manta Rays', subtitle: 'Swim with giant manta rays in crystal blue', activityType: 'snorkeling', difficultyLevel: 'all_levels', duration: '3 hours', destination: destPenida, adult: 450000, child: 300000, image: 0 },
    { slug: 'diving-crystal-bay',     title: 'Diving at Crystal Bay',     subtitle: 'World-class dive site with mola-mola sightings', activityType: 'diving',     difficultyLevel: 'intermediate', duration: '4 hours', destination: destPenida, adult: 950000, child: 650000, image: 1 },
    { slug: 'surfing-lesson-canggu',  title: 'Surfing Lesson at Canggu',  subtitle: 'Learn to surf with local instructors on soft waves', activityType: 'surfing', difficultyLevel: 'beginner', duration: '2 hours', destination: destBali, adult: 380000, child: 280000, image: 2 },
    { slug: 'jetski-tanjung-benoa',   title: 'Jet Ski at Tanjung Benoa',   subtitle: 'Adrenaline rush across turquoise waters',       activityType: 'jetski',    difficultyLevel: 'all_levels', duration: '30 min', destination: destBali, adult: 350000, child: 250000, image: 3 },
  ]

  for (const w of waterData) {
    await upsert('water-activities', w.slug, {
      title: w.title, slug: w.slug, subtitle: w.subtitle,
      activityType: w.activityType, difficultyLevel: w.difficultyLevel,
      destination: w.destination,
      description: richText(`Experience ${w.title.toLowerCase()} with certified guides, professional equipment, and safety-first approach. Perfect for ${w.difficultyLevel.replace('_', ' ')}.`),
      duration: w.duration,
      whatToBring: [
        { item: 'Swimwear', icon: 'star' },
        { item: 'Sunscreen', icon: 'star' },
        { item: 'Towel', icon: 'star' },
      ],
      requirements: 'Minimum age 12. Basic swimming ability required. Not recommended for pregnant women or people with heart conditions.',
      pricing: { adultPrice: w.adult, childPrice: w.child, currency: 'IDR', priceNote: 'per person' },
      featuredImage: pickMedia(w.image),
      status: 'published',
      isFeatured: w.image === 0,
    })
  }

  // ── Yachts (4) ──────────────────────────────────────────────
  const yachtData = [
    { slug: 'ocean-serenity-catamaran', name: 'Ocean Serenity', subtitle: 'Luxury catamaran for intimate charters',    yachtType: 'catamaran',    capacity: 12, image: 0, pkgPrice: 12500000 },
    { slug: 'wind-dancer-sailing',      name: 'Wind Dancer',    subtitle: 'Sailing yacht for sunset dinner cruises',   yachtType: 'sailing',      capacity: 10, image: 1, pkgPrice: 8500000 },
    { slug: 'royal-phinisi',            name: 'Royal Phinisi',   subtitle: 'Traditional Indonesian schooner overnight', yachtType: 'phinisi',      capacity: 16, image: 2, pkgPrice: 25000000 },
    { slug: 'thunder-speedboat',         name: 'Thunder',        subtitle: 'Speedboat for fast island hopping',         yachtType: 'speedboat',    capacity: 8,  image: 3, pkgPrice: 5500000 },
  ]

  for (const y of yachtData) {
    await upsert('yachts', y.slug, {
      name: y.name, slug: y.slug, subtitle: y.subtitle,
      yachtType: y.yachtType, capacity: y.capacity,
      destination: destBali,
      description: richText(`${y.name} — ${y.subtitle.toLowerCase()}. Professional crew, safety-certified, custom itineraries available.`),
      specifications: { length: '18m', engine: 'Twin 200HP', crewSize: 3, yearBuilt: '2022' },
      amenities: [
        { name: 'Sun Deck', icon: 'star' },
        { name: 'Bar', icon: 'sell' },
        { name: 'WiFi', icon: 'badge' },
      ],
      packages: [
        { name: 'Half Day Charter',  duration: '4 hours', description: 'Perfect intro cruise', includes: [{ item: 'Fuel' }, { item: 'Crew' }, { item: 'Snacks' }], price: y.pkgPrice, currency: 'IDR' },
        { name: 'Full Day Charter',  duration: '8 hours', description: 'Extended experience with lunch', includes: [{ item: 'Fuel' }, { item: 'Crew' }, { item: 'Full lunch' }, { item: 'Drinks' }], price: y.pkgPrice * 1.8, currency: 'IDR' },
      ],
      featuredImage: pickMedia(y.image),
      status: 'published',
      isFeatured: y.image === 0,
    })
  }

  // ── Restaurants (4) ─────────────────────────────────────────
  const restaurantData = [
    { slug: 'sunset-bar-lembongan',      name: 'Sunset Bar Lembongan',  subtitle: 'Cliffside bar with the best sunset view', cuisine: ['bar', 'western'],     priceRange: 'mid_range',   image: 0, dest: destLembongan },
    { slug: 'warung-organic-ubud',        name: 'Warung Organic Ubud',   subtitle: 'Traditional Balinese in a rice paddy setting', cuisine: ['indonesian'],    priceRange: 'budget',       image: 1, dest: destBali },
    { slug: 'ocean-house-nusa-penida',    name: 'Ocean House Penida',    subtitle: 'Fresh seafood by the ocean edge',        cuisine: ['seafood', 'fusion'], priceRange: 'fine_dining',  image: 2, dest: destPenida },
    { slug: 'canggu-cafe',                name: 'Canggu Cafe',           subtitle: 'Digital nomad friendly with fast WiFi',  cuisine: ['cafe', 'western'],   priceRange: 'mid_range',   image: 3, dest: destBali },
  ]

  for (const r of restaurantData) {
    await upsert('restaurants', r.slug, {
      name: r.name, slug: r.slug, subtitle: r.subtitle,
      cuisineType: r.cuisine, priceRange: r.priceRange,
      destination: r.dest,
      description: richText(`${r.name} — ${r.subtitle.toLowerCase()}. Hand-picked for quality, ambience, and consistent service.`),
      features: [
        { name: 'Ocean View', icon: 'location_on' },
        { name: 'Free WiFi', icon: 'badge' },
        { name: 'Vegetarian Options', icon: 'star' },
      ],
      menuHighlights: [
        { name: 'Signature Dish 1', price: 85000, description: 'Chef\'s recommendation' },
        { name: 'Signature Dish 2', price: 125000, description: 'Popular local favorite' },
      ],
      openingHours: [
        { day: 'monday', open: '11:00', close: '22:00', isClosed: false },
        { day: 'tuesday', open: '11:00', close: '22:00', isClosed: false },
        { day: 'sunday', open: '11:00', close: '23:00', isClosed: false },
      ],
      featuredImage: pickMedia(r.image),
      status: 'published',
      isFeatured: r.image === 0,
    })
  }

  // ── Venues (4) ──────────────────────────────────────────────
  const venueData = [
    { slug: 'garden-of-eden-ubud',    name: 'Garden of Eden Ubud',  subtitle: 'Lush tropical garden wedding venue', venueType: 'garden', image: 0, min: 20, max: 150, pkgPrice: 45000000 },
    { slug: 'cliffside-chapel-uluwatu', name: 'Cliffside Chapel Uluwatu', subtitle: 'Iconic glass chapel with ocean view', venueType: 'chapel', image: 1, min: 30, max: 100, pkgPrice: 85000000 },
    { slug: 'beachfront-ballroom-nusadua', name: 'Beachfront Ballroom Nusa Dua', subtitle: 'Elegant beachfront ballroom for grand events', venueType: 'ballroom', image: 2, min: 50, max: 300, pkgPrice: 120000000 },
    { slug: 'private-villa-canggu-events', name: 'Private Villa Canggu Events', subtitle: 'Intimate villa for exclusive celebrations', venueType: 'villa_private', image: 3, min: 15, max: 60, pkgPrice: 35000000 },
  ]

  for (const v of venueData) {
    await upsert('venues', v.slug, {
      name: v.name, slug: v.slug, subtitle: v.subtitle,
      venueType: v.venueType,
      eventTypes: ['wedding', 'engagement', 'anniversary'],
      destination: destBali,
      description: richText(`${v.name} — ${v.subtitle.toLowerCase()}. Full-service coordination, vendor network, and dedicated event manager.`),
      capacity: { minGuests: v.min, maxGuests: v.max },
      features: [
        { name: 'Bridal Suite', icon: 'star' },
        { name: 'Sound System', icon: 'badge' },
        { name: 'Parking', icon: 'directions_boat' },
      ],
      packages: [
        {
          name: 'Intimate Package',
          description: richText('For 20-40 guests'),
          includes: [{ item: 'Venue rental' }, { item: 'Basic decor' }, { item: 'Coordinator' }],
          startingPrice: v.pkgPrice, currency: 'IDR',
        },
        {
          name: 'Grand Package',
          description: richText('For 50+ guests, all-inclusive'),
          includes: [{ item: 'Venue' }, { item: 'Full decor' }, { item: 'Catering setup' }, { item: 'Photography' }],
          startingPrice: v.pkgPrice * 2, currency: 'IDR',
        },
      ],
      featuredImage: pickMedia(v.image),
      status: 'published',
      isFeatured: v.image === 0,
    })
  }

  // ── Tours (3) ───────────────────────────────────────────────
  const tourData = [
    { slug: 'ubud-cultural-day-trip', title: 'Ubud Cultural Day Trip', subtitle: 'Temples, terraces, and traditional dance', duration: 'Full Day', minPax: 1, maxPax: 8, adult: 850000, child: 550000, image: 0, dest: destBali },
    { slug: 'mount-batur-sunrise-hike', title: 'Mount Batur Sunrise Hike', subtitle: 'Trek an active volcano at dawn', duration: '8 hours', minPax: 2, maxPax: 15, adult: 750000, child: 500000, image: 1, dest: destBali },
    { slug: 'nusa-penida-island-hopping', title: 'Nusa Penida Island Hopping', subtitle: 'Kelingking, Angel\'s Billabong, Broken Beach', duration: 'Full Day', minPax: 2, maxPax: 12, adult: 1100000, child: 700000, image: 2, dest: destPenida },
  ]

  for (const t of tourData) {
    await upsert('tours', t.slug, {
      title: t.title, slug: t.slug, subtitle: t.subtitle,
      destination: t.dest,
      description: richText(`${t.title} — ${t.subtitle.toLowerCase()}. Small groups, licensed local guides, comfortable AC transport, and hidden-gem stops.`),
      duration: t.duration,
      minParticipants: t.minPax,
      maxParticipants: t.maxPax,
      highlights: [
        { text: 'Licensed local guide' },
        { text: 'Small group experience' },
        { text: 'Hotel pickup included' },
        { text: 'Photo stops at scenic spots' },
      ],
      itinerary: [
        { time: '07:00', title: 'Hotel Pickup', description: 'Comfortable AC transport pickup from your accommodation' },
        { time: '09:00', title: 'First Stop', description: 'Main attraction with guided walk' },
        { time: '12:00', title: 'Lunch Break', description: 'Traditional local restaurant' },
        { time: '15:00', title: 'Cultural Experience', description: 'Interactive experience with locals' },
        { time: '18:00', title: 'Return to Hotel', description: 'Drop off at your accommodation' },
      ],
      includes: [
        { item: 'Private AC transport' },
        { item: 'Licensed English-speaking guide' },
        { item: 'Bottled water' },
        { item: 'Entrance fees' },
        { item: 'Hotel pickup & drop-off' },
      ],
      excludes: [
        { item: 'Lunch (available at extra cost)' },
        { item: 'Personal expenses' },
        { item: 'Gratuities' },
      ],
      meetingPoint: {
        name: 'Your Hotel Lobby',
        time: '07:00',
        address: 'Pickup within Ubud, Canggu, Seminyak, Kuta area',
      },
      pickupService: {
        available: true,
        areas: 'Ubud, Canggu, Seminyak, Kuta, Nusa Dua',
        notes: 'Free pickup within 15km. Outside area: additional IDR 100k.',
      },
      additionalInfo: richText('Wear comfortable clothing and closed shoes. Bring sunscreen, hat, and camera. Not recommended for pregnant women or people with mobility issues.'),
      pricing: { adultPrice: t.adult, childPrice: t.child, currency: 'IDR', priceNote: 'per person' },
      featuredImage: pickMedia(t.image),
      status: 'published',
      isFeatured: t.image === 0,
    })
  }

  // ── Accommodations (3) ──────────────────────────────────────
  const accData = [
    { slug: 'seaside-villa-lembongan',   name: 'Seaside Villa Lembongan',  subtitle: 'Beachfront villa steps from the sand',      type: 'villa',    rooms: 3, stars: 5, image: 0, dest: destLembongan, roomPrice: 3500000 },
    { slug: 'jungle-hideaway-ubud',       name: 'Jungle Hideaway Ubud',    subtitle: 'Rice paddy view retreat with private pool', type: 'villa',    rooms: 2, stars: 4, image: 1, dest: destBali, roomPrice: 2800000 },
    { slug: 'cliff-resort-uluwatu',       name: 'Cliff Resort Uluwatu',    subtitle: 'Ocean cliff resort with infinity pool',    type: 'resort',   rooms: 4, stars: 5, image: 2, dest: destBali, roomPrice: 4500000 },
  ]

  for (const a of accData) {
    await upsert('accommodations', a.slug, {
      name: a.name, slug: a.slug, subtitle: a.subtitle,
      type: a.type,
      destination: a.dest,
      starRating: a.stars,
      description: richText(`${a.name} — ${a.subtitle.toLowerCase()}. Refined interiors, private amenities, and personalized service for a memorable stay.`),
      highlightTags: [{ text: 'Ocean View' }, { text: 'Private Pool' }, { text: 'Free WiFi' }, { text: 'Breakfast Included' }],
      amenities: [
        { name: 'Infinity Pool', icon: 'pool' },
        { name: 'Free WiFi', icon: 'badge' },
        { name: 'Restaurant', icon: 'restaurant' },
        { name: 'Spa Room', icon: 'star' },
        { name: 'Concierge', icon: 'support_agent' },
      ],
      roomTypes: Array.from({ length: a.rooms }, (_, i) => ({
        name: `Room Type ${i + 1}`,
        description: 'Spacious room with modern amenities and private balcony',
        maxGuests: 2 + i,
        bedType: i === 0 ? 'King Bed' : 'Queen Bed',
        pricePerNight: a.roomPrice + (i * 500000),
        currency: 'IDR',
      })),
      checkInTime: '14:00',
      checkOutTime: '12:00',
      nearbyLandmarks: [
        { name: 'Main Beach', distance: '5 mins' },
        { name: 'Local Restaurant Strip', distance: '10 mins' },
        { name: 'Sunset Point', distance: '15 mins' },
      ],
      curatedExperiences: [
        { name: 'In-Villa Spa Treatment' },
        { name: 'Private Sunset Dinner' },
        { name: 'Yoga Session' },
      ],
      featuredImage: pickMedia(a.image),
      status: 'published',
      isFeatured: a.image === 0,
    })
  }

  // ── Rentals (3) ─────────────────────────────────────────────
  const rentalData = [
    { slug: 'yamaha-nmax-155',    title: 'Yamaha NMAX 155',   subtitle: 'Popular scooter, easy handling',        rentalType: 'motorbike', brand: 'Yamaha', model: 'NMAX 155', year: '2023', dailyPrice: 100000, image: 0 },
    { slug: 'toyota-avanza-mpv',   title: 'Toyota Avanza MPV', subtitle: 'Family-friendly 7-seater with AC',      rentalType: 'car',       brand: 'Toyota', model: 'Avanza',   year: '2022', dailyPrice: 450000, image: 1 },
    { slug: 'honda-scoopy-110',    title: 'Honda Scoopy 110',  subtitle: 'Lightweight scooter for beach roads',   rentalType: 'motorbike', brand: 'Honda',  model: 'Scoopy',   year: '2023', dailyPrice: 75000,  image: 2 },
  ]

  for (const r of rentalData) {
    await upsert('rentals', r.slug, {
      title: r.title, slug: r.slug, subtitle: r.subtitle,
      rentalType: r.rentalType,
      destination: destBali,
      description: richText(`${r.title} — ${r.subtitle.toLowerCase()}. Well-maintained, fully insured, delivered to your accommodation.`),
      specifications: {
        brand: r.brand,
        model: r.model,
        year: r.year,
        details: r.rentalType === 'motorbike' ? 'Automatic transmission, fuel efficient, includes 2 helmets and lock.' : 'Automatic transmission, AC, 7 seats, includes fuel voucher and free delivery.',
      },
      features: r.rentalType === 'motorbike'
        ? [
            { name: '2 Helmets Included', icon: 'verified_user' },
            { name: 'Lock & Insurance', icon: 'badge' },
            { name: 'Free Delivery', icon: 'directions_boat' },
            { name: '24/7 Road Support', icon: 'headset_mic' },
          ]
        : [
            { name: 'Full AC', icon: 'star' },
            { name: '7 Seats', icon: 'group' },
            { name: 'Full Insurance', icon: 'verified_user' },
            { name: 'Free Delivery', icon: 'directions_boat' },
          ],
      pricingTiers: [
        { duration: 'full_day', price: r.dailyPrice, currency: 'IDR', note: 'Best value for short trips' },
        { duration: 'weekly', price: Math.round(r.dailyPrice * 6), currency: 'IDR', note: 'Save 15%' },
        { duration: 'monthly', price: Math.round(r.dailyPrice * 22), currency: 'IDR', note: 'Save 25%' },
      ],
      includes: [
        { item: 'Full tank of fuel (car) / Half tank (motorbike)' },
        { item: 'Insurance coverage' },
        { item: 'Free delivery within 10km' },
        { item: '24/7 road support' },
      ],
      requirements: 'Valid international driving license required. Passport as deposit (returned when rental complete). Age minimum: 21 years.',
      featuredImage: pickMedia(r.image),
      status: 'published',
      isFeatured: r.image === 0,
    })
  }

  log(`\n✓ Seeded 25 entries total:`)
  log(`  - 4 Water Activities, 4 Yachts, 4 Restaurants, 4 Venues`)
  log(`  - 3 Tours, 3 Accommodations, 3 Rentals`)
  log(`Restart Astro dev + touch [...slug].astro to refresh getStaticPaths.`)
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack}\n`)
  process.exit(1)
})
