
// Colors are hexadecimals; hex codes. (#FF0000 => 0xFF0000)
// windowsxp is the "default"

const PALETTES = {
    "windowsxp": {
        "colors": [0x995C25, 0xF2A51A, 0x0BA112, 0x012803, 0xFEF45D, 0xFFFFFF, 0x5DB0B9, 0xC81F12, 0x447F47, 0xF29C47, 0x380100, 0x493226],
        "bg": 0x000000,
    },
    "valve": {
        "colors": [0x171A21, 0x1B2838, 0x66C0F4, 0x2A475E, 0x4C6B22, 0xC7D5E0, 0xF74843, 0x27a7d8, 0xff9a00],
        "bg": 0x1A1C21,
    },
    "pastel": { // warning: lightmode jumpscare
        "colors": [0xffb3ba, 0xffdfba, 0xffffba, 0xbaffc9, 0xbae1ff, 0xbbbcfc, 0xe1cbf2],
        "bg": 0xc7b3c3,
    },
    "neon": {
        "colors": [0xff073a, 0xffa700, 0x00ff94, 0x00d4ff, 0x007bff, 0xff5e00, 0xff5e00, 0x42009e],
        "bg": 0x110326,
    },
};



// Don't touch this stuff unless you're actually rewriting something.
// The standalone name definitions exist purely to make config editing easier.

const TRANSITIONS = {
  FADEOUT: "fadeOut",
  DISSOLVE: "dissolve"
};
const FADEOUT = TRANSITIONS.FADEOUT;
const DISSOLVE = TRANSITIONS.DISSOLVE;

const CAMERA_STATES = {
  STATIC: "static",
  ORBIT: "orbit",
}
const STATIC = CAMERA_STATES.STATIC;
const ORBIT = CAMERA_STATES.ORBIT;

const JOINT_TYPES = {
    ELBOW: "elbow",
    BALL: "ball",
    MIXED: "mixed",
}
const ELBOW = JOINT_TYPES.ELBOW;
const BALL = JOINT_TYPES.BALL;
const MIXED = JOINT_TYPES.MIXED;

const PIPE_MATERIALS = {
    METAL: "metal",
    SHINY: "shiny",
}
const METAL = PIPE_MATERIALS.METAL;
const SHINY = PIPE_MATERIALS.SHINY;