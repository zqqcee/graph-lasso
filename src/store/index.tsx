import { atom } from "jotai";
import { DataMap } from "../config/data";
export const lassoAtom = atom(true); // lasso是否开启

export const velocityDecayAtom = atom(0.3);

export const dataNameAtom = atom(Object.keys(DataMap)[0]);

export const alphaAtom = atom(0.5);

export const collideAtom = atom(8);

export const alphaMinAtom = atom(0.1);

export const alphaDecayAtom = atom(0.01);

export const linkStrengthAtom = atom(0.4);