import type { Photo } from "react-photo-album";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

function assetLink(asset: string, width: number) {
  return `/dummy/${asset}?w=${width}&q=75`;
}

const dummyPhotos = [
  {
    asset: "alien-girl.png",
    width: 1080,
    height: 780,
    alt: "Hiking boots",
  },
  {
    asset: "black-boy.png",
    width: 1080,
    height: 720,
    alt: "A person pointing at a beige map",
  },
  {
    asset: "small-boy.png",
    width: 1080,
    height: 720,
    alt: "Two hikers walking toward a snow-covered mountain",
  },
  {
    asset: "white-boy.png",
    width: 1080,
    height: 1620,
    alt: "A silver and black coffee mug on a brown wooden table",
  },
  {
    asset: "black-boy.png",
    width: 1080,
    height: 607,
    alt: "A worm's eye view of trees at night",
  },
  {
    asset: "black-girl.png",
    width: 1080,
    height: 608,
    alt: "A pine tree forest near a mountain at sunset",
  },
  {
    asset: "fine-girl.png",
    width: 1080,
    height: 720,
    alt: "Silhouette photo of three hikers near tall trees",
  },
  {
    asset: "small-boy.png",
    width: 1080,
    height: 1549,
    alt: "A person sitting near a bonfire surrounded by trees",
  },
  {
    asset: "white-boy.png",
    width: 1080,
    height: 720,
    alt: "Green moss on gray rocks in a river",
  },
  {
    asset: "black-boy.png",
    width: 1080,
    height: 694,
    alt: "Landscape photography of mountains",
  },  {
    asset: "black-girl.png",
    width: 1080,
    height: 1620,
    alt: "Purple petaled flowers near a mountain",
  },
  {
    asset: "fine-girl.png",
    width: 1080,
    height: 1620,
    alt: "A pathway between green trees during daytime",
  },
  {
    asset: "small-boy.png",
    width: 1080,
    height: 720,
    alt: "A man wearing a black jacket and backpack standing on a grass field during sunset",
  },
  {
    asset: "white-boy.png",
    width: 1080,
    height: 1440,
    alt: "Green pine trees under white clouds during the daytime",
  },
  {
    asset: "alien-girl.png",
    width: 1080,
    height: 1620,
    alt: "A hiker sitting near the cliff",
  },
  {
    asset: "alien-girl.png",
    width: 1080,
    height: 720,
    alt: "A sign warning people not to disturb nature",
  },
  {
    asset: "black-boy.png",
    width: 1080,
    height: 1440,
    alt: "A small creek in Yosemite National Park",
  },
  {
    asset: "black-girl.png",
    width: 1080,
    height: 810,
    alt: "A tall mountain with a waterfall running down its side",
  },
  {
    asset: "fine-girl.png",
    width: 1080,
    height: 595,
    alt: "Blue mountains",
  },
  {
    asset: "white-boy.png",
    width: 1080,
    height: 810,
    alt: "A red flower on a green grass field during the daytime",
  },
].map(
  ({ asset, alt, width, height }) =>
    ({
      src: assetLink(asset, width),
      alt,
      width,
      height,
      srcSet: breakpoints.map((breakpoint) => ({
        src: assetLink(asset, breakpoint),
        width: breakpoint,
        height: Math.round((height / width) * breakpoint),
      })),
    }) as Photo,
);

export default dummyPhotos;