import * as badWords from "bad-words";

const filter = new (badWords.default || badWords.Filter || badWords)();

filter.addWords(
  "gun", "pistol", "rifle", "weapon", "knife", "bomb", "ammunition", "ak47", "glock", "bandook", "aslaha", "churri",
  "drugs", "charas", "heroin", "cocaine", "shisha", "vodka", "wine", "beer", "alcohol", "sharab",

  "sexy", "hot", "porn", "dating", "adult", "nude", "larki", "dating"
);

export const validateText = (text) => {
  if (!text) return true;
  return !filter.isProfane(text);
};

export const cleanText = (text) => {
  return filter.clean(text);
};