"use server";

import { poke } from "./poke";
import { resetUser } from "./resetUser";
import { updateUserFromPrivy } from "./updateUserFromPrivy";

const updateUserFromPrivyAction = updateUserFromPrivy;
const pokeAction = poke;
const resetUserAction = resetUser;

export { updateUserFromPrivyAction, pokeAction, resetUserAction };
