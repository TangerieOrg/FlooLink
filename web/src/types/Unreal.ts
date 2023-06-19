export namespace Unreal {
    export type Vector3 = [X: number, Y: number, Z: number];

    export const EGender = {
        Male: 0,
        Female: 1,
        Unknown: 2,
        Max: 3
    } as const;
    export type EGender = typeof EGender[keyof typeof EGender];

    export const EHouse = {
        Gryffindor: 0,
        Hufflepuff: 1,
        Ravenclaw: 2,
        Slytherin: 3,
        Unaffiliated: 4,
        Count: 5,
        Max: 6
    } as const;
    export type EHouse = typeof EHouse[keyof typeof EHouse];

    export interface CharacterInfo {
        Gender: EGender;
        House: EHouse;
    }
}