# Image Converter

A modern Next.js web application for converting images between different formats (PNG, JPG, WEBP, AVIF, TIFF, BMP) using Cloudinary.

## Features

- Upload images with drag & drop support
- Convert between multiple image formats
- Real-time preview
- Automatic cleanup after 24 hours
- Beautiful, responsive UI

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Configure Cloudinary

Create a `.env.local` file in the root directory and add your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

To get these credentials:
1. Sign up for a free account at [Cloudinary](https://cloudinary.com)
2. Go to your Dashboard
3. Copy the Cloud Name, API Key, and API Secret

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

1. Upload an image file (PNG, JPG, WEBP, GIF up to 10MB)
2. Select your desired output format
3. Click "Convert Image"
4. Download the converted image

Images are automatically deleted from Cloudinary after 24 hours to keep storage clean.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes (Edge Runtime)
- **Image Processing**: Cloudinary
- **UI Components**: Lucide React icons

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
