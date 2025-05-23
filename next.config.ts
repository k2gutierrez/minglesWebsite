import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ipfs.io'
            },
            {
                protocol: 'https',
                hostname: 'd9emswcmuvawb.cloudfront.net'
            },
            {
                protocol: 'https',
                hostname: 'bafybeifrjmhpuf34cv6sy4lqhs5gmmusznpunyfik3rqoqfi73abpcpnbi.ipfs.w3s.link'
            },
            {
                protocol: 'https',
                hostname: 'd3e54v103j8qbb.cloudfront.net'
            }
        ]
    }
};

export default nextConfig;
