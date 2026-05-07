export const events = [
  {
    id: 1,
    name: "Tomorrowland Brasil 2025",
    date: "2025-10-10",
    location: "Itu, São Paulo",
    category: "Festival",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    description:
      "O maior festival de música eletrônica do mundo chega ao Brasil com uma lineup incrível de DJs internacionais, cenários mágicos e uma experiência única que vai além da música. São dias de pura magia, arte e conexão.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso à área geral com melhor energia do festival",
        price: 890,
        available: 200,
      },
      {
        id: "vip",
        name: "VIP",
        description: "Área exclusiva com vista privilegiada e open bar",
        price: 1590,
        available: 50,
      },
      {
        id: "premium",
        name: "Premium",
        description: "Camarote privativo, serviço exclusivo e acesso total",
        price: 2800,
        available: 20,
      },
    ],
  },
  {
    id: 2,
    name: "Rock in Rio",
    date: "2025-09-19",
    location: "Rio de Janeiro, RJ",
    category: "Festival",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    description:
      "O festival mais icônico da América Latina retorna com uma edição histórica. Bandas lendárias e novos artistas se unem em um palco que já viu a história da música ser escrita. Uma experiência que marca gerações.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso à área geral do festival",
        price: 645,
        available: 500,
      },
      {
        id: "vip",
        name: "VIP",
        description: "Área VIP com banheiros exclusivos e lounge",
        price: 1200,
        available: 80,
      },
    ],
  },
  {
    id: 3,
    name: "Lollapalooza São Paulo",
    date: "2025-03-28",
    location: "São Paulo, SP",
    category: "Festival",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    description:
      "O festival multicultural que celebra música, arte e diversidade em São Paulo. Com vários palcos simultâneos e artistas dos mais variados gêneros, o Lolla é a experiência definitiva para quem ama música ao vivo.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso aos 4 palcos do festival",
        price: 750,
        available: 300,
      },
      {
        id: "vip",
        name: "VIP",
        description: "Área VIP com vista especial e conforto",
        price: 1450,
        available: 60,
      },
    ],
  },
  {
    id: 4,
    name: "The Weeknd — After Hours Tour",
    date: "2025-11-05",
    location: "Arena Corinthians, SP",
    category: "Show",
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    description:
      "Abel Tesfaye traz para o Brasil o espetáculo visual mais aguardado da década. Com produção cinematográfica, cenários surreais e hits que definiram uma era, After Hours Tour é mais do que um show — é uma obra de arte.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso à área geral da arena",
        price: 420,
        available: 400,
      },
      {
        id: "vip",
        name: "VIP Front",
        description: "Área exclusiva na frente do palco",
        price: 850,
        available: 100,
      },
    ],
  },
  {
    id: 5,
    name: "Coldplay — Music of the Spheres",
    date: "2025-11-22",
    location: "Estádio Nilton Santos, RJ",
    category: "Show",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    description:
      "A turnê mais sustentável e visualmente deslumbrante da história do rock. Chris Martin e sua banda transformam estádios em galáxias de luz e cor. Pulseiras LED, fogos de artifício e músicas que emocionam gerações.",
    ticketTypes: [
      {
        id: "standard",
        name: "Arquibancada",
        description: "Acesso à arquibancada do estádio",
        price: 595,
        available: 600,
      },
      {
        id: "pista",
        name: "Pista Premium",
        description: "Pista próxima ao palco com vista privilegiada",
        price: 950,
        available: 150,
      },
      {
        id: "vip",
        name: "Camarote",
        description: "Camarote com serviço completo e vista panorâmica",
        price: 2200,
        available: 30,
      },
    ],
  },
  {
    id: 6,
    name: "São Paulo Fashion Week",
    date: "2025-06-15",
    location: "Ibirapuera, São Paulo",
    category: "Moda",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    description:
      "O evento mais importante da moda brasileira reúne os grandes nomes do design nacional e internacional. Desfiles exclusivos, instalações artísticas e o lançamento das coleções que vão definir as tendências da próxima temporada.",
    ticketTypes: [
      {
        id: "standard",
        name: "Padrão",
        description: "Acesso aos desfiles e área de exposições",
        price: 200,
        available: 150,
      },
      {
        id: "vip",
        name: "VIP",
        description: "Assento frontal, coquetel exclusivo e brindes",
        price: 580,
        available: 40,
      },
    ],
  },

  // ── Novos eventos ────────────────────────────────────────────

  {
    id: 7,
    name: "Gusttavo Lima — Butekinho do Embaixador",
    date: "2025-08-16",
    location: "Ginásio do Ibirapuera, SP",
    category: "Show",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    description:
      "O Embaixador chega com tudo em mais uma noite inesquecível de sertanejo raiz e muito pagode. Gusttavo Lima promete uma festa que vai do couché ao forró, com produção de tirar o fôlego e os maiores hits da sua carreira.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso à área geral com toda a energia da galera",
        price: 180,
        available: 800,
      },
      {
        id: "vip",
        name: "Área VIP",
        description: "Setor especial com open bar de cerveja e mesa reservada",
        price: 420,
        available: 120,
      },
      {
        id: "premium",
        name: "Camarote Premium",
        description: "Camarote privativo com open bar completo e buffet",
        price: 950,
        available: 30,
      },
    ],
  },
  {
    id: 8,
    name: "Zé Neto & Cristiano — Colírio Tour",
    date: "2025-07-05",
    location: "Arena Fonte Nova, Salvador, BA",
    category: "Show",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
    description:
      "A dupla sertaneja mais explosiva do Brasil chega à Bahia com a Colírio Tour. Uma noite recheada de hits, muita energia e aquele sertanejo universitário que faz todo mundo cantar junto. Não vai ter jeito de ficar parado.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso à pista com vista para o palco principal",
        price: 150,
        available: 1000,
      },
      {
        id: "vip",
        name: "Pista Premium",
        description: "Setor mais próximo ao palco com grade frontal exclusiva",
        price: 320,
        available: 200,
      },
      {
        id: "camarote",
        name: "Camarote",
        description: "Visão panorâmica, open bar e serviço exclusivo",
        price: 780,
        available: 50,
      },
    ],
  },
  {
    id: 9,
    name: "Matuê — 333 Tour",
    date: "2025-09-13",
    location: "Espaço Unimed, São Paulo, SP",
    category: "Show",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    description:
      "O rei do trap brasileiro volta aos palcos com a 333 Tour, apresentando seu mais novo álbum ao vivo. Matuê mistura trap, hip-hop e influências futuristas numa produção audiovisual que redefiniu o rap nacional. Uma noite que vai marcar a cena.",
    ticketTypes: [
      {
        id: "standard",
        name: "Pista",
        description: "Acesso à pista — a mais vibe do rolê",
        price: 220,
        available: 600,
      },
      {
        id: "vip",
        name: "Pista VIP",
        description: "Área elevada com melhor visibilidade e menos lotação",
        price: 450,
        available: 100,
      },
    ],
  },
  {
    id: 10,
    name: "O Auto da Compadecida — Em Teatro",
    date: "2025-08-02",
    location: "Teatro Municipal, São Paulo, SP",
    category: "Teatro",
    image:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
    description:
      "A obra-prima de Ariano Suassuna ganha uma montagem moderna e vibrante no palco do Teatro Municipal. Com elenco de renome, trilha ao vivo e figurinos deslumbrantes, essa é a versão definitiva do clássico do teatro brasileiro que você não pode perder.",
    ticketTypes: [
      {
        id: "standard",
        name: "Plateia",
        description: "Acesso à plateia geral com ótima visibilidade",
        price: 90,
        available: 300,
      },
      {
        id: "vip",
        name: "Plateia VIP",
        description:
          "Primeiras fileiras com assento numerado e programa exclusivo",
        price: 180,
        available: 80,
      },
      {
        id: "premium",
        name: "Balcão Nobre",
        description:
          "Vista panorâmica do palco inteiro — a melhor experiência da casa",
        price: 260,
        available: 40,
      },
    ],
  },
];
