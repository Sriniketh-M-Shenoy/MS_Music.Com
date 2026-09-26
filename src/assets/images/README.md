# Adding Muralidhar Shenoy's Actual Photos 📸

To use the actual photos from your Google Images search link:

1. Download your favorite photos of Muralidhar Shenoy from the Google link:
   `https://www.google.com/search?q=muralidhar+shenoy&udm=2`

2. Save the downloaded image files into this directory (`src/assets/images/`):
   - `hero.jpg` (Hero background banner photo)
   - `portrait.jpg` (About Me section portrait photo)
   - `gallery1.jpg`, `gallery2.jpg`, `gallery3.jpg`, `gallery4.jpg` (Gallery photos)

3. Update `src/config/siteConfig.js` to use local asset paths:
   ```js
   heroImage: "/src/assets/images/hero.jpg",
   portraitImage: "/src/assets/images/portrait.jpg",
   ```

Or simply import them directly in `siteConfig.js`!
