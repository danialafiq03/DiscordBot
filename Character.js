class Character {
    constructor(name, rarity, hp, dmg, avatar) {
      this.name = name;
      this.rarity = rarity;
      this.hp = hp;
      this.dmg = dmg;
      this.avatar = avatar;
    }
    age() {
      let date = new Date();
      return date.getFullYear() - this.year;
    }
    
  }
  