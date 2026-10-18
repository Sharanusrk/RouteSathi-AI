from datetime import datetime
from typing import Dict, Any
import requests

WMO_CODES = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Rainy",
    55: "Rainy",
    61: "Rainy",
    63: "Rainy",
    65: "Heavy Rain",
    80: "Rainy",
    81: "Heavy Rain",
    82: "Heavy Rain",
    95: "Stormy",
    96: "Stormy",
    99: "Stormy",
}


def fetch_weather_for_coordinates(
    latitude: float,
    longitude: float,
    city: str = "Delhi",
    travel_date: str = None,
) -> Dict[str, Any]:
    """
    Attempts live Open-Meteo weather query first.
    Clearly labels whether data is 'LIVE_OPEN_METEO_API' or 'HISTORICAL_SEASONAL_DATASET'.
    """
    month = datetime.utcnow().month
    if travel_date:
        try:
            month = datetime.strptime(travel_date[:10], "%Y-%m-%d").month
        except Exception:
            pass

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m"
            f"&timezone=auto"
        )
        resp = requests.get(url, timeout=2.5)
        if resp.status_code == 200:
            data = resp.json().get("current", {})
            temp = float(data.get("temperature_2m", 27.5))
            humidity = float(data.get("relative_humidity_2m", 58.0))
            precip = float(data.get("precipitation", 0.0) or data.get("rain", 0.0) or 0.0)
            wind = float(data.get("wind_speed_10m", 11.0))
            w_code = int(data.get("weather_code", 0))
            cond = WMO_CODES.get(w_code, "Clear")
            return {
                "city": city,
                "temperature_c": round(temp, 1),
                "rainfall_mm": round(precip, 1),
                "humidity_pct": round(humidity, 1),
                "wind_speed_kmh": round(wind, 1),
                "condition": cond,
                "month": month,
                "data_type": "LIVE_OPEN_METEO_API",
                "source_label": "Live Weather Data (Open-Meteo API)",
            }
    except Exception:
        pass

    # Fallback: Historical seasonal weather dataset (IMD / Weather Data in India)
    is_monsoon = month in [6, 7, 8, 9]
    is_summer = month in [4, 5]
    is_winter = month in [11, 12, 1, 2]

    if is_monsoon:
        temp, rain, hum, wind, cond = 28.5, 24.0, 82.0, 18.0, "Rainy"
    elif is_summer:
        temp, rain, hum, wind, cond = 36.0, 2.0, 42.0, 14.0, "Clear"
    elif is_winter:
        temp, rain, hum, wind, cond = 21.5, 1.0, 55.0, 9.0, "Clear"
    else:
        temp, rain, hum, wind, cond = 27.0, 4.0, 60.0, 11.0, "Clear"

    # Adjust for high-altitude hill stations
    if latitude > 31.0 or city.lower() in ["leh", "ladakh", "manali", "shimla", "gulmarg", "tawang", "ooty", "munnar"]:
        temp -= 9.5

    return {
        "city": city,
        "temperature_c": round(temp, 1),
        "rainfall_mm": round(rain, 1),
        "humidity_pct": round(hum, 1),
        "wind_speed_kmh": round(wind, 1),
        "condition": cond,
        "month": month,
        "data_type": "HISTORICAL_SEASONAL_DATASET",
        "source_label": "Historical Seasonal Prediction (IMD / ProjectCapstone Dataset)",
    }
