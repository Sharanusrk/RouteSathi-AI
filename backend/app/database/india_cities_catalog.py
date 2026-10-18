"""
Comprehensive All-India Cities, Districts & Tourist Attractions Catalog
Covers all 28 States and 8 Union Territories (210+ Indian Cities & Tourism Hubs).
Each city entry includes coordinates, district, category, and iconic attractions
so that every Indian city has rich multi-day trip planning, routing, weather,
safety, hotel, and dining support.
"""

ALL_INDIA_CITIES_DATA = [
    # ==================== 1. ANDHRA PRADESH ====================
    ("Visakhapatnam", "Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185, "Pulihora, Bamboo Chicken & Vizag Seafood", [
        ("RK Beach & INS Kurusura Submarine Museum", "Beach", 40, "09:00", "20:30", "South India's iconic submarine museum on Ramakrishna Beach showcasing a decommissioned Soviet-era Kalvari-class submarine."),
        ("Kailasagiri Hill Park & Ropeway", "Viewpoint", 50, "09:00", "20:00", "Scenic 360-foot hilltop park overlooking the Bay of Bengal featuring giant Shiva-Parvati statues and cable car."),
        ("Simhachalam Varaha Lakshmi Narasimha Temple", "Temple", 0, "07:00", "19:00", "Ancient 11th-century Kalinga-Chalukya hilltop Vaishnavite shrine renowned for its carved stone chariot and kalyana mandapa."),
        ("Yarada Beach & Dolphin's Nose Lighthouse", "Beach", 30, "08:00", "17:30", "Pristine golden cove flanked by lush Eastern Ghats hills and the historic Dolphin's Nose maritime lighthouse."),
    ]),
    ("Tirupati", "Tirupati", "Andhra Pradesh", 13.6288, 79.4192, "Tirupati Laddu Prasadam & Rayalaseema Ragi Sangati", [
        ("Sri Venkateswara Swamy Temple Tirumala", "Temple", 0, "04:00", "23:00", "World-renowned ancient Dravidian hilltop shrine on the seven peaks of Seshachalam Hills patronized by Pallava, Chola, and Vijayanagara dynasties."),
        ("Sri Padmavathi Ammavari Temple Tiruchanur", "Temple", 0, "06:00", "20:00", "Sacred shrine dedicated to Goddess Padmavathi featuring the historic Padma Sarovaram temple tank."),
        ("Chandragiri Fort & Vijayanagara Palace", "Fort", 25, "09:30", "17:00", "11th-century citadel and later Vijayanagara royal capital housing the Indo-Saracenic Raja Mahal and Rani Mahal."),
        ("Sri Vari Museum & Silathoranam Natural Arch", "Museum", 0, "08:00", "18:00", "Geological wonder featuring a rare 2.5-billion-year-old natural rock arch and temple heritage gallery."),
    ]),
    ("Vijayawada", "NTR Vijayawada", "Andhra Pradesh", 16.5062, 80.6480, "Pesarattu Upma & Bandar Laddu", [
        ("Kanaka Durga Temple Indrakeeladri", "Temple", 0, "05:00", "21:00", "Sacred hilltop Shakti Peetham overlooking the Krishna River and Prakasam Barrage."),
        ("Undavalli Caves", "Historical", 25, "09:00", "17:30", "4th-to-5th century Vishnukundina monolithic rock-cut sandstone cave temples featuring a giant reclining Vishnu sculpture."),
        ("Prakasam Barrage & Bhavani Island", "Nature", 50, "08:00", "18:30", "Historic 1.2-kilometer dam across the Krishna River and one of India's largest river islands."),
    ]),
    ("Amaravati", "Guntur", "Andhra Pradesh", 16.5131, 80.5165, "Gongura Pachadi & Andhra Thali", [
        ("Amaravati Mahachaitya Buddhist Stupa & Museum", "Historical", 25, "09:00", "17:00", "3rd-century BCE Satavahana Buddhist stupa site and ASI museum preserving intricate limestone relief medallions."),
        ("Amareswara Swamy Temple", "Temple", 0, "06:00", "20:00", "One of the sacred Pancharama Kshetras situated on the southern bank of the Krishna River."),
    ]),
    ("Araku Valley", "Alluri Sitharama Raju", "Andhra Pradesh", 18.3273, 82.8775, "Araku Arabica Coffee & Bongu Chicken", [
        ("Borra Caves", "Nature", 80, "10:00", "17:00", "Million-year-old karstic limestone stalactite and stalagmite caves at 705 meters elevation in the Ananthagiri Hills."),
        ("Padmapuram Botanical Gardens & Tribal Museum", "Museum", 40, "09:00", "18:00", "Historic WWII-era horticultural garden with tree-top huts and the Araku Indigenous Tribal Culture Museum."),
    ]),
    ("Kurnool", "Kurnool", "Andhra Pradesh", 15.8281, 78.0373, "Rayalaseema Uggani Bajji & Jowar Roti", [
        ("Belum Caves", "Nature", 65, "10:00", "17:00", "Second-longest natural cave system on the Indian subcontinent featuring subterranean passages, siphons, and Patalaganga stream."),
        ("Konda Reddy Buruju & Oravakallu Rock Garden", "Historical", 30, "09:00", "18:00", "16th-century Vijayanagara watchtower bastion and ancient igneous silica rock formations."),
    ]),
    ("Rajahmundry", "East Godavari", "Andhra Pradesh", 17.0005, 81.8040, "Pootharekulu, Rose Milk & Godavari Pulasa", [
        ("Godavari Pushkar Ghat & Havelock Bridge", "Heritage", 0, "06:00", "21:00", "Historic 19th-century rail bridge and sacred riverside ghats in the cultural capital of Andhra Pradesh."),
        ("Papikondalu River Gorge Cruise Point", "Nature", 200, "07:30", "17:30", "Scenic boat excursion corridor through the forested Eastern Ghats gorges along the Godavari River."),
    ]),
    ("Lepakshi", "Sri Sathya Sai", "Andhra Pradesh", 13.8040, 77.6090, "Rayalaseema Tiffin & Groundnut Chutney", [
        ("Veerabhadra Temple & Hanging Pillar Lepakshi", "Historical", 0, "06:00", "18:00", "16th-century Vijayanagara architectural marvel famous for its suspended stone pillar, frescoes, and monolithic Nandi."),
    ]),

    # ==================== 2. ARUNACHAL PRADESH ====================
    ("Itanagar", "Papum Pare", "Arunachal Pradesh", 27.0844, 93.6053, "Thukpa, Bamboo Shoot Pork & Apong", [
        ("Ita Fort & Jawaharlal Nehru State Museum", "Fort", 20, "09:00", "17:00", "14th-century Chutiya dynasty brick fortress ('Fort of Bricks') and state ethnographic museum."),
        ("Ganga Lake (Gekar Sinyi) & Gompa", "Nature", 30, "08:00", "17:00", "Emerald foothill forest lake and hilltop Buddhist monastery consecrated by the Dalai Lama."),
    ]),
    ("Tawang", "Tawang", "Arunachal Pradesh", 27.5861, 91.8594, "Monpa Zan, Gyapa Khazi & Butter Tea", [
        ("Tawang Monastery (Galden Namgey Lhatse)", "Spiritual", 0, "07:00", "18:00", "Founded in 1680–81 by Merak Lama Lodre Gyatso, the largest monastery in India and second-largest in the world."),
        ("Sela Pass & Madhuri Lake (Shonga-tser)", "Viewpoint", 0, "06:00", "16:30", "High-altitude 13,700-foot Himalayan pass and glacial lake surrounded by snow-clad peaks."),
        ("Tawang War Memorial", "Historical", 0, "08:00", "18:00", "40-foot multi-hued stupa-style memorial honoring 2,420 Indian soldiers of the 1962 Sino-Indian conflict."),
    ]),
    ("Ziro", "Lower Subansiri", "Arunachal Pradesh", 27.5449, 93.8197, "Pika Pila & Smoked Bamboo Delicacies", [
        ("Ziro Apatani Cultural Landscape & Paddy-Cum-Fish Farms", "Cultural", 0, "07:00", "17:30", "UNESCO tentative heritage valley famed for sustainable Apatani wet-rice cultivation and pine hills."),
        ("Talley Valley Wildlife Sanctuary", "Wildlife", 50, "07:00", "16:00", "Sub-tropical and alpine biodiversity reserve home to clouded leopards and giant silver fir trees."),
    ]),
    ("Bomdila", "West Kameng", "Arunachal Pradesh", 27.2645, 92.4159, "Steamed Momos & Herbal Buckwheat Pancakes", [
        ("Bomdila Monastery (Gentse Gaden Rabgyel Ling)", "Spiritual", 0, "07:00", "18:00", "Replica of Tsongkhapa's Tsona Gontse monastery offering panoramic views of Kangto and Gorichen peaks."),
    ]),

    # ==================== 3. ASSAM ====================
    ("Guwahati", "Kamrup Metropolitan", "Assam", 26.1445, 91.7362, "Assam Laksa, Masor Tenga & Pitha", [
        ("Kamakhya Temple Nilachal Hill", "Temple", 0, "05:30", "18:30", "One of the oldest and most revered 51 Shakti Peethas overlooking the mighty Brahmaputra River."),
        ("Umananda Peacock Island & Brahmaputra River Heritage Center", "Heritage", 40, "08:30", "17:30", "World's smallest inhabited river island housing a 17th-century Ahom-era Shiva temple and colonial riverfront bungalow."),
        ("Assam State Museum & Srimanta Sankaradeva Kalakshetra", "Museum", 30, "10:00", "17:00", "Premier Northeast cultural museum preserving Ahom royal manuscripts, sculptures, and Sattriya arts."),
    ]),
    ("Kaziranga", "Golaghat", "Assam", 26.5775, 93.1711, "Assamese Duck Curry, Khar & Black Tea", [
        ("Kaziranga National Park (UNESCO World Heritage)", "Wildlife", 250, "06:30", "16:30", "World's largest habitat of the Great Indian One-Horned Rhinoceros, royal Bengal tigers, and wild water buffalo."),
        ("Kaziranga National Orchid and Biodiversity Park", "Nature", 100, "08:00", "17:30", "Houses over 600 wild orchid species of Northeast India and live Bihu folk cultural performances."),
    ]),
    ("Majuli", "Majuli", "Assam", 26.9500, 94.1667, "Baked River Fish & Traditional Assamese Thali", [
        ("Majuli Neo-Vaishnavite Satras (Kamalabari & Samaguri)", "Cultural", 0, "08:00", "17:30", "World's largest river island in the Brahmaputra, famed for 16th-century Srimanta Sankaradeva monasteries and mask-making."),
    ]),
    ("Sivasagar", "Sivasagar", "Assam", 26.9826, 94.6425, "Ahom Heritage Feast & Jolpan", [
        ("Rang Ghar & Talatal Ghar Ahom Royal Complex", "Historical", 25, "09:00", "17:00", "18th-century two-storey royal amphitheater (Asia's oldest surviving pavilion) and seven-storey Ahom palace."),
    ]),
    ("Jorhat", "Jorhat", "Assam", 26.7509, 94.2037, "Assam Orthodox Tea & Pitha", [
        ("Tocklai Tea Research Institute & Heritage Tea Bungalows", "Heritage", 50, "09:00", "17:00", "Established in 1911, the world's oldest and largest tea research station in the Tea Capital of India."),
    ]),
    ("Tezpur", "Sonitpur", "Assam", 26.6528, 92.7926, "Luchi, Alu Bhaji & Rohu Fish Tenga", [
        ("Agnigarh Hill & Da Parbatia 6th-Century Temple Ruins", "Historical", 20, "08:30", "18:00", "Mythological hilltop fortress overlooking the Brahmaputra and Gupta-era carved stone doorframes."),
    ]),

    # ==================== 4. BIHAR ====================
    ("Patna", "Patna", "Bihar", 25.5941, 85.1376, "Litti Chokha, Sattu Paratha & Khaja", [
        ("Bihar Museum & Patna Museum", "Museum", 100, "10:00", "17:00", "World-class architectural museum housing the Mauryan Didargunj Yakshi statue and ancient Magadha artifacts."),
        ("Golghar & Takht Sri Harimandir Ji Patna Sahib", "Historical", 20, "06:00", "20:00", "1786 beehive-shaped granary built by Captain John Garstin and the sacred birthplace of Guru Gobind Singh Ji."),
        ("Kumhrar Mauryan Pillared Hall Ruins", "Historical", 25, "09:00", "17:30", "Archaeological excavation site of ancient Pataliputra featuring 80-pillared sandstone hall remnants from Ashoka's era."),
    ]),
    ("Bodh Gaya", "Gaya", "Bihar", 24.6961, 84.9870, "Tilkut, Anarsa & Tibetan Thukpa", [
        ("Mahabodhi Temple Complex & Sacred Bodhi Tree (UNESCO)", "Spiritual", 0, "05:00", "21:00", "Sacred UNESCO site where Siddhartha Gautama attained enlightenment, originally commissioned by Emperor Ashoka in the 3rd century BCE."),
        ("Great Buddha Statue & Thai/Japanese Monasteries", "Spiritual", 0, "07:00", "18:00", "80-foot sandstone and granite meditation Buddha statue surrounded by international Buddhist monasteries."),
    ]),
    ("Nalanda", "Nalanda", "Bihar", 25.1367, 85.4438, "Silao Khaja & Bihari Thali", [
        ("Nalanda Mahavihara Archaeological Ruins (UNESCO)", "Historical", 40, "09:00", "17:00", "5th-to-12th century CE ancient monastic university complex where scholars from across Asia studied philosophy, astronomy, and medicine."),
        ("Xuanzang Memorial Hall & Nalanda Multimedia Museum", "Museum", 30, "09:30", "17:00", "Indo-Chinese memorial honoring the 7th-century scholar-traveler Xuanzang."),
    ]),
    ("Rajgir", "Nalanda", "Bihar", 25.0258, 85.4170, "Green Chana Ghugni & Pedha", [
        ("Vishwa Shanti Stupa, Gridhakuta Hill & Rajgir Glass Bridge", "Adventure", 120, "08:30", "17:00", "Aerial ropeway to the white marble Peace Pagoda atop Ratnagiri Hill and nature safari glass skywalk."),
    ]),
    ("Vaishali", "Vaishali", "Bihar", 25.9858, 85.1281, "Makhana Kheer & Litti", [
        ("Ashokan Lion Pillar Kolhua & Relic Stupa Vaishali", "Historical", 25, "09:00", "17:00", "Ancient Licchavi republic capital featuring a monolithic polished sandstone Ashokan pillar crowned by a single lion."),
    ]),

    # ==================== 5. CHHATTISGARH ====================
    ("Raipur", "Raipur", "Chhattisgarh", 21.2514, 81.6296, "Chila, Faraa, Muthia & Bafauri", [
        ("Purkhouti Muktangan Open-Air Tribal Museum & Nandan Van Zoo", "Cultural", 30, "09:00", "17:30", "200-acre cultural garden showcasing Bastar indigenous art, bell-metal dhokra crafts, and tribal habitats."),
        ("Mahant Ghasidas Memorial Museum", "Museum", 20, "10:00", "17:00", "Established in 1875 by Raja Mahant Ghasidas of Rajnandgaon, preserving central Indian inscriptions and sculptures."),
    ]),
    ("Jagdalpur", "Bastar", "Chhattisgarh", 19.0786, 82.0214, "Bastar Bamboo Shoot Curry & Mahua Desserts", [
        ("Chitrakote Waterfalls ('Niagara of India')", "Waterfall", 0, "06:00", "19:30", "985-foot-wide horseshoe-shaped waterfall on the Indravati River in the Bastar plateau."),
        ("Kanger Valley National Park & Kutumsar Caves", "Wildlife", 50, "08:00", "16:30", "Biosphere reserve famous for subterranean limestone caves, Tirathgarh cascades, and the Bastar Hill Myna."),
    ]),
    ("Sirpur", "Mahasamund", "Chhattisgarh", 21.3411, 82.1811, "Dehrori Sweet & Chhattisgarhi Thali", [
        ("Lakshmana Brick Temple & Buddhist Viharas Sirpur", "Historical", 25, "08:00", "17:30", "7th-century Dakshina Kosala capital on the Mahanadi River housing one of India's finest ancient brick temples."),
    ]),
    ("Bilaspur", "Bilaspur", "Chhattisgarh", 22.0797, 82.1409, "Dubki Kadhi & Kodo Millet Rice", [
        ("Ratanpur Mahamaya Temple & Achanakmar Tiger Reserve", "Wildlife", 50, "07:00", "18:00", "11th-century Kalachuri capital shrine and lush Maikal Hills tiger sanctuary."),
    ]),

    # ==================== 6. GOA ====================
    ("Panaji", "North Goa", "Goa", 15.4909, 73.8278, "Goan Fish Curry Rice, Bebinca & Poi Bread", [
        ("Fontainhas Latin Quarter & Our Lady of the Immaculate Conception Church", "Heritage", 0, "08:00", "20:00", "Colorful 19th-century Portuguese heritage neighborhood with ochre villas and the iconic 1619 baroque white church."),
        ("Reis Magos Fort & Mandovi Sunset Cruise", "Fort", 50, "09:30", "17:30", "Restored 1551 Portuguese riverside fort overlooking the Mandovi estuary and cultural gallery."),
    ]),
    ("Old Goa", "North Goa", "Goa", 15.5009, 73.9116, "Xacuti, Sorpotel & Goan Sannas", [
        ("Basilica of Bom Jesus & Se Cathedral (UNESCO)", "Heritage", 0, "09:00", "18:30", "16th-century UNESCO World Heritage baroque basilica holding the relics of St. Francis Xavier and Asia's largest church bell."),
        ("Archaeological Museum of Goa & Church of St. Cajetan", "Museum", 25, "09:00", "17:00", "Corinthian-style dome modeled after St. Peter's Basilica and Kadamba/Portuguese gallery."),
    ]),
    ("Calangute", "North Goa", "Goa", 15.5449, 73.7551, "Prawn Balchão, Calamari & Sol Kadhi", [
        ("Aguada Fort & Sinquerim Lighthouse", "Fort", 0, "09:30", "18:00", "1612 Portuguese headland fortress with a four-storey 1864 lighthouse and freshwater spring overlooking the Arabian Sea."),
        ("Candolim & Baga Coastal Promenade", "Beach", 0, "06:00", "21:00", "Golden sandy shoreline with lifeguarded daytime water sports and coastal dining."),
    ]),
    ("Margao", "South Goa", "Goa", 15.2832, 73.9862, "Goan Chouriço Pão & Serradura", [
        ("Colva Beach & Braganza Pereira Heritage Mansion Chandor", "Heritage", 100, "09:00", "17:30", "Tranquil white-sand South Goa beach and grand 17th-century Indo-Portuguese manor with Belgian chandeliers."),
        ("Palolem & Cabo de Rama Cliff Fort", "Beach", 0, "07:00", "18:30", "Crescent-shaped palm bay in Canacona and ancient cliffside fortress with sweeping ocean views."),
    ]),

    # ==================== 7. GUJARAT ====================
    ("Ahmedabad", "Ahmedabad", "Gujarat", 23.0225, 72.5714, "Khaman Dhokla, Khandvi, Fafda Jalebi & Gujarati Thali", [
        ("Sabarmati Ashram & Riverfront Promenade", "Historical", 0, "08:30", "18:30", "Mahatma Gandhi's residence from 1917 to 1930 and launching point of the historic Dandi Salt March."),
        ("Adalaj Stepwell (Vav) & Historic Walled City Pols (UNESCO)", "Heritage", 25, "08:00", "18:00", "1498 five-storey octagonal Solanki-Indo-Islamic sandstone stepwell built by Queen Rudabai in India's first UNESCO World Heritage City."),
        ("Atal Foot Overbridge & Kankaria Lakefront", "Nature", 30, "09:00", "21:00", "Iconic kite-inspired glass pedestrian bridge across the Sabarmati and 15th-century polygonal lake."),
    ]),
    ("Gandhinagar", "Gandhinagar", "Gujarat", 23.2156, 72.6369, "Undhiyu, Handvo & Basundi", [
        ("Akshardham Temple Gandhinagar & Dandi Kutir Museum", "Temple", 0, "09:30", "19:30", "Pink sandstone Swaminarayan monument set in 23 acres of gardens and India's largest salt-mound-shaped digital museum on Mahatma Gandhi."),
    ]),
    ("Vadodara", "Vadodara", "Gujarat", 22.3072, 73.1812, "Sev Usal, Bhakarwadi & Lilo Chevdo", [
        ("Laxmi Vilas Palace & Maharaja Fateh Singh Museum", "Palace", 250, "09:30", "17:00", "Built in 1890 by Maharaja Sayajirao Gaekwad III, an Indo-Saracenic palace four times the size of Buckingham Palace."),
        ("Champaner-Pavagadh Archaeological Park (UNESCO)", "Historical", 40, "08:30", "17:00", "16th-century pre-Mughal capital featuring Jami Masjid, stepwells, and Kalika Mata hilltop temple."),
    ]),
    ("Surat", "Surat", "Gujarat", 21.1702, 72.8311, "Surti Locho, Ghari, Undhiyu & Khaman", [
        ("Surat Castle (1546 Old Fort) & Dutch-Armenian Gardens", "Historical", 20, "10:00", "18:00", "16th-century Tapti River fortress built by Khudawand Khan and historic European maritime trading memorials."),
        ("Dumas Beach & Science Centre Surat", "Museum", 50, "09:30", "18:00", "Arabian Sea coastal promenade and modern planetarium/diamond gallery in the Diamond City of India."),
    ]),
    ("Kevadia", "Narmada", "Gujarat", 21.8380, 73.7191, "Kathiawadi Thali & Bajra Rotla", [
        ("Statue of Unity (182m World's Tallest Statue) & Viewing Gallery", "Heritage", 380, "08:00", "18:00", "Colossal 182-meter bronze tribute to Sardar Vallabhbhai Patel overlooking the Sardar Sarovar Dam on the Narmada River."),
        ("Valley of Flowers & Jungle Safari Ekta Nagar", "Nature", 200, "08:00", "17:30", "24-acre riverside floral landscape and zoological park."),
    ]),
    ("Dwarka", "Devbhumi Dwarka", "Gujarat", 22.2442, 68.9685, "Kathiawadi Sev Tameta &Chaas", [
        ("Dwarkadhish Jagat Mandir & Sudama Setu", "Temple", 0, "06:30", "21:00", "Five-storey 78-meter Chalukya-style limestone temple supported by 72 pillars at the mouth of the Gomti River."),
        ("Shivrajpur Blue Flag Beach & Nageshwar Jyotirlinga", "Beach", 30, "07:00", "18:30", "International Blue Flag certified white-sand beach and sacred Jyotirlinga shrine."),
    ]),
    ("Somnath", "Gir Somnath", "Gujarat", 20.8880, 70.4012, "Kesar Mango Pulp & Gujarati Kadhi", [
        ("Somnath Jyotirlinga Temple & Triveni Sangam", "Temple", 0, "06:00", "21:30", "First among the twelve sacred Jyotirlinga shrines of Shiva, reconstructed in Chalukya Maha-Meru Prasad style on the Arabian Sea shore."),
        ("Gir National Park & Devaliya Safari Park (Sasan Gir)", "Wildlife", 250, "06:30", "17:00", "The sole natural habitat of the majestic Asiatic Lion in the world."),
    ]),
    ("Bhuj", "Kutch", "Gujarat", 23.2420, 69.6669, "Kutchi Dabeli, Bajra Rotlo & Gulab Pak", [
        ("Great Rann of Kutch (Dhordo White Desert) & Prag Mahal", "Nature", 100, "07:00", "20:00", "Surreal 7,500-sq-km seasonal salt marsh desert and 19th-century Italian Gothic palace in Bhuj."),
        ("Dholavira Harappan City (UNESCO) & Mandvi Vijay Vilas Palace", "Historical", 50, "09:00", "17:30", "4,500-year-old Indus Valley metropolis with ancient water reservoirs and seaside royal summer palace."),
    ]),

    # ==================== 8. HARYANA ====================
    ("Gurugram", "Gurugram", "Haryana", 28.4595, 77.0266, "Besan Masala Roti, Kachri Chutney & CyberHub Dining", [
        ("Sultanpur National Park & Bird Sanctuary", "Wildlife", 40, "06:30", "16:30", "Ramsar wetland site hosting over 250 resident and migratory Eurasian bird species."),
        ("Museo Camera (Centre for the Photographic Arts) & CyberHub", "Museum", 200, "11:00", "19:00", "South Asia's largest vintage camera and photography museum housing 3,000+ historic lenses."),
    ]),
    ("Kurukshetra", "Kurukshetra", "Haryana", 29.9695, 76.8783, "Haryanvi Churma,Mixed Dal & Lassi", [
        ("Brahma Sarovar & Srikrishna Museum Kurukshetra", "Spiritual", 30, "06:00", "20:00", "Vast ancient sacred water tank associated with the Mahabharata and museum housing archaeological sculptures."),
        ("Sheikh Chilli's Tomb & Jyotisar Birthplace of Bhagavad Gita", "Historical", 25, "08:00", "18:00", "Mughal-era buff sandstone garden-mausoleum ('Taj of Haryana') and sacred banyan tree site at Jyotisar."),
    ]),
    ("Faridabad", "Faridabad", "Haryana", 28.4089, 77.3178, "Gohana Jalebi & Chole Bhature", [
        ("Surajkund Ancient Reservoir & Crafts Mela Grounds", "Cultural", 50, "09:00", "18:00", "10th-century semicircular stepped stone amphitheater reservoir built by Tomar King Surajpal."),
    ]),
    ("Panchkula", "Panchkula", "Haryana", 30.6942, 76.8606, "Pinjore Chana Kulcha & Kheer", [
        ("Yadavindra Gardens Pinjore & Morni Hills Tikkar Taal", "Nature", 40, "07:00", "21:00", "17th-century seven-terraced Mughal garden designed by Nawab Fidai Khan at the Shivalik foothills."),
    ]),
    ("Panipat", "Panipat", "Haryana", 29.3909, 76.9635, "Panipat Pachranga Pickle & Paratha", [
        ("Panipat Battlefields Memorial Museum & Ibrahim Lodi Tomb", "Historical", 20, "09:00", "17:00", "Museum documenting the three pivotal battles of Panipat (1526, 1556, 1761) and Sultanate monuments."),
    ]),

    # ==================== 9. HIMACHAL PRADESH ====================
    ("Shimla", "Shimla", "Himachal Pradesh", 31.1048, 77.1734, "Himachali Siddu, Chana Madra & Babru", [
        ("The Ridge, Christ Church & Scandal Point Mall Road", "Hill Station", 0, "06:00", "21:30", "1857 Neo-Gothic yellow church and pedestrian heritage promenade overlooking the Shivalik and Dhauladhar ranges."),
        ("Viceregal Lodge (Rashtrapati Niwas) & Kalka-Shimla Toy Train (UNESCO)", "Heritage", 100, "09:30", "17:00", "1888 Jacobethan stone mansion atop Observatory Hill where the 1945 Simla Conference was held."),
        ("Jakhoo Hanuman Temple & Ropeway", "Temple", 0, "07:00", "19:00", "Shimla's highest peak at 2,455 meters crowned by a 108-foot statue and aerial cable car."),
    ]),
    ("Manali", "Kullu", "Himachal Pradesh", 32.2432, 77.1892, "Kullu Trout Fish, Siddu & Aktori", [
        ("Hidimba Devi Cedar Forest Temple & Old Manali", "Temple", 0, "08:00", "18:00", "1553 four-tiered pagoda-style wooden temple built by Maharaja Bahadur Singh amidst ancient deodar cedars."),
        ("Solang Valley Ropeway & Atal Tunnel South Portal", "Adventure", 100, "08:00", "17:00", "Alpine adventure meadow and the 9.02-km world's longest highway tunnel above 10,000 feet."),
    ]),
    ("Dharamshala", "Kangra", "Himachal Pradesh", 32.2190, 76.3234, "Tibetan Tingmo, Shapaley, Thukpa & Kangra Dham", [
        ("Tsuglagkhang Complex (Dalai Lama Temple McLeod Ganj) & Namgyal Monastery", "Spiritual", 0, "06:00", "19:00", "Spiritual residence of the 14th Dalai Lama, Tibetan Museum, and prayer wheel circuit in Upper Dharamshala."),
        ("HPCA Cricket Stadium & Bhagsu Waterfall", "Viewpoint", 50, "09:00", "17:30", "One of the world's most scenic high-altitude stadiums framed by the snow-capped Dhauladhar range."),
    ]),
    ("Dalhousie", "Chamba", "Himachal Pradesh", 32.5387, 75.9710, "Chamba Rajma Madra & Chukh", [
        ("Khajjiar ('Mini Switzerland of India') & Kalatop Sanctuary", "Nature", 0, "07:00", "18:00", "Saucer-shaped alpine meadow at 1,920 meters ringed by dense deodar forests and a central floating-island lake."),
    ]),
    ("Kasauli", "Solan", "Himachal Pradesh", 30.9013, 76.9649, "Band Samosa, Ginger Tea & Plum Wine", [
        ("Gilbert Nature Trail, Sunset Point & Christ Church Kasauli", "Hill Station", 0, "07:00", "18:30", "Serene 1842 British cantonment hill town with cobblestone forest paths and 1853 sandstone church."),
    ]),

    # ==================== 10. JHARKHAND ====================
    ("Ranchi", "Ranchi", "Jharkhand", 23.3441, 85.3096, "Dhuska, Rugra Mushroom Curry & Chilka Roti", [
        ("Hundru Falls & Jonha Falls ('City of Waterfalls')", "Waterfall", 30, "08:00", "17:00", "Spectacular 98-meter Subarnarekha River cascade over Precambrian gneiss rock formations."),
        ("Patratu Valley & Dam Viewpoint", "Viewpoint", 0, "07:00", "18:00", "Winding hair-pin mountain highway overlooking the emerald Patratu reservoir built under Sir M. Visvesvaraya's plan."),
        ("Pahari Mandir & Tribal Research Institute Museum", "Museum", 20, "09:00", "17:30", "Hilltop shrine and ethnographic museum preserving Santhal, Munda, and Oraon heritage."),
    ]),
    ("Deoghar", "Deoghar", "Jharkhand", 24.4852, 86.6948, "Deoghar Peda, Tilkut & Kachori", [
        ("Baba Baidyanath Jyotirlinga Dham & Trikut Ropeway", "Temple", 0, "04:00", "21:00", "Sacred Jyotirlinga complex of 22 temples and the 2,470-foot Trikut Parvat hills."),
    ]),
    ("Jamshedpur", "East Singhbhum", "Jharkhand", 22.8046, 86.2029, "Litti Chokha & Dimna Lake Grill", [
        ("Jubilee Park, Tata Steel Zoological Park & Dalma Wildlife Sanctuary", "Nature", 40, "07:00", "19:30", "225-acre Mughal-inspired garden gifted in 1958 and elephant sanctuary in the Dalma Hills."),
    ]),
    ("Netarhat", "Latehar", "Jharkhand", 23.4713, 84.2719, "Bamboo Shoot Pickle & Tribal Thali", [
        ("Magnolia Sunset Point Netarhat & Betla National Park", "Wildlife", 100, "06:30", "17:30", "'Queen of Chotanagpur' plateau viewpoint and Palamu Fort inside Betla Tiger Reserve."),
    ]),

    # ==================== 11. KARNATAKA (Additional Cities beyond Mysore & Bangalore) ====================
    ("Hampi", "Vijayanagara", "Karnataka", 15.3350, 76.4600, "Jolada Rotti, Ennegai & Bisi Bele Bath", [
        ("Virupaksha Temple & Stone Chariot Vittala Temple (UNESCO)", "Historical", 40, "06:00", "18:00", "14th-to-16th century Vijayanagara Empire capital featuring musical granite pillars and the iconic Stone Chariot."),
        ("Lotus Mahal, Elephant Stables & Matanga Hill", "Heritage", 40, "08:30", "17:30", "Indo-Islamic royal pavilion in the Zenana Enclosure and sunrise viewpoint over the Tungabhadra boulder landscape."),
    ]),
    ("Coorg (Madikeri)", "Kodagu", "Karnataka", 12.4244, 75.7382, "Pandi Curry, Akki Rotti, Kadambuttu & Coorg Filter Coffee", [
        ("Raja's Seat, Madikeri Fort & Abbey Falls", "Hill Station", 30, "08:00", "18:30", "Misty Western Ghats coffee plantation viewpoints and cascading waterfall near Madikeri."),
        ("Dubare Elephant Camp & Namdroling Golden Temple Bylakuppe", "Wildlife", 100, "08:30", "17:00", "Kaveri riverside elephant interaction camp and the largest Nyingma Tibetan Buddhist monastery in South India."),
    ]),
    ("Mangaluru", "Dakshina Kannada", "Karnataka", 12.9141, 74.8560, "Mangalorean Ghee Roast, Neer Dosa, Kori Rotti & Gadbad Ice Cream", [
        ("Panambur Beach, St. Aloysius Chapel & Kadri Manjunath Temple", "Beach", 0, "07:00", "19:30", "1880 chapel painted with Italian frescoes by Antonio Moscheni and clean lifeguarded Arabian Sea beach."),
    ]),
    ("Udupi", "Udupi", "Karnataka", 13.3409, 74.7421, "Authentic Udupi Masala Dosa, Goli Baje & Rasam", [
        ("Sri Krishna Matha Temple & Malpe St. Mary's Island Columnar Basalt", "Temple", 50, "05:30", "20:00", "13th-century Dvaita Vedanta temple founded by Sri Madhvacharya and 88-million-year-old hexagonal volcanic rock island."),
    ]),
    ("Chikkamagaluru", "Chikkamagaluru", "Karnataka", 13.3161, 75.7720, "Malnad Akki Rotti & Single-Estate Arabica Coffee", [
        ("Mullayanagiri Peak (Highest Peak in Karnataka) & Baba Budangiri", "Hill Station", 0, "06:00", "18:00", "1,930-meter Western Ghats summit and birthplace of coffee cultivation in India (1670 CE)."),
    ]),
    ("Badami", "Bagalkot", "Karnataka", 15.9189, 75.6765, "North Karnataka Jolada Rotti Meals & Dharwad Peda", [
        ("Badami Cave Temples, Pattadakal (UNESCO) & Aihole", "Historical", 40, "08:30", "17:30", "6th-to-8th century Early Chalukya rock-cut red sandstone caves overlooking Agastya Lake and UNESCO temple complex."),
    ]),
    ("Gokarna", "Uttara Kannada", "Karnataka", 14.5479, 74.3188, "Konkani Fish Thali & Kokum Kadi", [
        ("Mahabaleshwar Temple, Om Beach & Mirjan Fort", "Beach", 0, "06:00", "19:00", "Ancient coastal Shiva shrine and scenic cliffside trails connecting Om, Kudle, and Half Moon beaches."),
    ]),

    # ==================== 12. KERALA ====================
    ("Kochi", "Ernakulam", "Kerala", 9.9312, 76.2673, "Karimeen Pollichathu, Appam with Stew & Puttu Kadala", [
        ("Fort Kochi Chinese Fishing Nets, St. Francis Church & Mattancherry Palace", "Heritage", 20, "09:00", "17:30", "1503 European church (oldest in India), 1555 Dutch Palace with Ramayana murals, and 1568 Paradesi Synagogue."),
        ("Kochi Water Metro & Marine Drive Backwater Promenade", "Nature", 40, "08:00", "20:00", "India's first electric-hybrid Water Metro ferry system connecting Vypin, High Court, and Fort Kochi."),
    ]),
    ("Thiruvananthapuram", "Thiruvananthapuram", "Kerala", 8.5241, 76.9366, "Kerala Sadya on Banana Leaf & Pazham Pori", [
        ("Sree Padmanabhaswamy Temple & Napier Museum", "Temple", 50, "04:30", "19:30", "16th-century Chera-Dravidian royal temple of Travancore and 1880 Indo-Saracenic art museum."),
        ("Kovalam Lighthouse Beach & Poovar Estuary", "Beach", 0, "06:30", "19:30", "Crescent beaches framed by the red-and-white Vizhinjam Lighthouse."),
    ]),
    ("Munnar", "Idukki", "Kerala", 10.0889, 77.0595, "Cardamom Tea, Idukki Pepper Roast & Malabar Parotta", [
        ("Eravikulam National Park (Nilgiri Tahr) & Mattupetty Tea Museum", "Hill Station", 200, "07:30", "16:30", "Rolling emerald tea estates at 1,600m and high-altitude shola-grassland home of the endangered Nilgiri Tahr."),
    ]),
    ("Alleppey (Alappuzha)", "Alappuzha", "Kerala", 9.4981, 76.3388, "Kuttanad Duck Roast & Tapioca Fish Curry", [
        ("Vembanad Lake Houseboat Backwater Cruise & Marari Beach", "Nature", 500, "08:00", "18:00", "Network of palm-fringed lagoons, paddy fields below sea level, and Kettuvallam houseboats."),
    ]),
    ("Wayanad", "Wayanad", "Kerala", 11.6854, 76.1320, "Bamboo Rice Payasam & Malabar Biryani", [
        ("Edakkal Caves (Neolithic Petroglyphs) & Banasura Sagar Dam", "Historical", 50, "09:00", "16:30", "6,000-BCE Stone Age rock engravings on Ambukuthi Mala and India's largest earthen dam."),
    ]),
    ("Kozhikode", "Kozhikode", "Kerala", 11.2588, 75.7804, "Kozhikode Halwa, Thalassery Biryani & Kallummakaya", [
        ("Kappad Blue Flag Beach (Vasco da Gama 1498 Landing) & SM Street", "Beach", 25, "07:00", "19:00", "Historic Malabar Spice Coast shore where Vasco da Gama landed in 1498 and heritage sweet bazaar."),
    ]),
    ("Thrissur", "Thrissur", "Kerala", 10.5276, 76.2144, "Palada Pradhaman & Vellayappam", [
        ("Vadakkunnathan Temple (UNESCO Intangible Heritage) & Athirappilly Waterfalls", "Waterfall", 50, "06:00", "18:00", "Classical Kerala temple architecture and the 80-foot Athirappilly waterfall on the Chalakudy River."),
    ]),

    # ==================== 13. MADHYA PRADESH ====================
    ("Bhopal", "Bhopal", "Madhya Pradesh", 23.2599, 77.4126, "Poha Jalebi, Bhopali Gosht Korma & Suleimani Chai", [
        ("Sanchi Stupa (UNESCO) & Bhimbetka Rock Shelters (UNESCO)", "Historical", 40, "08:30", "17:30", "3rd-century BCE Mauryan Great Stupa of Emperor Ashoka and 10,000-year-old prehistoric cave paintings."),
        ("Upper Lake (Bhojtal) & Indira Gandhi Rashtriya Manav Sangrahalaya", "Museum", 50, "09:30", "18:00", "11th-century Paramara Raja Bhoj lake and 200-acre national museum of humankind."),
    ]),
    ("Indore", "Indore", "Madhya Pradesh", 22.7196, 75.8577, "Indori Poha, Bhutte Ka Kees, Garadu & Sarafa Night Chaat", [
        ("Rajwada Palace & Lal Bagh Palace Holkar Heritage", "Palace", 25, "10:00", "17:30", "Seven-storey 1747 Maratha-Mughal royal residence of Devi Ahilyabai Holkar and European-styled Lal Bagh estate."),
        ("Chappan Dukan & Sarafa Heritage Food Bazaar", "Food", 0, "08:00", "23:00", "India's cleanest city culinary hub famous for clean street food certification."),
    ]),
    ("Ujjain", "Ujjain", "Madhya Pradesh", 23.1765, 75.7885, "Dal Bafla, Malpua & Rabri", [
        ("Mahakaleshwar Jyotirlinga & Mahakal Lok Corridor", "Temple", 0, "04:00", "22:00", "Sacred South-facing Dakshinamurti Jyotirlinga and grand 900-meter sandstone cultural corridor beside Rudra Sagar Lake."),
        ("Vedh Shala (Jantar Mantar Observatory) & Kal Bhairav Temple", "Historical", 20, "08:00", "18:00", "1719 astronomical observatory built by Maharaja Sawai Jai II along the Tropic of Cancer."),
    ]),
    ("Gwalior", "Gwalior", "Madhya Pradesh", 26.2183, 78.1828, "Bedai Kachori, Morena Gajak & Imarti", [
        ("Gwalior Fort (Man Mandir Palace, Sas Bahu Temple & Teli Ka Mandir)", "Fort", 75, "08:00", "17:30", "8th-to-15th century hilltop citadel described by Emperor Babur as 'the pearl amongst the fortresses of Hind'."),
        ("Jai Vilas Palace & Scindia Museum", "Palace", 300, "10:00", "17:30", "1874 European palace featuring the world's largest pair of 3.5-tonne Belgian chandeliers and a silver toy train on the dining table."),
    ]),
    ("Khajuraho", "Chhatarpur", "Madhya Pradesh", 24.8318, 79.9199, "Bundelkhandi Ras Kheer & Mahua Puri", [
        ("Khajuraho Group of Monuments (Kandariya Mahadeva) & Panna Tiger Reserve", "Historical", 40, "06:00", "18:00", "10th-century Chandela dynasty UNESCO sandstone temples and nearby Ken River gorge & tiger reserve."),
    ]),
    ("Jabalpur", "Jabalpur", "Madhya Pradesh", 23.1815, 79.9864, "Khoya Jalebi & Sabudana Khichdi", [
        ("Bhedaghat Marble Rocks & Dhuandhar Waterfalls", "Waterfall", 50, "07:30", "18:30", "100-foot magnesium limestone cliffs along the Narmada River gorge and misty Dhuandhar cascade."),
    ]),

    # ==================== 14. MAHARASHTRA ====================
    ("Mumbai", "Mumbai City", "Maharashtra", 19.0760, 72.8777, "Vada Pav, Pav Bhaji, Bombay Sandwich & Berry Pulao", [
        ("Gateway of India & Elephanta Caves (UNESCO)", "Historical", 40, "07:00", "18:00", "1924 Indo-Saracenic basalt arch on Apollo Bunder and 6th-century rock-cut Trimurti Shiva cave island."),
        ("Chhatrapati Shivaji Maharaj Terminus (UNESCO) & CSMVS Museum", "Heritage", 85, "10:00", "18:00", "1887 Victorian Gothic railway masterpiece and the Prince of Wales heritage museum at Kala Ghoda."),
        ("Marine Drive (Queen's Necklace) & Bandra-Worli Sea Link", "Viewpoint", 0, "06:00", "22:30", "3.6-km Art Deco coastal promenade and cable-stayed bridge across Mahim Bay."),
    ]),
    ("Pune", "Pune", "Maharashtra", 18.5204, 73.8567, "Misal Pav, Mastani, Bakarwadi & Puran Poli", [
        ("Shaniwar Wada, Aga Khan Palace & Sinhagad Fort", "Historical", 25, "08:00", "18:00", "1732 seat of the Peshwas of the Maratha Empire and the 1892 Aga Khan Palace national memorial."),
        ("Raja Dinkar Kelkar Museum & Dagdusheth Halwai Ganpati", "Museum", 50, "09:30", "17:30", "Houses 20,000+ everyday Indian decorative arts collected by Dr. D.G. Kelkar."),
    ]),
    ("Aurangabad (Chhatrapati Sambhajinagar)", "Chhatrapati Sambhajinagar", "Maharashtra", 19.8762, 75.3433, "Naan Qalia & Marathwada Thali", [
        ("Ajanta Caves & Ellora Kailasa Temple (UNESCO)", "Historical", 40, "08:00", "17:30", "2nd-century BCE Buddhist fresco caves and the 8th-century Rashtrakuta monolithic Kailasa temple carved top-down from a single basalt cliff."),
        ("Bibi Ka Maqbara & Daulatabad (Devagiri) Fort", "Historical", 25, "08:00", "18:00", "1660 'Taj of the Deccan' and invincible conical rock fortress of the Yadavas."),
    ]),
    ("Nashik", "Nashik", "Maharashtra", 19.9975, 73.7898, "Nashik Misal, Sabudana Vada & Vineyard Cheese Platter", [
        ("Trimbakeshwar Jyotirlinga, Panchavati & Pandavleni Caves", "Temple", 25, "06:00", "20:00", "Origin of the Godavari River at Brahmagiri Hill and 1st-century BCE Hinayana Buddhist rock-cut caves."),
    ]),
    ("Nagpur", "Nagpur", "Maharashtra", 21.1458, 79.0882, "Tarri Poha, Saoji Curry & Santra Barfi", [
        ("Deekshabhoomi Stupa, Zero Mile Stone & Tadoba-Andhari Tiger Reserve", "Historical", 0, "07:00", "20:00", "Sacred hollow stupa monument of Dr. B.R. Ambedkar and geographical center marker of colonial India."),
    ]),
    ("Lonavala & Mahabaleshwar", "Pune / Satara", "Maharashtra", 18.7557, 73.4091, "Lonavala Chikki, Corn Bhajiya & Mahabaleshwar Strawberries", [
        ("Karla & Bhaja Rock-Cut Caves, Pratapgad Fort & Arthur's Seat", "Hill Station", 35, "08:00", "18:00", "2nd-century BCE timber-arched Chaitya hall and Sahyadri Western Ghats viewpoints."),
    ]),

    # ==================== 15. MANIPUR ====================
    ("Imphal", "Imphal West", "Manipur", 24.8170, 93.9368, "Eromba, Kangshoi,Singju & Chak-Hao Black Rice Kheer", [
        ("Kangla Fort & Ima Keithel (World's Only All-Women Market)", "Historical", 20, "08:00", "17:00", "Ancient seat of the Meitei monarchs on the Imphal River and 500-year-old market run entirely by 4,000+ women."),
        ("Loktak Lake & Keibul Lamjao Floating National Park (Moirang)", "Wildlife", 50, "07:00", "16:30", "World's only floating national park atop phumdis (vegetative biomass islands), home to the endangered Sangai dancing deer."),
    ]),
    ("Ukhrul", "Ukhrul", "Manipur", 25.0968, 94.3617, "Smoked Pork with Bamboo Shoot & Passionfruit Juice", [
        ("Shirui Kashong Peak (Shirui Lily Habitat) & Khangkhui Cave", "Nature", 30, "07:00", "16:30", "Misty Tangkhul Naga hills where the rare pink-white Lilium mackliniae blooms."),
    ]),

    # ==================== 16. MEGHALAYA ====================
    ("Shillong", "East Khasi Hills", "Meghalaya", 25.5788, 91.8933, "Jadoh, Dohkhlieh, Tungrymbai & Pukhlein", [
        ("Umiam Lake, Shillong Peak & Don Bosco Museum of Indigenous Cultures", "Museum", 100, "09:00", "17:00", "Seven-storey hexagonal anthropological museum of Northeast India and panoramic pine-rimmed reservoir."),
        ("Elephant Falls & Ward's Lake", "Waterfall", 30, "08:00", "17:30", "Three-tiered fern-shaded cascade ('Ka Kshaid Lai Pateng Khohsiew') and colonial botanical lake."),
    ]),
    ("Cherrapunji (Sohra) & Dawki", "East Khasi Hills", "Meghalaya", 25.2702, 91.7323, "Khasi Cinnamon Tea & Steamed Rice Cakes", [
        ("Nongriat Double-Decker Living Root Bridge (UNESCO Tentative) & Nohkalikai Falls", "Adventure", 50, "07:00", "16:30", "Bio-engineered Ficus elastica living suspension bridge crafted by Khasi communities and India's tallest plunge waterfall (340m)."),
        ("Umngot River Dawki & Mawlynnong (Asia's Cleanest Village)", "Nature", 30, "07:30", "17:00", "Crystal-clear emerald river bordering Bangladesh where boats appear to float on air."),
    ]),

    # ==================== 17. MIZORAM ====================
    ("Aizawl", "Aizawl", "Mizoram", 23.7271, 92.7176, "Bai, Vawksa Rep, Sanpiau & Koat Pitha", [
        ("Solomon's Temple, Mizoram State Museum & Durtlang Hills", "Cultural", 20, "09:00", "17:00", "Grand white marble temple nested in lush Mizo hills and museum preserving Lusei heritage."),
        ("Reiek Tlang Heritage Village & Vantawng Falls", "Nature", 30, "08:00", "16:30", "1,465-meter mountain ridge with traditional Mizo chieftain cottages and 750-foot forest waterfall."),
    ]),
    ("Champhai", "Champhai", "Mizoram", 23.4566, 93.3282, "Mizo Bamboo Stew & Grape Juice", [
        ("Murlen National Park & Rih Dil Viewpoint", "Wildlife", 40, "07:00", "16:00", "Dense sub-montane cloud forest bordering Chin Hills."),
    ]),

    # ==================== 18. NAGALAND ====================
    ("Kohima", "Kohima", "Nagaland", 25.6751, 94.1086, "Smoked Pork with Axone, Galho & Raja Mircha Chutney", [
        ("Kohima WWII Cemetery, Kisama Hornbill Heritage Village & Dzukou Valley", "Historical", 30, "08:00", "16:30", "Historic 1944 Battle of Tennis Court memorial and the 16-tribe Naga Morung amphitheater at Kisama."),
        ("Khonoma Green Village (India's First Green Village)", "Cultural", 50, "08:00", "16:30", "700-year-old Angami Naga terraced alder-farming village renowned for community wildlife conservation."),
    ]),
    ("Dimapur", "Dimapur", "Nagaland", 25.9091, 93.7266, "Naga Sticky Rice & Bamboo Fish", [
        ("Kachari Rajbari Monolithic Ruins", "Historical", 20, "09:00", "17:00", "10th-to-13th century Dimasa Kachari mushroom-domed sandstone monoliths."),
    ]),

    # ==================== 19. ODISHA ====================
    ("Bhubaneswar", "Khordha", "Odisha", 20.2961, 85.8245, "Dalma, Pakhala Bhata, Chhena Poda & Rasabali", [
        ("Lingaraj Temple, Mukteshwar Temple & Udayagiri-Khandagiri Caves", "Temple", 25, "06:00", "20:00", "11th-century Somavamshi Kalinga deula architecture and 1st-century BCE King Kharavela Jain rock-cut caves."),
        ("Dhauli Shanti Stupa (Kalinga War Ashokan Edicts) & Odisha State Museum", "Historical", 20, "08:00", "18:00", "261 BCE Daya River battlefield featuring Emperor Ashoka's rock edicts and white Peace Pagoda."),
    ]),
    ("Puri & Konark", "Puri", "Odisha", 19.8135, 85.8312, "Jagannath Mahaprasad Abhada & Khaja", [
        ("Shree Jagannath Temple Puri & Puri Blue Flag Golden Beach", "Temple", 30, "05:30", "21:30", "12th-century Char Dham shrine built by King Anantavarman Chodaganga Deva and certified Blue Flag beach."),
        ("Konark Sun Temple (UNESCO) & Chilika Lake Satapada (Irrawaddy Dolphins)", "Historical", 40, "06:00", "19:00", "13th-century Eastern Ganga colossal stone chariot with 24 carved wheels and Asia's largest brackish water lagoon."),
    ]),
    ("Cuttack", "Cuttack", "Odisha", 20.4625, 85.8830, "Cuttack Dahibara Aloodum & Chhena Jhili", [
        ("Barabati Fort & Netaji Subhas Chandra Bose Birthplace Museum", "Historical", 20, "09:30", "17:30", "14th-century moated fort on the Mahanadi delta and Janakinath Bhawan national memorial."),
    ]),

    # ==================== 20. PUNJAB ====================
    ("Amritsar", "Amritsar", "Punjab", 31.6340, 74.8723, "Amritsari Kulcha, Makki di Roti Sarson da Saag & Lassi", [
        ("Sri Harmandir Sahib (Golden Temple), Jallianwala Bagh & Partition Museum", "Spiritual", 20, "04:00", "22:30", "Sacred gold-clad gurudwara set in the Amrit Sarovar pool feeding 100,000+ visitors daily at the Langar, beside the 1919 national memorial."),
        ("Attari-Wagah Border Beating Retreat Ceremony & Gobindgarh Fort", "Historical", 50, "10:00", "18:30", "Daily ceremonial lowering of flags by the BSF and Maharaja Ranjit Singh's 18th-century fort."),
    ]),
    ("Patiala & Ludhiana", "Patiala", "Punjab", 30.3398, 76.3869, "Patiala Shahi Paneer, Chole Bhature & Pinni", [
        ("Qila Mubarak Complex, Sheesh Mahal Patiala & Maharaja Ranjit Singh War Museum", "Palace", 40, "09:30", "17:00", "1763 Sikh palace fortress built by Baba Ala Singh housing Kangra miniature galleries and royal armoury."),
    ]),
    ("Anandpur Sahib", "Rupnagar", "Punjab", 31.2360, 76.4985, "Kada Prasad & Punjabi Dal Makhani", [
        ("Virasat-e-Khalsa Museum & Takht Sri Kesgarh Sahib", "Museum", 0, "10:00", "16:30", "Moshe Safdie-designed architectural marvel chronicling 500 years of Sikh history at the birthplace of the Khalsa (1699)."),
    ]),

    # ==================== 21. RAJASTHAN ====================
    ("Jaipur", "Jaipur", "Rajasthan", 26.9124, 75.7873, "Dal Baati Churma, Pyaaz Kachori, Ghevar & Laal Maas", [
        ("Amer Fort (UNESCO), Hawa Mahal & City Palace Jaipur", "Fort", 100, "08:00", "19:00", "1592 hilltop Rajput-Mughal citadel with Sheesh Mahal mirror hall and the 1799 five-storey honeycomb Palace of Winds."),
        ("Jantar Mantar (UNESCO) & Albert Hall Museum", "Historical", 50, "09:00", "17:30", "1734 astronomical observatory featuring the world's largest stone sundial and 1887 Indo-Saracenic museum."),
        ("Nahargarh Fort Sunset View & Jal Mahal", "Viewpoint", 50, "10:00", "21:00", "Aravalli ridge fort overlooking the Pink City and the 18th-century Water Palace in Man Sagar Lake."),
    ]),
    ("Udaipur", "Udaipur", "Rajasthan", 24.5854, 73.7125, "Gatte ki Sabzi, Ker Sangri & Mewari Thali", [
        ("City Palace Udaipur, Lake Pichola Boat Ride & Jag Mandir", "Palace", 300, "09:00", "19:00", "400-year-old granite and marble Mewar royal complex rising along Lake Pichola."),
        ("Saheliyon-ki-Bari, Bagore-ki-Haveli & Sajjangarh Monsoon Palace", "Heritage", 60, "09:00", "19:30", "18th-century lotus fountain gardens for royal maidens and folk dance courtyard at Gangaur Ghat."),
    ]),
    ("Jodhpur", "Jodhpur", "Rajasthan", 26.2389, 73.0243, "Mirchi Bada, Mawa Kachori & Makhania Lassi", [
        ("Mehrangarh Fort, Jaswant Thada & Umaid Bhawan Palace Museum", "Fort", 200, "09:00", "17:30", "1459 Rao Jodha citadel towering 400 feet above the Blue City and 1943 Art Deco sandstone palace."),
    ]),
    ("Jaisalmer", "Jaisalmer", "Rajasthan", 26.9157, 70.9083, "Bajre ki Roti, Panchkuta & Ker Sangri", [
        ("Jaisalmer Sonar Quila (Living Golden Fort - UNESCO), Patwon Ki Haveli & Sam Sand Dunes", "Fort", 100, "08:00", "19:00", "1156 Rawal Jaisal yellow sandstone living fortress and Thar Desert camel safari dunes."),
    ]),
    ("Pushkar & Ajmer", "Ajmer", "Rajasthan", 26.4897, 74.5511, "Pushkar Malpua, Dal Pakwan & Kadhi Kachori", [
        ("Pushkar Lake, Brahma Temple & Ajmer Sharif Dargah / Taragarh Fort", "Spiritual", 0, "06:00", "20:30", "Sacred 52-ghat pilgrimage lake ringed by the Aravalli hills and 13th-century Sufi shrine of Khwaja Moinuddin Chishti."),
    ]),
    ("Mount Abu & Chittorgarh", "Sirohi", "Rajasthan", 24.5926, 72.7156, "Rajasthani Rabri & Dal Baati", [
        ("Dilwara Jain Marble Temples, Nakki Lake & Chittorgarh Fort (UNESCO)", "Temple", 50, "09:00", "17:30", "11th-to-13th century Solanki white marble temples with filigree ceiling carvings and India's largest 700-acre hill fort."),
    ]),

    # ==================== 22. SIKKIM ====================
    ("Gangtok", "Gangtok", "Sikkim", 27.3389, 88.6065, "Phagshapa, Steamed Momos, Thukpa & Chhurpi Soup", [
        ("Rumtek Monastery, MG Marg Pedestrian Plaza & Namgyal Institute of Tibetology", "Spiritual", 30, "08:30", "17:30", "Seat of the Kagyu lineage housing golden stupas, MG Marg litter-free boulevard, and Gangtok Ropeway."),
        ("Tsomgo (Changu) Glacial Lake & Nathula Pass Corridor", "Nature", 100, "07:30", "15:30", "12,313-foot alpine lake along the historic Old Silk Route."),
    ]),
    ("Pelling & Namchi", "Gyalshing", "Sikkim", 27.3005, 88.2400, "Sikkimese Gundruk Soup & Sel Roti", [
        ("Pemayangtse Monastery (1705), Rabdentse Ruins & Chenrezig Skywalk", "Viewpoint", 50, "08:00", "17:00", "Second royal capital of Sikkim and India's first high-altitude glass skywalk facing Mount Kangchenjunga."),
    ]),

    # ==================== 23. TAMIL NADU ====================
    ("Chennai", "Chennai", "Tamil Nadu", 13.0827, 80.2707, "Filter Coffee, Idli Sambar, Murukku & Chettinad Meals", [
        ("Marina Beach, Kapaleeshwarar Temple Mylapore & San Thome Basilica", "Temple", 0, "06:00", "20:30", "7th-century Pallava-origin Dravidian gopuram in Mylapore and one of the world's longest urban beaches."),
        ("Fort St. George (1644) & Government Museum Egmore (Chola Bronzes)", "Museum", 50, "09:30", "17:00", "Established in 1851, housing the world's finest collection of 10th-century Chola Nataraja bronze sculptures."),
    ]),
    ("Mahabalipuram (Mamallapuram)", "Chengalpattu", "Tamil Nadu", 12.6208, 80.1945, "Grilled Bay Fish & South Indian Banana Leaf Meals", [
        ("Shore Temple, Pancha Rathas & Arjuna's Penance (UNESCO)", "Historical", 40, "06:00", "18:00", "7th-to-8th century Pallava King Narasimhavarman monolithic granite rathas and coastal bas-reliefs."),
    ]),
    ("Madurai", "Madurai", "Tamil Nadu", 9.9252, 78.1198, "Madurai Jigarthanda, Kari Dosa & Paruthi Paal", [
        ("Meenakshi Amman Temple & Thirumalai Nayakkar Mahal", "Temple", 50, "05:00", "21:00", "14-gopuram Dravidian masterpiece on the Vaigai River with the 1,000-Pillar Hall and 1636 Italian-Dravidian Nayak palace."),
    ]),
    ("Ooty (Udhagamandalam) & Coonoor", "Nilgiris", "Tamil Nadu", 11.4102, 76.6950, "Ooty Varkey, Homemade Chocolates & Nilgiri White Tea", [
        ("Nilgiri Mountain Railway (UNESCO), Government Botanical Garden & Doddabetta Peak", "Hill Station", 50, "08:00", "18:00", "1848 terraced botanical park and rack-and-pinion steam mountain railway climbing to 2,200 meters."),
    ]),
    ("Kodaikanal", "Dindigul", "Tamil Nadu", 10.2381, 77.4892, "Plum Cake, Eucalyptus Honey & Filter Coffee", [
        ("Kodai Star-Shaped Lake, Coaker's Walk & Pillar Rocks", "Hill Station", 30, "07:30", "18:00", "1863 man-made star-shaped lake at 2,133 meters in the Palani Hills."),
    ]),
    ("Thanjavur & Kumbakonam", "Thanjavur", "Tamil Nadu", 10.7870, 79.1378, "Kumbakonam Degree Coffee &Puliyodharai", [
        ("Brihadeeswarar Great Living Chola Temple (UNESCO) & Thanjavur Maratha Palace", "Temple", 0, "06:00", "20:00", "Built in 1010 CE by Raja Raja Chola I with a 216-foot granite vimana and Saraswathi Mahal Library."),
    ]),
    ("Rameswaram & Kanyakumari", "Ramanathapuram / Kanyakumari", "Tamil Nadu", 9.2876, 79.3129, "Nanjil Fish Curry & Sukku Coffee", [
        ("Ramanathaswamy Temple Longest Corridor, Dhanushkodi & Vivekananda Rock Memorial", "Spiritual", 50, "05:00", "20:00", "Char Dham temple with 1,212 sculpted pillars and the tri-ocean confluence memorial at India's southern tip."),
    ]),
    ("Coimbatore", "Coimbatore", "Tamil Nadu", 11.0168, 76.9558, "Kongunadu Arisi Paruppu Sadam & Mysorepa", [
        ("Adiyogi Shiva Statue (Isha Yoga Center), Marudhamalai Temple & Gass Forest Museum", "Spiritual", 0, "06:00", "20:00", "112-foot steel bust at the Velliangiri foothills and 1902 natural history forestry museum."),
    ]),

    # ==================== 24. TELANGANA ====================
    ("Hyderabad", "Hyderabad", "Telangana", 17.3850, 78.4867, "Hyderabadi Dum Biryani, Haleem, Double Ka Meetha & Irani Chai with Osmania Biscuits", [
        ("Charminar, Mecca Masjid & Laad Bazaar", "Historical", 25, "09:00", "17:30", "Built in 1591 by Sultan Muhammad Quli Qutb Shah to mark the founding of Hyderabad, flanked by pearl and bangle markets."),
        ("Golconda Fort & Qutb Shahi Tombs", "Fort", 25, "09:00", "17:30", "12th-to-16th century acoustic granite diamond-trading citadel that once yielded the Koh-i-Noor and Hope diamonds."),
        ("Salar Jung Museum, Chowmahalla Palace & Hussain Sagar Buddha Statue", "Museum", 50, "10:00", "17:00", "One of India's three National Museums housing the Veiled Rebecca marble sculpture and Nizam Asaf Jahi royal palace."),
        ("Ramoji Film City", "Cultural", 1350, "09:00", "17:30", "Guinness World Record 1,666-acre integrated film studio complex."),
    ]),
    ("Warangal", "Warangal", "Telangana", 17.9689, 79.5941, "Sarvapindi, Sakinalu & Telangana Jonna Rotte", [
        ("Ramappa Temple (UNESCO), Warangal Fort & Thousand Pillar Temple", "Historical", 40, "06:00", "18:00", "1213 CE Kakatiya dynasty sandstone temple constructed with floating porous bricks and black basalt columns."),
    ]),
    ("Nagarjuna Sagar", "Nalgonda", "Telangana", 16.5756, 79.3119, "Pachi Pulusu & Millet Roti", [
        ("Nagarjunakonda Buddhist Island Museum & Nagarjuna Sagar Dam", "Museum", 50, "09:00", "16:30", "3rd-century Ikshvaku Buddhist monastic relics relocated to an island museum in the world's largest masonry dam reservoir."),
    ]),

    # ==================== 25. TRIPURA ====================
    ("Agartala", "West Tripura", "Tripura", 23.8315, 91.2868, "Mui Borok, Wahan Mosdeng & Bangui Rice", [
        ("Ujjayanta Palace & Tripura State Museum", "Palace", 30, "10:00", "17:00", "1901 white Indo-Saracenic royal palace built by Maharaja Radha Kishore Manikya set amidst Mughal water gardens."),
        ("Neermahal Water Palace (Rudrasagar Lake) & Unakoti Rock-Cut Reliefs", "Historical", 50, "09:00", "17:00", "1930 lake palace in the middle of Rudrasagar Lake and 8th-century colossal Shaivite bas-reliefs carved into forest cliffs."),
    ]),

    # ==================== 26. UTTAR PRADESH ====================
    ("Agra", "Agra", "Uttar Pradesh", 27.1767, 78.0081, "Agra Petha, Bedai Jalebi, Dalmoth & Mughlai Paratha", [
        ("Taj Mahal (UNESCO) & Mehtab Bagh", "Historical", 50, "06:00", "18:00", "1632–1653 white Makrana marble mausoleum built by Emperor Shah Jahan for Mumtaz Mahal on the banks of the Yamuna."),
        ("Agra Fort (UNESCO), Itmad-ud-Daulah ('Baby Taj') & Fatehpur Sikri (UNESCO)", "Fort", 50, "06:00", "18:00", "Akbar's 1565 red sandstone crescent fortress and the imperial capital of Fatehpur Sikri with the 54-meter Buland Darwaza."),
    ]),
    ("Varanasi", "Varanasi", "Uttar Pradesh", 25.3176, 82.9739, "Banarasi Kachori Sabzi, Tamatar Chaat, Malaiyyo & Banarasi Paan", [
        ("Kashi Vishwanath Dham Corridor & Dashashwamedh Ganga Aarti", "Spiritual", 0, "04:00", "22:00", "One of the world's oldest continuously inhabited cities, uniting the sacred Jyotirlinga temple directly with Lalita Ghat on the Ganges."),
        ("Sarnath Dhamek Stupa & Ashokan Lion Capital Museum", "Historical", 25, "09:00", "17:00", "Site where Lord Buddha delivered his first sermon (Dhammacakkappavattana Sutta) and museum housing India's National Emblem."),
    ]),
    ("Lucknow", "Lucknow", "Uttar Pradesh", 26.8467, 80.9462, "Tunday Kababi, Lucknawi Awadhi Biryani, Basket Chaat & Makhan Malai", [
        ("Bara Imambara (Bhool Bhulaiyaa), Chota Imambara & Rumi Darwaza", "Historical", 50, "06:00", "17:30", "1784 Nawab Asaf-ud-Daula gravity-defying arched hall built without beams and the 60-foot Awadhi gateway."),
        ("British Residency Ruins & Hazratganj Heritage Market", "Heritage", 25, "08:00", "18:00", "National monument preserving the 1857 uprising history and Chikankari embroidery arcades."),
    ]),
    ("Ayodhya", "Ayodhya", "Uttar Pradesh", 26.7922, 82.1998, "Dahi Jalebi, Kachori & Pedha Prasadam", [
        ("Shri Ram Janmabhoomi Mandir, Hanuman Garhi & Saryu River Ram Ki Paidi", "Temple", 0, "06:30", "21:30", "Grand Nagara-style carved pink Bansi Paharpur sandstone temple complex and illuminated ghats on the Saryu River."),
    ]),
    ("Prayagraj", "Prayagraj", "Uttar Pradesh", 25.4358, 81.8463, "Allahabadi Guava, Churmura & Dahi Bhalla", [
        ("Triveni Sangam, Anand Bhavan & Khusro Bagh", "Spiritual", 30, "06:00", "19:00", "Sacred confluence of the Ganga, Yamuna, and mythical Saraswati rivers and historic Swaraj Bhavan museum."),
    ]),
    ("Mathura & Vrindavan", "Mathura", "Uttar Pradesh", 27.4924, 77.6737, "Mathura Peda, Bedmi Puri & Lassi", [
        ("Sri Krishna Janmasthan, Banke Bihari Temple, Prem Mandir & Mathura Government Museum", "Temple", 0, "06:00", "20:30", "Sacred Braj pilgrimage circuit and the 1874 museum housing Kusana-era red sandstone Buddhist and Hindu sculptures."),
    ]),
    ("Jhansi", "Jhansi", "Uttar Pradesh", 25.4484, 78.5685, "Bundeli Raiata, Ras Kheer & Kachori", [
        ("Jhansi Fort of Rani Lakshmibai, Rani Mahal & Orchha Cenotaphs", "Fort", 25, "08:00", "18:00", "17th-century hilltop Bundela fortress atop Bangira Hill immortalized by Rani Lakshmibai in 1857."),
    ]),

    # ==================== 27. UTTARAKHAND ====================
    ("Rishikesh & Haridwar", "Dehradun / Haridwar", "Uttarakhand", 30.0869, 78.2676, "Aloo Puri, Chotiwala Thali & Garhwali Kafuli", [
        ("Laxman Jhula / Ram Jhula, Triveni Ghat & Har Ki Pauri Ganga Aarti", "Spiritual", 0, "05:00", "21:00", "Yoga Capital of the World at the Himalayan foothills and sacred evening lamps on the Ganges."),
        ("Beatles Ashram (Chaurasi Kutia) & Shivpuri White-Water Rafting", "Adventure", 150, "09:00", "16:30", "Forested meditation domes inside Rajaji Tiger Reserve."),
    ]),
    ("Dehradun & Mussoorie", "Dehradun", "Uttarakhand", 30.3165, 78.0322, "Garhwali Chainsoo, Jhangora ki Kheer & Rusks", [
        ("Forest Research Institute (FRI), Robber's Cave (Guchhupani) & Kempty Falls Mussoorie", "Hill Station", 50, "08:00", "18:00", "1929 Greco-Roman brick campus spanning 450 hectares and Queen of the Hills promenade at 2,005 meters."),
    ]),
    ("Nainital & Jim Corbett", "Nainital", "Uttarakhand", 29.3919, 79.4542, "Kumaoni Bhatt ki Churkani, Aloo ke Gutke & Bal Mithai", [
        ("Naini Lake, Naina Devi Temple, Snow View Ropeway & Jim Corbett National Park", "Wildlife", 200, "06:30", "18:30", "Mango-shaped Kumaon lake and India's oldest national park (established 1936 as Hailey National Park)."),
    ]),

    # ==================== 28. WEST BENGAL ====================
    ("Kolkata", "Kolkata", "West Bengal", 22.5726, 88.3639, "Kathi Roll, Kosha Mangsho, Luchi, Rosogolla & Mishti Doi", [
        ("Victoria Memorial Hall & Indian Museum (1814 - Asia's Oldest Museum)", "Museum", 50, "10:00", "18:00", "1921 white Makrana marble Indo-Saracenic monument set in 64 acres on the Maidan and the 1814 Indian Museum."),
        ("Howrah Bridge (Rabindra Setu), Dakshineswar Kali Temple & Belur Math", "Heritage", 0, "06:00", "20:30", "Iconic 705-meter cantilever bridge over the Hooghly River and Sri Ramakrishna's headquarters at Belur Math."),
        ("College Street Boi Para, Indian Coffee House & Eco Park New Town", "Cultural", 30, "09:00", "20:00", "World's largest second-hand book market and 480-acre urban ecological park."),
    ]),
    ("Darjeeling & Kalimpong", "Darjeeling", "West Bengal", 27.0410, 88.2663, "Darjeeling First-Flush Tea, Steamed Momos & Thukpa", [
        ("Tiger Hill Kangchenjunga Sunrise, Darjeeling Himalayan Railway (UNESCO) & Happy Valley Tea Estate", "Hill Station", 100, "04:30", "17:30", "1881 UNESCO 'Toy Train' Batasia Loop and Himalayan Mountaineering Institute (Tenzing Norgay memorial)."),
    ]),
    ("Shantiniketan & Sundarbans", "Birbhum / South 24 Parganas", "West Bengal", 23.6776, 87.6852, "Shorshe Ilish, Chingri Malai Curry & Nolen Gurer Sandesh", [
        ("Visva-Bharati University (UNESCO) & Sundarbans Mangrove Tiger Reserve (UNESCO)", "Wildlife", 200, "07:00", "17:00", "Nobel Laureate Rabindranath Tagore's open-air university town and the world's largest estuarine mangrove delta."),
    ]),

    # ==================== 29. ANDAMAN & NICOBAR ISLANDS (UT) ====================
    ("Port Blair (Sri Vijaya Puram)", "South Andaman", "Andaman and Nicobar Islands", 11.6234, 92.7265, "Grilled Lobster, Coconut Prawn Curry & Tropical Fruit Platter", [
        ("Cellular Jail National Memorial & Ross Island (Netaji Subhash Chandra Bose Dweep)", "Historical", 30, "09:00", "17:00", "1906 three-storey radial colonial prison memorializing Indian freedom fighters and historic administrative island."),
    ]),
    ("Havelock Island (Swaraj Dweep)", "South Andaman", "Andaman and Nicobar Islands", 11.9761, 92.9876, "Andaman Fish Tikka & Tender Coconut", [
        ("Radhanagar Beach (Blue Flag #7) & Elephant Beach Coral Reef Snorkeling", "Beach", 50, "06:00", "17:30", "Internationally acclaimed turquoise crescent beach backed by tropical rainforest."),
    ]),

    # ==================== 30. CHANDIGARH (UT) ====================
    ("Chandigarh", "Chandigarh", "Chandigarh", 30.7333, 76.7794, "Amritsari Chole Kulche, Butter Chicken & Sweet Lassi", [
        ("Nek Chand's Rock Garden, Sukhna Lake & Le Corbusier Capitol Complex (UNESCO)", "Heritage", 30, "09:00", "19:00", "40-acre sculpture garden crafted from recycled ceramics, Shivalik foothill reservoir, and UNESCO modernist architecture."),
        ("Zakir Hussain Rose Garden & Government Museum Sector 10", "Nature", 20, "06:00", "20:00", "Asia's largest rose garden spanning 30 acres with 1,600 varieties."),
    ]),

    # ==================== 31. DADRA & NAGAR HAVELI AND DAMAN & DIU (UT) ====================
    ("Diu", "Diu", "Dadra and Nagar Haveli and Daman and Diu", 20.7144, 70.9874, "Portuguese Seafood Cataplana & Gujarati Thali", [
        ("Diu Fort (1535), Naida Caves, Nagoa Beach & St. Paul's Baroque Church", "Fort", 0, "08:00", "18:00", "Massive three-sided Arabian Sea fortress, sunlit subterranean rock labyrinths, and Hoka-palm lined beach."),
    ]),
    ("Daman & Silvassa", "Daman", "Dadra and Nagar Haveli and Daman and Diu", 20.3974, 72.8328, "Parsi Dhansak, Papri Chicken & Ubadiyu", [
        ("Moti Daman Fort, Jampore Beach & Vanganga Lake Garden Silvassa", "Beach", 20, "08:00", "19:00", "16th-century polygonal colonial ramparts and Warli tribal cultural center in Silvassa."),
    ]),

    # ==================== 32. JAMMU & KASHMIR (UT) ====================
    ("Srinagar", "Srinagar", "Jammu and Kashmir", 34.0837, 74.7973, "Kashmiri Wazwan, Rogan Josh, Dum Aloo, Nadru Yakhni & Kahwa Tea", [
        ("Dal Lake Shikara Ride, Mughal Gardens (Shalimar Bagh & Nishat Bagh) & Hazratbal Shrine", "Nature", 50, "07:00", "19:30", "1619 Emperor Jahangir terraced Chinar gardens overlooking Dal Lake and the Zabarwan Range."),
        ("Shankaracharya Hill Temple & Old Srinagar Pari Mahal", "Temple", 25, "08:00", "17:30", "Ancient Gopadri hilltop Shiva temple at 1,000 feet overlooking the Jhelum valley."),
    ]),
    ("Gulmarg & Pahalgam", "Baramulla / Anantnag", "Jammu and Kashmir", 34.0484, 74.3805, "Kashmiri Harissa, Noon Chai & Sheermal", [
        ("Gulmarg Gondola (Asia's Highest Cable Car to Kongdoori/Apharwat) & Betaab Valley Pahalgam", "Adventure", 800, "08:30", "16:30", "High-altitude alpine ski meadow at 3,979m and Lidder River pine valley."),
    ]),
    ("Jammu & Katra", "Jammu / Reasi", "Jammu and Kashmir", 32.7266, 74.8570, "Jammu Kalari Kulcha, Rajma Chawal & Patisa", [
        ("Mata Vaishno Devi Trikuta Shrine, Amar Mahal Palace Museum & Bahu Fort", "Spiritual", 50, "05:00", "21:00", "Sacred Trikuta Hills pilgrimage shrine and 19th-century French-chateau palace overlooking the Tawi River."),
    ]),

    # ==================== 33. LADAKH (UT) ====================
    ("Leh", "Leh", "Ladakh", 34.1526, 77.5771, "Skyu, Thukpa, Chutagi, Apricot Jam & Butter Tea", [
        ("Leh Palace, Shanti Stupa, Hall of Fame Museum & Hemis/Thiksey Monasteries", "Heritage", 50, "07:00", "18:30", "17th-century nine-storey royal palace built by King Sengge Namgyal and 12-storey hilltop Thiksey Gompa."),
        ("Pangong Tso Lake & Nubra Valley Hunder Sand Dunes", "Nature", 100, "07:00", "17:00", "14,270-foot endorheic high-altitude sapphire lake and double-humped Bactrian camel dunes."),
    ]),
    ("Kargil", "Kargil", "Ladakh", 34.5539, 76.1349, "Paba, Tangtur & Buckwheat Bread", [
        ("Kargil War Memorial Drass, Mulbekh Maitreya Rock Carving & Suru Valley", "Historical", 0, "08:00", "18:00", "Pink sandstone Vijaypath memorial honoring Operation Vijay (1999) heroes below Tololing Heights."),
    ]),

    # ==================== 34. LAKSHADWEEP (UT) ====================
    ("Kavaratti & Agatti", "Lakshadweep", "Lakshadweep", 10.5667, 72.6417, "Lakshadweep Tuna Curry, Octopus Fry & Coconut Barfi", [
        ("Kavaratti Marine Aquarium, Ujra Mosque & Agatti/Bangaram Coral Atoll Lagoons", "Beach", 100, "08:00", "17:30", "Pristine coral atoll lagoons with glass-bottom boat tours and 17th-century carved driftwood ceiling mosque."),
    ]),

    # ==================== 35. PUDUCHERRY (UT) ====================
    ("Puducherry", "Puducherry", "Puducherry", 11.9416, 79.8083, "French Croissants, Creole Prawn Curry & Wood-Fired Pizza", [
        ("White Town Promenade Beach, Sri Aurobindo Ashram & Auroville Matrimandir", "Heritage", 0, "07:00", "20:00", "French colonial boulevards with mustard-yellow villas, spiritual ashram (1926), and golden geodesic meditation sphere."),
        ("Paradise Beach Chunnambar & Basilica of the Sacred Heart of Jesus", "Beach", 50, "08:30", "17:30", "Backwater boat ferry to golden sandbar beach and 1908 Gothic Revival church."),
    ]),
]
