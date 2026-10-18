import io
import textwrap
from datetime import datetime
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def generate_itinerary_pdf_bytes(itinerary_data: Dict[str, Any], traveler_name: str = "SafeTrip AI Traveler") -> bytes:
    """
    Section 26: Complete Trip Plan PDF Generator using ReportLab.
    Includes header branding, traveler details, budget summary, AI safety & risk explanation,
    day-wise itinerary with history, metro/bus/cab costs, and mandatory disclaimer footer.
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    def draw_header_and_footer(page_num: int):
        # Top Brand Banner
        c.setFillColor(colors.HexColor("#0f172a"))
        c.rect(0, height - 68, width, 68, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#38bdf8"))
        c.setFont("Helvetica-Bold", 18)
        c.drawString(36, height - 36, "SafeTrip AI")
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 10)
        c.drawString(148, height - 35, "— Plan Smarter. Travel Safer. Explore India.")
        c.setFont("Helvetica", 8.5)
        c.setFillColor(colors.HexColor("#cbd5e1"))
        c.drawString(36, height - 54, "Intelligent AI-Based Tourism Safety, Recommendation & Multi-Modal Trip Planning System")
        c.drawRightString(width - 36, height - 44, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")

        # Mandatory Footer (Section 26)
        c.setStrokeColor(colors.HexColor("#cbd5e1"))
        c.line(36, 38, width - 36, 38)
        c.setFillColor(colors.HexColor("#475569"))
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(36, 24, "Travel information and fares may change. Verify live information before travel.")
        c.drawRightString(width - 36, 24, f"Page {page_num}")

    page_num = 1
    draw_header_and_footer(page_num)
    y = height - 92

    def ensure_space(needed_pts: float):
        nonlocal y, page_num
        if y - needed_pts < 55:
            c.showPage()
            page_num += 1
            draw_header_and_footer(page_num)
            y = height - 92

    dest = itinerary_data.get("destination", "Delhi")
    start_loc = itinerary_data.get("start_location", "Bangalore")
    days_count = itinerary_data.get("days_count", len(itinerary_data.get("days", [])))
    travelers = itinerary_data.get("travelers", 2)
    travel_date = itinerary_data.get("travel_date", "2026-10-15")
    budget_obj = itinerary_data.get("budget", {})
    risk_obj = itinerary_data.get("risk", {})
    weather_obj = itinerary_data.get("weather", {})

    # Trip Overview Box
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setStrokeColor(colors.HexColor("#e2e8f0"))
    c.roundRect(36, y - 78, width - 72, 78, 6, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 13)
    c.drawString(48, y - 20, f"{days_count}-Day Personalized SafeTrip AI Itinerary: {start_loc} to {dest}")
    c.setFont("Helvetica", 9.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawString(48, y - 38, f"Traveler: {traveler_name}   |   Travelers: {travelers}   |   Start Date: {travel_date}")
    c.drawString(
        48, y - 54,
        f"Total Budget: Rs. {budget_obj.get('total_budget_inr', 15000):,}   |   "
        f"Estimated Cost: Rs. {budget_obj.get('total_estimated_inr', 11200):,}   |   "
        f"Remaining: Rs. {budget_obj.get('remaining_budget_inr', 3800):,}"
    )
    c.drawString(
        48, y - 70,
        f"Weather Context: {weather_obj.get('condition', 'Clear')}, {weather_obj.get('temperature_c', 27)} C "
        f"({weather_obj.get('source_label', 'Historical/Live Weather')})"
    )
    y -= 95

    # Budget & AI Safety Summary Row
    ensure_space(105)
    c.setFillColor(colors.HexColor("#f0fdf4"))
    c.setStrokeColor(colors.HexColor("#bbf7d0"))
    c.roundRect(36, y - 92, (width - 84) / 2, 92, 6, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#065f46"))
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(46, y - 18, "Estimated Trip Budget Breakdown")
    c.setFont("Helvetica", 8.5)
    c.setFillColor(colors.HexColor("#1e293b"))
    c.drawString(46, y - 33, f"• Intercity Travel: Rs. {budget_obj.get('intercity_travel_inr', 2500):,}")
    c.drawString(46, y - 45, f"• Hotel Accommodation: Rs. {budget_obj.get('accommodation_hotel_inr', 3200):,}")
    c.drawString(46, y - 57, f"• Food & Dining: Rs. {budget_obj.get('food_dining_inr', 1800):,}")
    c.drawString(46, y - 69, f"• Local Transport & Entry: Rs. {budget_obj.get('local_transport_inr', 900) + budget_obj.get('entry_tickets_inr', 400):,}")
    c.setFont("Helvetica-Bold", 8.8)
    c.drawString(46, y - 83, f"Total Estimated: Rs. {budget_obj.get('total_estimated_inr', 8800):,} (Estimated Data)")

    right_x = 36 + (width - 84) / 2 + 12
    c.setFillColor(colors.HexColor("#eff6ff"))
    c.setStrokeColor(colors.HexColor("#bfdbfe"))
    c.roundRect(right_x, y - 92, (width - 84) / 2, 92, 6, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#1e40af"))
    c.setFont("Helvetica-Bold", 10.5)
    overall_lvl = risk_obj.get("overall_risk_level", "LOW")
    overall_sc = risk_obj.get("overall_risk_score", 26.5)
    c.drawString(right_x + 10, y - 18, f"AI Safety Assessment: {overall_lvl} RISK ({overall_sc}/100)")
    f_scores = risk_obj.get("factor_scores", {})
    c.setFont("Helvetica", 8.2)
    c.setFillColor(colors.HexColor("#1e293b"))
    c.drawString(
        right_x + 10, y - 33,
        f"Weather: {f_scores.get('weather', 22)} | Crowd: {f_scores.get('crowd', 45)} | Time: {f_scores.get('time', 20)}"
    )
    c.drawString(
        right_x + 10, y - 45,
        f"Route: {f_scores.get('route', 25)} | Location: {f_scores.get('location', 22)} | Scam: {f_scores.get('scam', 28)}"
    )
    rec_text = risk_obj.get("recommendation", "Follow daytime visiting windows and verified metro/cab transit.")
    wrapped_rec = textwrap.wrap(f"Safety Advice: {rec_text}", width=44)
    for idx_line, r_line in enumerate(wrapped_rec[:3]):
        c.drawString(right_x + 10, y - 59 - (idx_line * 11), r_line)

    y -= 110

    # Day-by-Day Itinerary Details
    for day_obj in itinerary_data.get("days", []):
        ensure_space(60)
        c.setFillColor(colors.HexColor("#1e293b"))
        c.roundRect(36, y - 24, width - 72, 24, 4, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(46, y - 16, f"{day_obj.get('theme', 'DAY PLAN')}   —   Est. Daily Spend: Rs. {day_obj.get('daily_estimated_cost_inr', 0):,}")
        y -= 34

        for place in day_obj.get("places", []):
            ensure_space(132)
            c.setFillColor(colors.HexColor("#ffffff"))
            c.setStrokeColor(colors.HexColor("#cbd5e1"))
            c.roundRect(36, y - 122, width - 72, 122, 5, fill=1, stroke=1)

            c.setFillColor(colors.HexColor("#0f172a"))
            c.setFont("Helvetica-Bold", 10.5)
            c.drawString(
                46, y - 16,
                f"{place.get('visit_order', 1)}. {place.get('name')} ({place.get('category')})  "
                f"[{place.get('start_time')} - {place.get('end_time')}]"
            )
            c.setFont("Helvetica-Bold", 8.5)
            c.setFillColor(colors.HexColor("#0284c7"))
            c.drawRightString(
                width - 46, y - 16,
                f"Safety: {place.get('safety_risk', 'LOW')} | Crowd: {place.get('crowd_level', 'Moderate')} | Entry: Rs. {place.get('entry_fee_per_person_inr', 0)}"
            )

            c.setFillColor(colors.HexColor("#334155"))
            c.setFont("Helvetica", 8.2)
            c.drawString(
                46, y - 30,
                f"Opening Hours: {place.get('opening_hours')}  |  Visit Duration: {place.get('estimated_visit_duration_hrs')} hrs  |  "
                f"Coords: ({place.get('latitude')}, {place.get('longitude')})"
            )

            hist = f"History: {place.get('short_history', '')}"
            for h_idx, h_line in enumerate(textwrap.wrap(hist, width=96)[:2]):
                c.drawString(46, y - 43 - (h_idx * 10), h_line)

            c.setFillColor(colors.HexColor("#0f766e"))
            c.setFont("Helvetica-Bold", 8.0)
            c.drawString(
                46, y - 66,
                f"Transit from {place.get('previous_location')}: {place.get('distance_from_previous_km')} km via {place.get('travel_method')} "
                f"({place.get('estimated_travel_time_mins')} mins, Est. Rs. {place.get('estimated_travel_cost_inr')})"
            )
            c.setFillColor(colors.HexColor("#475569"))
            c.setFont("Helvetica", 7.8)
            c.drawString(46, y - 78, f"• Metro: {str(place.get('metro_information', ''))[:95]}")
            c.drawString(46, y - 89, f"• Bus: {str(place.get('bus_information', ''))[:95]}")
            c.drawString(46, y - 100, f"• Cab/Auto: {str(place.get('cab_auto_estimate', ''))[:95]}")
            c.setFillColor(colors.HexColor("#1d4ed8"))
            c.drawString(46, y - 113, f"• AI Safety Note: {str(place.get('recommendation', ''))[:95]}")

            y -= 130

    c.save()
    return buf.getvalue()
