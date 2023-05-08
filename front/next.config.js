/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    //add google domain
    domains: ['cdn.intra.42.fr','res.cloudinary.com','lh3.googleusercontent.com'],
  }
}

module.exports = nextConfig;
