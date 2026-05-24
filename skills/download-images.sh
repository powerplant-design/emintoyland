#!/bin/bash
mkdir -p public/images

BASE="https://cdn.prod.website-files.com"

# Format: remote_path|local_filename
IMAGES=(
  # Site assets (65dbeb24854c3a7926aa8f77)
  "65dbeb24854c3a7926aa8f77/65e2bbee27b9cba00c75032f_eit-logo-shadow.png|eit-logo-shadow.png"
  "65dbeb24854c3a7926aa8f77/65dbf5531591364dfcf62681_eit-logo-pink.png|eit-logo-pink.png"
  "65dbeb24854c3a7926aa8f77/65f6120de7bc08dbe3503b04_eit-logo-mbl.png|eit-logo-mbl.png"
  "65dbeb24854c3a7926aa8f77/65dbeb25854c3a7926aa9028_Starfire%20Logo.webp|starfire-logo.webp"
  "65dbeb24854c3a7926aa8f77/65e397cdf405bab332ad139f_eit-hero.png|eit-hero.png"
  "65dbeb24854c3a7926aa8f77/65e62aedc7c68f0bf6a3ca9b_eit-about-hero.png|eit-about-hero.png"
  "65dbeb24854c3a7926aa8f77/65f65041102b1cbeb624f831_eit-intellectual.jpg|eit-intellectual.jpg"
  "65dbeb24854c3a7926aa8f77/65f64dccb11f2cc9f47c0700_eit-hotshots.jpg|eit-hotshots.jpg"
  "65dbeb24854c3a7926aa8f77/65dbfc49ad5c4f22c22bc5d1_eit-about.jpg|eit-about.jpg"
  "65dbeb24854c3a7926aa8f77/6680e9e9228e181980597a91_EIT-about-02.png|eit-about-02.png"
  "65dbeb24854c3a7926aa8f77/65dbeb25854c3a7926aa9027_Background%20Image.webp|cta-bg.webp"
  "65dbeb24854c3a7926aa8f77/65dbeb25854c3a7926aa9005_Home%20Image%201.webp|home-image-1.webp"
  "65dbeb24854c3a7926aa8f77/65e38adacd127654ad9e28cc_eit-toys-left-1260.png|eit-toys-left.png"
  "65dbeb24854c3a7926aa8f77/65e38aa70fb615e19463f14f_eit-toys-right-1260.png|eit-toys-right.png"
  "65dbeb24854c3a7926aa8f77/65e510835165b15251e0dc3d_eit-heart-layerz.png|eit-heart-layerz.png"
  "65dbeb24854c3a7926aa8f77/65e52e56dd0e018bfff340ea_eit-sparklez.gif|eit-sparklez.gif"
  # CMS assets (65dbeb25854c3a7926aa9000)
  "65dbeb25854c3a7926aa9000/664d7691d1b5e6f417aebdd6_Cover%20art.png|electric-rodeo-cover.png"
  "65dbeb25854c3a7926aa9000/6694aebf40e780cce73f15fb_ATMS%20TV.png|atms-tv.png"
  "65dbeb25854c3a7926aa9000/664d767966f47a75b9502c5a_Sex-School_Thumbnail_3000px.png|sex-school-thumb.png"
  "65dbeb25854c3a7926aa9000/687f1f07bc11a3b9c3099e30_Cosmo%20Swinging.png|cosmo-swinging.png"
  "65dbeb25854c3a7926aa9000/687f1dcbfcf9b4e553e2debc_I%20pegged%20my%20boyfriend%20with%20a%20strap-on.png|pegging-article.png"
  "65dbeb25854c3a7926aa9000/687f1bd6bac408c8955714dc_Stuff%20the%20road%20to%20normalising%20pleasure.png|stuff-road-to-normalising.png"
  "65dbeb25854c3a7926aa9000/687f1acdf32cad7cef546032_Importance%20of%20consent%20when%20gifting%20sex%20toys.png|consent-sex-toys.png"
  # Publication logos
  "65dbeb25854c3a7926aa9000/6694e3900d9848ba7e1dc1f8_logo-nzh.png|logo-nzh.png"
  "65dbeb25854c3a7926aa9000/6694e2a222d63c7ef8b5276c_logo-well%2Bgood.png|logo-wellgood.png"
  "65dbeb25854c3a7926aa9000/6694e284beacaec0f4e3cc03_logo-wh.png|logo-wh.png"
  "65dbeb25854c3a7926aa9000/6694e2627f31ed7202c6160a_logo-cosmo.png|logo-cosmo.png"
  "65dbeb25854c3a7926aa9000/65f6186524956f5bbda68124_logo-beducated.png|logo-beducated.png"
  "65dbeb25854c3a7926aa9000/65f61853e7bc08dbe3560fd0_logo-capsule.png|logo-capsule.png"
  "65dbeb25854c3a7926aa9000/65f61843fb31bfc79ea1b099_logo-mamamia.png|logo-mamamia.png"
  "65dbeb25854c3a7926aa9000/65f618326c7db01c71c51555_logo-atms.png|logo-atms.png"
  # Credentials
  "65dbeb25854c3a7926aa9000/664c4523c76f83003e97f16a_logo-semrush.jpg|logo-semrush.jpg"
  "65dbeb25854c3a7926aa9000/65e528eeee90ddba8e50e5ed_eit-logo-isee.png|logo-isee.png"
  "65dbeb25854c3a7926aa9000/65e528fadd0e018bfff06b99_eit-logo-massey.png|logo-massey.png"
  # Instagram
  "65dbeb25854c3a7926aa9000/67490da3e07c9d0adfdbd2e4_468775176_561031396542448_3475960150840319609_n.jpeg|insta-01.jpeg"
  "65dbeb25854c3a7926aa9000/673ceec488d6a4102fac04da_467032306_873042467980906_8420415803400567731_n.jpeg|insta-02.jpeg"
  "65dbeb25854c3a7926aa9000/670470b5dafbae1d3e72aa03_462451472_2480905188966939_2359730659121252915_n.jpeg|insta-03.jpeg"
  "65dbeb25854c3a7926aa9000/66a083538b97e26c34d9c1a8_452475872_8343232555709420_8032706041668161173_n.jpeg|insta-04.jpeg"
  # Blog body images
  "65dbeb25854c3a7926aa9000/675b6246528547d160b5e841_6694af7865d9b249bdaf5ddb_IMG_20231003_105314_867.jpeg|electric-rodeo-photo.jpeg"
  "65dbeb25854c3a7926aa9000/6694b20e54eefab2c56f05d5_IMG_0512.JPG|sex-school-photo.jpg"
)

echo "Downloading ${#IMAGES[@]} images..."
for entry in "${IMAGES[@]}"; do
  remote="${entry%%|*}"
  local="${entry##*|}"
  echo "  $local"
  curl -sL "$BASE/$remote" -o "public/images/$local" &
done

wait
echo ""
echo "Done! Downloaded files:"
ls public/images/
