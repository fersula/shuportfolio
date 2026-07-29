import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // `next dev` binds to localhost by default, so dev-only asset/HMR
  // requests arriving with Origin: http://<LAN IP>:3000 (i.e. from a phone
  // on the same Wi-Fi) get 403'd by Next's dev cross-origin protection —
  // the page HTML still loads fine either way, but the JS that hydrates it
  // never does, leaving stale/SSR-only content on screen. Update this IP
  // if it changes (`ipconfig getifaddr en0`).
  allowedDevOrigins: ["192.168.10.6"],
};

export default nextConfig;
