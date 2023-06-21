import MAP_TILES from "url:./**/*.webp";

type Row = [string, string, string, string, string, string, string, string];
type Tileset = [Row, Row, Row, Row, Row, Row, Row, Row];

const SIDE_LENGTH = 8;

const { large, medium, small } = MAP_TILES;

const toTileset = (map : Record<string, string>) : Tileset => {
    const tileSet : Tileset = Array(SIDE_LENGTH).fill(0).map(() => Array(SIDE_LENGTH)) as any;
    for(let i = 0; i < SIDE_LENGTH * SIDE_LENGTH;  i++) {
        tileSet[Math.floor(i / SIDE_LENGTH)][i % SIDE_LENGTH] = map[`${i}`];
    }
    return tileSet;
}

export const LargeTiles = toTileset(large);
export const MediumTiles = toTileset(medium);
export const SmallTiles = toTileset(small);