// const SOUND_CUTOFF_RANGE = 100;
// const SOUND_NEAR_RANGE = 10;

const VOLUME_MULT = 1;
const DISTANCE_DIVIDER = Math.pow(900, 2);
const FALLOFF = 0.65;
const OFFSET = 0.1
const MIN_CUTOFF = 0.08;

export const calcVolumeMult = (me : Float32Array, other : Float32Array) => {
    const distSquared = ((me[0] - other[0])*(me[0] - other[0]) + (me[1] - other[1])*(me[1] - other[1]) + (me[2] - other[2])*(me[2] - other[2])) / DISTANCE_DIVIDER;
    const inv = Math.pow(1/distSquared, FALLOFF) - OFFSET;
    const m = Math.min(
        Math.max(
            inv,
            0
        ),
        1
    ) * VOLUME_MULT;
    if(m < MIN_CUTOFF) return 0;
    return Math.round(m * 100) / 100;
}