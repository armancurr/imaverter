# Better Converter

A fast and easy file conversion tool that lets you convert images between popular formats like JPG, PNG, WebP, AVIF, GIF, TIFF, BMP, and ICO. It features a clean interface, instant previews, and supports drag-and-drop or quick uploads for hassle-free conversion.

### Key Features:

- **Image Conversion:** Instantly convert images to and from 8 major formats.
- **Multi-format Support:** JPG, PNG, WebP, AVIF, GIF, TIFF, BMP, and ICO.
- **Preview & Download:** See your converted images and download them instantly.
- **Simple Interface:** Drag-and-drop or click to upload—no clutter, just conversion.

### Get Started:

```bash
# Clone the project repo
git clone https://github.com/armancurr/file-converter.git

# Change into the project directory
cd file-converter

# Create a .env.local file with the required environment variables
cat <<EOF > .env.local
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
CRON_SECRET=
EOF

# Install dependencies using Bun
bun install

# Start the development server
bun dev
```
