import base64
from fastapi import FastAPI, UploadFile, File, Form
import anthropic

app = FastAPI()
client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

SYSTEM = (
    "You are a plant health assistant for inexperienced home gardeners. "
    "Base every claim on what is visible in the photo. If the image is unclear or "
    "one photo cannot separate the candidates, list the extra photos you need. "
    "Never give pesticide doses. Prefer cultural and mechanical fixes first. "
    "Keep actions simple and doable in under 15 minutes where possible."
)

TOOL = {
    "name": "report_diagnosis",
    "description": "Report the plant health assessment.",
    "input_schema": {
        "type": "object",
        "properties": {
            "plant_species": {"type": "string"},
            "needs_more_photos": {"type": "array", "items": {"type": "string"}},
            "urgency": {"type": "string", "enum": ["low", "medium", "high"]},
            "candidates": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "category": {"type": "string", "enum": [
                            "fungal", "bacterial", "viral", "pest", "nutrient",
                            "water_stress", "light_stress", "other"]},
                        "confidence": {"type": "number"},
                        "visible_evidence": {"type": "string"},
                        "actions": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["name", "category", "confidence",
                                 "visible_evidence", "actions"],
                },
            },
        },
        "required": ["plant_species", "needs_more_photos", "urgency", "candidates"],
    },
}

@app.post("/diagnose")
async def diagnose(photo: UploadFile = File(...), context: str = Form("{}")):
    data = base64.standard_b64encode(await photo.read()).decode()
    resp = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1500,
        system=SYSTEM,
        tools=[TOOL],
        tool_choice={"type": "tool", "name": "report_diagnosis"},
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {
                    "type": "base64", "media_type": photo.content_type, "data": data}},
                {"type": "text", "text": f"Garden context (JSON): {context}\nDiagnose the plant in the photo."},
            ],
        }],
    )
    return next(b.input for b in resp.content if b.type == "tool_use")