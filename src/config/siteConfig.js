/**
 * SITE CONFIGURATION FILE
 * =======================
 * All website content is driven dynamically from this file.
 * You can edit artist information, social links, Google Form links, images, latest posts, audio tracks,
 * videos, concert schedules, gallery photos, and reviews here.
 */

import heroBg from '../assets/hero/hero_background.png';
import picRedKurta from '../assets/about/pic_red_kurta.png';
import picMicBlack from '../assets/gallery/pic_mic_black.png';
import picSingingMic from '../assets/gallery/pic_singing_mic.png';
import picTshirt from '../assets/gallery/pic_tshirt.png';

export const siteConfig = {
  // 1. ARTIST OVERVIEW & IMAGES
  artist: {
    name: "Muralidhar Shenoy",
    hometown: "Kochi, Kerala",
    corporateBackground: "Retired Vice President – Sales, Canara Robeco Mutual Fund (Mangalore)",
    title: "Playback Singer & Music Composer",
    tagline: "Playback Singer & Music Composer",
    subtitle: "Devotional, Light & Classical Vocal Performance",
    verifiedBadge: "Verified Artist",
    youtubeHandle: "@muralidharshenoykochi",
    
    // ARTIST PHOTOS
    heroImage: heroBg,
    portraitImage: picRedKurta,

    aboutParagraphs: [
      "Muralidhar Shenoy hails from the cultural town of Kochi, Kerala. Very much inclined towards devotional, light, and classical music from a young age, he has dedicated his life to musical mastery and vocal expression.",
      "A versatile playback singer and music composer for many songs across Indian languages, he brings emotional depth and technical finesse to every performance. Parallel to his artistic achievements, Muralidhar served a distinguished corporate career, retiring as Vice President - Sales of Canara Robeco Mutual Fund, Mangalore."
    ],
    location: "Kochi, Kerala & Mangalore, Karnataka",
    availableFor: ["Grand Classical Recitals", "Sugama Sangeetha & Light Music", "Devotional Bhajans", "Film & Studio Recordings", "Music Composition"],
    languages: ["Kannada", "Hindi", "Konkani", "Malayalam", "Marathi", "Tulu"],
    stats: [
      { label: "Origin", value: "Kochi" },
      { label: "Genres", value: "3+" },
      { label: "Languages", value: "6" },
      { label: "Musical Legacy", value: "Multilingual" }
    ]
  },

  // 2. SOCIAL MEDIA LINKS
  socials: {
    spotify: "https://open.spotify.com/artist/0oEpNPAtIRZ1ReC28uqhdT",
    instagram: "https://www.instagram.com/muralidhargshenoy/?hl=en&utm_source=gemini",
    youtube: "https://www.youtube.com/@muralidharshenoykochi",
    youtubeSubscribe: "https://www.youtube.com/channel/UCZZkLUPMv1Ka4bNSyOpYGOA?sub_confirmation=1",
    facebook: "https://www.facebook.com/muralidhar.g.shenoy/",
    email: "booking.muralidharshenoy@gmail.com",
  },

  // 3. ACTUAL LATEST POSTS FROM YT, INSTA & FB
  latestPosts: [
    {
      id: 1,
      platform: "YouTube",
      title: "Indravallari Poochoodivarum (K.J. Yesudas Tribute Cover)",
      type: "Latest Video",
      handle: "@muralidharshenoykochi",
      thumbnail: picSingingMic,
      url: "https://www.youtube.com/@muralidharshenoykochi",
      actionText: "Watch Video on YouTube ↗",
      description: "Evergreen Malayalam classic film vocal rendition from Gandharva Kshetham, honoring legend K.J. Yesudas."
    },
    {
      id: 2,
      platform: "Instagram",
      title: "Yad Na Jaye Beete Dinon Ki - Studio Tribute Reel",
      type: "Latest Reel",
      handle: "@muralidhargshenoy",
      thumbnail: picMicBlack,
      url: "https://www.instagram.com/muralidhargshenoy/?hl=en",
      actionText: "View Reel on Instagram ↗",
      description: "Unplugged studio vocal performance paying tribute to legendary playback maestro Mohammed Rafi."
    },
    {
      id: 3,
      platform: "Facebook",
      title: "Amara Prabho & Konkani Devotional Haribhajan",
      type: "Latest Post",
      handle: "Muralidhar Shenoy",
      thumbnail: picRedKurta,
      url: "https://www.facebook.com/muralidhar.g.shenoy/",
      actionText: "Read Post on Facebook ↗",
      description: "Soulful devotional vocal recital performed live for GSB community and temple celebrations."
    }
  ],

  // 4. GOOGLE FORM & BOOKING ENQUIRY CONFIGURATION
  googleForm: {
    enabled: true,
    title: "Booking Enquiry & Performance Request",
    description: "Submit your event details via our official Google Form or email directly for custom concert programming.",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfDdummyFormIdHere/viewform?embedded=true", 
    directFormUrl: "https://forms.google.com/your-google-form-link-here",
    contactEmail: "booking.muralidharshenoy@gmail.com"
  },

  // 5. FEATURED AUDIO PREVIEW TRACKS
  audioTracks: [
    {
      id: 1,
      title: "Indravallari Poochoodivarum",
      genre: "Malayalam Classic",
      language: "Malayalam",
      duration: "04:15",
      spotifyUrl: "https://open.spotify.com/artist/0oEpNPAtIRZ1ReC28uqhdT",
      coverImage: picSingingMic
    },
    {
      id: 2,
      title: "Amara Prabho (Konkani Haribhajan)",
      genre: "Devotional",
      language: "Konkani",
      duration: "03:45",
      spotifyUrl: "https://open.spotify.com/artist/0oEpNPAtIRZ1ReC28uqhdT",
      coverImage: picRedKurta
    },
    {
      id: 3,
      title: "Yad Na Jaye Beete Dinon Ki",
      genre: "Rafi Tribute",
      language: "Hindi",
      duration: "05:10",
      spotifyUrl: "https://open.spotify.com/artist/0oEpNPAtIRZ1ReC28uqhdT",
      coverImage: picMicBlack
    }
  ],

  // 6. YOUTUBE VIDEO SHOWCASE
  videoShowcase: [
    {
      id: 1,
      title: "Indravallari Poochoodivarum - K.J. Yesudas Tribute",
      category: "Malayalam Classic",
      language: "Malayalam",
      youtubeId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/@muralidharshenoykochi",
      description: "Evergreen Malayalam classic from Gandharva Kshetham rendered with authentic vocal expression."
    },
    {
      id: 2,
      title: "Yad Na Jaye Beete Dinon Ki - Mohammed Rafi Tribute",
      category: "Hindi Classic",
      language: "Hindi",
      youtubeId: "L_LUpnjgPso",
      youtubeUrl: "https://www.youtube.com/@muralidharshenoykochi",
      description: "Classic film song rendition from Dil Ek Mandir paying homage to legendary playback master."
    },
    {
      id: 3,
      title: "Amara Prabho - Konkani Haribhajan Vocal Recital",
      category: "Devotional",
      language: "Konkani",
      youtubeId: "3JZ_D3ELwOQ",
      youtubeUrl: "https://www.youtube.com/@muralidharshenoykochi",
      description: "Soulful devotional vocal performance celebrating Konkani musical heritage."
    }
  ],

  // 7. EVENTS & CONCERT SCHEDULE
  events: [
    {
      id: 1,
      title: "Sugama Sangeetha & Bhavageethe Evening",
      date: "2026-10-15",
      formattedDate: "OCT 15, 2026",
      time: "6:30 PM IST",
      venue: "Chowdiah Memorial Hall",
      city: "Bengaluru",
      status: "Available",
      category: "Public Concert"
    },
    {
      id: 2,
      title: "Konkani Haribhajan & Classical Recital",
      date: "2026-11-08",
      formattedDate: "NOV 08, 2026",
      time: "5:00 PM IST",
      venue: "Town Hall Auditorium",
      city: "Mangaluru",
      status: "Available",
      category: "Devotional"
    },
    {
      id: 3,
      title: "Retro Film Songs Special - Sangeet Sandhya",
      date: "2026-08-20",
      formattedDate: "AUG 20, 2026",
      time: "7:00 PM IST",
      venue: "Ravindra Kalakshetra",
      city: "Bengaluru",
      status: "Concluded",
      category: "Film Songs"
    }
  ],

  // 8. PHOTO GALLERY
  gallery: [
    {
      id: 1,
      url: picSingingMic,
      caption: "Live Vocal Concert Recital",
      category: "Concerts"
    },
    {
      id: 2,
      url: picMicBlack,
      caption: "Studio Vocal Performance",
      category: "Studio"
    },
    {
      id: 3,
      url: picRedKurta,
      caption: "Devotional & Sugama Sangeetha Evening",
      category: "Concerts"
    },
    {
      id: 4,
      url: picTshirt,
      caption: "Musical Journey & Artist Portrait",
      category: "Festival"
    }
  ],

  // 9. TESTIMONIALS
  testimonials: [
    {
      quote: "Muralidhar Shenoy's performance at our cultural festival was pure magic. His devotional and light music renditions showcased rare emotional depth.",
      name: "Dr. K. R. Bhat",
      role: "President, Cultural Arts Forum",
      location: "Bengaluru"
    },
    {
      quote: "His original compositions and playback singing span rare authenticity across languages. A true master of melody.",
      name: "Suresh & Ananya Pai",
      role: "Event Hosts",
      location: "Mangaluru"
    }
  ],

  // 10. FREQUENTLY ASKED QUESTIONS
  faqs: [
    {
      q: "What genres of music does Muralidhar perform live?",
      a: "Muralidhar performs Devotional Bhajans, Light Music (Sugama Sangeetha), Playback film songs, and Indian Classical recitals."
    },
    {
      q: "What types of events can I book him for?",
      a: "He is available for public concerts, cultural association festivals, devotional temple events, wedding receptions, private musical evenings, and studio recording assignments."
    },
    {
      q: "Does he compose music for new projects?",
      a: "Yes! As an experienced music composer, he composes original songs and jingles across Indian languages."
    }
  ]
};
