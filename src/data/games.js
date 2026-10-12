export const covers = {
  'Baldur’s Gate 3':'photo-1511512578047-dfb367046420','Cyberpunk 2077':'photo-1542751371-adc38448a05e','Elden Ring':'photo-1542751371-6533b3b0a5f0',
  'The Witcher 3':'photo-1518709268805-4e9042af9f23','Hades II':'photo-1511512578047-dfb367046420','Hollow Knight':'photo-1548685913-fe6678babe8d',
  'Stardew Valley':'photo-1511512578047-dfb367046420','Alan Wake 2':'photo-1535223289827-42f1e9919769'
};
const steamArt={baldur:1086940,cyberpunk:1091500,elden:1245620,'the witcher':292030,witcher:292030,hades:1145350,hollow:367520,stardew:413150};
export const imageFor=(game)=>{const title=(game.title||'').toLowerCase();if(title.startsWith('alan wake 2'))return 'https://cdn1.epicgames.com/offer/c4763f236d08423eb47b4c3008779c84/EGS_AlanWake2_RemedyEntertainment_S1_2560x1440-ec44404c0b41bc457cb94cd72cf85872';if(game.coverUrl)return game.coverUrl;if(title.startsWith('the witcher'))return 'https://cdn.akamai.steamstatic.com/steam/apps/292030/library_600x900.jpg';const key=Object.keys(steamArt).find(name=>title.startsWith(name));return key?`https://cdn.akamai.steamstatic.com/steam/apps/${steamArt[key]}/header.jpg`:'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85'};
export const samples = [
  {id:'demo-1',title:'Baldur’s Gate 3',genre:'RPG',year:2023,rating:9.7,platform:'PC · PS5 · Xbox',description:'Собери отряд, брось вызов судьбе и проживи историю, которая меняется вместе с каждым решением.',ownerName:'Larian Studios'},
  {id:'demo-2',title:'Cyberpunk 2077',genre:'Action RPG',year:2020,rating:9.1,platform:'PC · PS5 · Xbox',description:'Неоновый мегаполис, опасные контракты и собственный путь к легенде Найт-Сити.',ownerName:'CD Projekt Red'},
  {id:'demo-3',title:'Elden Ring',genre:'Soulslike',year:2022,rating:9.5,platform:'PC · PS5 · Xbox',description:'Осколки Кольца Элден, тайны Междуземья и свобода исследовать мир в своём ритме.',ownerName:'FromSoftware'},
  {id:'demo-4',title:'The Witcher 3',genre:'RPG',year:2015,rating:9.6,platform:'PC · PS5 · Xbox · Switch',description:'Следуй за Геральтом по огромному миру, где у каждого выбора есть цена.',ownerName:'CD Projekt Red'},
  {id:'demo-5',title:'Hades II',genre:'Roguelike',year:2024,rating:9.3,platform:'PC',description:'Сразись с Титаном Времени в новом мифологическом приключении Supergiant Games.',ownerName:'Supergiant Games'},
  {id:'demo-6',title:'Hollow Knight',genre:'Metroidvania',year:2017,rating:9.4,platform:'PC · PS5 · Xbox · Switch',description:'Исследуй подземное королевство жуков и раскрой историю Халлоунеста.',ownerName:'Team Cherry'},
  {id:'demo-7',title:'Stardew Valley',genre:'Симулятор',year:2016,rating:9.2,platform:'PC · PS5 · Xbox · Switch',description:'Новая жизнь на ферме, уютные будни и маленький город, полный историй.',ownerName:'ConcernedApe'},
  {id:'demo-8',title:'Alan Wake 2',genre:'Хоррор',year:2023,rating:9.0,platform:'PC · PS5 · Xbox',description:'Два героя, два мира и тревожная история на грани реальности и кошмара.',ownerName:'Remedy Entertainment'}
];
