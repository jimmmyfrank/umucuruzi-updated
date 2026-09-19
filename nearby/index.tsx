// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useMemo,
//   useCallback,
// } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   TextInput,
//   SafeAreaView,
//   Platform,
//   ScrollView,
//   FlatList,
//   RefreshControl,
//   Image,
// } from "react-native";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { traderService } from "../../../services/trader";
// import { marketService } from "../../../services/market";
// import { Colors } from "../../../theme/colors";
// import { useTheme } from "../../../context/ThemeContext";
// import Constants from "expo-constants";

// // ─── Base URL for images ──────────────────────────────────────────────
// const API_BASE_URL =
//   Constants.expoConfig?.extra?.apiUrl || "http://localhost:5000/api";
// const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

// const getFullImageUrl = (path: string | null | undefined): string | null => {
//   if (!path) return null;
//   if (path.startsWith("data:image")) return path;
//   if (path.startsWith("http://") || path.startsWith("https://")) return path;
//   if (path.startsWith("/")) return `${BASE_URL}${path}`;
//   return `${BASE_URL}/${path}`;
// };

// // ─── Constants ──────────────────────────────────────────────────────
// const CATEGORIES = [
//   { label: "All", value: "" },
//   { label: "Restaurant", value: "Restaurant" },
//   { label: "Café", value: "Café" },
//   { label: "Bar", value: "Bar" },
//   { label: "Electronics", value: "Electronics" },
//   { label: "Clothing", value: "Clothing" },
//   { label: "Food", value: "Food" },
//   { label: "Agriculture", value: "Agriculture" },
//   { label: "Other", value: "Other" },
// ];

// const DEFAULT_LOCATIONS = [
//   { label: "All", district: "", sector: "", cell: "" },
//   { label: "Gasabo", district: "Gasabo", sector: "", cell: "" },
//   { label: "Kicukiro", district: "Kicukiro", sector: "", cell: "" },
//   { label: "Nyarugenge", district: "Nyarugenge", sector: "", cell: "" },
// ];

// // ─── Distance helper (Haversine formula) ────────────────────────────
// const getDistance = (
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number,
// ) => {
//   const R = 6371; // Earth's radius in km
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLon = (lon2 - lon1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) *
//       Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// // ─── Main Component ──────────────────────────────────────────────────
// export default function Nearby() {
//   const router = useRouter();
//   const { theme } = useTheme();
//   const isDark = theme === "dark";
//   const insets = useSafeAreaInsets();
//   const mapRef = useRef<any>(null);

//   // ─── State ──────────────────────────────────────────────────────
//   const [location, setLocation] = useState<Location.LocationObject | null>(
//     null,
//   );
//   const [userCoords, setUserCoords] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);
//   const [region, setRegion] = useState<any>(null);
//   const [allTraders, setAllTraders] = useState<any[]>([]);
//   const [allMarkets, setAllMarkets] = useState<any[]>([]);
//   const [filteredTraders, setFilteredTraders] = useState<any[]>([]);
//   const [filteredMarkets, setFilteredMarkets] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [locationError, setLocationError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState<{
//     district: string;
//     sector: string;
//     cell: string;
//   }>({ district: "", sector: "", cell: "" });
//   const [userLocationText, setUserLocationText] = useState<string>("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [viewMode, setViewMode] = useState<"list" | "map">("list");
//   const [locations, setLocations] = useState(DEFAULT_LOCATIONS);

//   // ─── Dynamic map loading ────────────────────────────────────────────
//   const [MapModule, setMapModule] = useState<any>(null);
//   const [mapLoaded, setMapLoaded] = useState(false);

//   useEffect(() => {
//     if (Platform.OS !== "web") {
//       import("react-native-maps")
//         .then((module) => {
//           setMapModule(module);
//           setMapLoaded(true);
//         })
//         .catch((err) => {
//           console.warn("Failed to load react-native-maps:", err);
//           setMapLoaded(true);
//         });
//     } else {
//       setMapLoaded(true); // web doesn't need the map
//     }
//   }, []);

//   // ─── Reverse‑geocode ──────────────────────────────────────────────
//   const reverseGeocode = async (lat: number, lng: number) => {
//     try {
//       const results = await Location.reverseGeocodeAsync({
//         latitude: lat,
//         longitude: lng,
//       });
//       if (results && results.length > 0) {
//         const addr = results[0];
//         const district = addr.district || addr.region || "";
//         const sector = addr.subregion || addr.city || "";
//         const cell = addr.street || addr.name || "";
//         return { district, sector, cell };
//       }
//       return null;
//     } catch (error) {
//       console.error("Reverse geocode error:", error);
//       return null;
//     }
//   };

//   // ─── Location fetch ────────────────────────────────────────────────
//   const getLocation = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setLocationError("Location permission denied");
//         setLoading(false);
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//         timeout: 10000,
//       });
//       setLocation(loc);
//       setLocationError(null);
//       const { latitude, longitude } = loc.coords;
//       setUserCoords({ lat: latitude, lng: longitude });

//       if (Platform.OS !== "web") {
//         setRegion({
//           latitude,
//           longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });
//       }

//       const locationInfo = await reverseGeocode(latitude, longitude);
//       if (locationInfo) {
//         const { district, sector, cell } = locationInfo;
//         setUserLocationText(
//           `${district}${sector ? `, ${sector}` : ""}${cell ? `, ${cell}` : ""}`,
//         );
//         if (district) {
//           const filter = { district, sector, cell };
//           setSelectedLocation(filter);
//           setLocations((prev) => {
//             const exists = prev.some(
//               (l) =>
//                 l.district === filter.district &&
//                 l.sector === filter.sector &&
//                 l.cell === filter.cell,
//             );
//             if (exists) return prev;
//             const label = filter.district
//               ? filter.sector
//                 ? filter.cell
//                   ? `${filter.district} - ${filter.sector} - ${filter.cell}`
//                   : `${filter.district} - ${filter.sector}`
//                 : filter.district
//               : "My Location";
//             return [...prev, { label, ...filter }];
//           });
//         } else {
//           setUserLocationText("Location detected (sector unknown)");
//           Alert.alert(
//             "Location Info",
//             "Could not determine your exact sector. You can use the filter to find nearby shops.",
//           );
//         }
//       } else {
//         setUserLocationText("Location detected (sector unknown)");
//         Alert.alert(
//           "Location Info",
//           "Could not determine your exact sector. Use the filter to find nearby shops.",
//         );
//       }

//       await fetchAllData(latitude, longitude);
//     } catch (error: any) {
//       console.error("Location error:", error);
//       if (
//         error.code === "E_LOCATION_TIMEOUT" ||
//         error.message?.includes("timeout")
//       ) {
//         setLocationError("Location request timed out. Please check your GPS.");
//       } else if (error.message?.includes("location services")) {
//         setLocationError("Please enable location services.");
//       } else {
//         setLocationError("Could not get your location.");
//       }
//       setLoading(false);
//     }
//   };

//   // ─── Fetch all traders and markets ──────────────────────────────
//   const fetchAllData = async (lat?: number, lng?: number) => {
//     try {
//       const [tradersRes, marketsRes] = await Promise.all([
//         traderService.getTraders().catch(() => []),
//         marketService.getMarkets().catch(() => []),
//       ]);
//       setAllTraders(tradersRes);
//       setAllMarkets(marketsRes);
//       applyFilters(tradersRes, marketsRes);
//     } catch (error) {
//       Alert.alert("Error", "Could not load data");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // ─── Progressive location filtering + distance sorting ──────────
//   const applyFilters = (
//     traders = allTraders,
//     markets = allMarkets,
//     loc = selectedLocation,
//     cat = selectedCategory,
//     search = searchText,
//   ) => {
//     let filteredT = [...traders];
//     let filteredM = [...markets];

//     // ── 1. Progressive location filter ──
//     const applyLocationFilter = (items: any[], type: "trader" | "market") => {
//       if (!loc.district && !loc.sector && !loc.cell) return items;

//       let result = items;

//       const matches = (item: any, level: "cell" | "sector" | "district") => {
//         const profile = type === "trader" ? item.TraderProfile : item;
//         const val = profile?.[level]?.toLowerCase().trim() || "";
//         const locVal = loc[level]?.toLowerCase().trim() || "";
//         return locVal ? val === locVal : true;
//       };

//       if (loc.cell) {
//         const cellMatches = result.filter((item) => matches(item, "cell"));
//         if (cellMatches.length > 0) return cellMatches;
//       }

//       if (loc.sector) {
//         const sectorMatches = result.filter((item) => matches(item, "sector"));
//         if (sectorMatches.length > 0) return sectorMatches;
//       }

//       if (loc.district) {
//         const districtMatches = result.filter((item) =>
//           matches(item, "district"),
//         );
//         if (districtMatches.length > 0) return districtMatches;
//       }

//       return result;
//     };

//     filteredT = applyLocationFilter(filteredT, "trader");
//     filteredM = applyLocationFilter(filteredM, "market");

//     // ── 2. Category filter ──
//     if (cat) {
//       filteredT = filteredT.filter(
//         (t) => t.TraderProfile?.business_category === cat,
//       );
//     }

//     // ── 3. Search filter ──
//     if (search.trim()) {
//       const q = search.toLowerCase().trim();
//       filteredT = filteredT.filter(
//         (t) =>
//           t.full_name?.toLowerCase().includes(q) ||
//           t.TraderProfile?.shop_name?.toLowerCase().includes(q) ||
//           t.TraderProfile?.business_category?.toLowerCase().includes(q),
//       );
//       filteredM = filteredM.filter(
//         (m) =>
//           m.name?.toLowerCase().includes(q) ||
//           m.district?.toLowerCase().includes(q) ||
//           m.sector?.toLowerCase().includes(q),
//       );
//     }

//     // ── 4. Distance sorting ──
//     if (userCoords) {
//       const { lat, lng } = userCoords;
//       filteredT = filteredT
//         .map((item) => {
//           const coords = item.TraderProfile?.coordinates;
//           if (!coords) return { ...item, distance: Infinity };
//           const [lat2, lng2] = coords.split(",").map(Number);
//           if (isNaN(lat2) || isNaN(lng2))
//             return { ...item, distance: Infinity };
//           const dist = getDistance(lat, lng, lat2, lng2);
//           return { ...item, distance: dist };
//         })
//         .sort((a, b) => a.distance - b.distance);

//       filteredM = filteredM
//         .map((item) => {
//           const coords = item.coordinates;
//           if (!coords) return { ...item, distance: Infinity };
//           const [lat2, lng2] = coords.split(",").map(Number);
//           if (isNaN(lat2) || isNaN(lng2))
//             return { ...item, distance: Infinity };
//           const dist = getDistance(lat, lng, lat2, lng2);
//           return { ...item, distance: dist };
//         })
//         .sort((a, b) => a.distance - b.distance);
//     }

//     setFilteredTraders(filteredT);
//     setFilteredMarkets(filteredM);
//   };

//   // ─── Handlers ──────────────────────────────────────────────────────
//   const handleCategoryPress = (cat: string) => {
//     setSelectedCategory(cat);
//     applyFilters(allTraders, allMarkets, selectedLocation, cat);
//   };

//   const handleLocationSelect = (loc: {
//     district: string;
//     sector: string;
//     cell: string;
//   }) => {
//     setSelectedLocation(loc);
//     setShowFilters(false);
//     applyFilters(allTraders, allMarkets, loc, selectedCategory);
//   };

//   const handleSearchSubmit = () => {
//     applyFilters();
//   };

//   const clearSearch = () => {
//     setSearchText("");
//     applyFilters(
//       allTraders,
//       allMarkets,
//       selectedLocation,
//       selectedCategory,
//       "",
//     );
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     if (location) {
//       fetchAllData(location.coords.latitude, location.coords.longitude);
//     } else {
//       getLocation();
//     }
//   };

//   // ─── Effects ──────────────────────────────────────────────────────
//   useEffect(() => {
//     getLocation();
//   }, []);

//   useEffect(() => {
//     if (allTraders.length || allMarkets.length) {
//       applyFilters();
//     }
//   }, [selectedLocation, selectedCategory, searchText]);

//   // ─── Render: trader card ──────────────────────────────────────────
//   const renderTraderCard = ({ item }: { item: any }) => {
//     const profile = item.TraderProfile || {};
//     const shopName = profile.shop_name || item.full_name;
//     const category = profile.business_category || "Trader";
//     const location =
//       profile.district && profile.sector
//         ? `${profile.district}, ${profile.sector}`
//         : profile.district || "";
//     const rating = parseFloat(profile.rating_avg) || 0;
//     const distance = item.distance !== undefined ? item.distance : null;

//     let imageUrl = getFullImageUrl(item.profile_image);
//     if (!imageUrl && profile.logo_image) {
//       imageUrl = getFullImageUrl(profile.logo_image);
//     }

//     return (
//       <TouchableOpacity
//         style={[
//           styles.traderCard,
//           { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
//         ]}
//         onPress={() => router.push(`/trader/${item.id}`)}
//       >
//         <View style={styles.traderCardContent}>
//           {imageUrl ? (
//             <Image source={{ uri: imageUrl }} style={styles.traderImage} />
//           ) : (
//             <View style={styles.traderAvatar}>
//               <Text style={styles.traderAvatarText}>
//                 {shopName.charAt(0).toUpperCase()}
//               </Text>
//             </View>
//           )}
//           <View style={styles.traderInfo}>
//             <Text
//               style={[styles.traderName, { color: isDark ? "#fff" : "#000" }]}
//             >
//               {shopName}
//             </Text>
//             <Text style={[styles.traderCategory, { color: Colors.gray[500] }]}>
//               {category}
//             </Text>
//             <View style={styles.traderMeta}>
//               {location ? (
//                 <View style={styles.traderLocation}>
//                   <Ionicons
//                     name="location-outline"
//                     size={14}
//                     color={Colors.gray[400]}
//                   />
//                   <Text style={{ color: Colors.gray[500], fontSize: 12 }}>
//                     {location}
//                   </Text>
//                 </View>
//               ) : null}
//               {distance !== null && distance < 9999 && (
//                 <Text
//                   style={{ color: Colors.primary, fontSize: 12, marginLeft: 6 }}
//                 >
//                   {distance < 1 ? "< 1 km" : `${distance.toFixed(1)} km`}
//                 </Text>
//               )}
//               {rating > 0 && (
//                 <View style={styles.traderRating}>
//                   <Ionicons name="star" size={14} color={Colors.primary} />
//                   <Text style={{ color: Colors.primary, fontSize: 12 }}>
//                     {rating.toFixed(1)}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//           <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ─── Render: market card ──────────────────────────────────────────
//   const renderMarketCard = ({ item }: { item: any }) => {
//     let imageUrl =
//       getFullImageUrl(item.logo_image) || getFullImageUrl(item.banner_image);
//     const distance = item.distance !== undefined ? item.distance : null;
//     return (
//       <TouchableOpacity
//         style={[
//           styles.marketCard,
//           { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
//         ]}
//         onPress={() => router.push(`/market/${item.id}`)}
//       >
//         <View style={styles.marketCardContent}>
//           {imageUrl ? (
//             <Image source={{ uri: imageUrl }} style={styles.marketImage} />
//           ) : (
//             <Ionicons
//               name="storefront-outline"
//               size={24}
//               color={Colors.primary}
//             />
//           )}
//           <View style={styles.marketInfo}>
//             <Text
//               style={[styles.marketName, { color: isDark ? "#fff" : "#000" }]}
//             >
//               {item.name}
//             </Text>
//             <Text style={{ color: Colors.gray[500], fontSize: 12 }}>
//               {item.district}, {item.sector}
//             </Text>
//             {distance !== null && distance < 9999 && (
//               <Text style={{ color: Colors.primary, fontSize: 11 }}>
//                 {distance < 1 ? "< 1 km" : `${distance.toFixed(1)} km`}
//               </Text>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ─── Main render ───────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <View
//         style={[
//           styles.loadingContainer,
//           { backgroundColor: isDark ? "#1a1a1a" : Colors.gray[50] },
//         ]}
//       >
//         <ActivityIndicator size="large" color={Colors.primary} />
//         <Text
//           style={{ marginTop: 12, color: isDark ? "#aaa" : Colors.gray[600] }}
//         >
//           Loading nearby places...
//         </Text>
//       </View>
//     );
//   }

//   if (locationError && !location) {
//     return (
//       <View
//         style={[
//           styles.errorContainer,
//           { backgroundColor: isDark ? "#1a1a1a" : Colors.gray[50] },
//         ]}
//       >
//         <Ionicons name="location-outline" size={64} color={Colors.gray[400]} />
//         <Text style={[styles.errorTitle, { color: isDark ? "#fff" : "#000" }]}>
//           Location Unavailable
//         </Text>
//         <Text
//           style={[
//             styles.errorMessage,
//             { color: isDark ? "#aaa" : Colors.gray[600] },
//           ]}
//         >
//           {locationError}
//         </Text>
//         <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
//           <Text style={styles.retryBtnText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // ─── Render Map or fallback ──────────────────────────────────────
//   const renderMap = () => {
//     if (Platform.OS === "web") {
//       return (
//         <View style={styles.mapFallback}>
//           <Ionicons name="map-outline" size={48} color={Colors.gray[400]} />
//           <Text style={{ color: Colors.gray[500] }}>
//             Map not available on web
//           </Text>
//         </View>
//       );
//     }

//     if (!mapLoaded) {
//       return (
//         <View style={styles.mapFallback}>
//           <ActivityIndicator size="large" color={Colors.primary} />
//           <Text style={{ marginTop: 12, color: Colors.gray[500] }}>
//             Loading map...
//           </Text>
//         </View>
//       );
//     }

//     if (!MapModule) {
//       return (
//         <View style={styles.mapFallback}>
//           <Ionicons name="map-outline" size={48} color={Colors.gray[400]} />
//           <Text style={{ color: Colors.gray[500] }}>
//             Map module unavailable
//           </Text>
//         </View>
//       );
//     }

//     const { default: MapView, Marker, PROVIDER_GOOGLE } = MapModule;

//     if (!region) {
//       return (
//         <View style={styles.mapFallback}>
//           <ActivityIndicator size="large" color={Colors.primary} />
//           <Text style={{ marginTop: 12, color: Colors.gray[500] }}>
//             Waiting for location...
//           </Text>
//         </View>
//       );
//     }

//     return (
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         region={region}
//         showsUserLocation
//         showsMyLocationButton
//         onRegionChangeComplete={(r: any) => setRegion(r)}
//       >
//         {filteredTraders.map((trader) => {
//           const coords = trader.TraderProfile?.coordinates;
//           if (!coords) return null;
//           const [lat, lng] = coords.split(",").map(Number);
//           if (isNaN(lat) || isNaN(lng)) return null;
//           return (
//             <Marker
//               key={`trader-${trader.id}`}
//               coordinate={{ latitude: lat, longitude: lng }}
//               title={trader.TraderProfile?.shop_name || trader.full_name}
//               description={trader.TraderProfile?.business_category || "Trader"}
//               onCalloutPress={() => router.push(`/trader/${trader.id}`)}
//             >
//               <View style={styles.marker}>
//                 <Ionicons name="storefront" size={24} color={Colors.primary} />
//               </View>
//             </Marker>
//           );
//         })}
//         {filteredMarkets.map((market) => {
//           const coords = market.coordinates;
//           if (!coords) return null;
//           const [lat, lng] = coords.split(",").map(Number);
//           if (isNaN(lat) || isNaN(lng)) return null;
//           return (
//             <Marker
//               key={`market-${market.id}`}
//               coordinate={{ latitude: lat, longitude: lng }}
//               title={market.name}
//               description={market.district}
//               onCalloutPress={() => router.push(`/market/${market.id}`)}
//             >
//               <View
//                 style={[styles.marker, { backgroundColor: Colors.secondary }]}
//               >
//                 <Ionicons name="business" size={20} color="#fff" />
//               </View>
//             </Marker>
//           );
//         })}
//       </MapView>
//     );
//   };

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? "#1a1a1a" : Colors.gray[50] },
//       ]}
//     >
//       <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
//             Nearby
//           </Text>
//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
//               style={styles.toggleBtn}
//             >
//               <Ionicons
//                 name={viewMode === "list" ? "map-outline" : "list-outline"}
//                 size={24}
//                 color={isDark ? "#fff" : "#000"}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => setShowFilters(true)}
//               style={styles.filterBtn}
//             >
//               <Ionicons
//                 name="options-outline"
//                 size={24}
//                 color={isDark ? "#fff" : "#000"}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Location info */}
//         {userLocationText ? (
//           <View style={styles.locationInfo}>
//             <Ionicons name="location" size={16} color={Colors.primary} />
//             <Text
//               style={{
//                 color: isDark ? "#aaa" : Colors.gray[600],
//                 marginLeft: 6,
//               }}
//             >
//               {userLocationText.includes("sector unknown")
//                 ? userLocationText
//                 : `Showing results near: ${userLocationText}`}
//             </Text>
//           </View>
//         ) : null}

//         {/* Search Bar */}
//         <View
//           style={[
//             styles.searchBar,
//             { backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0" },
//           ]}
//         >
//           <Ionicons name="search-outline" size={20} color={Colors.gray[400]} />
//           <TextInput
//             style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
//             placeholder="Search by name, shop, category..."
//             placeholderTextColor={Colors.gray[400]}
//             value={searchText}
//             onChangeText={setSearchText}
//             onSubmitEditing={handleSearchSubmit}
//             returnKeyType="search"
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={clearSearch}>
//               <Ionicons
//                 name="close-circle"
//                 size={20}
//                 color={Colors.gray[400]}
//               />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Category Chips */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.chipScroll}
//           contentContainerStyle={styles.chipContent}
//         >
//           {CATEGORIES.map((cat) => (
//             <TouchableOpacity
//               key={cat.value}
//               style={[
//                 styles.chip,
//                 selectedCategory === cat.value && styles.chipActive,
//                 { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
//               ]}
//               onPress={() => handleCategoryPress(cat.value)}
//             >
//               <Text
//                 style={[
//                   styles.chipText,
//                   selectedCategory === cat.value && { color: "#fff" },
//                   { color: isDark ? "#fff" : "#000" },
//                 ]}
//               >
//                 {cat.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Map View */}
//         <View style={styles.mapWrapper}>{renderMap()}</View>

//         {/* List of traders and markets */}
//         {viewMode === "list" && (
//           <FlatList
//             data={filteredTraders}
//             keyExtractor={(item) => `trader-${item.id}`}
//             renderItem={renderTraderCard}
//             contentContainerStyle={styles.listContent}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//             ListHeaderComponent={
//               filteredMarkets.length > 0 ? (
//                 <>
//                   <Text
//                     style={[
//                       styles.sectionTitle,
//                       { color: isDark ? "#fff" : "#000" },
//                     ]}
//                   >
//                     Markets Nearby
//                   </Text>
//                   <FlatList
//                     data={filteredMarkets}
//                     keyExtractor={(item) => `market-${item.id}`}
//                     renderItem={renderMarketCard}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.marketList}
//                   />
//                   <Text
//                     style={[
//                       styles.sectionTitle,
//                       { color: isDark ? "#fff" : "#000" },
//                     ]}
//                   >
//                     Traders
//                   </Text>
//                 </>
//               ) : null
//             }
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Ionicons
//                   name="storefront-outline"
//                   size={48}
//                   color={Colors.gray[400]}
//                 />
//                 <Text style={{ color: Colors.gray[500], marginTop: 12 }}>
//                   No traders or markets found in this area
//                 </Text>
//               </View>
//             }
//           />
//         )}
//       </View>

//       {/* Filter Modal */}
//       <Modal visible={showFilters} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View
//             style={[
//               styles.modalContent,
//               { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
//             ]}
//           >
//             <Text
//               style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}
//             >
//               Filter
//             </Text>

//             <Text
//               style={[styles.modalLabel, { color: isDark ? "#fff" : "#000" }]}
//             >
//               Location
//             </Text>
//             <View style={styles.locationChips}>
//               {locations.map((loc) => (
//                 <TouchableOpacity
//                   key={loc.label}
//                   style={[
//                     styles.locationChip,
//                     selectedLocation.district === loc.district &&
//                       selectedLocation.sector === loc.sector &&
//                       selectedLocation.cell === loc.cell &&
//                       styles.locationChipActive,
//                     { backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0" },
//                   ]}
//                   onPress={() =>
//                     handleLocationSelect({
//                       district: loc.district,
//                       sector: loc.sector,
//                       cell: loc.cell,
//                     })
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.locationChipText,
//                       { color: isDark ? "#fff" : "#000" },
//                     ]}
//                   >
//                     {loc.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={[styles.modalBtn, styles.modalBtnCancel]}
//                 onPress={() => setShowFilters(false)}
//               >
//                 <Text style={[styles.modalBtnText, { color: "#000" }]}>
//                   Close
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalBtn, styles.modalBtnApply]}
//                 onPress={() => setShowFilters(false)}
//               >
//                 <Text style={styles.modalBtnText}>Apply</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   contentWrapper: { flex: 1 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   title: { fontSize: 24, fontWeight: "bold" },
//   headerActions: { flexDirection: "row", alignItems: "center" },
//   toggleBtn: { padding: 4, marginRight: 12 },
//   filterBtn: { padding: 4 },
//   locationInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginBottom: 8,
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 16,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 16 },
//   chipScroll: { paddingHorizontal: 16, marginBottom: 12 },
//   chipContent: { paddingVertical: 4 },
//   chip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: Colors.gray[300],
//   },
//   chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
//   chipText: { fontWeight: "500" },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 16,
//     marginBottom: 8,
//     paddingHorizontal: 16,
//   },
//   listContent: { paddingBottom: 20 },
//   traderCard: {
//     marginHorizontal: 16,
//     marginBottom: 10,
//     borderRadius: 12,
//     padding: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   traderCardContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   traderImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   traderAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: Colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   traderAvatarText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   traderInfo: { flex: 1 },
//   traderName: { fontSize: 16, fontWeight: "600" },
//   traderCategory: { fontSize: 14, marginTop: 2 },
//   traderMeta: {
//     flexDirection: "row",
//     marginTop: 4,
//     alignItems: "center",
//     flexWrap: "wrap",
//   },
//   traderLocation: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   traderRating: { flexDirection: "row", alignItems: "center" },
//   marketList: { paddingHorizontal: 16, marginBottom: 12 },
//   marketCard: {
//     padding: 12,
//     borderRadius: 12,
//     marginRight: 12,
//     width: 180,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   marketCardContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   marketImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   marketInfo: { marginLeft: 8, flex: 1 },
//   marketName: { fontSize: 14, fontWeight: "600" },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 40,
//   },
//   mapWrapper: {
//     height: 200,
//     marginHorizontal: 16,
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#f0f0f0",
//   },
//   map: { flex: 1 },
//   mapFallback: { flex: 1, justifyContent: "center", alignItems: "center" },
//   marker: {
//     backgroundColor: "#fff",
//     padding: 6,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//   },
//   // Error state
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//   },
//   errorTitle: { fontSize: 22, fontWeight: "bold", marginTop: 16 },
//   errorMessage: {
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 8,
//     marginBottom: 24,
//   },
//   retryBtn: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 32,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   // Modal
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     width: "90%",
//     borderRadius: 16,
//     padding: 20,
//     maxHeight: "70%",
//   },
//   modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
//   modalLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
//   locationChips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
//   locationChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: Colors.gray[300],
//   },
//   locationChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   locationChipText: { fontWeight: "500" },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   modalBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   modalBtnCancel: { backgroundColor: Colors.gray[200], marginRight: 8 },
//   modalBtnApply: { backgroundColor: Colors.primary, marginLeft: 8 },
//   modalBtnText: { fontWeight: "600", color: "#fff" },
// });
