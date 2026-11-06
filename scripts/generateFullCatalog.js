const fs = require('fs');
const path = require('path');

// Curated data definitions for generating 520+ unique, high-quality products across 25 categories

const CATEGORY_PRODUCTS = [
  // 1. Electronics & Audio (cat-electronics)
  {
    category: 'cat-electronics',
    subCategory: 'sub-headphones',
    items: [
      { name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones', brand: 'brand-sony', price: 29990, mrp: 34990, image: '1505740420928-5e560c06d30e', tag: 'Noise-Cancelling', desc: 'Industry-leading noise canceling with two processors and 8 microphones. Up to 30-hour battery life with quick charging.' },
      { name: 'Bose QuietComfort 45 Bluetooth Wireless Headphones', brand: 'brand-bose', price: 24900, mrp: 29900, image: '1546435770-a3e426bf472b', tag: 'QuietComfort', desc: 'The perfect balance of quiet, comfort, and sound. TriPort acoustic architecture delivers deep, full audio.' },
      { name: 'boAt Rockerz 550 Over-Ear Wireless Headphone', brand: 'brand-boat', price: 1999, mrp: 4999, image: '1583394838336-acd977736f90', tag: 'Super Extra Bass', desc: '50mm dynamic drivers bring immersive audio with 20 hours playback and plush physical noise isolation ear cushions.' },
      { name: 'Sony WH-CH720N Noise Cancelling Wireless Headphones', brand: 'brand-sony', price: 9990, mrp: 14990, image: '1572536147248-ac59a8abfa4b', tag: 'Dual Noise Sensor', desc: 'Lightweight ergonomic design with Integrated Processor V1 and 35-hour continuous battery for all-day listening.' },
      { name: 'JBL Live 660NC Wireless Over-Ear NC Headphones', brand: 'brand-jbl', price: 8999, mrp: 14999, image: '1577174881658-0f30ed549adc', tag: 'Signature Sound', desc: '40mm drivers deliver punchy bass, with Ambient Aware and TalkThru technology for effortless awareness.' },
      { name: 'Sennheiser Accentum Wireless ANC Headphones', brand: 'brand-sony', price: 11990, mrp: 15990, image: '1598331668826-20cecc596b88', tag: 'Hybrid ANC', desc: '50-hour battery life with Sennheiser acoustic transducer and customizable 5-band sound equalizer.' },
      { name: 'Anker Soundcore Space One Active NC Headphones', brand: 'brand-anker', price: 6999, mrp: 9999, image: '1585298723682-7115561c51b7', tag: 'LDAC Hi-Res', desc: 'Voice-reduction active noise cancelling reducing twice as much background chatter with 40mm custom drivers.' },
      { name: 'boAt Rockerz 450 Bluetooth On-Ear Headphone', brand: 'brand-boat', price: 1499, mrp: 3990, image: '1545127398-14699f92334b', tag: 'Matte Finish', desc: '40mm dynamic drivers deliver HD sound with up to 15 hours of battery and adaptive soft-cushioned earcups.' },
      { name: 'Apple AirPods Max - Space Grey', brand: 'brand-apple', price: 59900, mrp: 59900, image: '1514525253161-7a46d19cd819', tag: 'Spatial Audio', desc: 'Custom acoustic design, H1 chip, computational audio, and dynamic head tracking for theater-like sound.' },
      { name: 'Sony MDR-ZX110A Wired On-Ear Headphones', brand: 'brand-sony', price: 899, mrp: 1390, image: '1563245372-f21724e3856d', tag: 'Tangle-Free', desc: '30mm neodymium dynamic drivers, compact folding design, and wide frequency range from 12Hz to 22kHz.' },
    ]
  },
  {
    category: 'cat-electronics',
    subCategory: 'sub-earbuds',
    items: [
      { name: 'Apple AirPods Pro (2nd Generation) with USB-C MagSafe', brand: 'brand-apple', price: 23900, mrp: 24900, image: '1600294037681-c80b4cb5b434', tag: 'Active Noise Cancellation', desc: 'H2 chip power, up to 2x more Active Noise Cancellation, Adaptive Audio, and personalized Spatial Audio.' },
      { name: 'Sony WF-1000XM5 Truly Wireless Noise Canceling Earbuds', brand: 'brand-sony', price: 21990, mrp: 29990, image: '1590658268037-6bf12165a8df', tag: 'Hi-Res Audio', desc: 'Dynamic Driver X, dual proprietary noise cancelling processors, and crystal-clear call quality with bone conduction.' },
      { name: 'Bose QuietComfort Ultra Wireless Noise Cancelling Earbuds', brand: 'brand-bose', price: 23990, mrp: 25900, image: '1508700115892-45ecd05ae2ad', tag: 'Immersive Audio', desc: 'Breakthrough spatialized audio that places sound right in front of you. CustomTune technology shapes sound to your ears.' },
      { name: 'boAt Airdopes 141 True Wireless Earbuds', brand: 'brand-boat', price: 1299, mrp: 4490, image: '1572569511254-d8f925fe2cbb', tag: 'BEAST Mode', desc: '42 hours playback, ENx environmental noise cancellation for calls, and low-latency gaming mode.' },
      { name: 'OnePlus Buds Pro 2 with Dynaudio Sound Tuning', brand: 'brand-oneplus', price: 8999, mrp: 11999, image: '1606220588913-b3aacb4d2f46', tag: 'MelodyBoost Dual', desc: 'Co-created with Dynaudio, featuring 11mm + 6mm dual drivers, smart adaptive noise cancellation up to 48dB.' },
      { name: 'Nothing Ear (2) Hi-Res Audio Dual Chamber Earbuds', brand: 'brand-nothing', price: 8499, mrp: 12999, image: '1598331668826-20cecc596b88', tag: 'Transparent Case', desc: 'Custom 11.6mm driver, 24bit Hi-Res certified audio, personalized sound profile, and IP54 water resistance.' },
      { name: 'Samsung Galaxy Buds2 Pro 24-bit Hi-Fi Sound', brand: 'brand-samsung', price: 12999, mrp: 19999, image: '1590658002970-ce604462fb0f', tag: 'Intelligent ANC', desc: 'Seamless 24-bit studio sound, 3 high-SNR microphones for studio cancellation, and ergonomic comfort fit.' },
      { name: 'Realme Buds Air 5 Pro Dual Driver ANC Earbuds', brand: 'brand-realme', price: 4499, mrp: 7999, image: '1618366712010-f4ae9c647dcb', tag: '50dB ANC', desc: '11mm bass driver + 6mm micro-planar tweeter, 50dB active noise cancellation, and LDAC HD codec.' },
      { name: 'boAt Nirvana Ion ANC with Crystal Bionic Sound', brand: 'brand-boat', price: 2499, mrp: 9990, image: '1608156639585-34a0a562a0cf', tag: '120H Playtime', desc: 'Unmatched 120 hours total playtime, quad mics with ENx technology, and dual EQ modes.' },
      { name: 'JBL Wave Beam In-Ear Deep Bass TWS Earbuds', brand: 'brand-jbl', price: 2999, mrp: 4999, image: '1613040809724-53cb7c49dd49', tag: 'Deep Bass', desc: '8mm drivers delivering deep bass with 32 hours total battery life and comfortable stick design.' },
    ]
  },
  {
    category: 'cat-electronics',
    subCategory: 'sub-speakers',
    items: [
      { name: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker', brand: 'brand-jbl', price: 9999, mrp: 13999, image: '1545454675-3531b543be5d', tag: 'IP67 Waterproof', desc: '2-way speaker system with racetrack-shaped woofer, separate tweeter, and dual pumping passive radiators.' },
      { name: 'Sony SRS-XB100 Wireless Compact Travel Speaker', brand: 'brand-sony', price: 3990, mrp: 5990, image: '1511671782779-c97d3d27a1d4', tag: 'Extra Bass', desc: 'Sound Diffusion Processor spreads sound in any space, compact body with multiway strap and 16 hours battery.' },
      { name: 'Bose SoundLink Flex Bluetooth Outdoor Speaker', brand: 'brand-bose', price: 14900, mrp: 16900, image: '1574920162043-b872873f19c8', tag: 'PositionIQ', desc: 'Engineered to withstand water, dust, and debris. PositionIQ technology optimizes sound regardless of orientation.' },
      { name: 'boAt Stone 350 10W Portable Wireless Speaker', brand: 'brand-boat', price: 1499, mrp: 3490, image: '1591488320449-011701bb6704', tag: '10W Stereo', desc: 'Dynamic 10W stereo sound, IPX7 splash resistance, and up to 12 hours playtime with Type-C fast charging.' },
      { name: 'JBL Charge 5 Portable Bluetooth Speaker with Powerbank', brand: 'brand-jbl', price: 14999, mrp: 18999, image: '1520170350707-b2da59970118', tag: '20H Battery', desc: 'Long excursion driver, separate tweeter, dual passive bass radiators, and built-in USB powerbank for your phone.' },
      { name: 'Sony SRS-XG300 X-Series Wireless Party Speaker', brand: 'brand-sony', price: 22990, mrp: 32990, image: '1595341888016-a392ef81b7de', tag: 'Mega Bass', desc: 'X-Balanced Speaker Unit delivers powerful, high-quality sound and deep punchy bass with ambient illumination.' },
      { name: 'boAt PartyPal 50 20W Bluetooth Party Speaker with Mic', brand: 'brand-boat', price: 2999, mrp: 7990, image: '1524678606370-a47ad25cb82a', tag: 'Karaoke Ready', desc: 'Integrated karaoke microphone support, dynamic RGB lights, and 20W RMS output for indoor and outdoor gatherings.' },
      { name: 'Anker Soundcore Motion+ 30W Hi-Res Bluetooth Speaker', brand: 'brand-anker', price: 7999, mrp: 10999, image: '1508700115892-45ecd05ae2ad', tag: 'Hi-Res Audio', desc: 'Ultra-wide frequency range from 50Hz to 40kHz, Qualcomm aptX, BassUp technology, and active crossover.' },
    ]
  },
  {
    category: 'cat-electronics',
    subCategory: 'sub-soundbars',
    items: [
      { name: 'Sony HT-S20R 5.1ch Dolby Digital Soundbar with Subwoofer', brand: 'brand-sony', price: 17990, mrp: 23990, image: '1593359677879-a4bb92f829d1', tag: '5.1 Channel', desc: '400W total power output, discrete 5.1ch system with rear speakers and external subwoofer for true cinema sound.' },
      { name: 'JBL Bar 500 5.1 Channel 590W Dolby Atmos Soundbar', brand: 'brand-jbl', price: 44999, mrp: 59999, image: '1519389950473-47ba0277781c', tag: 'MultiBeam', desc: 'MultiBeam technology creates a wide soundstage without extra speakers. 10-inch wireless down-firing subwoofer.' },
      { name: 'Samsung HW-B670 5.1 Channel Soundbar with Bass Boost', brand: 'brand-samsung', price: 21990, mrp: 34900, image: '1507473885765-e6ed057f782c', tag: 'DTS Virtual:X', desc: 'DTS Virtual:X creates spacious 3D sound, dedicated center speaker for clear dialogue, and built-in rear surround speakers.' },
      { name: 'boAt Aavante Bar 2050 160W 2.1 Channel Soundbar', brand: 'brand-boat', price: 6999, mrp: 22990, image: '1511707171634-5f897ff02aa9', tag: 'Signature Bass', desc: '160W RMS cinematic sound with master wireless subwoofer, multi-connectivity (HDMI ARC, Optical, BT 5.0).' },
    ]
  },
  {
    category: 'cat-electronics',
    subCategory: 'sub-neckbands',
    items: [
      { name: 'OnePlus Bullets Wireless Z2 Bluetooth Neckband', brand: 'brand-oneplus', price: 1799, mrp: 2299, image: '1546435770-a3e426bf472b', tag: 'Super Bass', desc: '12.4mm bass drivers, 30 hours battery life with 10-minute warp charge giving 20 hours listening.' },
      { name: 'boAt Rockerz 255 Pro+ In-Ear Bluetooth Neckband', brand: 'brand-boat', price: 1299, mrp: 3990, image: '1505740420928-5e560c06d30e', tag: 'ASAP Charge', desc: 'Up to 40 hours continuous playback, IPX7 water and sweat shield, and Qualcomm cVc call noise cancellation.' },
      { name: 'Realme Buds Wireless 3 30dB ANC Neckband Earphone', brand: 'brand-realme', price: 1699, mrp: 2999, image: '1572536147248-ac59a8abfa4b', tag: '30dB ANC', desc: '13.6mm dynamic bass driver, 360-degree spatial audio effect, and 40 hours battery backup with fast charging.' },
    ]
  },
];

console.log('Category seed templates ready');
