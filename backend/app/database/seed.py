import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.config import DATASET_DIR, TOURISM_CATEGORIES
from app.models.entities import (
    User, State, District, Category, TouristPlace, PlaceCategory, PlaceHistory,
    TransportRoute, MetroStation, BusStop, Hotel, Restaurant, WeatherData,
    CrowdData, IncidentReport, DatasetRegistry, PdfUpload, MlModelRecord, Itinerary, ItineraryDay, ItineraryPlace
)
from app.ml.pipeline import train_all_models
from app.pdf.parser import ensure_capstone_pdf_dataset, parse_tourism_pdf
from app.utils.security import hash_password

ALL_36_STATES_UTS = [
    ("Andhra Pradesh", "AP", "South India", "Amaravati", 15.9129, 79.7400, "Known for Tirupati, Araku Valley, Eastern Ghats & coastal temples."),
    ("Arunachal Pradesh", "AR", "North-East India", "Itanagar", 28.2180, 94.7278, "Land of Dawn-Lit Mountains, Tawang Monastery & Ziro Valley."),
    ("Assam", "AS", "North-East India", "Dispur", 26.2006, 92.9376, "Home to Kaziranga one-horned rhinos, Majuli river island & tea estates."),
    ("Bihar", "BR", "East India", "Patna", 25.0961, 85.3131, "Cradle of Buddhism and Jainism featuring Bodh Gaya, Nalanda & Rajgir."),
    ("Chhattisgarh", "CG", "Central India", "Raipur", 21.2787, 81.8661, "Famous for Chitrakote Waterfalls, Bastar tribal heritage & ancient caves."),
    ("Goa", "GA", "West India", "Panaji", 15.2993, 74.1240, "Premier coastal destination blending golden beaches, water sports & Indo-Portuguese heritage."),
    ("Gujarat", "GJ", "West India", "Gandhinagar", 22.2587, 71.1924, "Home to Rann of Kutch, Gir Asiatic Lions, Statue of Unity & Somnath."),
    ("Haryana", "HR", "North India", "Chandigarh", 29.0588, 76.0856, "Historic land of Kurukshetra, Sultanpur Bird Sanctuary & heritage resorts."),
    ("Himachal Pradesh", "HP", "North India", "Shimla", 31.1048, 77.1734, "Himalayan paradise featuring Shimla, Manali, Spiti Valley, Dharamshala & Khajjiar."),
    ("Jharkhand", "JH", "East India", "Ranchi", 23.6102, 85.2799, "Land of forests and waterfalls including Hundru Falls, Betla National Park & Deoghar."),
    ("Karnataka", "KA", "South India", "Bengaluru", 15.3173, 75.7139, "One State Many Worlds: Mysore Palace, Hampi UNESCO ruins, Coorg, Bangalore & Gokarna."),
    ("Kerala", "KL", "South India", "Thiruvananthapuram", 10.8505, 76.2711, "God's Own Country: Alleppey backwaters, Munnar tea hills, Wayanad & Varkala cliffs."),
    ("Madhya Pradesh", "MP", "Central India", "Bhopal", 22.9734, 78.6569, "Heart of Incredible India: Khajuraho temples, Sanchi Stupa, Kanha & Bandhavgarh tiger reserves."),
    ("Maharashtra", "MH", "West India", "Mumbai", 19.7515, 75.7139, "Home to Mumbai, Ajanta-Ellora UNESCO caves, Western Ghats hill stations & Maratha forts."),
    ("Manipur", "MN", "North-East India", "Imphal", 24.6637, 93.9063, "Jewel of India featuring Loktak floating lake, Kangla Fort & Keibul Lamjao National Park."),
    ("Meghalaya", "ML", "North-East India", "Shillong", 25.4670, 91.3662, "Abode of Clouds: Shillong, Cherrapunji, Living Root Bridges of Mawlynnong & Dawki."),
    ("Mizoram", "MZ", "North-East India", "Aizawl", 23.1645, 92.9376, "Rolling blue hills, Reiek heritage village, Vantawng Falls & Phawngpui Peak."),
    ("Nagaland", "NL", "North-East India", "Kohima", 26.1584, 94.5624, "Land of Festivals: Kohima, Dzukou Valley, Khonoma green village & Hornbill culture."),
    ("Odisha", "OD", "East India", "Bhubaneswar", 20.9517, 85.0985, "Soul of Incredible India: Konark Sun Temple, Jagannath Puri, Chilika Lake & quiet beaches."),
    ("Punjab", "PB", "North India", "Chandigarh", 31.1471, 75.3412, "Spiritual and culinary heartland anchored by the Golden Temple in Amritsar & Wagah Border."),
    ("Rajasthan", "RJ", "North India", "Jaipur", 27.0238, 74.2179, "Land of Kings: Jaipur palaces, Udaipur lakes, Jaisalmer Thar desert & Ranthambore."),
    ("Sikkim", "SK", "North-East India", "Gangtok", 27.5330, 88.5122, "Himalayan biodiversity hotspot with Gangtok, Nathula Pass, Tsomgo Lake & North Sikkim."),
    ("Tamil Nadu", "TN", "South India", "Chennai", 11.1271, 78.6569, "Land of Dravidian Chola/Pandya temples, Mahabalipuram, Madurai, Ooty & Kanyakumari."),
    ("Telangana", "TG", "South India", "Hyderabad", 18.1124, 79.0193, "Historic pearl & IT hub featuring Charminar, Golconda Fort, Ramoji Film City & Ramappa Temple."),
    ("Tripura", "TR", "North-East India", "Agartala", 23.9408, 91.9882, "Renowned for Ujjayanta Palace, Neermahal water palace & Unakoti rock-cut bas-reliefs."),
    ("Uttar Pradesh", "UP", "North India", "Lucknow", 26.8467, 80.9462, "Home to the iconic Taj Mahal in Agra, spiritual ghats of Varanasi, Ayodhya & Lucknow heritage."),
    ("Uttarakhand", "UK", "North India", "Dehradun", 30.0668, 79.0193, "Devbhumi: Rishikesh yoga capital, Haridwar, Nainital, Mussoorie, Auli & Char Dham."),
    ("West Bengal", "WB", "East India", "Kolkata", 22.9868, 87.8550, "Cultural capital Kolkata, Darjeeling Himalayan tea hills & Sundarbans mangrove delta."),
    # 8 Union Territories
    ("Andaman and Nicobar Islands", "AN", "Islands UT", "Port Blair", 11.7401, 92.6586, "Tropical archipelago with Havelock Radhanagar Beach, Cellular Jail & coral reefs."),
    ("Chandigarh", "CH", "North India UT", "Chandigarh", 30.7333, 76.7794, "Le Corbusier's planned garden city featuring Rock Garden, Sukhna Lake & Capitol Complex."),
    ("Dadra and Nagar Haveli and Daman and Diu", "DD", "West India UT", "Daman", 20.4283, 72.8397, "Coastal forts of Diu, tranquil beaches, Naida Caves & tribal garden trails."),
    ("Delhi", "DL", "North India UT", "New Delhi", 28.6139, 77.2090, "National Capital Territory blending Mughal monuments, Lutyens heritage, museums & vibrant markets."),
    ("Jammu and Kashmir", "JK", "North India UT", "Srinagar", 34.0837, 74.7973, "Paradise on Earth: Dal Lake Srinagar, Gulmarg ski slopes, Pahalgam & Vaishno Devi."),
    ("Ladakh", "LA", "North India UT", "Leh", 34.1526, 77.5771, "High-altitude cold desert famed for Pangong Lake, Nubra Valley, monasteries & mountain passes."),
    ("Lakshadweep", "LD", "Islands UT", "Kavaratti", 10.5667, 72.6417, "Pristine coral atolls of Agatti, Bangaram & Kadmat with turquoise lagoons."),
    ("Puducherry", "PY", "South India UT", "Puducherry", 11.9416, 79.8083, "French Riviera of the East: White Town promenade, Auroville, Sri Aurobindo Ashram & beaches."),
]


CURATED_GRANULAR_PLACES = [
    # ================= DELHI (Complete 3-Day Canonical & Extended Places) =================
    {
        "name": "India Gate",
        "state": "Delhi", "district": "New Delhi", "city": "New Delhi",
        "latitude": 28.6129, "longitude": 77.2295,
        "category": "Historical", "sub_category": "Historical, Heritage, Couple, Family, Photography",
        "opening_time": "06:00", "closing_time": "23:00", "best_time": "Morning (08:30 AM) or Evening (06:00 PM)",
        "average_visit_duration": 1.5, "entry_fee": 0, "rating": 4.7, "popularity": 96,
        "crowd_score": 68, "safety_score": 89, "weather_sensitivity": "HIGH",
        "nearest_metro": "Central Secretariat / Kartavya Path Metro (Yellow & Violet Line)",
        "nearest_bus_stop": "India Gate DTC Bus Terminal (Routes 335, 405, 505)",
        "local_food_recommendations": "Pandara Road North Indian Dining, Connaught Place Cafes & Kulfi",
        "description": "Iconic 42-meter sandstone war memorial arch situated along Kartavya Path in the heart of New Delhi.",
        "history": "Designed by Sir Edwin Lutyens and unveiled in 1931, the All-India War Memorial (India Gate) commemorates over 70,000 soldiers of the British Indian Army who lost their lives during the First World War and the Third Anglo-Afghan War. Constructed from yellow and red Bharatpur sandstone, its archway bears the inscribed names of over 13,000 servicemen. Following independence, the Amar Jawan Jyoti eternal flame was added in 1972 to honor India's fallen heroes, now integrated with the adjacent National War Memorial canopy along the revamped Kartavya Path boulevard.",
    },
    {
        "name": "Rashtrapati Bhavan & Amrit Udyan Area",
        "state": "Delhi", "district": "New Delhi", "city": "New Delhi",
        "latitude": 28.6143, "longitude": 77.1994,
        "category": "Heritage", "sub_category": "Heritage, Historical, Architecture, Photography, Family",
        "opening_time": "09:30", "closing_time": "17:30", "best_time": "Morning (09:30 AM - 12:00 PM)",
        "average_visit_duration": 2.0, "entry_fee": 50, "rating": 4.7, "popularity": 90,
        "crowd_score": 48, "safety_score": 95, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "Central Secretariat Metro Station (Yellow & Violet Line)",
        "nearest_bus_stop": "Krishi Bhavan / Raisina Hill Bus Stop",
        "local_food_recommendations": "Parliament Street South Indian Canteens & Janpath Bistros",
        "description": "Grand presidential estate atop Raisina Hill showcasing Indo-Saracenic architecture, museum galleries, and landscaped gardens.",
        "history": "Constructed between 1912 and 1929 as the Viceroy's House to designs by Sir Edwin Lutyens and Herbert Baker, Rashtrapati Bhavan serves as the official residence of the President of India. Spanning 330 acres with 340 rooms, the estate blends classical European colonnades with traditional Indian architectural motifs including chhajjas, chhatris, and jaalis inspired by the Sanchi Stupa. After the Republic of India was proclaimed in 1950, it became a symbol of Indian democracy and hosts the Rashtrapati Bhavan Museum Complex and the seasonal Amrit Udyan botanical gardens.",
    },
    {
        "name": "National War Memorial",
        "state": "Delhi", "district": "New Delhi", "city": "New Delhi",
        "latitude": 28.6127, "longitude": 77.2333,
        "category": "Historical", "sub_category": "Historical, Heritage, Family, Spiritual, Photography",
        "opening_time": "09:00", "closing_time": "20:00", "best_time": "Morning (10:00 AM) or Sunset Retreat Ceremony",
        "average_visit_duration": 1.2, "entry_fee": 0, "rating": 4.8, "popularity": 91,
        "crowd_score": 54, "safety_score": 94, "weather_sensitivity": "HIGH",
        "nearest_metro": "Central Secretariat / Mandi House Metro Station",
        "nearest_bus_stop": "National Stadium / India Gate Circle Stop",
        "local_food_recommendations": "Khan Market & Pandara Road Restaurants",
        "description": "Sacred concentric chakra-styled monument honoring the Armed Forces soldiers who served independent India since 1947.",
        "history": "Dedicated to the nation in February 2019, the National War Memorial spans 40 acres at the India Gate complex and honors over 26,000 soldiers of the Indian Armed Forces who made the supreme sacrifice in conflicts after 1947, including the 1947–48, 1962, 1965, 1971, and 1999 Kargil wars as well as UN peacekeeping missions. Its architectural layout is inspired by the ancient Chakravyuha formation, comprising four concentric circles—the Amar Chakra, Veerta Chakra, Tyag Chakra, and Rakshak Chakra—crafted in granite tablets inscribed with gold-lettered names.",
    },
    {
        "name": "Connaught Place (Rajiv Chowk Heritage Hub)",
        "state": "Delhi", "district": "New Delhi", "city": "New Delhi",
        "latitude": 28.6315, "longitude": 77.2167,
        "category": "Shopping", "sub_category": "Shopping, Food, Couple, Heritage, Cultural",
        "opening_time": "10:00", "closing_time": "22:30", "best_time": "Afternoon & Evening (04:00 PM - 08:30 PM)",
        "average_visit_duration": 2.0, "entry_fee": 0, "rating": 4.6, "popularity": 93,
        "crowd_score": 76, "safety_score": 84, "weather_sensitivity": "LOW",
        "nearest_metro": "Rajiv Chowk Metro Interchange (Yellow & Blue Line)",
        "nearest_bus_stop": "Palika Kendra / Connaught Circus DTC Hub",
        "local_food_recommendations": "Wenger's Bakery, Saravana Bhavan, Kwality Heritage Restaurant & Janpath Chaat",
        "description": "Georgian-style colonnaded commercial and culinary heart of New Delhi with heritage cafes, bookstores, and Central Park.",
        "history": "Designed by British architect Robert Tor Russell and completed in 1933 as the centerpiece of New Delhi's commercial district, Connaught Place was modeled after the Royal Crescent in Bath, England. Constructed in two concentric circles—the Inner and Outer Circles—radiated by seven arterial roads, its whitewashed Georgian arcades became the social and cultural hub of 20th-century Delhi. Today, centered around Central Park and the Rajiv Chowk Metro interchange, it houses century-old bakeries, khadi emporiums, art galleries, and the historic Agrasen ki Baoli stepwell nearby.",
    },
    {
        "name": "Red Fort (Lal Qila)",
        "state": "Delhi", "district": "Central Delhi", "city": "New Delhi",
        "latitude": 28.6562, "longitude": 77.2410,
        "category": "Fort", "sub_category": "Fort, Historical, Heritage, Photography, Family",
        "opening_time": "09:30", "closing_time": "16:30", "best_time": "Morning (09:30 AM - 12:30 PM)",
        "average_visit_duration": 2.5, "entry_fee": 50, "rating": 4.6, "popularity": 95,
        "crowd_score": 75, "safety_score": 82, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "Lal Qila Metro Station (Violet Line)",
        "nearest_bus_stop": "Red Fort / Netaji Subhash Marg Bus Stand",
        "local_food_recommendations": "Paranthe Wali Gali, Old Famous Jalebi Wala & Karim's Mughlai",
        "description": "UNESCO World Heritage 17th-century red sandstone Mughal fortress complex housing royal pavilions and museums.",
        "history": "Commissioned by Mughal Emperor Shah Jahan in 1638 when he shifted his capital from Agra to Shahjahanabad, the Red Fort (Lal Qila) was designed by architect Ustad Ahmad Lahori and completed in 1648. Enclosed by 2.4 kilometers of towering red sandstone ramparts along the Yamuna riverfront, the citadel contains the Diwan-i-Aam, Diwan-i-Khas, Rang Mahal, and Moti Masjid, fusing Persian, Timurid, and Hindu architectural styles. Designated a UNESCO World Heritage Site in 2007, it is the site where India's Prime Minister hoists the national tricolor every Independence Day.",
    },
    {
        "name": "Jama Masjid",
        "state": "Delhi", "district": "Central Delhi", "city": "New Delhi",
        "latitude": 28.6507, "longitude": 77.2334,
        "category": "Religious", "sub_category": "Religious, Historical, Heritage, Cultural, Photography",
        "opening_time": "07:00", "closing_time": "18:30", "best_time": "Morning (08:30 AM - 11:30 AM)",
        "average_visit_duration": 1.2, "entry_fee": 0, "rating": 4.5, "popularity": 88,
        "crowd_score": 78, "safety_score": 79, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "Jama Masjid Metro Station (Violet Line)",
        "nearest_bus_stop": "Jama Masjid Gate No. 1 DTC Stop",
        "local_food_recommendations": "Matia Mahal Kebabs, Shahi Tukda & Haji Mohd Hussain Fried Chicken",
        "description": "One of India's largest historic mosques featuring grand red sandstone courtyards, marble domes, and panoramic minarets.",
        "history": "Built by Mughal Emperor Shah Jahan between 1650 and 1656 at the highest point of the walled city of Shahjahanabad, Masjid-i-Jahan-Numa (Jama Masjid) was constructed by over 5,000 artisans using red sandstone and white marble strips. Its expansive courtyard can accommodate 25,000 worshippers and is approached by three monumental gateways, flanked by two 40-meter-tall minarets and three onion-shaped marble domes. Inaugurated by Imam Syed Abdul Ghafoor Shah Bukhari of Bukhara, it remains an enduring masterpiece of Indo-Islamic sacred architecture.",
    },
    {
        "name": "Chandni Chowk Heritage Market & Food Trail",
        "state": "Delhi", "district": "Central Delhi", "city": "New Delhi",
        "latitude": 28.6506, "longitude": 77.2303,
        "category": "Food", "sub_category": "Food, Shopping, Heritage, Cultural, Couple",
        "opening_time": "09:30", "closing_time": "21:00", "best_time": "Late Morning or Afternoon (11:00 AM - 06:00 PM)",
        "average_visit_duration": 2.0, "entry_fee": 0, "rating": 4.5, "popularity": 92,
        "crowd_score": 86, "safety_score": 75, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "Chandni Chowk Metro Station (Yellow Line)",
        "nearest_bus_stop": "Sis Ganj Gurudwara / Town Hall Bus Stop",
        "local_food_recommendations": "Natraj Dahi Bhalla, Paranthe Wali Gali, Daulat Ki Chaat & Haldiram Heritage",
        "description": "Pedestrianized 17th-century Mughal boulevard famous for spice markets, silver bazaars, sacred shrines, and legendary street food.",
        "history": "Laid out in 1650 by Princess Jahanara Begum, daughter of Emperor Shah Jahan, Chandni Chowk ('Moonlit Square') originally featured a central water canal reflecting moonlight along a tree-lined avenue stretching from the Lahori Gate of the Red Fort to Fatehpuri Masjid. Historically divided into specialized bazaars such as Dariba Kalan for silver, Kinari Bazaar for zardozi textiles, and Khari Baoli—Asia's largest wholesale spice market—the avenue also uniquely unites Sri Gurudwara Sis Ganj Sahib, Gauri Shankar Temple, Central Baptist Church, and Sunehri Masjid along a single corridor.",
    },
    {
        "name": "Humayun's Tomb",
        "state": "Delhi", "district": "South East Delhi", "city": "New Delhi",
        "latitude": 28.5933, "longitude": 77.2507,
        "category": "Historical", "sub_category": "Historical, Heritage, Couple, Photography, Nature",
        "opening_time": "06:00", "closing_time": "18:00", "best_time": "Afternoon (02:30 PM - 05:30 PM)",
        "average_visit_duration": 2.0, "entry_fee": 50, "rating": 4.7, "popularity": 91,
        "crowd_score": 52, "safety_score": 90, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "JLN Stadium / Hazrat Nizamuddin Metro Station",
        "nearest_bus_stop": "Humayun's Tomb / Sunder Nursery Bus Stop",
        "local_food_recommendations": "Sunder Nursery Garden Cafe & Khan Market Dining",
        "description": "UNESCO World Heritage garden-tomb and architectural precursor to the Taj Mahal set amidst tranquil Charbagh gardens.",
        "history": "Commissioned in 1565 by Empress Bega Begum (Haji Begum), first wife of the second Mughal Emperor Humayun, and designed by Persian architects Mirak Mirza Ghiyas and his son Sayyid Muhammad, Humayun's Tomb was the first grand garden-tomb on the Indian subcontinent. Set at the center of a geometrical Persian Charbagh (four-quadrant paradise garden) with water channels, its high double dome clad in white marble and red sandstone established the architectural blueprint that culminated a century later in the Taj Mahal. It was declared a UNESCO World Heritage Site in 1993.",
    },
    {
        "name": "Qutub Minar Archaeological Complex",
        "state": "Delhi", "district": "South Delhi", "city": "New Delhi",
        "latitude": 28.5245, "longitude": 77.1855,
        "category": "Historical", "sub_category": "Historical, Heritage, Couple, Photography, Family",
        "opening_time": "07:00", "closing_time": "20:00", "best_time": "Morning (08:30 AM - 11:30 AM)",
        "average_visit_duration": 2.0, "entry_fee": 40, "rating": 4.7, "popularity": 94,
        "crowd_score": 64, "safety_score": 88, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "Qutab Minar Metro Station (Yellow Line)",
        "nearest_bus_stop": "Mehrauli / Qutub Minar Terminal",
        "local_food_recommendations": "Olive Bar & Kitchen Mehrauli, Dramz & Saket Cafes",
        "description": "UNESCO World Heritage 72.5-meter fluted sandstone victory tower surrounded by ancient monuments and the 4th-century Iron Pillar.",
        "history": "Initiated in 1199 CE by Qutb-ud-din Aibak, founder of the Delhi Sultanate, and completed around 1220 by his successor Shams-ud-din Iltutmish, the Qutub Minar rises 72.5 meters in five distinct tapering storeys adorned with intricate Arabic calligraphic bands and muqarnas corbelled balconies. In 1368, Firoz Shah Tughlaq restored the upper two storeys using marble and sandstone after lightning damage. The surrounding Qutb complex houses the Quwwat-ul-Islam Mosque, Alai Darwaza, and the rust-resistant 4th-century Gupta-era Iron Pillar of चंद्रगुप्त II.",
    },
    {
        "name": "Lotus Temple (Bahá'í House of Worship)",
        "state": "Delhi", "district": "South East Delhi", "city": "New Delhi",
        "latitude": 28.5535, "longitude": 77.2588,
        "category": "Spiritual", "sub_category": "Spiritual, Religious, Couple, Family, Photography",
        "opening_time": "08:30", "closing_time": "17:30", "best_time": "Morning or Mid-Afternoon (10:00 AM - 04:00 PM)",
        "average_visit_duration": 1.5, "entry_fee": 0, "rating": 4.6, "popularity": 90,
        "crowd_score": 66, "safety_score": 92, "weather_sensitivity": "LOW",
        "nearest_metro": "Kalkaji Mandir Metro Interchange (Violet & Magenta Line)",
        "nearest_bus_stop": "Nehru Place / Kalkaji Mandir Bus Stop",
        "local_food_recommendations": "Epicuria Food Mall at Nehru Place & Greater Kailash Cafes",
        "description": "Architectural marvel shaped as a blooming white marble lotus flower open to people of all faiths for silent meditation.",
        "history": "Designed by Iranian-Canadian architect Fariborz Sahba and consecrated in December 1986, the Bahá'í House of Worship in Kalkaji, New Delhi—universally known as the Lotus Temple—is composed of 27 free-standing Pentelikon white marble-clad petals arranged in clusters of three to form nine sides. Surrounded by nine reflection ponds and 26 acres of landscaped gardens that naturally cool the central prayer hall, the temple contains no idols, images, or pulpits, embodying the Bahá'í principle of the unity of religion and humanity.",
    },
    {
        "name": "Swaminarayan Akshardham Temple",
        "state": "Delhi", "district": "East Delhi", "city": "New Delhi",
        "latitude": 28.6127, "longitude": 77.2773,
        "category": "Temple", "sub_category": "Temple, Spiritual, Cultural, Family, Heritage",
        "opening_time": "10:00", "closing_time": "18:30", "best_time": "Afternoon to Evening Water Show (02:30 PM - 07:00 PM)",
        "average_visit_duration": 3.5, "entry_fee": 170, "rating": 4.8, "popularity": 95,
        "crowd_score": 72, "safety_score": 94, "weather_sensitivity": "LOW",
        "nearest_metro": "Akshardham Metro Station (Blue Line)",
        "nearest_bus_stop": "Akshardham Flyover Bus Stop",
        "local_food_recommendations": "Premwati Food Court inside Akshardham Complex (Pure Veg)",
        "description": "Monumental carved pink sandstone and marble spiritual-cultural campus featuring exhibitions, boat ride, and musical fountain.",
        "history": "Inaugurated on 6 November 2005 by President Dr. A.P.J. Abdul Kalam and Pramukh Swami Maharaj of BAPS, Swaminarayan Akshardham on the banks of the Yamuna was crafted according to ancient Shilpa Shastra architectural treatises without structural steel. Built from Rajasthani pink sandstone and Italian Carrara marble by over 11,000 artisans, the 141-foot central mandir features 234 ornate pillars and 20,000 sculpted figures. The complex includes the Sanskruti Vihar cultural boat ride, Sahajanand Darshan robotics hall, and the Sahaj Anand multimedia water show.",
    },
    {
        "name": "National Museum New Delhi",
        "state": "Delhi", "district": "New Delhi", "city": "New Delhi",
        "latitude": 28.6118, "longitude": 77.2193,
        "category": "Museum", "sub_category": "Museum, Historical, Heritage, Cultural, Family",
        "opening_time": "10:00", "closing_time": "18:00", "best_time": "All Day (Ideal Indoor Alternative during Heat/Rain)",
        "average_visit_duration": 2.5, "entry_fee": 20, "rating": 4.6, "popularity": 84,
        "crowd_score": 40, "safety_score": 95, "weather_sensitivity": "LOW",
        "nearest_metro": "Udyog Bhawan / Central Secretariat Metro Station",
        "nearest_bus_stop": "National Museum Janpath Bus Stop",
        "local_food_recommendations": "Museum Cafe & Andhra Bhavan Canteen nearby",
        "description": "India's premier indoor museum housing over 200,000 artifacts spanning 5,000 years from the Indus Valley Civilization to modern art.",
        "history": "Established on 15 August 1949 at Rashtrapati Bhavan and moved to its permanent Janpath building inaugurated by Vice President Dr. Sarvepalli Radhakrishnan in 1960, the National Museum preserves over 200,000 works of Indian and international heritage spanning five millennia. Its climate-controlled galleries display original Harappan bronzes including the famous Dancing Girl from Mohenjo-daro, Mauryan and Gandhara Buddhist sculptures, sacred relics of Lord Buddha, Chola bronzes, Mughal miniature paintings, and Central Asian antiquities collected by Aurel Stein.",
    },

    # ================= KARNATAKA (Mysore, Bangalore, Hampi, Coorg) =================
    {
        "name": "Mysore Palace (Amba Vilas Palace)",
        "state": "Karnataka", "district": "Mysuru", "city": "Mysore",
        "latitude": 12.3052, "longitude": 76.6552,
        "category": "Palace", "sub_category": "Historical, Heritage, Family, Photography, Cultural, Couple",
        "opening_time": "10:00", "closing_time": "17:30", "best_time": "Morning (10:00 AM) or Sunday Evening Illumination (07:00 PM)",
        "average_visit_duration": 2.5, "entry_fee": 100, "rating": 4.8, "popularity": 96,
        "crowd_score": 70, "safety_score": 92, "weather_sensitivity": "LOW",
        "nearest_metro": "N/A (Mysuru City Bus Stand 0.5 km)",
        "nearest_bus_stop": "Mysore Palace KSRTC City Bus Stand",
        "local_food_recommendations": "Mylari Dosa, Guru Sweet Mart Mysore Pak & Hotel RRR",
        "description": "Magnificent three-storey Indo-Saracenic royal residence of the Wadiyar dynasty famed for stained glass halls and 97,000-bulb illuminations.",
        "history": "Commissioned in 1897 by Maharani Kempananjammanni Vani Vilasa Sannidhana and Maharaja Krishnaraja Wadiyar IV after fire destroyed the older wooden palace, the present Amba Vilas Palace (Mysore Palace) was designed by British architect Henry Irwin and completed in 1912. Built of fine grey granite crowned with pink marble domes, the Indo-Saracenic masterpiece integrates Hindu, Mughal, Rajput, and Gothic elements, including the ornate Kalyana Mantapa with Scottish stained glass, the Durbar Hall, and the Golden Howdah displayed during the historic Mysuru Dasara festival.",
    },
    {
        "name": "Brindavan Gardens & KRS Dam",
        "state": "Karnataka", "district": "Mysuru", "city": "Mysore",
        "latitude": 12.4217, "longitude": 76.5728,
        "category": "Nature", "sub_category": "Nature, Couple, Family, Photography",
        "opening_time": "08:00", "closing_time": "20:30", "best_time": "Late Afternoon to Musical Fountain (04:30 PM - 07:30 PM)",
        "average_visit_duration": 2.0, "entry_fee": 50, "rating": 4.4, "popularity": 88,
        "crowd_score": 65, "safety_score": 87, "weather_sensitivity": "HIGH",
        "nearest_metro": "N/A",
        "nearest_bus_stop": "Brindavan Gardens KSRTC Terminal (Route 303)",
        "local_food_recommendations": "Mayura Cauvery KSTDC Restaurant & KRS Highway Cafes",
        "description": "Symmetrical terrace gardens below the Krishna Raja Sagara Dam across the Kaveri River featuring illuminated musical fountains.",
        "history": "Conceived by Sir Mirza Ismail, Diwan of Mysore, and constructed between 1927 and 1932 adjacent to Sir M. Visvesvaraya's engineering landmark, the Krishna Raja Sagara (KRS) Dam across the Kaveri River, Brindavan Gardens spans 60 acres of terraced Mughal-style parterres. Modeled after the Shalimar Gardens of Kashmir, its cascading water channels, topiary lawns, boating lake, and synchronized musical fountains powered by natural hydraulic pressure made it one of 20th-century India's most celebrated public landscape gardens.",
    },
    {
        "name": "Chamundi Hill & Sri Chamundeshwari Temple",
        "state": "Karnataka", "district": "Mysuru", "city": "Mysore",
        "latitude": 12.2725, "longitude": 76.6706,
        "category": "Temple", "sub_category": "Temple, Religious, Spiritual, Viewpoint, Family",
        "opening_time": "07:30", "closing_time": "21:00", "best_time": "Morning (08:00 AM - 11:00 AM)",
        "average_visit_duration": 2.0, "entry_fee": 0, "rating": 4.7, "popularity": 90,
        "crowd_score": 68, "safety_score": 89, "weather_sensitivity": "MEDIUM",
        "nearest_metro": "N/A",
        "nearest_bus_stop": "Chamundi Hill Electric Bus Stand (Route 201)",
        "local_food_recommendations": "Vinayaka Mylari & Chamundi Hill Foothill Cafes",
        "description": "Sacred 1,062-meter hilltop Dravidian temple overlooking Mysuru city with a monolithic Nandi statue along 1,008 stone steps.",
        "history": "Perched atop the 1,062-meter Chamundi Hills overlooking Mysuru, the Sri Chamundeshwari Temple dates back to the 12th-century Hoysala period, with its seven-tier Gopuram tower added by the Vijayanagara rulers in the 17th century and patronized as the tutelary deity of the Mysore Maharajas. In 1659, Doddadevaraja Wadiyar commissioned the 1,008 granite steps leading up the hill and the colossal 16-foot monolithic Nandi bull carved from a single black boulder at the 700th step.",
    },
    {
        "name": "St. Philomena's Cathedral Mysore",
        "state": "Karnataka", "district": "Mysuru", "city": "Mysore",
        "latitude": 12.3211, "longitude": 76.6583,
        "category": "Heritage", "sub_category": "Religious, Heritage, Architecture, Photography",
        "opening_time": "06:00", "closing_time": "18:00", "best_time": "Morning or Mid-Day (10:00 AM - 04:00 PM)",
        "average_visit_duration": 1.0, "entry_fee": 0, "rating": 4.6, "popularity": 84,
        "crowd_score": 44, "safety_score": 92, "weather_sensitivity": "LOW",
        "nearest_metro": "N/A",
        "nearest_bus_stop": "St. Philomena's Church Ashoka Road Stop",
        "local_food_recommendations": "Depth N Green Cafe & Old House Italian Mysore",
        "description": "Towering Neo-Gothic cathedral with 175-foot twin spires inspired by Cologne Cathedral and French stained-glass windows.",
        "history": "Originally built as a modest church in 1843 by Maharaja Mummadi Krishnaraja Wadiyar, the grand Neo-Gothic St. Philomena's Cathedral was reconstructed beginning in 1933 when Maharaja Krishnaraja Wadiyar IV laid its foundation stone. Designed by French architect Daly and completed in 1941, the cruciform church features twin 175-foot spires inspired by Cologne Cathedral in Germany, French stained-glass windows depicting scenes from the life of Christ, and a subterranean crypt housing a 3rd-century relic of Saint Philomena.",
    },
    {
        "name": "Lalbagh Botanical Garden",
        "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore",
        "latitude": 12.9507, "longitude": 77.5848,
        "category": "Nature", "sub_category": "Nature, Couple, Family, Photography, Heritage",
        "opening_time": "06:00", "closing_time": "19:00", "best_time": "Morning (07:30 AM - 11:00 AM)",
        "average_visit_duration": 2.0, "entry_fee": 30, "rating": 4.6, "popularity": 91,
        "crowd_score": 58, "safety_score": 90, "weather_sensitivity": "HIGH",
        "nearest_metro": "Lalbagh Metro Station (Green Line - Namma Metro)",
        "nearest_bus_stop": "Lalbagh West / Main Gate BMTC Stop",
        "local_food_recommendations": "Mavalli Tiffin Room (MTR) Lalbagh Road & Vidyarthi Bhavan",
        "description": "240-acre historic botanical garden housing an 1889 Crystal Palace-inspired Glass House, lotus lake, and 3-billion-year-old Peninsular Gneiss rock.",
        "history": "Commissioned in 1760 by Hyder Ali, ruler of Mysore, and expanded by his son Tipu Sultan with rare botanical specimens imported from Persia, Afghanistan, and Mauritius, Lalbagh Botanical Garden spans 240 acres in southern Bengaluru. In the 19th century, British botanists John Cameron and William Munro established its horticultural taxonomy, culminating in the 1889 construction of the cast-iron Glass House modeled on London's Crystal Palace. The garden also preserves the Lalbagh Rock, a National Geological Monument formed of 3,000-million-year-old Peninsular Gneiss.",
    },
    {
        "name": "Bangalore Palace",
        "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore",
        "latitude": 12.9988, "longitude": 77.5921,
        "category": "Palace", "sub_category": "Palace, Historical, Heritage, Couple, Photography",
        "opening_time": "10:00", "closing_time": "17:30", "best_time": "Morning or Afternoon (10:30 AM - 04:30 PM)",
        "average_visit_duration": 2.0, "entry_fee": 240, "rating": 4.4, "popularity": 86,
        "crowd_score": 50, "safety_score": 92, "weather_sensitivity": "LOW",
        "nearest_metro": "Cubbon Park / Mantri Square Sampige Road Metro Station",
        "nearest_bus_stop": "Palace Grounds / Mekhri Circle BMTC Stop",
        "local_food_recommendations": "CTR (Central Tiffin Room) Malleshwaram & Cunningham Road Cafes",
        "description": "Tudor Revival royal castle built in 1878 with fortified towers, battlements, Victorian woodwork, and Raja Ravi Varma paintings.",
        "history": "Constructed between 1874 and 1878 for the young Maharaja Chamarajendra Wadiyar X on land originally acquired from Rev. J. Garrett, principal of Central High School, Bangalore Palace was modeled after Windsor Castle in England. Built in Tudor Revival style with fortified granite towers, Gothic stained-glass windows, and crenellated battlements, its interiors feature intricate Burmese teakwood carvings, floral cornices, a grand Durbar Hall, and original 19th-century paintings by Raja Ravi Varma.",
    },
]


from app.database.india_cities_catalog import ALL_INDIA_CITIES_DATA


def _seed_all_india_cities_catalog(db: Session):
    """
    Ensures every single State & Union Territory (all 36) and all major Indian cities
    have Districts, TouristPlaces, PlaceHistory, Hotels, Restaurants, and MetroStations.
    """
    state_map = {s.name.lower(): s for s in db.query(State).all()}
    if not state_map:
        return

    for city_name, dist_name, state_name, lat, lon, food_rec, attractions in ALL_INDIA_CITIES_DATA:
        st_obj = state_map.get(state_name.lower())
        if not st_obj:
            continue

        clean_dist = dist_name.split("/")[0].strip()
        d_obj = db.query(District).filter(
            District.state_id == st_obj.id,
            District.name.ilike(clean_dist),
        ).first()
        if not d_obj:
            d_obj = District(
                state_id=st_obj.id,
                name=clean_dist,
                latitude=lat,
                longitude=lon,
                crime_index=26.0,
                safety_tier="LOW",
                description=f"Major tourism & cultural hub of {city_name} ({clean_dist}) in {st_obj.name}.",
            )
            db.add(d_obj)
            db.flush()

        for idx, (attr_title, attr_cat, fee, open_t, close_t, attr_desc) in enumerate(attractions):
            exists = db.query(TouristPlace).filter(
                TouristPlace.name == attr_title,
            ).first()
            if exists:
                continue

            p_lat = round(lat + idx * 0.0085, 5)
            p_lon = round(lon + idx * 0.0075, 5)
            w_sens = "HIGH" if attr_cat in ["Beach", "Nature", "Wildlife", "Waterfall", "Adventure", "Hill Station", "Viewpoint"] else "LOW" if attr_cat == "Museum" else "MEDIUM"

            history_full = (
                f"{attr_title} in {city_name}, {st_obj.name} is one of the premier {attr_cat.lower()} landmarks of {st_obj.region}. "
                f"{attr_desc} Visitors exploring {city_name} can also experience authentic regional cuisine including {food_rec}, "
                f"with convenient access via local city transport and state highways."
            )

            tp = TouristPlace(
                state_id=st_obj.id,
                district_id=d_obj.id,
                name=attr_title,
                state=st_obj.name,
                district=d_obj.name,
                city=city_name.split("(")[0].split("&")[0].strip(),
                latitude=p_lat,
                longitude=p_lon,
                category=attr_cat,
                sub_category=f"{attr_cat}, Heritage, Family, Couple, Photography",
                description=attr_desc,
                history=history_full,
                best_time="Morning (08:30 AM - 12:00 PM) & Late Afternoon",
                best_season="October to March",
                opening_time=open_t,
                closing_time=close_t,
                average_visit_duration=2.0,
                entry_fee=float(fee),
                rating=4.6,
                popularity=88.0,
                crowd_score=52.0,
                safety_score=87.0,
                weather_sensitivity=w_sens,
                activities=f"Sightseeing, Photography, Cultural Walk, {attr_cat}",
                family_friendly=True,
                couple_friendly=True,
                solo_friendly=True,
                senior_friendly=True,
                nearest_metro=f"{city_name.split('(')[0].strip()} Central Metro Station" if any(m in city_name.lower() for m in ["delhi", "mumbai", "kolkata", "chennai", "hyderabad", "bangalore", "jaipur", "kochi", "lucknow", "ahmedabad", "pune", "nagpur", "agra", "gurugram"]) else "N/A (Use City Bus / Auto / Cab)",
                nearest_bus_stop=f"{city_name.split('(')[0].strip()} Central Bus Terminal",
                nearest_airport=f"{city_name.split('(')[0].strip()} Airport",
                nearest_railway=f"{city_name.split('(')[0].strip()} Railway Junction",
                daily_budget_low=1400.0,
                daily_budget_mid=2800.0,
                daily_budget_luxury=6500.0,
                local_food_recommendations=food_rec,
                safety_notes="Safe during daytime operating hours; use official tourist guides and verified transit.",
                data_source="SafeTrip AI All-India Cities Master Catalog",
            )
            db.add(tp)
            db.flush()

            db.add(PlaceHistory(
                place_id=tp.id,
                history_text=history_full,
                establishment_year="Heritage Site",
                dynasty_or_era=st_obj.region,
                source_citation="Ministry of Tourism & State Tourism Development Corporation",
            ))

        # Ensure City has Verified Hotels & Restaurants
        clean_city = city_name.split("(")[0].split("&")[0].strip()
        if db.query(Hotel).filter(Hotel.city.ilike(f"%{clean_city}%")).count() == 0:
            db.add_all([
                Hotel(
                    district_id=d_obj.id,
                    name=f"The Grand Heritage Residency {clean_city}",
                    city=clean_city,
                    tier="Mid-Range",
                    price_per_night=2100.0,
                    rating=4.6,
                    safety_score=92.0,
                    amenities="24x7 Security, CCTV, Free Wi-Fi, Verified Airport/Station Shuttle, Breakfast",
                    latitude=round(lat + 0.004, 5),
                    longitude=round(lon + 0.004, 5),
                ),
                Hotel(
                    district_id=d_obj.id,
                    name=f"SafeStay Eco & Tourist Inn {clean_city}",
                    city=clean_city,
                    tier="Budget",
                    price_per_night=1100.0,
                    rating=4.4,
                    safety_score=89.0,
                    amenities="Verified Reception, Tourist Helpdesk, Clean Rooms, Family Safe",
                    latitude=round(lat - 0.004, 5),
                    longitude=round(lon - 0.004, 5),
                ),
            ])

        if db.query(Restaurant).filter(Restaurant.city.ilike(f"%{clean_city}%")).count() == 0:
            db.add_all([
                Restaurant(
                    district_id=d_obj.id,
                    name=f"Royal {st_obj.name} Spice & Heritage Kitchen ({clean_city})",
                    city=clean_city,
                    cuisine=f"Authentic {st_obj.name} & North/South Indian",
                    signature_dish=food_rec.split(",")[0].strip(),
                    avg_cost_for_two=550.0,
                    rating=4.6,
                    latitude=round(lat + 0.002, 5),
                    longitude=round(lon - 0.002, 5),
                ),
            ])


    # Add additional Metro cities if not present
    extra_metros = [
        ("Kolkata", "Kolkata Metro", "Esplanade / Park Street", "Blue / Green Line", "#2563eb", 1, 22.5646, 88.3516, True, "North-South & East-West", "Victoria Memorial, Indian Museum, Maidan"),
        ("Kochi", "Kochi Metro (KMRL)", "Maharaja's College / MG Road", "Blue Line", "#0284c7", 1, 9.9734, 76.2862, False, "Blue Line & Water Metro", "Marine Drive, Ernakulam Shiva Temple"),
        ("Lucknow", "Lucknow Metro (UPMRC)", "Hazratganj", "Red Line", "#dc2626", 1, 26.8505, 80.9467, False, "North-South Corridor", "Hazratganj Heritage Market, Bara Imambara"),
        ("Ahmedabad", "Gujarat Metro (GMRC)", "Old High Court Interchange", "Blue / Red Line", "#dc2626", 1, 23.0396, 72.5660, True, "East-West & North-South", "Sabarmati Riverfront, Walled City Pols"),
        ("Pune", "Pune Metro (MahaMetro)", "Civil Court / District Court", "Purple / Aqua Line", "#9333ea", 1, 18.5308, 73.8542, True, "Purple Line, Aqua Line", "Shaniwar Wada, Kasba Peth"),
        ("Nagpur", "Nagpur Metro (MahaMetro)", "Sitabuldi Interchange", "Orange / Aqua Line", "#ea580c", 1, 21.1431, 79.0805, True, "Orange Line, Aqua Line", "Zero Mile Freedom Park, Sitabuldi Fort"),
        ("Agra", "Agra Metro (UPMRC)", "Taj East Gate", "Yellow Line", "#eab308", 1, 27.1680, 78.0490, False, "Priority Corridor", "Taj Mahal, Agra Fort"),
    ]
    for city, net, st_name, line, col, order, m_lat, m_lon, inter, conn, nearby in extra_metros:
        if not db.query(MetroStation).filter(MetroStation.city == city, MetroStation.station_name == st_name).first():
            db.add(MetroStation(
                city=city, network_name=net, station_name=st_name, line_name=line,
                line_color=col, station_order=order, latitude=m_lat, longitude=m_lon,
                is_interchange=inter, connected_lines=conn, nearby_attractions=nearby
            ))

    db.commit()


def seed_database(db: Session):
    """
    Populates the 22 database tables if not already seeded,
    integrating ProjectCapstone/Dataset + PDF dataset + All-India Cities + ML models.
    """
    ensure_capstone_pdf_dataset()

    if db.query(State).count() > 0 and db.query(TouristPlace).count() >= 50:
        _seed_all_india_cities_catalog(db)
        # Ensure ML models exist
        if db.query(MlModelRecord).count() == 0:
            _seed_ml_models(db)
        return

    # 1. Seed Demo Users (USER & ADMIN)
    if db.query(User).count() == 0:
        demo_user = User(
            full_name="Aarav Sharma",
            email="user@safetrip.ai",
            password_hash=hash_password("user123"),
            role="USER",
            phone="+91-9876543210",
            home_city="Bangalore",
            preferences_json=json.dumps({
                "categories": ["Historical", "Couple", "Food", "Museum"],
                "crowdPreference": "low",
                "safetyPriority": "high",
                "travelMode": "public",
            }),
        )
        admin_user = User(
            full_name="Dr. Sai (SafeTrip AI Admin)",
            email="admin@safetrip.ai",
            password_hash=hash_password("admin123"),
            role="ADMIN",
            phone="+91-9900112233",
            home_city="Bangalore",
            preferences_json=json.dumps({"role_note": "MCA Major Project Administrator & ML Researcher"}),
        )
        db.add_all([demo_user, admin_user])
        db.commit()

    # 2. Seed Categories
    cat_map = {}
    for c_name in TOURISM_CATEGORIES:
        existing = db.query(Category).filter(Category.name == c_name).first()
        if not existing:
            existing = Category(name=c_name, icon="Compass", description=f"Explore verified {c_name} destinations across India")
            db.add(existing)
            db.flush()
        cat_map[c_name.lower()] = existing

    # 3. Seed All 36 States & Union Territories
    state_map = {}
    for name, code, region, capital, lat, lon, desc in ALL_36_STATES_UTS:
        st = db.query(State).filter(State.name == name).first()
        if not st:
            st = State(
                name=name, code=code, region=region, capital=capital,
                latitude=lat, longitude=lon, description=desc, avg_safety_score=84.0
            )
            db.add(st)
            db.flush()
        state_map[name.lower()] = st

    db.commit()

    # Helper to get or create district
    district_cache = {}
    def get_or_create_district(state_obj: State, dist_name: str, lat: float, lon: float, crime_idx: float = 28.0) -> District:
        clean_dist = dist_name.split(",")[0].strip() or state_obj.capital or state_obj.name
        key = (state_obj.id, clean_dist.lower())
        if key in district_cache:
            return district_cache[key]
        d = db.query(District).filter(District.state_id == state_obj.id, District.name == clean_dist).first()
        if not d:
            d = District(
                state_id=state_obj.id,
                name=clean_dist,
                latitude=lat,
                longitude=lon,
                crime_index=crime_idx,
                safety_tier="LOW" if crime_idx < 38 else ("MEDIUM" if crime_idx < 65 else "HIGH"),
                description=f"Tourism & cultural district of {clean_dist} in {state_obj.name}.",
            )
            db.add(d)
            db.flush()
        district_cache[key] = d
        return d

    # 4. Seed Curated Granular Places (Delhi 12 places, Karnataka Mysore/Bangalore, etc.)
    for item in CURATED_GRANULAR_PLACES:
        st_obj = state_map.get(item["state"].lower()) or state_map["delhi"]
        d_obj = get_or_create_district(st_obj, item["district"], item["latitude"], item["longitude"], crime_idx=30.0)
        exists = db.query(TouristPlace).filter(TouristPlace.name == item["name"], TouristPlace.city == item["city"]).first()
        if exists:
            continue
        p = TouristPlace(
            state_id=st_obj.id,
            district_id=d_obj.id,
            name=item["name"],
            state=st_obj.name,
            district=d_obj.name,
            city=item["city"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            category=item["category"],
            sub_category=item["sub_category"],
            description=item["description"],
            history=item["history"],
            best_time=item["best_time"],
            opening_time=item["opening_time"],
            closing_time=item["closing_time"],
            average_visit_duration=item["average_visit_duration"],
            entry_fee=item["entry_fee"],
            rating=item["rating"],
            popularity=item["popularity"],
            crowd_score=item["crowd_score"],
            safety_score=item["safety_score"],
            weather_sensitivity=item["weather_sensitivity"],
            nearest_metro=item.get("nearest_metro"),
            nearest_bus_stop=item.get("nearest_bus_stop"),
            local_food_recommendations=item.get("local_food_recommendations"),
            couple_friendly="couple" in item["sub_category"].lower(),
            family_friendly="family" in item["sub_category"].lower() or True,
            solo_friendly=True,
            senior_friendly=True,
            data_source="SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf + ASI Records",
        )
        db.add(p)
        db.flush()

        # PlaceHistory record
        ph = PlaceHistory(
            place_id=p.id,
            history_text=item["history"],
            establishment_year="Historical Monument",
            dynasty_or_era="Indian Heritage",
            source_citation="Archaeological Survey of India (ASI) / ProjectCapstone Dataset",
        )
        db.add(ph)

        # PlaceCategories
        for sub_c in [x.strip() for x in item["sub_category"].split(",")]:
            c_obj = cat_map.get(sub_c.lower())
            if c_obj:
                db.add(PlaceCategory(place_id=p.id, category_id=c_obj.id))

        # CrowdData samples
        db.add_all([
            CrowdData(place_id=p.id, day_type="Weekday", season="Peak", time_slot="Morning", crowd_level="Low", occupancy_index=max(20, item["crowd_score"] - 20)),
            CrowdData(place_id=p.id, day_type="Weekend", season="Peak", time_slot="Evening", crowd_level="High" if item["crowd_score"] > 60 else "Moderate", occupancy_index=min(95, item["crowd_score"] + 15)),
        ])

    # 5. Seed All 100 Destinations & Primary Attractions from india_tourism_dataset.json
    json_path = DATASET_DIR / "Indian Tourism Dataset" / "india_tourism_dataset.json"
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            raw_destinations = json.load(f)

        for dest in raw_destinations:
            raw_state = dest.get("state", "Karnataka").split("/")[0].split("(")[0].strip()
            if raw_state == "Andaman & Nicobar":
                raw_state = "Andaman and Nicobar Islands"
            st_obj = state_map.get(raw_state.lower())
            if not st_obj:
                # Find closest match
                for k, v in state_map.items():
                    if k in raw_state.lower() or raw_state.lower() in k:
                        st_obj = v
                        break
            if not st_obj:
                st_obj = state_map["karnataka"]

            coords = dest.get("coordinates", {})
            lat = float(coords.get("latitude", st_obj.latitude))
            lon = float(coords.get("longitude", st_obj.longitude))
            dist_str = dest.get("district", st_obj.capital or st_obj.name)
            safety_rat = float(dest.get("safety_rating", 8)) * 10.0
            crime_idx = max(12.0, 100.0 - safety_rat)
            d_obj = get_or_create_district(st_obj, dist_str, lat, lon, crime_idx=crime_idx)

            dest_name = dest.get("destination_name", "Destination").split("(")[0].strip()
            trip_types = dest.get("trip_types", ["Heritage", "Nature"])
            primary_cat = trip_types[0] if trip_types else "Heritage"
            if primary_cat == "Pilgrimage":
                primary_cat = "Spiritual"
            elif primary_cat == "Hill_Station":
                primary_cat = "Hill Station"

            attractions = dest.get("primary_attractions", [])
            cuisine_list = dest.get("local_cuisine_must_try", [])
            cuisine_str = ", ".join(cuisine_list[:4]) if cuisine_list else "Regional Indian Specialties"
            culture_txt = dest.get("local_culture", "")
            unique_txt = dest.get("unique_experiences", "")
            reviews_txt = dest.get("user_reviews_summary", "")
            safety_notes = dest.get("safety_notes", "Generally safe during daytime hours.")
            budget_cat = dest.get("budget_category", {})
            mid_cat = dest.get("mid_range_category", {})
            lux_cat = dest.get("luxury_category", {})

            daily_low = float((budget_cat.get("total_daily_range") or [1400, 2500])[0])
            daily_mid = float((mid_cat.get("total_daily_range") or [3000, 5500])[0])
            daily_lux = float((lux_cat.get("total_daily_range") or [8000, 15000])[0])

            history_120w = (
                f"{dest_name} in {d_obj.name} ({st_obj.name}) is a historically and culturally significant destination "
                f"in {dest.get('region', 'India')}. {culture_txt} Known for {', '.join(attractions[:4])}, "
                f"the region has preserved centuries-old architectural, ecological, and spiritual traditions. "
                f"Visitors experience {unique_txt.lower() if unique_txt else 'distinctive regional heritage'}, "
                f"while local customs reflect {dest.get('local_customs', 'warm Indian hospitality and sacred heritage')}."
            )

            # Add main destination hub + top primary attractions as distinct searchable places
            place_entries = [(dest_name, lat, lon, 0)]
            for idx_a, attr_name in enumerate(attractions[:2]):
                offset_lat = round(lat + (idx_a + 1) * 0.012, 5)
                offset_lon = round(lon + (idx_a + 1) * 0.011, 5)
                place_entries.append((f"{attr_name} ({dest_name})", offset_lat, offset_lon, 40 if idx_a == 0 else 0))

            for p_title, p_lat, p_lon, p_fee in place_entries:
                if db.query(TouristPlace).filter(TouristPlace.name == p_title).first():
                    continue
                pop_score = float(dest.get("popularity_score", 8)) * 10.0
                w_sens = "HIGH" if primary_cat in ["Beach", "Nature", "Wildlife", "Waterfall", "Adventure", "Trekking"] else "MEDIUM"
                ideal_for = dest.get("ideal_for", [])
                sub_cats = ", ".join(set(trip_types + ["Couple" if "Couple" in ideal_for or "Couples" in ideal_for else "Family"]))

                tp = TouristPlace(
                    state_id=st_obj.id,
                    district_id=d_obj.id,
                    name=p_title,
                    state=st_obj.name,
                    district=d_obj.name,
                    city=dest_name,
                    latitude=p_lat,
                    longitude=p_lon,
                    category=primary_cat,
                    sub_category=sub_cats,
                    description=f"{unique_txt}. {reviews_txt}".strip(". "),
                    history=history_120w,
                    best_time="Morning (08:30 AM - 12:00 PM) & Late Afternoon",
                    best_season=", ".join(dest.get("best_seasons", ["Winter", "Post-Monsoon"])),
                    opening_time="08:00",
                    closing_time="18:30",
                    average_visit_duration=2.5,
                    entry_fee=p_fee,
                    rating=round(min(4.9, 4.1 + (pop_score / 120.0)), 1),
                    popularity=pop_score,
                    crowd_score=min(90.0, max(25.0, pop_score - 8.0)),
                    safety_score=safety_rat,
                    weather_sensitivity=w_sens,
                    activities=", ".join(dest.get("activities_available", ["Sightseeing", "Photography"])),
                    family_friendly=True,
                    couple_friendly=True,
                    solo_friendly=True,
                    senior_friendly=dest.get("accessibility", "Easy") == "Easy",
                    nearest_bus_stop=f"{dest_name} Central State Transport Stand",
                    nearest_airport=dest.get("nearest_airport", {}).get("name", "Regional Domestic Airport"),
                    nearest_railway=dest.get("nearest_railway_station", {}).get("name", "Nearest Junction Railway Station"),
                    daily_budget_low=daily_low,
                    daily_budget_mid=daily_mid,
                    daily_budget_luxury=daily_lux,
                    local_food_recommendations=cuisine_str,
                    safety_notes=safety_notes,
                    data_source="ProjectCapstone/Dataset/Indian Tourism Dataset/india_tourism_dataset.json",
                )
                db.add(tp)
                db.flush()

                db.add(PlaceHistory(
                    place_id=tp.id,
                    history_text=history_120w,
                    establishment_year="Heritage Circuit",
                    dynasty_or_era=dest.get("region", "Indian Cultural Heritage"),
                    source_citation="Ministry of Tourism / ProjectCapstone Indian Tourism Dataset",
                ))

    db.commit()

    # 6. Seed Metro Stations (Delhi Metro, Bengaluru Namma Metro, Mumbai Metro, Chennai Metro, Hyderabad Metro)
    if db.query(MetroStation).count() == 0:
        metro_seed = [
            ("Delhi", "Delhi Metro (DMRC)", "Rajiv Chowk", "Yellow / Blue Line", "#eab308", 1, 28.6328, 77.2197, True, "Yellow Line, Blue Line", "Connaught Place, Janpath, Jantar Mantar"),
            ("Delhi", "Delhi Metro (DMRC)", "Central Secretariat", "Yellow / Violet Line", "#7c3aed", 2, 28.6147, 77.2119, True, "Yellow Line, Violet Line", "India Gate, Rashtrapati Bhavan, National War Memorial, National Museum"),
            ("Delhi", "Delhi Metro (DMRC)", "Chandni Chowk", "Yellow Line", "#eab308", 3, 28.6578, 77.2301, False, "Yellow Line", "Chandni Chowk Bazaar, Paranthe Wali Gali, Sis Ganj Gurudwara"),
            ("Delhi", "Delhi Metro (DMRC)", "Lal Qila", "Violet Line", "#7c3aed", 4, 28.6559, 77.2389, False, "Violet Line", "Red Fort (Lal Qila)"),
            ("Delhi", "Delhi Metro (DMRC)", "Jama Masjid", "Violet Line", "#7c3aed", 5, 28.6502, 77.2376, False, "Violet Line", "Jama Masjid, Matia Mahal"),
            ("Delhi", "Delhi Metro (DMRC)", "JLN Stadium", "Violet Line", "#7c3aed", 6, 28.5830, 77.2336, False, "Violet Line", "Humayun's Tomb, Sunder Nursery, Lodhi Garden"),
            ("Delhi", "Delhi Metro (DMRC)", "Qutab Minar", "Yellow Line", "#eab308", 7, 28.5127, 77.1864, False, "Yellow Line", "Qutub Minar Archaeological Complex, Mehrauli"),
            ("Delhi", "Delhi Metro (DMRC)", "Kalkaji Mandir", "Violet / Magenta Line", "#db2777", 8, 28.5494, 77.2604, True, "Violet Line, Magenta Line", "Lotus Temple (Bahá'í House of Worship)"),
            ("Delhi", "Delhi Metro (DMRC)", "Akshardham", "Blue Line", "#2563eb", 9, 28.6182, 77.2789, False, "Blue Line", "Swaminarayan Akshardham Temple"),
            ("Bangalore", "Namma Metro (BMRCL)", "Nadaprabhu Kempegowda (Majestic)", "Purple / Green Line", "#9333ea", 1, 12.9757, 77.5728, True, "Purple Line, Green Line", "KSR Bengaluru Railway Station, Kempegowda Bus Terminal"),
            ("Bangalore", "Namma Metro (BMRCL)", "Cubbon Park", "Purple Line", "#9333ea", 2, 12.9807, 77.5973, False, "Purple Line", "Cubbon Park, Visvesvaraya Museum, Vidhana Soudha, Bangalore Palace"),
            ("Bangalore", "Namma Metro (BMRCL)", "Lalbagh", "Green Line", "#16a34a", 3, 12.9465, 77.5801, False, "Green Line", "Lalbagh Botanical Garden, MTR"),
            ("Mumbai", "Mumbai Metro & Suburban", "Churchgate / CSMT Hub", "Aqua Line 3", "#0284c7", 1, 18.9322, 72.8264, True, "Line 3, Western/Central Line", "Gateway of India, Marine Drive, CSMVS Museum"),
            ("Chennai", "Chennai Metro (CMRL)", "Puratchi Thalaivar Dr. M.G.R. Central", "Blue / Green Line", "#2563eb", 1, 13.0822, 80.2755, True, "Blue Line, Green Line", "Marina Beach, Fort St. George"),
            ("Hyderabad", "Hyderabad Metro (HMRL)", "MG Bus Station (MGBS)", "Red / Green Line", "#dc2626", 1, 17.3782, 78.4843, True, "Red Line, Green Line", "Charminar, Salar Jung Museum"),
            ("Jaipur", "Jaipur Metro (JMRC)", "Badi Chaupar", "Pink Line", "#ec4899", 1, 26.9235, 75.8268, False, "Pink Line", "Hawa Mahal, City Palace Jaipur, Jantar Mantar"),
        ]
        for city, net, st_name, line, col, order, lat, lon, inter, conn, nearby in metro_seed:
            db.add(MetroStation(
                city=city, network_name=net, station_name=st_name, line_name=line,
                line_color=col, station_order=order, latitude=lat, longitude=lon,
                is_interchange=inter, connected_lines=conn, nearby_attractions=nearby
            ))

    # 7. Seed Bus Stops, Hotels, Restaurants & Intercity Routes
    if db.query(BusStop).count() == 0:
        db.add_all([
            BusStop(city="Delhi", stop_name="India Gate Kartavya Path DTC Stop", operator="DTC Electric Fleet", routes_served="335, 405, 505, HOHO Tourist Bus", latitude=28.6125, longitude=77.2280, nearby_place="India Gate"),
            BusStop(city="Delhi", stop_name="Red Fort Netaji Subhash Marg Terminal", operator="DTC / Cluster Bus", routes_served="104, 216, 419, 901", latitude=28.6550, longitude=77.2395, nearby_place="Red Fort & Chandni Chowk"),
            BusStop(city="Delhi", stop_name="Qutub Minar Mehrauli Terminal", operator="DTC AC Express", routes_served="505, 534, 715, Airport Express Feeder", latitude=28.5238, longitude=77.1862, nearby_place="Qutub Minar"),
            BusStop(city="Mysore", stop_name="Mysore Palace City Bus Stand", operator="KSRTC Mysuru", routes_served="101, 201 (Chamundi Hill), 303 (Brindavan Gardens)", latitude=12.3075, longitude=76.6540, nearby_place="Mysore Palace"),
            BusStop(city="Bangalore", stop_name="Kempegowda (Majestic) BMTC Volvos", operator="BMTC Vajra AC", routes_served="KIA-9, 201R, 335E, Hop-On Sightseeing", latitude=12.9772, longitude=77.5715, nearby_place="Bangalore City Center"),
        ])

    if db.query(Hotel).count() == 0:
        delhi_dist = db.query(District).filter(District.name.ilike("%Delhi%")).first()
        mys_dist = db.query(District).filter(District.name.ilike("%Mysuru%")).first() or delhi_dist
        if delhi_dist:
            db.add_all([
                Hotel(district_id=delhi_dist.id, name="Hotel Connaught Royale Heritage", city="Delhi", tier="Mid-Range", price_per_night=1800, rating=4.5, safety_score=92, latitude=28.6305, longitude=77.2185),
                Hotel(district_id=delhi_dist.id, name="Zostel & Backpackers Safe Stay New Delhi", city="Delhi", tier="Budget", price_per_night=950, rating=4.4, safety_score=88, latitude=28.6425, longitude=77.2140),
                Hotel(district_id=delhi_dist.id, name="The Imperial Lutyens Sanctuary", city="Delhi", tier="Luxury", price_per_night=7800, rating=4.9, safety_score=97, latitude=28.6255, longitude=77.2192),
                Hotel(district_id=mys_dist.id, name="Royal Orchid Metropole Mysuru", city="Mysore", tier="Mid-Range", price_per_night=2200, rating=4.6, safety_score=93, latitude=12.3102, longitude=76.6428),
            ])

    if db.query(Restaurant).count() == 0:
        delhi_dist = db.query(District).filter(District.name.ilike("%Delhi%")).first()
        mys_dist = db.query(District).filter(District.name.ilike("%Mysuru%")).first() or delhi_dist
        if delhi_dist:
            db.add_all([
                Restaurant(district_id=delhi_dist.id, name="Saravana Bhavan Connaught Place", city="Delhi", cuisine="South & North Indian Vegetarian", signature_dish="Mini Tiffin & Masala Dosa", avg_cost_for_two=550, rating=4.6, latitude=28.6318, longitude=77.2178),
                Restaurant(district_id=delhi_dist.id, name="Karim's Royal Mughlai Kitchen (Est. 1913)", city="Delhi", cuisine="Mughlai Heritage", signature_dish="Mutton Burra & Shahi Tukda", avg_cost_for_two=800, rating=4.5, latitude=28.6495, longitude=77.2338),
                Restaurant(district_id=delhi_dist.id, name="Gulati Spice Market Restaurant Pandara Road", city="Delhi", cuisine="North Indian & Kebabs", signature_dish="Dal Makhani & Butter Chicken", avg_cost_for_two=1100, rating=4.7, latitude=28.6085, longitude=77.2312),
                Restaurant(district_id=mys_dist.id, name="Original Vinayaka Mylari (Est. 1938)", city="Mysore", cuisine="Authentic Mysuru Tiffin", signature_dish="Benne Masala Dosa & Filter Coffee", avg_cost_for_two=250, rating=4.7, latitude=12.3125, longitude=76.6612),
            ])

    # 8. Seed Initial Community & Historical Incident Reports (Section 18 & 19)
    if db.query(IncidentReport).count() == 0:
        db.add_all([
            IncidentReport(
                location_name="Old Delhi Railway Station & Chandni Chowk Outer Lanes",
                city="Delhi", state="Delhi", date="2026-08-14", time="22:15",
                category="Scam",
                description="Unregistered touts claiming Metro gates are closed and overcharging ₹600 for short auto trips late at night. Use official DMRC gates or prepaid booth.",
                severity="HIGH", latitude=28.6562, longitude=77.2310, status="APPROVED", source_type="USER_REPORT"
            ),
            IncidentReport(
                location_name="Connaught Place Outer Circle Unmarked Guides",
                city="Delhi", state="Delhi", date="2026-09-02", time="16:30",
                category="Fraud",
                description="Fake 'Government Emporium Sale' rickshaw diversion scam targeting first-time tourists. Verify official state emporiums on Baba Kharak Singh Marg.",
                severity="MEDIUM", latitude=28.6315, longitude=77.2167, status="APPROVED", source_type="USER_REPORT"
            ),
            IncidentReport(
                location_name="Jaipur Amber Fort Elephant Ramp",
                city="Jaipur", state="Rajasthan", date="2026-07-19", time="13:00",
                category="Crowd issue",
                description="High afternoon bottleneck and unauthorized photography touts on narrow cobbled ramp during weekend peak hours.",
                severity="MEDIUM", latitude=26.9855, longitude=75.8513, status="APPROVED", source_type="USER_REPORT"
            ),
            IncidentReport(
                location_name="Goa Baga Parking Belt",
                city="Goa", state="Goa", date="2026-08-25", time="23:30",
                category="Transport issue",
                description="Late-night non-metered cab surge pricing outside beach shacks. Pre-book GoaMiles app cab or hotel shuttle.",
                severity="MEDIUM", latitude=15.5553, longitude=73.7517, status="APPROVED", source_type="USER_REPORT"
            ),
        ])

    # 9. Seed Dataset Registry (Section 46: source, license, download date, description)
    if db.query(DatasetRegistry).count() == 0:
        db.add_all([
            DatasetRegistry(
                name="SafeTrip AI Indian Tourism & Safety PDF Dataset",
                source="ProjectCapstone/Dataset/SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf",
                license="Academic Capstone & Open Data Attribution",
                download_date="2026-01-12",
                record_count=190,
                missing_values_count=0,
                features_list="state, district, city, name, latitude, longitude, category, entry_fee, rating, safety_score, crowd_score, weather_sensitivity",
                file_path=str(DATASET_DIR / "SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf"),
                description="Structured PDF dataset containing verified Indian tourist monuments, coordinates, safety scores, and multi-factor ML risk observations.",
            ),
            DatasetRegistry(
                name="Indian Tourism Destinations Master Dataset (JSON)",
                source="ProjectCapstone/Dataset/Indian Tourism Dataset/india_tourism_dataset.json",
                license="CC BY 4.0 / Public Tourism Knowledge Base",
                download_date="2026-01-12",
                record_count=100,
                missing_values_count=0,
                features_list="destination_name, state, district, coordinates, budget_category, trip_types, primary_attractions, safety_rating, best_seasons",
                file_path=str(DATASET_DIR / "Indian Tourism Dataset" / "india_tourism_dataset.json"),
                description="100 comprehensive Indian tourism circuits with seasonal temperatures, budgets, safety ratings, and accessibility metrics.",
            ),
            DatasetRegistry(
                name="Indian Road Accident & Traffic Density Dataset (2022–2025)",
                source="ProjectCapstone/Dataset/Indian Road Accident Dataset (2022-2025)/indian_roads_dataset.csv",
                license="Open Data Commons (ODC-By)",
                download_date="2025-11-20",
                record_count=20000,
                missing_values_count=340,
                features_list="city, state, latitude, longitude, hour, day_of_week, weather, visibility, temperature, traffic_density, is_peak_hour, festival, risk_score",
                file_path=str(DATASET_DIR / "Indian Road Accident Dataset (2022–2025)" / "indian_roads_dataset.csv"),
                description="Granular road safety, traffic crowd density, weather visibility, and route risk scores across Indian cities.",
            ),
            DatasetRegistry(
                name="Daily Rainfall Data India (2009–2024) & IMD Historical Weather",
                source="ProjectCapstone/Dataset/archiveDaily Rainfall Data - India (2009-2024)/daily-rainfall-at-state-level.csv",
                license="Government Open Data License - India (NDSAP)",
                download_date="2025-10-05",
                record_count=204800,
                missing_values_count=112,
                features_list="date, state_code, state_name, actual, rfs, normal, deviation",
                file_path=str(DATASET_DIR / "archiveDaily Rainfall Data - India (2009-2024)" / "daily-rainfall-at-state-level.csv"),
                description="State-wise daily precipitation and seasonal deviation records used to train the Weather-Activity Risk classification model.",
            ),
            DatasetRegistry(
                name="NCRB Crime in India District & Occurrence Datasets",
                source="ProjectCapstone/Dataset/Crime in India/crime/01_District_wise_crimes_committed_IPC_2014.csv",
                license="National Crime Records Bureau (NCRB) Open Government Data India",
                download_date="2025-09-18",
                record_count=9840,
                missing_values_count=0,
                features_list="States/UTs, District, Theft, Robbery, Cheating, Fraud, Crimes Against Women, Highway & Railway Occurrence",
                file_path=str(DATASET_DIR / "Crime in India" / "crime" / "01_District_wise_crimes_committed_IPC_2014.csv"),
                description="Official district-wise IPC crime, theft, fraud, and place-of-occurrence records used to train the Scam & Location Risk model.",
            ),
        ])

    # 10. Seed Initial PDF Upload Record from SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf
    if db.query(PdfUpload).count() == 0:
        pdf_path = ensure_capstone_pdf_dataset()
        parsed_info = parse_tourism_pdf(pdf_path)
        db.add(PdfUpload(
            uploaded_by=2,
            filename="SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf",
            file_size_bytes=pdf_path.stat().st_size,
            dataset_source="ProjectCapstone/Dataset/SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf",
            status="APPROVED",
            extracted_text_preview=parsed_info["text_preview"][:800],
            extracted_records_count=parsed_info["extracted_records_count"],
            valid_records_count=parsed_info["valid_records_count"],
            invalid_records_count=parsed_info["invalid_records_count"],
            extracted_json=json.dumps(parsed_info["records"][:35]),
            validation_errors_json=json.dumps(parsed_info["validation_errors"]),
            approved_at=datetime.utcnow(),
        ))

    # 10b. Seed All-India Cities Catalog across all 36 States & Union Territories
    _seed_all_india_cities_catalog(db)

    db.commit()

    # 11. Train & Persist ML Models if not yet in DB
    if db.query(MlModelRecord).count() == 0:
        _seed_ml_models(db)



def _seed_ml_models(db: Session):
    trained_list = train_all_models()
    db.query(MlModelRecord).delete()
    for m in trained_list:
        rec = MlModelRecord(
            model_name=m["model_name"],
            target_task=m["target_task"],
            selected_algorithm=m["selected_algorithm"],
            version=m["version"],
            dataset_source=m["dataset_source"],
            dataset_size=m["dataset_size"],
            features_json=json.dumps(m["features"]),
            missing_values_handled=m["missing_values_handled"],
            duplicates_removed=m["duplicates_removed"],
            train_accuracy=m["train_accuracy"],
            val_accuracy=m["val_accuracy"],
            precision_score=m["precision_score"],
            recall_score=m["recall_score"],
            f1_score=m["f1_score"],
            roc_auc=m["roc_auc"],
            confusion_matrix_json=json.dumps(m["confusion_matrix"]),
            feature_importance_json=json.dumps(m["feature_importance"]),
            comparison_metrics_json=json.dumps(m["comparison_metrics"]),
            selection_rationale=m["selection_rationale"],
            file_path=m["file_path"],
        )
        db.add(rec)
    db.commit()
