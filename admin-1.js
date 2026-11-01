const ON=OSP.on;
const eur=(n,d)=>n.toLocaleString('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:d===0?0:2,minimumFractionDigits:d===0?0:2});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=s=>document.querySelector(s);

/* Dados de exemplo */
let RS=ON?[]:[
 {id:'tasca',name:'Tasca do Largo',city:'Lisboa',cuisine:'Portuguesa',st:'ativo',rate:8,gmv:12840,res:612,rating:4.7,paid:true},
 {id:'brasa',name:'Forno & Brasa',city:'Porto',cuisine:'Grelhados',st:'ativo',rate:8,gmv:9420,res:455,rating:4.5,paid:true},
 {id:'mare',name:'Maré Alta',city:'Cascais',cuisine:'Peixe e marisco',st:'ativo',rate:9,gmv:15380,res:380,rating:4.8,paid:false},
 {id:'oliveira',name:'Casa Oliveira',city:'Lisboa',cuisine:'Vegetariana',st:'ativo',rate:8,gmv:6210,res:360,rating:4.6,paid:false},
 {id:'izakaya',name:'Izakaya Sol',city:'Porto',cuisine:'Japonesa',st:'ativo',rate:8,gmv:7480,res:402,rating:4.4,paid:true},
 {id:'massa',name:'Massa Fresca',city:'Lisboa',cuisine:'Italiana',st:'ativo',rate:8,gmv:5890,res:340,rating:4.5,paid:false},
 {id:'adega',name:'Adega Velha',city:'Braga',cuisine:'Portuguesa',st:'suspenso',rate:8,gmv:1260,res:64,rating:3.2,paid:true,why:'Várias queixas de pedidos não preparados a tempo.'},
 {id:'cantina',name:'Cantina da Ribeira',city:'Porto',cuisine:'Portuguesa',st:'pendente',rate:8,gmv:0,res:0,rating:0,paid:true},
 {id:'patio',name:'Pátio das Flores',city:'Faro',cuisine:'Mediterrânica',st:'pendente',rate:8,gmv:0,res:0,rating:0,paid:true}
];
let CL=ON?[]:[
 {id:1,name:'Marta Sousa',mail:'m***@exemplo.pt',city:'Lisboa',res:14,spent:412,pts:340,noshow:0,since:'mar 2026',st:'ativo'},
 {id:2,name:'João Pereira',mail:'j***@exemplo.pt',city:'Porto',res:9,spent:268,pts:120,noshow:1,since:'abr 2026',st:'ativo'},
 {id:3,name:'Carla Nunes',mail:'c***@exemplo.pt',city:'Lisboa',res:21,spent:735,pts:610,noshow:0,since:'jan 2026',st:'ativo'},
 {id:4,name:'Miguel Rocha',mail:'m***@exemplo.pt',city:'Cascais',res:6,spent:301,pts:95,noshow:0,since:'jun 2026',st:'ativo'},
 {id:5,name:'Helena Costa',mail:'h***@exemplo.pt',city:'Lisboa',res:11,spent:289,pts:210,noshow:0,since:'fev 2026',st:'ativo'},
 {id:6,name:'Rui Tavares',mail:'r***@exemplo.pt',city:'Porto',res:5,spent:122,pts:40,noshow:3,since:'mai 2026',st:'ativo'},
 {id:7,name:'Sónia Lima',mail:'s***@exemplo.pt',city:'Faro',res:3,spent:97,pts:30,noshow:0,since:'ago 2026',st:'ativo'},
 {id:8,name:'Pedro Dias',mail:'p***@exemplo.pt',city:'Lisboa',res:8,spent:176,pts:70,noshow:4,since:'mar 2026',st:'bloqueado'}
];
let RES=ON?[]:[
 {c:'OSP-B1',cl:'Carla Nunes',r:'tasca',when:'Hoje · 19:00',n:2,tot:48.9,st:'concluida',m:'MB WAY',ps:'pago'},
 {c:'OSP-B2',cl:'Miguel Rocha',r:'tasca',when:'Hoje · 19:30',n:4,tot:68.8,st:'confirmada',m:'Cartão',ps:'pago'},
 {c:'OSP-B3',cl:'Helena Costa',r:'tasca',when:'Hoje · 19:45',n:2,tot:30.5,st:'confirmada',m:'MB WAY',ps:'pago'},
 {c:'OSP-C1',cl:'João Pereira',r:'brasa',when:'Hoje · 20:00',n:3,tot:47.6,st:'confirmada',m:'Cartão',ps:'pago'},
 {c:'OSP-C2',cl:'Sónia Lima',r:'patio',when:'Hoje · 21:00',n:4,tot:52,st:'pendente',m:'Referência MB',ps:'falhado',noacc:true},
 {c:'OSP-D1',cl:'Rui Tavares',r:'izakaya',when:'Ontem · 20:30',n:2,tot:31.4,st:'naoveio',m:'MB WAY',ps:'pago'},
 {c:'OSP-D2',cl:'Marta Sousa',r:'mare',when:'Ontem · 13:00',n:2,tot:62.4,st:'concluida',m:'Cartão',ps:'pago'},
 {c:'OSP-D3',cl:'Pedro Dias',r:'adega',when:'Ontem · 21:00',n:2,tot:34,st:'cancelada',m:'Cartão',ps:'reembolsado'},
 {c:'OSP-E1',cl:'Marta Sousa',r:'oliveira',when:'Qua · 20:00',n:2,tot:41.8,st:'concluida',m:'MB WAY',ps:'pago'},
 {c:'OSP-E2',cl:'Carla Nunes',r:'massa',when:'Qua · 13:15',n:2,tot:36,st:'concluida',m:'Apple Pay',ps:'pago'}
];
let WEEKS=ON?[]:[['S34',17900],['S35',19200],['S36',18400],['S37',21300],['S38',22800],['S39',24100],['S40',23600],['S41',25400]];
let PRE=[];
let DISP=[];
