/* Weapon Masteries by Class and Level are providing in the 2024 free rules on D&D Beyond: 
* https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Barbarian
* https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Fighter
* https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Paladin
* https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Ranger
* https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Rogue
*/
export const classMasteries = [
  {
    id: "barbarian",
    masteries: [
      { level: 1, grants: 2 },
      { level: 4, grants: 1 },
      { level: 10, grants: 1 }
    ]
  },
  {
    id: "fighter",
    masteries: [
      { level: 1, grants: 2 },
      { level: 4, grants: 1 },
      { level: 10, grants: 1 },
      { level: 16, grants: 1 }
    ]
  },
  {
    id: "paladin",
    masteries: [
      { level: 1, grants: 2 }
    ]
  },
  {
    id: "ranger",
    masteries: [
      { level: 1, grants: 2 }
    ]
  },
  {
    id: "rogue",
    masteries: [
      { level: 1, grants: 2 }
    ]
  }
]
/*
export const classMasteries = {
  barbarian: { levels: { 1: 2, 4: 3, 10: 4 } },
  fighter: { levels: { 1: 2, 4: 3, 10: 4, 16: 5 } },
  paladin: { levels: { 1: 2 } },
  ranger: { levels: { 1: 2 } },
  rogue: { levels: { 1: 2 } }
}
  */