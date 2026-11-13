import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Netflix - Movie Recommendation System',
  description: 'Full-stack Content-Based Movie Recommendation System powered by Cosine Similarity and TMDB integration.',
  keywords: ['Netflix', 'Recommendation System', 'Movie Recommender', 'Cosine Similarity', 'AIML', 'Next.js'],
  icons: {
    icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2023.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-netflix-black text-white antialiased min-h-screen flex flex-col selection:bg-netflix-red selection:text-white">
        {children}
      </body>
    </html>
  );
}

