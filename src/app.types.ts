interface Pet {
  name: string;
  age: number;
}

interface PetsDTO {
  pets: Pet[];
  count: number;
}

export { Pet, PetsDTO };
