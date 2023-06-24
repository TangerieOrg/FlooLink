import Center from "url:./Center.glb";
import North from "url:./North.glb";
import South from "url:./South.glb";

import _Water from "url:./Water.glb";

import SM_Map_Overland_E from "url:./SM_Map_Overland_E.glb";
import SM_Map_Overland_M from "url:./SM_Map_Overland_M.glb";
import SM_Map_Overland_MS from "url:./SM_Map_Overland_MS.glb";
import SM_Map_Overland_N from "url:./SM_Map_Overland_N.glb";
import SM_Map_Overland_S from "url:./SM_Map_Overland_S.glb";
import SM_Map_Overland_W from "url:./SM_Map_Overland_W.glb";

export const Models = {
    Props: { Center, North, South },
    Tiles: {
        SM_Map_Overland_E,
        SM_Map_Overland_M,
        SM_Map_Overland_MS,
        SM_Map_Overland_N,
        SM_Map_Overland_S,
        SM_Map_Overland_W
    },
    Water: _Water
}

/*
export const ModelsAsItems = {
    Props: [
        ["Center", Center],
        ["North", North],
        ["South", South],
    ],
    Tiles: [
        ["SM_Map_Overland_E", Models.Tiles.SM_Map_Overland_E],
        ["SM_Map_Overland_M", Models.Tiles.SM_Map_Overland_M],
        ["SM_Map_Overland_MS", Models.Tiles.SM_Map_Overland_MS],
        ["SM_Map_Overland_N", Models.Tiles.SM_Map_Overland_N],
        ["SM_Map_Overland_S", Models.Tiles.SM_Map_Overland_S],
        ["SM_Map_Overland_W", Models.Tiles.SM_Map_Overland_W],
    ],
    Water: ["Water", Models.Water]
}
*/