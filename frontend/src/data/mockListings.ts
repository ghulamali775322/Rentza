export interface Listing {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  image: string;
}

export const MOCK_LISTINGS: Listing[] = [
  // --- CARS (6 Items) ---
  { id: 1, title: "Toyota Corolla 2021", category: "Cars", price: "PKR 11,000", location: "Lahore", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300",  },
  { id: 2, title: "Honda Civic 2022", category: "Cars", price: "PKR 35,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1594070319944-7c0cbebb6f58?q=80&w=300",  },
  { id: 3, title: "Suzuki Alto VXR", category: "Cars", price: "PKR 18,000", location: "Rawalpindi", image: "https://images.unsplash.com/photo-1624428911304-0245ec2ba09a?q=80&w=300", },
  { id: 4, title: "Kia Sportage 2020", category: "Cars", price: "PKR 9,000", location: "Karachi", image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=300",  },
  { id: 5, title: "Hyundai Tucson", category: "Cars", price: "PKR 12,000", location: "Lahore", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300",  },
  { id: 6, title: "Suzuki Cultus 2019", category: "Cars", price: "PKR 35,00", location: "Multan", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300", },

  // --- BIKES (6 Items) ---
  { id: 7, title: "Yamaha YBR 125", category: "Bikes", price: "PKR 12,000", location: "Karachi", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300",  },
  { id: 8, title: "Honda CG 125", category: "Bikes", price: "PKR 11,000", location: "Lahore", image: "https://images.unsplash.com/photo-1694612976980-7d2384636cd1?q=80&w=300", },
  { id: 9, title: "Suzuki GS 150", category: "Bikes", price: "PKR 5,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1605177848615-4da1d95ff03b?q=80&w=300", },
  { id: 10, title: "Super Power 70cc", category: "Bikes", price: "PKR 8,000", location: "Faisalabad", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300",  },
  { id: 11, title: "Kawasaki Ninja", category: "Bikes", price: "PKR 7,000", location: "Lahore", image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=300", },
  { id: 12, title: "Heavy Bike 500cc", category: "Bikes", price: "PKR 6,000", location: "Rawalpindi", image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=300", },

  // --- MOBILE PHONES (6 Items) ---
  { id: 13, title: "iPhone 14 Pro Max", category: "Mobile Phones", price: "PKR 3,000", location: "Lahore", image: "https://images.unsplash.com/photo-1680266985445-84ee90d29ba8?q=80&w=300",  },
  { id: 14, title: "Samsung S23 Ultra", category: "Mobile Phones", price: "PKR 25,00", location: "Karachi", image: "https://images.unsplash.com/photo-1709744722656-9b850470293f?q=80&w=300",  },
  { id: 15, title: "Google Pixel 7", category: "Mobile Phones", price: "PKR 3,500", location: "Islamabad", image: "https://images.unsplash.com/photo-1669888940542-bf597f76ef39?q=80&w=300",  },
  { id: 16, title: "Xiaomi Redmi Note 12", category: "Mobile Phones", price: "PKR 2,000", location: "Multan", image: "https://images.unsplash.com/photo-1568171284620-57dc85d9f210?q=80&w=300",  },
  { id: 17, title: "OnePlus 11", category: "Mobile Phones", price: "PKR 5,000", location: "Lahore", image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=300", },
  { id: 18, title: "iPhone X (Used)", category: "Mobile Phones", price: "PKR 4,000", location: "Peshawar", image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300", },

  // --- BICYCLES (6 Items) ---
  { id: 19, title: "Phoenix Mountain Bike", category: "Bicycles", price: "PKR 9,000", location: "Lahore", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=300",  },
  { id: 20, title: "Sohrab Cycle", category: "Bicycles", price: "PKR 5,000", location: "Faisalabad", image: "https://images.unsplash.com/photo-1672115905370-bea7eefba6a3?q=80&w=300", },
  { id: 21, title: "Kids BMW Cycle", category: "Bicycles", price: "PKR 4,000", location: "Karachi", image: "https://images.unsplash.com/photo-1638381226228-05c259a06086?q=80&w=300", },
  { id: 22, title: "Sports Racing Cycle", category: "Bicycles", price: "PKR 10,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=300", },
  { id: 23, title: "Imported Fat Tire Bike", category: "Bicycles", price: "PKR 12,000", location: "Rawalpindi", image: "https://images.unsplash.com/photo-1723322699174-ea81b9b2d1c5?q=80&w=300",},
  { id: 24, title: "Standard Ladies Cycle", category: "Bicycles", price: "PKR 15,000", location: "Lahore", image: "https://images.unsplash.com/photo-1505705694340-019e1e335916?w=300",},

  // --- HOUSES & FLATS (6 Items) ---
  { id: 25, title: "5 Marla House for Rent", category: "Houses & Flats", price: "PKR 45,000/mo", location: "Johar Town, Lahore", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300",  },
  { id: 26, title: "Luxury Apartment", category: "Houses & Flats", price: "PKR 80,000/mo", location: "DHA, Karachi", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300", },
  { id: 27, title: "10 Marla Upper Portion", category: "Houses & Flats", price: "PKR 35,000/mo", location: "Rawalpindi", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300",},
  { id: 28, title: "Furnished Flat for Students", category: "Houses & Flats", price: "PKR 25,000/mo", location: "Islamabad", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300", },
  { id: 29, title: "1 Kanal Full House", category: "Houses & Flats", price: "PKR 150,000/mo", location: "Bahria Town, Lahore", image: "https://images.unsplash.com/photo-1551207714-08d9cbf469f9?q=80&w=300", },
  { id: 30, title: "Studio Apartment", category: "Houses & Flats", price: "PKR 20,000/mo", location: "Faisalabad", image: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=300",  },

  // --- PLOTS & LAND (6 Items) ---
  { id: 31, title: "5 Marla Residential Plot", category: "Plots & Land", price: "PKR 50,000", location: "DHA 9, Lahore", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300", },
  { id: 32, title: "1 Kanal Plot File", category: "Plots & Land", price: "PKR 40,000", location: "Bahria Town, Karachi", image: "https://images.unsplash.com/photo-1587745890135-20db8c79b027?q=80&w=300",  },
  { id: 33, title: "Commercial Plot 4 Marla", category: "Plots & Land", price: "PKR 35,000", location: "Blue Area, Islamabad", image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=300",  },
  { id: 34, title: "Farmhouse Land 4 Kanal", category: "Plots & Land", price: "PKR 40,000", location: "Bedian Road, Lahore", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=300",  },
  { id: 35, title: "10 Marla Corner Plot", category: "Plots & Land", price: "PKR 80,000", location: "Rawalpindi", image: "https://images.unsplash.com/photo-1586859821397-c81e4971ca82?q=80&w=300",  },
  { id: 36, title: "Industrial Land 2 Acres", category: "Plots & Land", price: "PKR 15,000", location: "Faisalabad", image: "https://images.unsplash.com/photo-1608582704682-7496a29e43e2?q=80&w=300",  },

  // --- FURNITURE (6 Items) ---
  { id: 37, title: "Double Bed Set", category: "Furniture", price: "PKR 15,000", location: "Lahore", image: "https://images.unsplash.com/photo-1673687782286-674e29c9bf9e?q=80&w=300",  },
  { id: 38, title: "L-Shape Sofa", category: "Furniture", price: "PKR 60,000", location: "Karachi", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300",  },
  { id: 39, title: "Dining Table (6 Seater)", category: "Furniture", price: "PKR 35,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300",  },
  { id: 40, title: "Office Chair", category: "Furniture", price: "PKR 12,000", location: "Rawalpindi", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300",  },
  { id: 41, title: "Wooden Wardrobe", category: "Furniture", price: "PKR 28,000", location: "Multan", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=300",  },
  { id: 42, title: "Study Table", category: "Furniture", price: "PKR 8,000", location: "Lahore", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300", },

  // --- ELECTRONICS & HOME APPLIANCES (6 Items) ---
  { id: 43, title: "Haier Refrigerator", category: "Electronics & Home Appliances", price: "PKR 85,000", location: "Karachi", image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300",  },
  { id: 44, title: "Samsung 43 Inch LED TV", category: "Electronics & Home Appliances", price: "PKR 70,000", location: "Lahore", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300", },
  { id: 45, title: "Dawlance Split AC 1.5 Ton", category: "Electronics & Home Appliances", price: "PKR 110,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1613274390099-2782b6b2367d?w=300", },
  { id: 46, title: "Microwave Oven", category: "Electronics & Home Appliances", price: "PKR 15,000", location: "Faisalabad", image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=300", },
  { id: 47, title: "Automatic Washing Machine", category: "Electronics & Home Appliances", price: "PKR 65,000", location: "Multan", image: "https://plus.unsplash.com/premium_photo-1761262863007-b865bcff2bf9?q=80&w=300", },
  { id: 48, title: "Sony PlayStation 5", category: "Electronics & Home Appliances", price: "PKR 160,000", location: "Lahore", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300",  },

  // --- EQUIPMENT & TOOLS (6 Items) ---
  { id: 49, title: "Drill Machine Kit", category: "Equipment & Tools", price: "PKR 8,500", location: "Lahore", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300",  },
  { id: 50, title: "Welding Plant", category: "Equipment & Tools", price: "PKR 25,000", location: "Karachi", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300", },
  { id: 51, title: "Generator 3KVA", category: "Equipment & Tools", price: "PKR 95,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1601599561213-83238c276560?w=300",  },
  { id: 52, title: "Lawn Mower", category: "Equipment & Tools", price: "PKR 18,000", location: "Rawalpindi", image: "https://plus.unsplash.com/premium_photo-1747911361954-841258c229cf?q=80&w=300",  },
  { id: 53, title: "Tool Box Complete", category: "Equipment & Tools", price: "PKR 5,000", location: "Multan", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300",  },
  { id: 54, title: "Air Compressor", category: "Equipment & Tools", price: "PKR 35,000", location: "Peshawar", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300",  },

  // --- FASHION & PERSONAL ITEMS (6 Items) ---
  { id: 55, title: "Branded Leather Jacket", category: "Fashion & Personal Items", price: "PKR 12,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300", },
  { id: 56, title: "Ray-Ban Sunglasses", category: "Fashion & Personal Items", price: "PKR 8,000", location: "Lahore", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300", },
  { id: 57, title: "Men's Wrist Watch", category: "Fashion & Personal Items", price: "PKR 5,000", location: "Karachi", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300",  },
  { id: 58, title: "Wedding Dress (Lehenga)", category: "Fashion & Personal Items", price: "PKR 60,000", location: "Lahore", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300",  },
  { id: 59, title: "Nike Sneakers", category: "Fashion & Personal Items", price: "PKR 15,000", location: "Faisalabad", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300", },
  { id: 60, title: "Handbag for Ladies", category: "Fashion & Personal Items", price: "PKR 4,500", location: "Multan", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300",  },

  // --- SPORTS EQUIPMENT (6 Items) ---
  { id: 61, title: "Cricket Bat (CA)", category: "Sports Equipment", price: "PKR 8,000", location: "Lahore", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300",  },
  { id: 62, title: "Treadmill Machine", category: "Sports Equipment", price: "PKR 85,000", location: "Karachi", image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=300",  },
  { id: 63, title: "Football (Adidas)", category: "Sports Equipment", price: "PKR 4,000", location: "Islamabad", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300",  },
  { id: 64, title: "Badminton Racket Set", category: "Sports Equipment", price: "PKR 3,500", location: "Sialkot", image: "https://images.unsplash.com/photo-1586768402600-714186e09479?q=80&w=300",  },
  { id: 65, title: "Dumbbells 10kg Pair", category: "Sports Equipment", price: "PKR 6,000", location: "Lahore", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300",  },
  { id: 66, title: "Tennis Racket", category: "Sports Equipment", price: "PKR 12,000", location: "Karachi", image: "https://images.unsplash.com/photo-1617883861744-13b534e3b928?q=80&w=870", },
];