import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_URL =
process.env.BACKEND_URL ||
"https://career-compass-backend-v8sv.onrender.com";

export async function POST(request: NextRequest) {
try {
const token = await getToken({
req: request,
secret: process.env.NEXTAUTH_SECRET,
});


if (!token?.backendToken || !token?.userId) {
  return NextResponse.json(
    {
      success: false,
      message: "Please log in before saving your interview.",
    },
    { status: 401 }
  );
}

const body = await request.json();

const response = await fetch(`${BACKEND_URL}/api/interview/save`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.backendToken}`,
  },
  body: JSON.stringify(body),
  cache: "no-store",
});

const data = await response.json();

return NextResponse.json(data, {
  status: response.status,
});


} catch (error) {
console.error("Interview save proxy error:", error);


return NextResponse.json(
  {
    success: false,
    message: "Unable to save your interview.",
  },
  { status: 500 }
);


}
}
