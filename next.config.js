/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.bs9.com.br',
      'www.educacao.sp.gov.br',
      'saladofuturo.educacao.sp.gov.br'
    ],
  },
}

module.exports = nextConfig 