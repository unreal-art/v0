import type { Photo } from "react-photo-album";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

function assetLink(asset: string, width: number) {
  return `/dummy/${asset}?w=${width}&q=75`;
}

const dummyPhotos = [
  {
    id: "1",
    asset: "alien-girl.png",
    width: 1080,
    height: 780,
    alt: "Hiking boots",
  },
  {
    id: "2",
    asset: "black-boy.png",
    width: 1080,
    height: 720,
    alt: "A person pointing at a beige map",
  },
  {
    id: "3",
    asset: "small-boy.png",
    width: 1080,
    height: 720,
    alt: "Two hikers walking toward a snow-covered mountain",
  },
  {
    id: "4",
    asset: "white-boy.png",
    width: 1080,
    height: 1620,
    alt: "A silver and black coffee mug on a brown wooden table",
  },
  {
    id: "5",
    asset: "black-boy.png",
    width: 1080,
    height: 607,
    alt: "A worm's eye view of trees at night",
  },
  {
    id: "6",
    asset: "black-girl.png",
    width: 1080,
    height: 608,
    alt: "A pine tree forest near a mountain at sunset",
  },
  {
    id: "7",
    asset: "fine-girl.png",
    width: 1080,
    height: 720,
    alt: "Silhouette photo of three hikers near tall trees",
  },
  {
    id: "8",
    asset: "small-boy.png",
    width: 1080,
    height: 1549,
    alt: "A person sitting near a bonfire surrounded by trees",
  },
  {
    id: "9",
    asset: "white-boy.png",
    width: 1080,
    height: 720,
    alt: "Green moss on gray rocks in a river",
  },
  {
    id: "10",
    asset: "black-boy.png",
    width: 1080,
    height: 694,
    alt: "Landscape photography of mountains",
  },
  {
    id: "11",
    asset: "black-girl.png",
    width: 1080,
    height: 1620,
    alt: "Purple petaled flowers near a mountain",
  },
  {
    id: "12",
    asset: "fine-girl.png",
    width: 1080,
    height: 1620,
    alt: "A pathway between green trees during daytime",
  },
  {
    id: "13",
    asset: "small-boy.png",
    width: 1080,
    height: 720,
    alt: "A man wearing a black jacket and backpack standing on a grass field during sunset",
  },
  {
    id: "14",
    asset: "white-boy.png",
    width: 1080,
    height: 1440,
    alt: "Green pine trees under white clouds during the daytime",
  },
  {
    id: "15",
    asset: "alien-girl.png",
    width: 1080,
    height: 1620,
    alt: "A hiker sitting near the cliff",
  },
  {
    id: "16",
    asset: "alien-girl.png",
    width: 1080,
    height: 720,
    alt: "A sign warning people not to disturb nature",
  },
  {
    id: "17",
    asset: "black-boy.png",
    width: 1080,
    height: 1440,
    alt: "A small creek in Yosemite National Park",
  },
  {
    id: "18",
    asset: "black-girl.png",
    width: 1080,
    height: 810,
    alt: "A tall mountain with a waterfall running down its side",
  },
  {
    id: "19",
    asset: "fine-girl.png",
    width: 1080,
    height: 595,
    alt: "Blue mountains",
  },
  {
    id: "20",
    asset: "white-boy.png",
    width: 1080,
    height: 810,
    alt: "A red flower on a green grass field during the daytime",
  },
].map(
  ({ asset, alt, width, height, id }) =>
    ({
      src: assetLink(asset, width),
      key: id,
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
