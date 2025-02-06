"use server";

import { updateUserFromPrivy } from "./updateUserFromPrivy";
import { uploadImage } from "./uploadImage";

const updateUserFromPrivyAction = updateUserFromPrivy;
const uploadImageAction = uploadImage;

export { updateUserFromPrivyAction, uploadImageAction };
