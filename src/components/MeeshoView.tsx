import { useState, useMemo } from 'react';
import { Search, ShoppingCart, Star, ArrowLeft, Check, CheckCircle2, ShieldCheck, Truck, RefreshCw, X } from 'lucide-react';

interface MeeshoProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  delivery: string;
  sizes: string[];
  mTrusted: boolean;
  reviewsList: { user: string; rating: number; text: string }[];
}

const BASE_PRODUCTS: MeeshoProduct[] = [
  {
    id: "m1",
    title: "Enchanting Multi-Color Georgette Printed Kurta Set with Dupatta",
    category: "Kurtis Set",
    price: 349,
    originalPrice: 899,
    discount: 61,
    rating: 4.2,
    reviews: 2489,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["S", "M", "L", "XL", "XXL"],
    mTrusted: true,
    reviewsList: [
      { user: "Priya Sharma", rating: 5, text: "Very nice fabric, soft georgette. Worth the price!" },
      { user: "Sheetal K.", rating: 4, text: "Fitting is perfect, color is slightly dark but looks classy" },
      { user: "Anjali Gupta", rating: 5, text: "Highly recommended, received so many compliments." }
    ]
  },
  {
    id: "m2",
    title: "Trendy Women Traditional Banarasi Litchi Silk Saree with Blouse Piece",
    category: "Sarees",
    price: 499,
    originalPrice: 1599,
    discount: 68,
    rating: 4.1,
    reviews: 5824,
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["Free Size"],
    mTrusted: true,
    reviewsList: [
      { user: "Nisha Patel", rating: 4, text: "Beautiful saree. Shining is very elegant." },
      { user: "Sunita G.", rating: 5, text: "Value for money. Soft shine, good for gift." }
    ]
  },
  {
    id: "m3",
    title: "Professional Makeup Brush Set of 12 with Designer Travel Case Pouch",
    category: "Makeup & Beauty",
    price: 199,
    originalPrice: 499,
    discount: 60,
    rating: 4.3,
    reviews: 1045,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["Regular Size"],
    mTrusted: false,
    reviewsList: [
      { user: "Sneha Nair", rating: 5, text: "Brushes are very soft! Beautiful pink color case." },
      { user: "Meera Das", rating: 4, text: "Good product in this budget. Easy to carry." }
    ]
  },
  {
    id: "m4",
    title: "Elegant Gold-Plated Kundan & Pearl Traditional Choker Necklace Set",
    category: "Jewellery",
    price: 279,
    originalPrice: 999,
    discount: 72,
    rating: 4.4,
    reviews: 3120,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["Adjustable"],
    mTrusted: true,
    reviewsList: [
      { user: "Divya R.", rating: 5, text: "Extremely gorgeous! Best for wedding season." },
      { user: "Kajal Pathak", rating: 4, text: "Finishing is very fine. Beautiful design." }
    ]
  },
  {
    id: "m5",
    title: "Ultralight Women Comfort Memory-Foam Walking Shoes / Casual Sneakers",
    category: "Footwear",
    price: 389,
    originalPrice: 999,
    discount: 61,
    rating: 4.0,
    reviews: 890,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery + Cash on Delivery",
    sizes: ["3", "4", "5", "6", "7", "8"],
    mTrusted: false,
    reviewsList: [
      { user: "Pooja Roy", rating: 4, text: "Very soft comfort. Good for daily walking." },
      { user: "Ritu Verma", rating: 4, text: "Light weight, fits well. Super quality." }
    ]
  },
  {
    id: "m6",
    title: "Premium 3-Piece Non-Stick Cooking Kadai and Fry Pan Set",
    category: "Kitchen & Home",
    price: 449,
    originalPrice: 1299,
    discount: 65,
    rating: 4.2,
    reviews: 1432,
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["Standard Set"],
    mTrusted: true,
    reviewsList: [
      { user: "Aarati J.", rating: 5, text: "Very good non stick set. Easy to wash." },
      { user: "Meena Gupta", rating: 4, text: "Using since one week, works great." }
    ]
  },
  {
    id: "m7",
    title: "Stylish Floral Print Rayon A-Line Long Maxi Dress for Women",
    category: "Western Wear",
    price: 299,
    originalPrice: 799,
    discount: 62,
    rating: 4.1,
    reviews: 1540,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["S", "M", "L", "XL"],
    mTrusted: true,
    reviewsList: [
      { user: "Neha S.", rating: 5, text: "Very pretty gown! Cloth is premium rayon." }
    ]
  },
  {
    id: "m8",
    title: "Latest Matte Waterproof Long Lasting Lipstick - Combo Set of 4",
    category: "Makeup & Beauty",
    price: 149,
    originalPrice: 399,
    discount: 62,
    rating: 4.2,
    reviews: 978,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600",
    delivery: "Free Delivery",
    sizes: ["Set of 4"],
    mTrusted: false,
    reviewsList: [
      { user: "Ananya K.", rating: 5, text: "Beautiful shades! Fits nicely, not dry at all." }
    ]
  }
];

const ADJECTIVES = [
  "Premium", "Designer", "Classic", "Trendy", "Luxury", "Elegant", "Gorgeous", 
  "Daily-Wear", "Fancy", "Royal", "Super-Soft", "Handcrafted", "Chic", "Ultra", 
  "Modern", "Festive", "Exclusive", "Vintage", "Beautiful", "Smart", "New-Style",
  "Fabulous", "Exquisite", "Stylish", "Comfortable", "Traditional", "Indo-Western"
];

const BRANDS = [
  "Zaza Fashion", "Shree Balaji", "Komal Art", "Varni Creation", "Anushka Fab", 
  "GlowUp Jewels", "Metro Style", "KitchenSutra", "Femina Silk", "StyleCo", 
  "Elegance Hub", "Aura Designs", "Kundan Palace", "FeetJoy", "Aadhya Fab"
];

const CATEGORY_IMAGE_IDS: Record<string, string[]> = {
  "Kurtis Set": [
    "photo-1610030469983-98e550d6193c",
    "photo-1631857455684-a54a2f03665f",
    "photo-1625937402360-1e5b8712a806",
    "photo-1608748323409-3221c1724ac1",
    "photo-1609357605129-26f69add5d6e",
    "photo-1630045053424-69b7eb97d4b4",
    "photo-1611756578033-c7dc4fa7dd74",
    "photo-1634141510639-d691d86f47be",
    "photo-1610030469507-6bbce3debc67",
    "photo-1614088717887-faec5b3693fb",
    "photo-1610030469584-3c9f285a9df4",
    "photo-1624313511475-4309f4d38bf0",
    "photo-1614088785317-06ac96efeeab",
    "photo-1621085023908-c8bc9cb07ed8",
    "photo-1612712271812-70b1348beeee",
    "photo-1628144458872-dd34d9894f72"
  ],
  "Sarees": [
    "photo-1610030469668-93535c17b6b3",
    "photo-1610030470034-367dc3b999fb",
    "photo-1610030470004-9ba0b47116cb",
    "photo-1610030469600-b61cb85ae7e8",
    "photo-1621184455862-c163dfb30e0f",
    "photo-1617627143750-d86bc21e42bb",
    "photo-1583391733956-3750e0ff4e8b",
    "photo-1610030469584-3c9f285a9df4",
    "photo-1605721911519-3dfeb3be25e7",
    "photo-1596783074918-c84cb06531ca",
    "photo-1610030469983-98e550d6193c",
    "photo-1609357605129-26f69add5d6e",
    "photo-1631857455684-a54a2f03665f",
    "photo-1625937402360-1e5b8712a806",
    "photo-1608748323409-3221c1724ac1",
    "photo-1630045053424-69b7eb97d4b4",
    "photo-1611756578033-c7dc4fa7dd74"
  ],
  "Western Wear": [
    "photo-1595777457583-95e059d581b8",
    "photo-1490481651871-ab68de25d43d",
    "photo-1539109136881-3be0616acf4b",
    "photo-1496747611176-843222e1e57c",
    "photo-1509631179647-0177331693ae",
    "photo-1554412933-514a83d2f3c8",
    "photo-1434389677669-e08b4cac3105",
    "photo-1485968579580-b6d095142e6e",
    "photo-1515886657613-9f3515b0c78f",
    "photo-1529139574466-a303027c1d8b",
    "photo-1609149091993-875ef213a890",
    "photo-1512436991641-6745cdb1723f",
    "photo-1571513722275-4b41940f54b8"
  ],
  "Jewellery": [
    "photo-1599643478518-a784e5dc4c8f",
    "photo-1535632066927-ab7c9ab60908",
    "photo-1617038260897-41a1f14a8ca0",
    "photo-1599643477877-530eb83abc8e",
    "photo-1605100804763-247f67b3557e",
    "photo-1602751584552-8ba73aad10e1",
    "photo-1601121141461-9d6647bca1ed",
    "photo-1611085583191-a3b1a1a27d81",
    "photo-1611591437281-460bfbe1220a",
    "photo-1515562141207-7a88fb7ce338",
    "photo-1590548784585-645d2b63452d",
    "photo-1569397240114-11ef8d7e68cf"
  ],
  "Makeup & Beauty": [
    "photo-1522335789203-aabd1fc54bc9",
    "photo-1586495777744-4413f21062fa",
    "photo-1512496015851-a90fb38ba796",
    "photo-1596462502278-27bfdc403348",
    "photo-1612817288484-6f916006741a",
    "photo-1608248597481-496100c80836",
    "photo-1515688594390-b649af70d282",
    "photo-1526413232643-8af7907db09d",
    "photo-1616683693504-3ea7e9ad6fec",
    "photo-1620916566398-39f1143ab7be",
    "photo-1512495976824-f75373bec313"
  ],
  "Footwear": [
    "photo-1543163521-1bf539c55dd2",
    "photo-1595950653106-6c9ebd614d3a",
    "photo-1603808033192-082d49f3477a",
    "photo-1608231387042-66d1773070a5",
    "photo-1607522370275-f14206abe5d3",
    "photo-1600185365483-26d7a4cc7519",
    "photo-1560343090-f0409e92791a",
    "photo-1539185441755-769473a23570",
    "photo-1542291026-7eec264c27ff",
    "photo-1549298916-b41d501d3772",
    "photo-1549298916-b5250724bf05",
    "photo-1525966222434-6ad5334de341"
  ],
  "Kitchen & Home": [
    "photo-1584269600464-37b1b58a9fe7",
    "photo-1618220179428-22790b461013",
    "photo-1588854337236-6889d631faa8",
    "photo-1556911220-e15b29be8c8f",
    "photo-1600585154340-be6161a56a0c",
    "photo-1520981302911-f12a3263c8f6",
    "photo-1530606901309-c83fa1ec296f",
    "photo-1610701596007-11502861dcfa",
    "photo-1600607687939-ce8a6c25118c",
    "photo-1507089947368-19c1da9775ae",
    "photo-1513694203232-719a280e022f",
    "photo-1513519245088-0e12902e5a38"
  ]
};

const generateProducts = (): MeeshoProduct[] => {
  const result: MeeshoProduct[] = [];
  
  // First include all 8 base products directly
  BASE_PRODUCTS.forEach((p, idx) => {
    result.push({ ...p, id: `base-${idx}` });
  });

  // Now dynamically create up to 165 products to populate the shelves
  let counter = 1;
  while (result.length < 165) {
    const baseProd = BASE_PRODUCTS[counter % BASE_PRODUCTS.length];
    const adj = ADJECTIVES[counter % ADJECTIVES.length];
    const brand = BRANDS[(counter + 3) % BRANDS.length];
    
    // Modify titles so they are unique and natural sounding
    let newTitle = "";
    if (counter % 4 === 0) {
      newTitle = `${adj} ${baseProd.title} by ${brand}`;
    } else if (counter % 4 === 1) {
      newTitle = `New Launch: ${adj} ${baseProd.title}`;
    } else if (counter % 4 === 2) {
      newTitle = `Special Pack: ${baseProd.title} (${brand})`;
    } else {
      newTitle = `Trending ${adj} Series: ${baseProd.title}`;
    }
    
    // Add realistic randomized prices with standard retail endings (.e.g., 49, 79, 99)
    const priceShift = ((counter * 13) % 151) - 75; // -75 to +75 Price shift
    let newPrice = Math.max(99, baseProd.price + priceShift);
    
    const endings = [49, 79, 89, 99];
    const currentEnding = newPrice % 100;
    const closestEnding = endings.reduce((prev, curr) => 
      Math.abs(curr - currentEnding) < Math.abs(prev - currentEnding) ? curr : prev
    );
    newPrice = Math.floor(newPrice / 100) * 100 + closestEnding;

    const originalPrice = Math.floor(newPrice * (2 + (counter % 3) * 0.4));
    const discount = Math.round(((originalPrice - newPrice) / originalPrice) * 100);
    const rating = Math.round((3.8 + (counter % 13) * 0.1) * 10) / 10;
    const reviews = Math.floor(baseProd.reviews * (0.2 + (counter % 5) * 0.3)) + 19;

    // Retrieve category-specific unique photo ID if available
    let dynamicImage = baseProd.image;
    const categoryList = CATEGORY_IMAGE_IDS[baseProd.category];
    if (categoryList && categoryList.length > 0) {
      const selectedId = categoryList[counter % categoryList.length];
      dynamicImage = `https://images.unsplash.com/${selectedId}?auto=format&fit=crop&q=80&w=600`;
    }

    result.push({
      id: `gen-${counter}`,
      title: newTitle,
      category: baseProd.category,
      price: newPrice,
      originalPrice: originalPrice,
      discount: discount,
      rating: Math.min(5.0, rating),
      reviews: reviews,
      image: dynamicImage,
      delivery: baseProd.delivery,
      sizes: baseProd.sizes,
      mTrusted: (counter % 3 === 0),
      reviewsList: [...baseProd.reviewsList]
    });
    
    counter++;
  }
  return result;
};

const MEESHO_PRODUCTS = generateProducts();

const CATEGORIES = ["All", "Kurtis Set", "Sarees", "Western Wear", "Jewellery", "Makeup & Beauty", "Footwear", "Kitchen & Home"];

interface MeeshoViewProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export default function MeeshoView({ onClose, isDarkMode }: MeeshoViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: MeeshoProduct; quantity: number; selectedSize: string }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MeeshoProduct | null>(null);
  const [activeSize, setActiveSize] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return MEESHO_PRODUCTS.filter(prod => {
      const matchCat = selectedCategory === "All" || prod.category === selectedCategory;
      const matchSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleProductClick = (prod: MeeshoProduct) => {
    setSelectedProduct(prod);
    setActiveSize(prod.sizes[0] || "");
  };

  const addToCart = (prod: MeeshoProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === prod.id && item.selectedSize === activeSize);
      if (existing) {
        return prev.map(item => item.product.id === prod.id && item.selectedSize === activeSize 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { product: prod, quantity: 1, selectedSize: activeSize }];
    });
    // Visual alert / Toast
    alert(`Added to Cart: ${prod.title} (Size: ${activeSize})`);
  };

  const handleRemoveFromCart = (prodId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === prodId && item.selectedSize === size)));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartMrpTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.originalPrice * item.quantity), 0);
  }, [cart]);

  return (
    <div className="fixed inset-0 z-[999] bg-white text-slate-800 font-sans flex flex-col h-full overflow-hidden select-text cursor-default">
      {/* MEESHO HEADER */}
      <header className="bg-white border-b border-rose-100 px-4 py-2.5 flex flex-col gap-2 shrink-0 shadow-sm relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-rose-50 rounded-full transition-colors text-slate-600 focus:outline-none"
              title="Back"
            >
              <ArrowLeft size={22} className="stroke-[2.5]" />
            </button>
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-[#e71d7c] tracking-tight lowercase">meesho</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1.5 hidden sm:inline uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded">India's Lowest Prices</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Back to Secret Trigger - hidden but visible for user */}
            <span 
              onClick={onClose}
              className="text-[9px] font-sans text-neutral-400 border border-neutral-200 rounded px-1.5 py-1 uppercase tracking-tighter opacity-10 hover:opacity-100 cursor-pointer transition-opacity"
              title="Secret Exit"
            >
              Back to study
            </span>

            <button 
              onClick={() => setShowCart(true)} 
              className="relative p-2 hover:bg-rose-50 rounded-full text-slate-700 transition"
              aria-label="View Cart"
            >
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e71d7c] text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SEARCH BAR (ACTUAL FILTERS) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pr-3 pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search by Product, Category or Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#e71d7c] focus:bg-white focus:ring-1 focus:ring-[#e71d7c] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 inset-y-0 text-xs font-bold text-[#e71d7c] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* HORIZONTAL CATEGORIES ROW */}
      <div className="bg-white border-b border-slate-100 flex items-center gap-2 px-4 py-2 overflow-x-auto shrink-0 select-none scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-bold rounded-full transition-all tracking-wider ${selectedCategory === cat ? 'bg-[#e71d7c] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MAIN VIEW AREA (SCROLLABLE PRODUCTS) */}
      <div className="flex-1 overflow-y-auto bg-slate-50" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* SALE HERO PROMO */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 flex justify-between items-center relative overflow-hidden select-none">
          <div className="z-10 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded font-mono">LIVE NOW</span>
              <span className="text-xs uppercase font-extrabold tracking-widest opacity-90">MAHA INDIAN SAVING SALE</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Deals Starting from ₹99 + Free Delivery</h2>
            <p className="text-[10px] opacity-80">Free COD • 7 Days Easy Returns • Premium Quality Sellers</p>
          </div>
          <div className="absolute right-2 opacity-15 transform rotate-12 scale-150">
            <ShoppingCart size={110} strokeWidth={1} />
          </div>
        </div>

        {/* INFORMATIVE TRUST METRICS BAR */}
        <div className="bg-white px-4 py-2 flex justify-between items-center border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1"><Truck size={12} className="text-[#e71d7c]" /> Free Delivery</span>
          <span className="flex items-center gap-1"><RefreshCw size={12} className="text-[#e71d7c]" /> 7-Day Easy Returns</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-[#e71d7c]" /> Cash On Delivery</span>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-semibold text-slate-400 mb-1">No products found matching "{searchQuery}"</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="text-[#e71d7c] font-bold text-xs hover:underline uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id} 
                onClick={() => handleProductClick(prod)}
                className="bg-white rounded-lg border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group"
              >
                {/* Product Image */}
                <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden shrink-0">
                  <img 
                    src={prod.image} 
                    alt={prod.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {prod.mTrusted && (
                    <span className="absolute top-2 left-2 bg-[#e71d7c] text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide font-sans shadow shadow-rose-900/25">
                      M-Trusted
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-slate-600 line-clamp-2 leading-snug font-medium group-hover:text-slate-900 transition-colors mb-1">
                      {prod.title}
                    </h3>
                    
                    {/* Price & Discount */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-slate-900 font-sans">₹{prod.price}</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{prod.originalPrice}</span>
                      <span className="text-[10px] text-green-600 font-black tracking-tight">{prod.discount}% off</span>
                    </div>

                    <p className="text-[9px] text-slate-450 text-slate-500 mt-1 font-bold">{prod.delivery}</p>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="bg-green-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      {prod.rating} <Star size={8} className="fill-white stroke-none" />
                    </span>
                    <span className="text-[10px] text-slate-400">({prod.reviews})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT DETAILS DIALOG OVERLAY */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[1010] bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg sm:rounded-xl shadow-2xl flex flex-col h-[90vh] sm:h-auto max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50 shrink-0">
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">Product Details</span>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="aspect-[4/5] w-full bg-slate-150">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-4 space-y-4">
                {/* Title & Price */}
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900 leading-snug">
                    {selectedProduct.title}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#e71d7c]">₹{selectedProduct.price}</span>
                    <span className="text-xs text-slate-405 line-through text-slate-400">₹{selectedProduct.originalPrice}</span>
                    <span className="text-xs text-green-600 font-extrabold">{selectedProduct.discount}% Off</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold bg-green-50 text-green-700 px-2 py-1 rounded inline-block">
                    {selectedProduct.delivery}
                  </p>
                </div>

                {/* Sizing Select */}
                <div className="border-t pt-3 border-dashed border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Size</span>
                  <div className="flex gap-2.5 flex-wrap">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setActiveSize(size)}
                        className={`min-w-10 h-10 border text-xs font-bold rounded-lg flex items-center justify-center transition-all ${activeSize === size ? 'border-[#e71d7c] bg-[#e71d7c]/5 text-[#e71d7c] ring-1 ring-[#e71d7c]' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust/Guarantee checklist */}
                <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 border border-slate-100">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-600" /> Free Shipping</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-600" /> Cash on Delivery</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-600" /> 7 Days Returns</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-600" /> Lowest Prices</span>
                </div>

                {/* Customer Reviews panel */}
                <div className="border-t pt-3 border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Customer Chat Reviews</span>
                  <div className="space-y-3">
                    {selectedProduct.reviewsList.map((rev, i) => (
                      <div key={i} className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-700">{rev.user}</span>
                          <span className="bg-green-600 text-white font-extrabold text-[9px] px-1 rounded flex items-center">
                            {rev.rating} ★
                          </span>
                        </div>
                        <p className="text-slate-600">"{rev.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="border-t border-slate-100 p-4 bg-white shrink-0 flex gap-3">
              <button
                type="button"
                onClick={() => addToCart(selectedProduct)}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold py-3 rounded-lg text-center shadow-lg shadow-rose-200 uppercase tracking-wider text-xs md:text-sm"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setShowCart(true);
                  setSelectedProduct(null);
                }}
                className="flex-1 bg-rose-50 border border-rose-200 text-[#e71d7c] font-extrabold py-3 rounded-lg text-center uppercase tracking-wider text-xs md:text-sm hover:bg-rose-100"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER OVERLAY */}
      {showCart && (
        <div className="fixed inset-0 z-[1010] bg-black/60 fallback-backdrop-blur flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left">
            {/* Header */}
            <div className="border-b border-rose-100 px-4 py-4 flex justify-between items-center bg-rose-50/30 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#e71d7c]" />
                <span className="font-bold font-sans text-sm uppercase tracking-wide text-slate-700">Your Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              </div>
              <button onClick={() => setShowCart(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Cart body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {orderPlaced ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 text-green-550 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce">
                    <Check size={36} className="stroke-[3]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Order Request Placed Successfully!</h3>
                  <p className="text-xs text-slate-450 leading-relaxed text-slate-500">Your Order has been sent for packaging. Cash on Delivery is selected by default.</p>
                  <button 
                    onClick={() => {
                      setCart([]);
                      setOrderPlaced(false);
                      setShowCart(false);
                    }}
                    className="w-full bg-[#e71d7c] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-90"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                  <p className="text-sm font-semibold text-slate-400 mb-2">Your shopping cart is flat empty.</p>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="text-[#e71d7c] font-black uppercase text-xs hover:underline tracking-widest"
                  >
                    Explore Trendy Collections
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <img 
                        src={item.product.image} 
                        alt={item.product.title} 
                        className="w-16 aspect-[4/5] object-cover rounded-md bg-slate-150 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 truncate">{item.product.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                        </div>
                        <div className="flex justify-between items-baseline mt-2">
                          <span className="text-sm font-bold text-[#e71d7c]">₹{item.product.price * item.quantity}</span>
                          <button 
                            onClick={() => handleRemoveFromCart(item.product.id, item.selectedSize)}
                            className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pricing Breakdown Card */}
                  <div className="border-t border-dashed pt-4 space-y-2 border-slate-300">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Price Details</h4>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Total Product Price (MRP)</span>
                        <span className="line-through text-slate-400">₹{cartMrpTotal}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Product Discount</span>
                        <span>- ₹{cartMrpTotal - cartTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="text-green-600 font-extrabold uppercase text-[10px]">FREE</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-slate-950 border-t pt-2 mt-1">
                        <span>Grand Total Value</span>
                        <span>₹{cartTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer and checkout */}
            {!orderPlaced && cart.length > 0 && (
              <div className="border-t border-slate-100 p-4 bg-white shrink-0 text-slate-800">
                <p className="text-[10px] text-slate-500 leading-tight mb-3 text-center">By continuing, you agree that this order will be delivered with India Post Cash-on-Delivery.</p>
                <button
                  type="button"
                  onClick={() => setOrderPlaced(true)}
                  className="w-full bg-[#e71d7c] hover:bg-[#c91268] text-white font-extrabold py-3 rounded-lg text-center shadow-lg shadow-rose-200 uppercase tracking-widest text-xs md:text-sm transition-all"
                >
                  Place Cash-on-Delivery Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
