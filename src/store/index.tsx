import { atom } from "jotai";
import { DataMap } from "../config/data";
export const lassoAtom = atom(true); // lasso是否开启

export const velocityDecayAtom = atom(0.3);

export const dataNameAtom = atom(Object.keys(DataMap)[0]);
