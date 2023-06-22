import MAP_TILES from "url:./**/*.webp";

type Row = [string, string, string, string, string, string, string, string];
type Tileset = [Row, Row, Row, Row, Row, Row, Row, Row];


const { large, medium, small } = MAP_TILES;

const toTileset = (map : Record<string, string>) : Tileset => {
    const sideLength = Math.sqrt(Object.keys(map).length);
    const tileSet : Tileset = Array(sideLength).fill(0).map(() => Array(sideLength)) as any;
    for(let i = 0; i < sideLength * sideLength;  i++) {
        tileSet[Math.floor(i / sideLength)][i % sideLength] = map[`${i}`];
    }
    return tileSet;
}

export const LargeTiles = toTileset(large);
export const MediumTiles = toTileset(medium);
export const SmallTiles = toTileset(small);