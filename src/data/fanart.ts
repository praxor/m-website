export interface FanartImage {
  number: number;
  src: string;
  width: number;
  height: number;
  artist: string;
  caption?: string;
}

export const fanartOptions: FanartImage[] = [
  { number: 1, src: '/media/fanart/fanart1.png', width: 1920, height: 1080, artist: 'toohi', caption: 'Heian-era praxor design.' },
  { number: 2, src: '/media/fanart/fanart2.jpeg', width: 1437, height: 1231, artist: 'blueistic', caption: 'It\'s me.' },
  { number: 3, src: '/media/fanart/fanart3.png', width: 2160, height: 1620, artist: 'fyre', caption: 'Thank god for underwear.' },
  { number: 4, src: '/media/fanart/fanart4.png', width: 121, height: 235, artist: 'louies', caption: 'Sketch of yours truly made by my ex.' },
  { number: 5, src: '/media/fanart/fanart5.png', width: 483, height: 429, artist: 'toohi', caption: 'I was genuinely baffled upon receiving this one.' },
  { number: 6, src: '/media/fanart/fanart6.png', width: 572, height: 534, artist: 'toohi', caption: '...smug little fucker, ain\'t I?' },
  { number: 7, src: '/media/fanart/fanart7.png', width: 676, height: 702, artist: 'toohi', caption: 'Axis spaceman design. He was hardly drawn this way.' },
  { number: 8, src: '/media/fanart/fanart8.png', width: 460, height: 500, artist: '???', caption: 'Early form of praxor emoji design. Features Axis.' },
  { number: 9, src: '/media/fanart/fanart9.png', width: 1920, height: 1080, artist: 'toohi', caption: 'Incarnation of infection. Rabies. 𝙎𝙘𝙖𝙧𝙮.' },
  { number: 10, src: '/media/fanart/fanart10.png', width: 507, height: 525, artist: 'can you guess who did it (it was toohi)', caption: 'It\'s IRL me again, woohoo!' },
  { number: 11, src: '/media/fanart/fanart11.png', width: 453, height: 513, artist: 'lego_foxy', caption: 'Bowling pin-xor. Thank you Lego Foxy' },
  { number: 12, src: '/media/fanart/fanart12.png', width: 993, height: 1385, artist: 'lotterytickett', caption: 'I can\'t believe I asked to be put in this attire. Oh well, it was worth it.' },
  { number: 13, src: '/media/fanart/fanart13.jpg', width: 218, height: 203, artist: 'mcpattychon', caption: 'mcpatty\'s random sketch of me. They locked in later.' },
  { number: 14, src: '/media/fanart/fanart14.png', width: 2568, height: 3257, artist: 'milk / cowcat', caption: 'If you can\'t read, she made this for my 15th birthday. Thank you.' },
  { number: 15, src: '/media/fanart/fanart15.png', width: 1280, height: 1280, artist: 'angelbeat09', caption: 'I genuinely forgot how I got this.' },
  { number: 16, src: '/media/fanart/fanart16.jpg', width: 1272, height: 1485, artist: 'mynt719', caption: 'Purnid.' },
  { number: 17, src: '/media/fanart/fanart17.png', width: 1012, height: 1402, artist: '???', caption: 'Mr. Black hiding under this... tubby...' },
  { number: 18, src: '/media/fanart/fanart18.png', width: 876, height: 1405, artist: 'mynt719', caption: 'Purnid swagged out.' },
  { number: 19, src: '/media/fanart/fanart19.png', width: 1868, height: 2054, artist: 'mynt719', caption: 'praxor!V2 smoking a birthday candle. Yeah, it was for my birthday.' },
  { number: 20, src: '/media/fanart/fanart20.png', width: 1821, height: 1541, artist: 'toohi', caption: 'Toohi blessed me with this piece. This can count as praxor!V2\'s official design, and reference sheet.' },
  { number: 21, src: '/media/fanart/fanart21.jpg', width: 3060, height: 4080, artist: 'null / roota / the_real_peter_griffin.', caption: 'Quite the calm sketch for our \'Dead man in hollow arms\'.' },
  { number: 22, src: '/media/fanart/fanart22.png', width: 3072, height: 3072, artist: 'mcpattychon', caption: 'Evidence of mcpatty locking in.' },
  { number: 23, src: '/media/fanart/fanart23.png', width: 1024, height: 894, artist: 'null / roota / the_real_peter_griffin.', caption: 'I don\'t mean to glaze insanely, but SWEET MOTHER OF PEARL I was not expecting this from her.' },
  { number: 24, src: '/media/fanart/fanart24.png', width: 2048, height: 2048, artist: 'bibiipusheen.', caption: 'Chibi version of praxor!V2. Why did I get blushed twice in a row?' },
];

export const fanartByNumber = new Map(fanartOptions.map((image) => [image.number, image]));
