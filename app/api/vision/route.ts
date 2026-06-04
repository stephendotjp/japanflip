import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: "Missing imageBase64 or mimeType" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Vision API not configured" }, { status: 500 });
  }

  const body = {
    requests: [
      {
        image: { content: imageBase64 },
        features: [
          { type: "LABEL_DETECTION", maxResults: 5 },
          { type: "WEB_DETECTION", maxResults: 5 },
        ],
      },
    ],
  };

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Vision API error", res.status, errBody);
    return NextResponse.json({ error: "Vision API error", detail: errBody }, { status: 502 });
  }

  const data = await res.json();
  const response = data.responses?.[0];

  const labels: string[] = (response?.labelAnnotations ?? [])
    .slice(0, 5)
    .map((a: { description: string }) => a.description.toLowerCase());

  const webEntities: string[] = (response?.webDetection?.webEntities ?? [])
    .slice(0, 5)
    .filter((e: { description?: string }) => e.description)
    .map((e: { description: string }) => e.description);

  return NextResponse.json({ labels, webEntities });
}
