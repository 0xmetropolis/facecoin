"use server";

import { poke } from "./poke";
import { updateUserFromPrivy } from "./updateUserFromPrivy";

const updateUserFromPrivyAction = updateUserFromPrivy;
const pokeAction = poke;

export { updateUserFromPrivyAction, pokeAction };
