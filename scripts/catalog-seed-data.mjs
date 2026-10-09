export const categories = [
  "Conjuntos",
  "Macaquinhos",
  "Macacões",
  "Blusas",
  "Croppeds",
  "Saias",
  "Casacos",
  "Casaquinhos",
];

const numbered = (directory, extension, count) =>
  Array.from({ length: count }, (_, index) => `${directory}/${index + 1}.${extension}`);

export const products = [
  {
    name: "Macaquito Ellie",
    category: "Macaquinhos",
    brand: "Atletika",
    files: numbered("src/assets/atletika/macaquito-ellie", "jpg", 3),
  },
  {
    name: "Conjunto Perla",
    category: "Conjuntos",
    brand: "Atletika",
    files: numbered("src/assets/atletika/conjunto-perla", "jpg", 2),
  },
  {
    name: "Conjunto Layane",
    category: "Conjuntos",
    brand: "Atletika",
    files: numbered("src/assets/atletika/conjunto-layane", "jpg", 3),
  },
  {
    name: "Macacão Marta",
    category: "Macacões",
    brand: "Atletika",
    files: numbered("src/assets/atletika/macacao-marta", "jpg", 3),
  },
  {
    name: "Conjunto Cherry",
    category: "Conjuntos",
    brand: "Atletika",
    files: numbered("src/assets/atletika/conjunto-cherry", "jpg", 3),
  },
  {
    name: "Macaquito Helena",
    category: "Macaquinhos",
    brand: "Atletika",
    files: numbered("src/assets/atletika/macaquito-helena", "jpg", 3),
  },
  {
    name: "Blusa Baby Look com Bolsos",
    category: "Blusas",
    brand: "Atletika",
    files: numbered("src/assets/atletika/blusa-baby-look-com-bolsos", "jpg", 3),
  },
  {
    name: "Conjunto Kimi",
    category: "Conjuntos",
    brand: "Atletika",
    files: numbered("src/assets/atletika/conjunto-kimi", "jpg", 3),
  },
  {
    name: "Baby Look Tapa Bumbum",
    category: "Blusas",
    brand: "Summi",
    files: numbered("public/summi/blusa-baby-look-tapa-bumbum", "jpg", 6),
  },
  {
    name: "Trend",
    category: "Blusas",
    brand: "Summi",
    files: numbered("public/summi/blusa-trend", "webp", 3),
  },
  {
    name: "Regatão",
    category: "Blusas",
    brand: "Summi",
    files: numbered("public/summi/blusa-regatao", "jpg", 6),
  },
  {
    name: "Regata",
    category: "Blusas",
    brand: "Summi",
    files: numbered("public/summi/blusa-regata", "jpg", 6),
  },
  {
    name: "Cropped New",
    category: "Croppeds",
    brand: "Summi",
    files: numbered("public/summi/blusa-cropped-new", "jpg", 11),
  },
  {
    name: "Morcego",
    category: "Blusas",
    brand: "Summi",
    files: numbered("public/summi/blusa-morcego", "jpg", 2),
  },
  {
    name: "Cropped",
    category: "Croppeds",
    brand: "Summi",
    files: numbered("public/summi/blusa-cropped", "jpg", 3),
  },
  {
    name: "Baby Look",
    category: "Blusas",
    brand: "Summi",
    files: numbered("public/summi/blusa-baby-look", "jpg", 5),
  },
  {
    name: "Macacão Jade",
    category: "Macacões",
    brand: "Summi",
    files: numbered("public/summi/macacao-jade", "jpg", 5),
  },
  {
    name: "Macaquinho Jade",
    category: "Macaquinhos",
    brand: "Summi",
    files: numbered("public/summi/macaquinho-jade", "jpg", 5),
  },
  {
    name: "Macaquinho Summi",
    category: "Macaquinhos",
    brand: "Summi",
    files: numbered("public/summi/macaquinho-summi", "jpg", 5),
  },
  {
    name: "Macacão Summi",
    category: "Macacões",
    brand: "Summi",
    files: [
      "public/summi/macacao-summi/1.jpg",
      "public/summi/macacao-summi/2.png",
      "public/summi/macacao-summi/3.png",
      "public/summi/macacao-summi/4.jpg",
      "public/summi/macacao-summi/5.jpg",
    ],
  },
  {
    name: "Casaco Moviment",
    category: "Casacos",
    brand: "Summi",
    files: numbered("public/summi/casaco-moviment", "jpg", 3),
  },
  {
    name: "Casaquinho Malha Encorpada UV",
    category: "Casaquinhos",
    brand: "Summi",
    files: numbered("public/summi/casaquinho-malha-encorpada-uv", "jpg", 3),
  },
];
