
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://career-compass-backend-v8sv.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Your session is missing. Please sign in again.",
        },
        { status: 401 }
      );
    }

    if (!token.userId || !token.backendToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Your backend authentication details are missing.",
          diagnostic: {
            hasUserId: Boolean(token.userId),
            hasBackendToken: Boolean(token.backendToken),
          },
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/interview/history`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.backendToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const responseText = await response.text();

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "Interview history backend returned non-JSON:",
        response.status,
        responseText.slice(0, 300)
      );

      return NextResponse.json(
        {
          success: false,
          message: "The backend returned an invalid response.",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("Interview history backend error:", {
        status: response.status,
        message: data.message,
      });

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch interview history.",
        },
        { status: response.status }
      );
    }

    const interviews = Array.isArray(data.interviews)
      ? data.interviews
      : Array.isArray(data.history)
        ? data.history
        : Array.isArray(data.data)
          ? data.data
          : [];

    console.log("Interview history fetched:", {
      count: interviews.length,
      firstInterviewId: interviews[0]?._id ?? null,
      firstInterviewScore: interviews[0]?.totalScore ?? null,
    });

    return NextResponse.json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Interview history proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "The interview history API request failed.",
      },
      { status: 500 }
    );
  }
}

