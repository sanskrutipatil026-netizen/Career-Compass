import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],

turbopack: {
root: path.resolve("."),
},
};

export default nextConfig;
