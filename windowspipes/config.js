const CONFIG = {

    // The Color palette the pipes sample from. (Edit or make your own in /definitions.js)
    SELECTED_PALETTE: "windowsxp", // windowsxp, valve, pastel, neon
    // Toggle the background between the default black or the one associated with the chosen Palette.
    // NOTE: The background logo will always be visible over any color other than black.
    ENABLE_PALETTE_BG_COLOR: true,

    // The style of pipe joints.
    PIPE_JOINTS_STYLE: MIXED, // ELBOW, BALL, MIXED
    // The radius of the pipes.
    PIPE_RADIUS: 0.2, // 0.2
    // The speed the pipes move. It's all vibes tbh, my implementation of this is not good, but it works.
    PIPE_MOVE_INTERVAL: 0.03, // 0.03
    START_PIPE_AMOUNT: 2, // NOTE: INCREASE AT OWN RISK. Highly recommend against going over the default here.

    // Adjusts the lighting.
    PIPE_MATERIAL: METAL, // METAL, SHINY
    PIPE_SHININESS: 0.2, // 0.3 (0 - 1)
    PIPE_METALNESS: 0.7, // 0.7 (0 - 1) - Only applies when METAL is selected.
    DIRECT_LIGHT_INTENSITY: 1.3, // 1.2
    AMBIENT_LIGHT_INTENSITY: 0.9, // 0.9

    // Places the light so it's always coming from the direction of the camera.
    GIVE_CAMERA_FLASHLIGHT: false,

    // Grid size in each dimension.
    // You can keep this at (10, 10, 10), but it might be worth widening for modern screen resolution.
    // (Y = UP)
    GRID_SIZE_X: 13, // 10
    GRID_SIZE_Y: 10, // 10
    GRID_SIZE_Z: 13, // 10

    // Toggle the background image that appears over pipes.
    HIDE_BACKGROUND_IMAGE: false,
    // OPTIONAL, only necessary if you don't rename your bg image to "background.png"
    // If an extension is not supplied, it'll assume it's a PNG.
    // Any and all background images must be placed in /images.
    IMAGE_NAME: "",

    // The outro transition between scenes.
    CURRENT_TRANSITION: FADEOUT, // FADEOUT, DISSOLVE
    TRANSITION_SPEED: 4, // 4

    // Adjustments for the camera.
    // Distance Min/Max will set a random range. Setting the same number in both will lock it to that.
    CAMERA_DISTANCE_MIN: 30, // 30
    CAMERA_DISTANCE_MAX: 40, // 40
    CAMERA_MOVEMENT: STATIC, // STATIC, ORBIT
    CAMERA_ORBIT_SPEED: 0.05, // 0.05 (50 is kinda fun)

    // Values that set the min/max length of longer pipes.
    LONGPIPE_MIN_LENGTH: 350, // 350
    LONGPIPE_MAX_LENGTH: 750, // 750

    // Values that set the min/max length of shorter pipes.
    SHORTPIPE_MIN_LENGTH: 50, // 50
    SHORTPIPE_MAX_LENGTH: 100, // 100
    // Short pipes don't always show up, but you can adjust that here.
    // This is mostly a design decision to make pipes longer on average.
    SHORTPIPE_CHANCE: 1 / 5, // 1 / 5

};