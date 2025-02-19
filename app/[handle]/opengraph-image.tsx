import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";
import { join } from "node:path";

// Image metadata
export const alt = "Facecoin Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: { handle: string };
}) {
  const user = await prisma.user.findUnique({
    where: {
      socialHandle: params.handle,
    },
  });

  // Font loading
  const interSemiBold = await readFile(
    join(process.cwd(), "assets/Inter-semibold.ttf")
  );

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#E6E8F5",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#6B7280",
          }}
        >
          User not found
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: interSemiBold,
            style: "normal",
            weight: 600,
          },
        ],
      }
    );
  }

  const element = (
    <div
      style={{
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
      }}
    >
      {/* Main content container */}
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        {/* Avatar container */}
        <div
          style={{
            marginRight: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={user.pfp ?? ""}
            alt={user.socialHandle}
            width="200"
            height="200"
            style={{
              borderRadius: "100%",
            }}
          />
        </div>

        {/* Text content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              margin: "0",
            }}
          >
            @{user.socialHandle}
          </p>
          <p
            style={{
              fontSize: "32px",
              color: "#6B7280",
              margin: "0",
            }}
          >
            {Number(user.tokenAllocation).toLocaleString()} $facecoin
          </p>
        </div>
      </div>

      {/* Powered by Metal logo */}
      <div
        style={{
          alignSelf: "flex-end",
          position: "absolute",
          bottom: 40,
          alignItems: "center",
          gap: "8px",
          fontSize: "16px",
          color: "#6B7280",
        }}
      >
        <span>powered by</span>
        <img
          src="https://metal.build/logo.png"
          alt="Metal"
          width="20"
          height="24"
          style={{
            objectFit: "contain",
          }}
        />
        <span>metal</span>
      </div>
    </div>
  );

  return new ImageResponse(element, {
    ...size,
    fonts: [
      {
        name: "Inter",
        data: interSemiBold,
        style: "normal",
        weight: 600,
      },
    ],
  });
}
