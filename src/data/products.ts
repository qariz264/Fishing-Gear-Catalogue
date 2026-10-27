export interface ProductVariant {
  id: string;
  label: string;
  colorHex?: string;
  detail?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price?: number;
  imageUrl?: string;
  images?: string[];
  badge?: string;
  description: string;
  application?: string;
  waterType?: string;
  targetSpecies?: string[];
  specs: ProductSpec[];
  verificationStatus?: string;
  researchNotes?: string;
  variants?: ProductVariant[];
  catalogPhotoMatch?: string;
  gearType?: 'rod' | 'reel' | 'lure' | 'hook' | 'net' | 'line' | 'other';
  published?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  storagePath?: string;
  accentTheme?: {
    bg: string;
    border: string;
    text: string;
    gradient: string;
  };
}

export const CATEGORIES = [
  "All Equipment",
  "Fishing Rods",
  "Fishing Reels",
  "Artificial Lures",
  "Hooks & Terminal",
  "Fishing Lines",
  "Nets & Landing Gear",
  "Accessories",
  "Other Gear"
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

export const PRODUCTS: Product[] = [
  {
    "id": "prod-1792331101161",
    "name": "Braided fishing line",
    "brand": "FishWithNelson",
    "category": "Fishing Lines",
    "subcategory": "Braided fishing Lines",
    "price": 1200,
    "imageUrl": "/images/catalog/prod-1792331101161-1.webp",
    "images": [
      "/images/catalog/prod-1792331101161-1.webp",
      "/images/catalog/prod-1792331101161-2.webp"
    ],
    "badge": "",
    "description": "Braided fishing lines are rated as some of the Best lines when it comes to fighting Strong fish. This braid can comfortably do 40pounds or 18kgs before snagging. 40ponds braided line.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "100M"
      },
      {
        "label": "Key Feature",
        "value": "0.23mm"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T13:45:01.162Z",
    "updatedAt": "2026-10-18T19:48:01.969Z"
  },
  {
    "id": "prod-1792331300018",
    "name": "Stopper beads",
    "brand": "FishWithNelson",
    "category": "Other Gear",
    "subcategory": "Fishing accessories",
    "price": 500,
    "imageUrl": "/images/catalog/prod-1792331300018-1.webp",
    "images": [
      "/images/catalog/prod-1792331300018-1.webp"
    ],
    "badge": "",
    "description": "These beads are used for installation of floaters and sinkers to make sure they stay in place.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "250beads"
      },
      {
        "label": "Key Feature",
        "value": "Blue or Red"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T13:48:20.019Z",
    "updatedAt": "2026-10-18T13:48:20.018Z"
  },
  {
    "id": "prod-1792331882603",
    "name": "Pro kit fishing Combo",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Complete Combo",
    "price": 9800,
    "imageUrl": "/images/catalog/prod-1792331882603-1.webp",
    "images": [
      "/images/catalog/prod-1792331882603-1.webp"
    ],
    "badge": "",
    "description": "This is a complete fishing Combo for heavy duty fishing. Best when targeting Bass fishing, bream tilapia and hard fighting fish like barbells. This combo contains 3000 reel series. 5 foot 2piece rod, a 15 or 8grams floater, a 10 or 5 grams sinker, one set of stopper beads, 4size 14 J hooks, a braided line thats 100M , a change nylon line that is 100M and a free crankbait. You will be so ready to start your Bass fishing carrier. It casts smooth like butter.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Pro kit"
      },
      {
        "label": "Key Feature",
        "value": "Metallic reel"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T13:58:02.603Z",
    "updatedAt": "2026-10-18T13:58:02.603Z"
  },
  {
    "id": "prod-1792332175845",
    "name": "Senko or Wacky Worms",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Plastic Fishing Worms",
    "price": 200,
    "imageUrl": "/images/catalog/prod-1792332175845-1.webp",
    "images": [
      "/images/catalog/prod-1792332175845-1.webp"
    ],
    "badge": "",
    "description": "1pc of a senko Will catch you more fish than anything else in your lure box.. these 6inch senkos go for 200 each at our Shop.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "6inch"
      },
      {
        "label": "Key Feature",
        "value": "8.5grams"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:02:55.846Z",
    "updatedAt": "2026-10-18T14:02:55.846Z"
  },
  {
    "id": "prod-1792332870594",
    "name": "100M clear fishing line",
    "brand": "FishWithNelson",
    "category": "Fishing Lines",
    "subcategory": "Fishing Lines",
    "price": 1200,
    "imageUrl": "/images/catalog/prod-1792332870594-1.webp",
    "images": [
      "/images/catalog/prod-1792332870594-1.webp"
    ],
    "badge": "",
    "description": "Strong and durable fishing line. Nylon. 100m for all types of reels and leaders lines.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Nylon clear"
      },
      {
        "label": "Key Feature",
        "value": "100M long"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:14:30.594Z",
    "updatedAt": "2026-10-18T14:14:30.594Z"
  },
  {
    "id": "prod-1792333090163",
    "name": "Premium crankbaits",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Crankbaits",
    "price": 600,
    "imageUrl": "/images/catalog/prod-1792333090163-1.webp",
    "images": [
      "/images/catalog/prod-1792333090163-1.webp"
    ],
    "badge": "",
    "description": "For 600 Each you get yourself the Best crankbaits in town. These ones work like magic on Bass fishing.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Plastic"
      },
      {
        "label": "Key Feature",
        "value": "Multiple colors."
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:18:10.163Z",
    "updatedAt": "2026-10-18T14:18:10.163Z"
  },
  {
    "id": "prod-1792333612437",
    "name": "Multi jointed glind bait",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Lures",
    "price": 1000,
    "imageUrl": "/images/catalog/prod-1792333612437-1.webp",
    "images": [
      "/images/catalog/prod-1792333612437-1.webp"
    ],
    "badge": "",
    "description": "This glind bait works perfectly and catches ONLY personal bests.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Multi jointed"
      },
      {
        "label": "Key Feature",
        "value": "Plastic lure"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:26:52.437Z",
    "updatedAt": "2026-10-18T14:26:52.437Z"
  },
  {
    "id": "prod-1792333964051",
    "name": "Catfish circle hooks",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Hoojs",
    "price": 300,
    "imageUrl": "/images/catalog/prod-1792333964051-1.webp",
    "images": [
      "/images/catalog/prod-1792333964051-1.webp"
    ],
    "badge": "",
    "description": "4pcs at Ksh 300. When target giant catfish these are the hooks you need. If the catfish you are targeting are less than 3kgs just avoid These ones and buy size 14 J hooks. Check them out here on our site",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Big"
      },
      {
        "label": "Key Feature",
        "value": "Strong hooks"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:32:44.051Z",
    "updatedAt": "2026-10-18T14:32:44.051Z"
  },
  {
    "id": "prod-1792334895287",
    "name": "Fishing handpole",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Handpole",
    "price": 2500,
    "imageUrl": "/images/catalog/prod-1792334895287-1.webp",
    "images": [
      "/images/catalog/prod-1792334895287-1.webp"
    ],
    "badge": "",
    "description": "Retractable fishing handpole. Simple to use for both adults and kids 7+years. Avoid the hustle of a reel machine.... just show up and start catching. Comes in different colors.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "3.6 m Long"
      },
      {
        "label": "Key Feature",
        "value": "Telescopic"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:48:15.287Z",
    "updatedAt": "2026-10-18T14:48:15.287Z"
  },
  {
    "id": "prod-1792335189815",
    "name": "Strong two piece fishing rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Rods",
    "price": 3500,
    "imageUrl": "/images/catalog/prod-1792335189815-1.webp",
    "images": [
      "/images/catalog/prod-1792335189815-1.webp"
    ],
    "badge": "",
    "description": "Strong rods.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "2.1 m or 5 foot 2piece rod"
      },
      {
        "label": "Key Feature",
        "value": "Corbon"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T14:53:09.815Z",
    "updatedAt": "2026-10-18T14:53:09.815Z"
  },
  {
    "id": "prod-1792341191735",
    "name": "R- Bait caster",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Baitcasters",
    "price": 5500,
    "imageUrl": "/images/catalog/prod-1792341191735-1.webp",
    "images": [
      "/images/catalog/prod-1792341191735-1.webp"
    ],
    "badge": "",
    "description": "Bait casters are the best for bass fishing and casting lures. Cast with Lazer sharp precision. R bait caster does the job smoothly.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Carbon fiber"
      },
      {
        "label": "Key Feature",
        "value": "Heavy power"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T16:33:11.735Z",
    "updatedAt": "2026-10-18T16:33:11.735Z"
  },
  {
    "id": "prod-1792341436021",
    "name": "3000 series reel",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Reels",
    "price": 5500,
    "imageUrl": "/images/catalog/prod-1792341436021-1.webp",
    "images": [
      "/images/catalog/prod-1792341436021-1.webp"
    ],
    "badge": "",
    "description": "Metallic super heavy duty. Powerful reel for handling powerful fish upto 12kgs comfortably.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Metallic"
      },
      {
        "label": "Key Feature",
        "value": "3000 series."
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T16:37:16.022Z",
    "updatedAt": "2026-10-18T16:37:16.022Z"
  },
  {
    "id": "prod-1792341673522",
    "name": "Powerful s3000 reel",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Reels",
    "price": 7500,
    "imageUrl": "/images/catalog/prod-1792341673522-1.webp",
    "images": [
      "/images/catalog/prod-1792341673522-1.webp"
    ],
    "badge": "",
    "description": "This reel is a metallic beast and there is no freshwater fish that it can't handle. Fishing power looks like this.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "S3000"
      },
      {
        "label": "Key Feature",
        "value": "Metallic"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T16:41:13.522Z",
    "updatedAt": "2026-10-18T16:41:13.522Z"
  },
  {
    "id": "prod-1792342279541",
    "name": "Carperan Sea fishing reel and rod Combo.",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Complete Combo",
    "price": 45000,
    "imageUrl": "/images/catalog/prod-1792342279541-1.webp",
    "images": [
      "/images/catalog/prod-1792342279541-1.webp"
    ],
    "badge": "",
    "description": "Dominate the sea with this saltwater fishing Combo. Rated for salt water fishing this combo gives you a strong 12 foot rod,  3 different reels for sea fishing to use depending With the size of fish you are targeting, a 500 meter Long braided line, 2 long jerk baits, and 2 ... 60grams sinkers. Now heat the sea. This combo is ONLY available on preorder.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Power"
      },
      {
        "label": "Key Feature",
        "value": "Seawater Combo"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T16:51:19.541Z",
    "updatedAt": "2026-10-18T16:51:19.541Z"
  },
  {
    "id": "prod-1792353799992",
    "name": "Soft lure",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Lures",
    "price": 200,
    "imageUrl": "/images/catalog/prod-1792353799992-1.webp",
    "images": [
      "/images/catalog/prod-1792353799992-1.webp",
      "/images/catalog/prod-1792353799992-2.webp",
      "/images/catalog/prod-1792353799992-3.webp"
    ],
    "badge": "",
    "description": "Basically a 6inch 7grams senko with a swimming tail. Very effective for Bass fishing.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Soft silicone"
      },
      {
        "label": "Key Feature",
        "value": "Swimming tail"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T20:03:19.992Z",
    "updatedAt": "2026-10-18T20:03:19.992Z"
  },
  {
    "id": "prod-1792354075294",
    "name": "Fishing lures",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Lures",
    "price": 3500,
    "imageUrl": "/images/catalog/prod-1792354075294-1.webp",
    "images": [
      "/images/catalog/prod-1792354075294-1.webp",
      "/images/catalog/prod-1792354075294-2.webp"
    ],
    "badge": "",
    "description": "Best lures to start Bass fishing with. Kickstart.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Assorted colors"
      },
      {
        "label": "Key Feature",
        "value": "Lures"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T20:07:55.294Z",
    "updatedAt": "2026-10-18T20:07:55.294Z"
  },
  {
    "id": "prod-1792354800804",
    "name": "Fishing beginners kit",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Complete Combo",
    "price": 3500,
    "imageUrl": "/images/catalog/prod-1792354800804-1.webp",
    "images": [
      "/images/catalog/prod-1792354800804-1.webp",
      "/images/catalog/prod-1792354800804-2.webp",
      "/images/catalog/prod-1792354800804-3.webp"
    ],
    "badge": "",
    "description": "For complete begginers. A low budget fishing kit that Will enable you practice with confidence before upgrading to something serious also our best selling Combo. It includes a 200 series metaplastic reel, a 1.3/1.8m  two piece fishing rod, a strong nylon fishing line, a spare 100M fishing line, floater, sinker, stopper beads and 4pcs J hook. If lucky you might also get a crankbait in the package. Can pull out a 6pounder",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Complete Combo"
      },
      {
        "label": "Key Feature",
        "value": "Everything inclusive"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T20:20:00.804Z",
    "updatedAt": "2026-10-18T20:20:00.804Z"
  },
  {
    "id": "prod-1792355046307",
    "name": "Powerful fishing reel and rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Combo",
    "price": 7500,
    "imageUrl": "/images/catalog/prod-1792355046307-1.webp",
    "images": [
      "/images/catalog/prod-1792355046307-1.webp",
      "/images/catalog/prod-1792355046307-2.webp",
      "/images/catalog/prod-1792355046307-3.webp"
    ],
    "badge": "",
    "description": "Great for catfish, and Bass fishing",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Specification",
        "value": "Premium"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-18T20:24:06.307Z",
    "updatedAt": "2026-10-19T08:34:13.056Z"
  },
  {
    "id": "prod-1792399617842",
    "name": "8/15grams Fishing Floaters.",
    "brand": "FishWithNelson",
    "category": "Other Gear",
    "subcategory": "Floaters",
    "price": 150,
    "imageUrl": "/images/catalog/prod-1792399617842-1.webp",
    "images": [
      "/images/catalog/prod-1792399617842-1.webp",
      "/images/catalog/prod-1792399617842-2.webp"
    ],
    "badge": "",
    "description": "Built light with Luminous colors to enhance visibility in water, these bulb floater are a must have for any angler.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Light"
      },
      {
        "label": "Key Feature",
        "value": "3,8,15, grams"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-19T08:46:57.842Z",
    "updatedAt": "2026-10-19T08:46:57.842Z"
  },
  {
    "id": "prod-1792417505271",
    "name": "Fishing Reels",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 5500,
    "imageUrl": "/images/catalog/prod-1792417505271-1.webp",
    "images": [
      "/images/catalog/prod-1792417505271-1.webp",
      "/images/catalog/prod-1792417505271-2.webp",
      "/images/catalog/prod-1792417505271-3.webp",
      "/images/catalog/prod-1792417505271-4.webp",
      "/images/catalog/prod-1792417505271-5.webp",
      "/images/catalog/prod-1792417505271-6.webp",
      "/images/catalog/prod-1792417505271-7.webp",
      "/images/catalog/prod-1792417505271-8.webp",
      "/images/catalog/prod-1792417505271-9.webp",
      "/images/catalog/prod-1792417505271-10.webp",
      "/images/catalog/prod-1792417505271-11.webp",
      "/images/catalog/prod-1792417505271-12.webp"
    ],
    "badge": "",
    "description": "Reasonably priced fishing gears. Any reel of your choice for the images above goes for Ksh 5500. Take a screenshot and Reach out with it.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Assorted"
      },
      {
        "label": "Key Feature",
        "value": "Metallic and plastic."
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-19T13:45:05.271Z",
    "updatedAt": "2026-10-19T13:45:05.271Z"
  },
  {
    "id": "prod-1792417911662",
    "name": "Fishing Rod and reel",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Rod, reel",
    "price": 7500,
    "imageUrl": "/images/catalog/prod-1792417911662-1.webp",
    "images": [
      "/images/catalog/prod-1792417911662-1.webp",
      "/images/catalog/prod-1792417911662-2.webp",
      "/images/catalog/prod-1792417911662-3.webp",
      "/images/catalog/prod-1792417911662-4.webp",
      "/images/catalog/prod-1792417911662-5.webp",
      "/images/catalog/prod-1792417911662-6.webp",
      "/images/catalog/prod-1792417911662-7.webp",
      "/images/catalog/prod-1792417911662-8.webp",
      "/images/catalog/prod-1792417911662-9.webp",
      "/images/catalog/prod-1792417911662-10.webp",
      "/images/catalog/prod-1792417911662-11.webp"
    ],
    "badge": "",
    "description": "A combination of fishing reel and rod. Excellent quality. Metallic semi reels and medium Action rods. No better way of kick-starting your fishing passion",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Assorted"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-19T13:51:51.662Z",
    "updatedAt": "2026-10-19T13:51:51.662Z"
  },
  {
    "id": "prod-1792418576361",
    "name": "Catfish circle hooks",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Hooks",
    "price": 300,
    "imageUrl": "/images/catalog/prod-1792418576361-1.webp",
    "images": [
      "/images/catalog/prod-1792418576361-1.webp",
      "/images/catalog/prod-1792418576361-2.webp",
      "/images/catalog/prod-1792418576361-3.webp",
      "/images/catalog/prod-1792418576361-4.webp",
      "/images/catalog/prod-1792418576361-5.webp",
      "/images/catalog/prod-1792418576361-6.webp",
      "/images/catalog/prod-1792418576361-7.webp"
    ],
    "badge": "",
    "description": "4pcs of catfish circle hooks at Ksh 300. Catches the Giants.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Hard steel"
      },
      {
        "label": "Key Feature",
        "value": "Size 4&5"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-19T14:02:56.361Z",
    "updatedAt": "2026-10-19T14:02:56.361Z"
  },
  {
    "id": "prod-1792418766717",
    "name": "Abu Garcia Bmax Sx spinning reel and baitcasters",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Reels",
    "price": 18500,
    "imageUrl": "/images/catalog/prod-1792418766717-1.webp",
    "images": [
      "/images/catalog/prod-1792418766717-1.webp",
      "/images/catalog/prod-1792418766717-2.webp",
      "/images/catalog/prod-1792418766717-3.webp"
    ],
    "badge": "",
    "description": "If you know you know.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Abu Garcia"
      },
      {
        "label": "Key Feature",
        "value": "Sx"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-19T14:06:06.717Z",
    "updatedAt": "2026-10-19T14:06:06.717Z"
  },
  {
    "id": "prod-1792693493935",
    "name": "Fishing Hat",
    "brand": "FishWithNelson",
    "category": "Other Gear",
    "subcategory": "Tackle",
    "price": 650,
    "imageUrl": "/images/catalog/prod-1792693493935-1.webp",
    "images": [
      "/images/catalog/prod-1792693493935-1.webp",
      "/images/catalog/prod-1792693493935-2.webp",
      "/images/catalog/prod-1792693493935-3.webp",
      "/images/catalog/prod-1792693493935-4.webp",
      "/images/catalog/prod-1792693493935-5.webp",
      "/images/catalog/prod-1792693493935-6.webp"
    ],
    "badge": "",
    "description": "Fishing jungle hat",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T18:24:53.935Z",
    "updatedAt": "2026-10-22T18:24:53.935Z"
  },
  {
    "id": "prod-1792764885060",
    "name": "Trout Lure s",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Lures",
    "price": 200,
    "imageUrl": "/images/catalog/prod-1792764885060-1.webp",
    "images": [
      "/images/catalog/prod-1792764885060-1.webp",
      "/images/catalog/prod-1792764885060-2.webp",
      "/images/catalog/prod-1792764885060-3.webp",
      "/images/catalog/prod-1792764885060-4.webp",
      "/images/catalog/prod-1792764885060-5.webp",
      "/images/catalog/prod-1792764885060-6.webp"
    ],
    "badge": "",
    "description": "Per packet of 5pcs",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Type",
        "value": "Tiny"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-23T14:14:45.060Z",
    "updatedAt": "2026-10-23T14:14:45.060Z"
  },
  {
    "id": "prod-1792765033173",
    "name": "J hooks for fishing",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Hooks",
    "price": 1200,
    "imageUrl": "/images/catalog/prod-1792765033173-1.webp",
    "images": [
      "/images/catalog/prod-1792765033173-1.webp",
      "/images/catalog/prod-1792765033173-2.webp",
      "/images/catalog/prod-1792765033173-3.webp",
      "/images/catalog/prod-1792765033173-4.webp"
    ],
    "badge": "Featured",
    "description": "A packet of 200 pcs of J hooks size 8 to size 14 hooks",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [],
    "published": true,
    "featured": true,
    "createdAt": "2026-10-23T14:17:13.173Z",
    "updatedAt": "2026-10-23T14:17:13.173Z"
  },
  {
    "id": "prod-1792765367882",
    "name": "Traditional Arrow and bow",
    "brand": "FishWithNelson",
    "category": "Other Gear",
    "subcategory": "Bow",
    "price": 3500,
    "imageUrl": "/images/catalog/prod-1792765367882-1.webp",
    "images": [
      "/images/catalog/prod-1792765367882-1.webp",
      "/images/catalog/prod-1792765367882-2.webp",
      "/images/catalog/prod-1792765367882-3.webp",
      "/images/catalog/prod-1792765367882-4.webp"
    ],
    "badge": "",
    "description": "Traditional 6 Sharp arrows and a strong wooden bow .",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-23T14:22:47.882Z",
    "updatedAt": "2026-10-23T14:22:47.882Z"
  },
  {
    "id": "prod-1792765518916",
    "name": "Sinkers or fishing weights",
    "brand": "FishWithNelson",
    "category": "Accessories",
    "subcategory": "Sinkers",
    "price": 100,
    "imageUrl": "/images/catalog/prod-1792765518916-1.webp",
    "images": [
      "/images/catalog/prod-1792765518916-1.webp",
      "/images/catalog/prod-1792765518916-2.webp",
      "/images/catalog/prod-1792765518916-3.webp"
    ],
    "badge": "",
    "description": "Fishing sinkers from 3grams sinkers to 10grams sinkers",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-23T14:25:18.916Z",
    "updatedAt": "2026-10-23T14:25:18.916Z"
  },
  {
    "id": "product-1791961702588",
    "name": "Daiwa crossfire LT",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 17500,
    "imageUrl": "/images/catalog/product-1791961702588-1.jpg",
    "images": [
      "/images/catalog/product-1791961702588-1.jpg"
    ],
    "badge": "",
    "description": "Lightweight reel for everyday fishing",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-17T12:27:24.418Z",
    "updatedAt": "2026-10-17T12:27:24.418Z"
  },
  {
    "id": "product-1791961847245",
    "name": "Penn Pursuit IV",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791961847245-1.jpg",
    "images": [
      "/images/catalog/product-1791961847245-1.jpg"
    ],
    "badge": "",
    "description": "Designed for saltwater use",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-17T13:20:58.750Z",
    "updatedAt": "2026-10-17T13:20:58.750Z"
  },
  {
    "id": "product-1791962301849",
    "name": "Shimano SLX",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962301849-1.jpg",
    "images": [
      "/images/catalog/product-1791962301849-1.jpg"
    ],
    "badge": "",
    "description": "Popular Low-profile baitcaster",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.095Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791962396617",
    "name": "Daiwa Tatula",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962396617-1.jpg",
    "images": [
      "/images/catalog/product-1791962396617-1.jpg"
    ],
    "badge": "",
    "description": "Designed for Controlled and accurate casting",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791962499985",
    "name": "Abu Garcia Max X",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962499985-1.jpg",
    "images": [
      "/images/catalog/product-1791962499985-1.jpg"
    ],
    "badge": "",
    "description": "Entry level baitcasting option",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791962596138",
    "name": "Penn Senator",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962596138-1.jpg",
    "images": [
      "/images/catalog/product-1791962596138-1.jpg"
    ],
    "badge": "",
    "description": "Used for heavy duty saltwater fishing",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791962751477",
    "name": "Shimano TLD",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962751477-1.jpg",
    "images": [
      "/images/catalog/product-1791962751477-1.jpg"
    ],
    "badge": "",
    "description": "Used for offshore trolling",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791962823333",
    "name": "Daiwa Sealine",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962823333-1.jpg",
    "images": [
      "/images/catalog/product-1791962823333-1.jpg"
    ],
    "badge": "",
    "description": "Used for boat fishing and trolling",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791962908959",
    "name": "Zebco 33",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791962908959-1.jpg",
    "images": [
      "/images/catalog/product-1791962908959-1.jpg"
    ],
    "badge": "",
    "description": "A well known closed-face reel",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791963000594",
    "name": "Zebco 202 imitation reel",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 5800,
    "imageUrl": "/images/catalog/product-1791963000594-1.jpg",
    "images": [
      "/images/catalog/product-1791963000594-1.jpg",
      "/images/catalog/product-1791963000594-2.webp",
      "/images/catalog/product-1791963000594-3.webp",
      "/images/catalog/product-1791963000594-4.webp",
      "/images/catalog/product-1791963000594-5.webp",
      "/images/catalog/product-1791963000594-6.webp",
      "/images/catalog/product-1791963000594-7.webp"
    ],
    "badge": "",
    "description": "Simple beginners fishing reel.  Zebco look alike.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:45:21.584Z",
    "updatedAt": "2026-10-22T10:45:21.584Z"
  },
  {
    "id": "product-1791963104860",
    "name": "Enclosed casting reel",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 5800,
    "imageUrl": "/images/catalog/product-1791963104860-1.webp",
    "images": [
      "/images/catalog/product-1791963104860-1.webp",
      "/images/catalog/product-1791963104860-2.jpg",
      "/images/catalog/product-1791963104860-3.webp",
      "/images/catalog/product-1791963104860-4.webp",
      "/images/catalog/product-1791963104860-5.webp",
      "/images/catalog/product-1791963104860-6.webp",
      "/images/catalog/product-1791963104860-7.webp"
    ],
    "badge": "",
    "description": "a spincast reel with an enclosed spool. Great for kids and adults easy to operate.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:35:13.916Z",
    "updatedAt": "2026-10-22T10:35:13.916Z"
  },
  {
    "id": "product-1791963689137",
    "name": "Minnow Lure. Jerk baits",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 600,
    "imageUrl": "/images/catalog/product-1791963689137-1.jpg",
    "images": [
      "/images/catalog/product-1791963689137-1.jpg",
      "/images/catalog/product-1791963689137-2.webp",
      "/images/catalog/product-1791963689137-3.webp",
      "/images/catalog/product-1791963689137-4.webp",
      "/images/catalog/product-1791963689137-5.webp",
      "/images/catalog/product-1791963689137-6.webp",
      "/images/catalog/product-1791963689137-7.webp"
    ],
    "badge": "",
    "description": "Predatory fish such as tuna in suitable offshore applications, barracuda, and freshwater game fish, depending on lure size and design",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:31:17.055Z",
    "updatedAt": "2026-10-22T10:31:17.055Z"
  },
  {
    "id": "product-1791963752893",
    "name": "spoon Lure",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 450,
    "imageUrl": "/images/catalog/product-1791963752893-1.jpg",
    "images": [
      "/images/catalog/product-1791963752893-1.jpg",
      "/images/catalog/product-1791963752893-2.webp",
      "/images/catalog/product-1791963752893-3.webp",
      "/images/catalog/product-1791963752893-4.webp"
    ],
    "badge": "",
    "description": "Heavy for Casting long distances and targeting predatory fish in fresh or salt water",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:28:57.874Z",
    "updatedAt": "2026-10-22T10:28:57.874Z"
  },
  {
    "id": "product-1791964366037",
    "name": "Soft plastic lures",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 200,
    "imageUrl": "/images/catalog/product-1791964366037-1.jpg",
    "images": [
      "/images/catalog/product-1791964366037-1.jpg",
      "/images/catalog/product-1791964366037-2.webp",
      "/images/catalog/product-1791964366037-3.webp",
      "/images/catalog/product-1791964366037-4.webp",
      "/images/catalog/product-1791964366037-5.webp"
    ],
    "badge": "",
    "description": "Bass, snapper, and other predatory fish when rigged appropriately.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:26:31.043Z",
    "updatedAt": "2026-10-22T10:26:31.041Z"
  },
  {
    "id": "product-1791964418315",
    "name": "Popper lures",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 400,
    "imageUrl": "/images/catalog/product-1791964418315-1.jpg",
    "images": [
      "/images/catalog/product-1791964418315-1.jpg"
    ],
    "badge": "",
    "description": "Best Top water lures for bass fishing and Surface-feeding fish, including trevally and other aggressive saltwater predators",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:23:08.982Z",
    "updatedAt": "2026-10-22T10:23:08.982Z"
  },
  {
    "id": "product-1791964487708",
    "name": "Metal Jig",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 500,
    "imageUrl": "/images/catalog/product-1791964487708-1.jpg",
    "images": [
      "/images/catalog/product-1791964487708-1.jpg"
    ],
    "badge": "",
    "description": "Shore jigging, offshore jigging, and targeting fish such as trevally, tuna, and kingfish.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:21:35.538Z",
    "updatedAt": "2026-10-22T10:21:35.538Z"
  },
  {
    "id": "product-1791964579538",
    "name": "spinner bait and inline spinner",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 500,
    "imageUrl": "/images/catalog/product-1791964579538-1.jpg",
    "images": [
      "/images/catalog/product-1791964579538-1.jpg",
      "/images/catalog/product-1791964579538-2.webp",
      "/images/catalog/product-1791964579538-3.webp"
    ],
    "badge": "",
    "description": "Mostly for freshwater predatory fish, though some inline spinners are also suitable for other environments.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:20:58.187Z",
    "updatedAt": "2026-10-22T10:20:58.187Z"
  },
  {
    "id": "product-1791964803078",
    "name": "Long nose Crankbait",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 400,
    "imageUrl": "/images/catalog/product-1791964803078-1.jpg",
    "images": [
      "/images/catalog/product-1791964803078-1.jpg",
      "/images/catalog/product-1791964803078-2.webp",
      "/images/catalog/product-1791964803078-3.webp",
      "/images/catalog/product-1791964803078-4.webp"
    ],
    "badge": "",
    "description": "Crankbaits are the best for Searching different water depths for predatory fish especially Bass fishing and ocean fishing lures.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:19:05.153Z",
    "updatedAt": "2026-10-22T10:19:05.153Z"
  },
  {
    "id": "product-1791964945388",
    "name": "Wacky Worms, senkos Stick Worm",
    "brand": "FishWithNelson",
    "category": "Artificial Lures",
    "subcategory": "Tackle",
    "price": 200,
    "imageUrl": "/images/catalog/product-1791964945388-1.webp",
    "images": [
      "/images/catalog/product-1791964945388-1.webp",
      "/images/catalog/product-1791964945388-2.jpg",
      "/images/catalog/product-1791964945388-3.webp",
      "/images/catalog/product-1791964945388-4.webp",
      "/images/catalog/product-1791964945388-5.webp",
      "/images/catalog/product-1791964945388-6.webp",
      "/images/catalog/product-1791964945388-7.webp",
      "/images/catalog/product-1791964945388-8.webp"
    ],
    "badge": "",
    "description": "They are popular soft baits primarily used in freshwater bass fishing, most frequently rigged weightless, as a Texas rig, or as a Wacky rig to produce a fluttering, lifelike shimmy as they sink.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:15:19.395Z",
    "updatedAt": "2026-10-22T10:15:19.395Z"
  },
  {
    "id": "product-1791968844705",
    "name": "Crankbait circle hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791968844705-1.jpg",
    "images": [
      "/images/catalog/product-1791968844705-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791968893682",
    "name": "octopus hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791968893682-1.jpg",
    "images": [
      "/images/catalog/product-1791968893682-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791968950840",
    "name": "Offset Shank Worm EWG hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791968950840-1.jpg",
    "images": [
      "/images/catalog/product-1791968950840-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791968992563",
    "name": "Decoy Ringed hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791968992563-1.jpg",
    "images": [
      "/images/catalog/product-1791968992563-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791969115364",
    "name": "EWG lightwire worm hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791969115364-1.jpg",
    "images": [
      "/images/catalog/product-1791969115364-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791969147273",
    "name": "Mondo EWG hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791969147273-1.jpg",
    "images": [
      "/images/catalog/product-1791969147273-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791969201725",
    "name": "Monster Hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791969201725-1.jpg",
    "images": [
      "/images/catalog/product-1791969201725-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791969255429",
    "name": "Bass hooks for senkos and wacky worms",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Hooks",
    "price": 100,
    "imageUrl": "/images/catalog/product-1791969255429-1.jpg",
    "images": [
      "/images/catalog/product-1791969255429-1.jpg",
      "/images/catalog/product-1791969255429-2.webp",
      "/images/catalog/product-1791969255429-3.webp"
    ],
    "badge": "",
    "description": "When you want to do a weedless Texas rig this is the Hook to purchase.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:10:42.095Z",
    "updatedAt": "2026-10-22T10:10:42.095Z"
  },
  {
    "id": "product-1791969298143",
    "name": "Treble Round Hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 40,
    "imageUrl": "/images/catalog/product-1791969298143-1.jpg",
    "images": [
      "/images/catalog/product-1791969298143-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-22T10:07:30.279Z"
  },
  {
    "id": "product-1791969338748",
    "name": "Treble catfish Hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 40,
    "imageUrl": "/images/catalog/product-1791969338748-1.jpg",
    "images": [
      "/images/catalog/product-1791969338748-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-22T10:07:01.558Z"
  },
  {
    "id": "product-1791969391068",
    "name": "Jig Hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 50,
    "imageUrl": "/images/catalog/product-1791969391068-1.jpg",
    "images": [
      "/images/catalog/product-1791969391068-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-22T10:06:48.683Z"
  },
  {
    "id": "product-1791969430933",
    "name": "Jig head Hook",
    "brand": "FishWithNelson",
    "category": "Hooks & Terminal",
    "subcategory": "Tackle",
    "price": 50,
    "imageUrl": "/images/catalog/product-1791969430933-1.jpg",
    "images": [
      "/images/catalog/product-1791969430933-1.jpg"
    ],
    "badge": "",
    "description": "Jighead hooks, strong and silver",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:06:26.043Z",
    "updatedAt": "2026-10-22T10:06:26.043Z"
  },
  {
    "id": "product-1791969669010",
    "name": "Spinning  rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791969669010-1.jpg",
    "images": [
      "/images/catalog/product-1791969669010-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791969681286",
    "name": "Spinning  rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791969681286-1.jpg",
    "images": [
      "/images/catalog/product-1791969681286-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791969698001",
    "name": "Spinning  rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791969698001-1.jpg",
    "images": [
      "/images/catalog/product-1791969698001-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791970973768",
    "name": "Casting  rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791970973768-1.jpg",
    "images": [
      "/images/catalog/product-1791970973768-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791970992294",
    "name": "Casting  rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791970992294-1.jpg",
    "images": [
      "/images/catalog/product-1791970992294-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971004222",
    "name": "Casting  rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971004222-1.jpg",
    "images": [
      "/images/catalog/product-1791971004222-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971058545",
    "name": "Boat and trolling rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971058545-1.jpg",
    "images": [
      "/images/catalog/product-1791971058545-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971073848",
    "name": "Boat and trolling rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971073848-1.jpg",
    "images": [
      "/images/catalog/product-1791971073848-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971086875",
    "name": "Boat and trolling rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971086875-1.jpg",
    "images": [
      "/images/catalog/product-1791971086875-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971101081",
    "name": "Boat and trolling rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971101081-1.jpg",
    "images": [
      "/images/catalog/product-1791971101081-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971146074",
    "name": "Telescopic rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971146074-1.jpg",
    "images": [
      "/images/catalog/product-1791971146074-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971166530",
    "name": "Telescopic rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971166530-1.jpg",
    "images": [
      "/images/catalog/product-1791971166530-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971209846",
    "name": "Telescopic rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971209846-1.jpg",
    "images": [
      "/images/catalog/product-1791971209846-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971222703",
    "name": "Telescopic rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971222703-1.jpg",
    "images": [
      "/images/catalog/product-1791971222703-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971426055",
    "name": "Fly rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971426055-1.jpg",
    "images": [
      "/images/catalog/product-1791971426055-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971439523",
    "name": "Fly rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971439523-1.jpg",
    "images": [
      "/images/catalog/product-1791971439523-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971463495",
    "name": "Fly rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971463495-1.jpg",
    "images": [
      "/images/catalog/product-1791971463495-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791971485629",
    "name": "Fly rod",
    "brand": "FishWithNelson",
    "category": "Fishing Rods",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/product-1791971485629-1.jpg",
    "images": [
      "/images/catalog/product-1791971485629-1.jpg"
    ],
    "badge": "",
    "description": "",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  },
  {
    "id": "product-1791972219470",
    "name": "Landing Net / scooping net",
    "brand": "FishWithNelson",
    "category": "Nets & Landing Gear",
    "subcategory": "Tackle",
    "price": 1600,
    "imageUrl": "/images/catalog/product-1791972219470-1.jpg",
    "images": [
      "/images/catalog/product-1791972219470-1.jpg"
    ],
    "badge": "",
    "description": "1 meter Long landing net. Good for all types of fresh water fish.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Strong",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:05:25.290Z",
    "updatedAt": "2026-10-22T10:05:25.290Z"
  },
  {
    "id": "product-1791972273018",
    "name": "Fish landing Net /scoop net",
    "brand": "FishWithNelson",
    "category": "Nets & Landing Gear",
    "subcategory": "Tackle",
    "price": 2300,
    "imageUrl": "/images/catalog/product-1791972273018-1.jpg",
    "images": [
      "/images/catalog/product-1791972273018-1.jpg"
    ],
    "badge": "",
    "description": "This is a trout specific landing or scoop net. Strong for highland fish.",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-22T10:03:37.368Z",
    "updatedAt": "2026-10-22T10:03:37.368Z"
  },
  {
    "id": "rod-muriyu-zhb-540",
    "name": "Shimano Sienna",
    "brand": "FishWithNelson",
    "category": "Fishing Reels",
    "subcategory": "Tackle",
    "price": 0,
    "imageUrl": "/images/catalog/rod-muriyu-zhb-540-1.jpg",
    "images": [
      "/images/catalog/rod-muriyu-zhb-540-1.jpg"
    ],
    "badge": "",
    "description": "suitable for general-purpose fishing",
    "application": "",
    "waterType": "Versatile",
    "targetSpecies": [],
    "specs": [
      {
        "label": "Details",
        "value": "Verified Gear"
      }
    ],
    "published": true,
    "featured": false,
    "createdAt": "2026-10-27T13:04:14.096Z",
    "updatedAt": "2026-10-27T13:04:14.096Z"
  }
];
