# Low-End Device Performance Pass

The game now detects constrained devices and defaults them to a safer graphics profile when no manual quality choice exists.

- 2GB-or-less devices, 2 CPU cores or fewer, or browser Save-Data preference => LOW.
- 4GB-or-less devices or 4 CPU cores or fewer => MED.
- LOW caps canvas DPR at 1, limits decorative particles, disables expensive canvas shadows, throttles rendering to about 30 FPS, and removes heavy CSS blur/backdrop effects.
- MED caps canvas DPR at 1.25 and throttles decorative rendering to about 45 FPS.
- HIGH remains available as an explicit user choice.
- Large source sprites are downscaled to a maximum 384px canvas before background-removal processing, substantially reducing RAM pressure.
- Menu and splash starfields use fewer stars and a lower render rate on constrained devices.

This is an optimization pass; actual device performance can still vary by browser, thermal state, and memory pressure.
