/* config.js — edit favourites, name and refresh rate here */
/* ===== CONFIG ===== */
const CFG = {
  favDriver: 'piastri',          // Jolpica driverId
  favTeam: 'mercedes',           // Jolpica constructorId
  rival: 'max_verstappen',       // driver for the "gap" stat
  name: 'Akshra',
  refreshMs: 60000               // data refresh interval
};
const API = '/api/f1/';   // Django proxy (see dashboard/views.py)
const COLORS = {mercedes:'#6ee7c8',ferrari:'#d42e20',mclaren:'#f08a24',haas:'#9aa0a6',red_bull:'#3b5bdb',alpine:'#3e8fd0',rb:'#7b8cf0',racing_bulls:'#7b8cf0',audi:'#3a8a6a',williams:'#7cc4f2',aston_martin:'#2f8f6b',cadillac:'#888'};
const FLAGS = {USA:'🇺🇸','United States':'🇺🇸',Canada:'🇨🇦',Monaco:'🇲🇨',Spain:'🇪🇸',Austria:'🇦🇹',UK:'🇬🇧','United Kingdom':'🇬🇧',Belgium:'🇧🇪',Hungary:'🇭🇺',Netherlands:'🇳🇱',Italy:'🇮🇹',Azerbaijan:'🇦🇿',Singapore:'🇸🇬',Japan:'🇯🇵',Qatar:'🇶🇦',UAE:'🇦🇪',Mexico:'🇲🇽',Brazil:'🇧🇷',Australia:'🇦🇺',China:'🇨🇳',Bahrain:'🇧🇭','Saudi Arabia':'🇸🇦'};
const NATFLAG = {};
let S = {races:[],drivers:[],teams:[],last:null,next:null};
