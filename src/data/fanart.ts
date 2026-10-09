export interface FanartImage {
  number: number;
  src: string;
  width: number;
  height: number;
  artist: string;
  caption?: string;
  // Character slug from characters.ts; shows this art on that character's page.
  cSlug?: string;
}

export const fanartOptions: FanartImage[] = [
  { number: 1, src: '/media/fanart/fanart1.png', width: 1920, height: 1080, artist: 'toohi', caption: 'Heian-era praxor design.', cSlug: 'praxor-v1' },
  { number: 2, src: '/media/fanart/fanart2.jpeg', width: 1437, height: 1231, artist: 'blueistic', caption: 'It\'s me.', cSlug: 'axis' },
  { number: 3, src: '/media/fanart/fanart3.png', width: 2160, height: 1620, artist: 'fyre', caption: 'Thank god for underwear.' },
  { number: 4, src: '/media/fanart/fanart4.png', width: 121, height: 235, artist: 'louies', caption: 'Sketch of yours truly made by my ex.', cSlug: 'praxor-v1' },
  { number: 5, src: '/media/fanart/fanart5.png', width: 483, height: 429, artist: 'toohi', caption: 'I was genuinely baffled upon receiving this one.', cSlug: 'praxor-v1' },
  { number: 6, src: '/media/fanart/fanart6.png', width: 676, height: 702, artist: 'toohi', caption: 'Axis spaceman design. He was hardly drawn this way.', cSlug: 'axis' },
  { number: 7, src: '/media/fanart/fanart7.png', width: 1920, height: 1080, artist: 'toohi', caption: 'Incarnation of infection. Rabies. 𝙎𝙘𝙖𝙧𝙮.', cSlug: 'praxor-v1' },
  { number: 8, src: '/media/fanart/fanart8.png', width: 453, height: 513, artist: 'lego_foxy', caption: 'Bowling pin-xor. Thank you Lego Foxy' },
  { number: 9, src: '/media/fanart/fanart9.png', width: 993, height: 1385, artist: 'lotterytickett', caption: 'I can\'t believe I asked to be put in this attire. Oh well, it was worth it.', cSlug: 'praxor-v2' },
  { number: 10, src: '/media/fanart/fanart10.jpg', width: 218, height: 203, artist: 'mcpattychon', caption: 'mcpatty\'s random sketch of me. They locked in later.', cSlug: 'praxor-v2' },
  { number: 11, src: '/media/fanart/fanart11.png', width: 2568, height: 3257, artist: 'milk / cowcat', caption: 'If you can\'t read, she made this for my 15th birthday. Thank you.', cSlug: 'praxor-v1' },
  { number: 12, src: '/media/fanart/fanart12.png', width: 1280, height: 1280, artist: 'angelbeat09', caption: 'I genuinely forgot how I got this.' },
  { number: 13, src: '/media/fanart/fanart13.jpg', width: 1272, height: 1485, artist: 'mynt719', caption: 'Purnid.', cSlug: 'purnid' },
  { number: 14, src: '/media/fanart/fanart14.png', width: 1012, height: 1402, artist: '???', caption: 'Mr. Black hiding under this... tubby...', cSlug: 'mr-black' },
  { number: 15, src: '/media/fanart/fanart15.png', width: 876, height: 1405, artist: 'mynt719', caption: 'Purnid swagged out.', cSlug: 'purnid' },
  { number: 16, src: '/media/fanart/fanart16.png', width: 1868, height: 2054, artist: 'mynt719', caption: 'praxor!V2 smoking a birthday candle. Yeah, it was for my birthday.', cSlug: 'praxor-v2' },
  { number: 17, src: '/media/fanart/fanart17.png', width: 1821, height: 1541, artist: 'toohi', caption: 'Toohi blessed me with this piece. This can count as praxor!V2\'s official design, and reference sheet.', cSlug: 'praxor-v2' },
  { number: 18, src: '/media/fanart/fanart18.jpg', width: 3060, height: 4080, artist: 'null / roota / the_real_peter_griffin.', caption: 'Quite the calm sketch for our \'Dead man in hollow arms\'.', cSlug: 'praxor-v2' },
  { number: 19, src: '/media/fanart/fanart19.png', width: 3072, height: 3072, artist: 'mcpattychon', caption: 'Evidence of mcpatty locking in.', cSlug: 'praxor-v2' },
  { number: 20, src: '/media/fanart/fanart20.png', width: 1024, height: 894, artist: 'null / roota / the_real_peter_griffin.', caption: 'I don\'t mean to glaze insanely, but SWEET MOTHER OF PEARL I was not expecting this from her.', cSlug: 'praxor-v2' },
  { number: 21, src: '/media/fanart/fanart21.png', width: 2048, height: 2048, artist: 'bibiipusheen.', caption: 'Chibi version of praxor!V2. Why did I get blushed twice in a row?', cSlug: 'praxor-v2' },
  { number: 22, src: '/media/fanart/fanart22.png', width: 2048, height: 2048, artist: 'sillysatorugojo_', caption: 'He is justice. He is truth.', cSlug: 'pubbly' },
  { number: 23, src: '/media/fanart/fanart23.jpg', width: 2160, height: 2880, artist: 'enaxie', caption: '\"this is my impression of him\" Hell yeah man.', cSlug: 'pubbly' },
  { number: 24, src: '/media/fanart/fanart24.png', width: 219, height: 232, artist: 'toohi', caption: 'lil guy', cSlug: 'praxor-v2' },
  { number: 25, src: '/media/fanart/fanart25.png', width: 2048, height: 2048, artist: 'sillysatorugojo_', caption: 'The pubbler. Twice. Technically.', cSlug: 'pubbly' },
  { number: 26, src: '/media/fanart/fanart26.png', width: 983, height: 959, artist: 'bloody_soda', caption: 'Soup\'s Headcanon of Mr. Cake. Indubitably splendid.', cSlug: 'mrcake' },
  { number: 27, src: '/media/fanart/fanart27.png', width: 579, height: 569, artist: 'thatonedude7637', caption: '"praxor cat" ', cSlug: 'the-praxor-cat' },
];

export const fanartByNumber = new Map(fanartOptions.map((image) => [image.number, image]));
