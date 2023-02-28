import PocketBase from "pocketbase";
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';



async function newId(): Promise<string> {
    const record = await pb.collection('users').create({number: 56});
    localStorage.setItem('userid', record.id);
    return record.id;
}

export function getAvatar(seed: string): string {
    return createAvatar(bottts, { seed: seed }).toDataUriSync();
}

export const pb = new PocketBase();

export const userid: string = localStorage.getItem('userid') ?? await newId();

export const avatar = getAvatar(userid);

export interface UserRecord {
    id: string;
    number: number;
}
