# Vehicle Display Customization Guide

This guide explains the new vehicle display customization features added to the Brisbane Bus Routes SPA.

## Accessing Settings

1. **Desktop**: Click the ⚙️ settings button in the top-right corner of the main UI panel
2. **Mobile**: Tap the ⚙️ Settings button in the bottom navigation bar

## Vehicle Display Modes

The "Vehicle Display" section in settings allows you to choose how vehicles are rendered on the map.

### Available Modes

#### 1. Dots
- Simple colored circles representing each vehicle
- Color indicates speed:
  - **Gray**: Stationary (0 m/s)
  - **Red**: Slow (0-5 m/s / 0-18 km/h)
  - **Orange**: Medium (5-10 m/s / 18-36 km/h)
  - **Yellow**: Fast (10-15 m/s / 36-54 km/h)
  - **Green**: Very Fast (15+ m/s / 54+ km/h)
- White stroke around each dot for visibility
- Route label displays below each dot

#### 2. Emoji (Default)
- Displays vehicle type using emoji icons:
  - 🚌 Bus (GTFS route_type 3)
  - 🚊 Tram (GTFS route_type 0)
  - 🚇 Subway (GTFS route_type 1)
  - 🚆 Rail (GTFS route_type 2)
  - ⛴️ Ferry (GTFS route_type 4)
  - 🚋 Cable Tram (GTFS route_type 5)
  - 🚡 Aerial Lift (GTFS route_type 6)
  - 🚞 Funicular (GTFS route_type 7)
  - 🚎 Trolleybus (GTFS route_type 11)
  - 🚝 Monorail (GTFS route_type 12)
- Icon rotates based on vehicle bearing/direction
- Route label displays below each icon
- Best for distinguishing vehicle types at a glance

#### 3. Icons
- Currently uses the same emoji icons as mode 2
- Future enhancement: Could load custom SVG icons or sprite sheets
- Designed to support icon libraries like Font Awesome or custom transit icon sets
- Route label displays below each icon

#### 4. Single Character
- Displays a single letter representing vehicle type:
  - **B** = Bus
  - **T** = Tram
  - **S** = Subway
  - **R** = Rail
  - **F** = Ferry
  - **C** = Cable Tram
  - **A** = Aerial Lift
  - **M** = Monorail
- Letter color indicates speed (same color scheme as dots)
- Character rotates based on vehicle bearing/direction
- Minimal visual design, good for high-density views
- Route label displays below each character

#### 5. Direction Arrows
- Displays a Unicode arrow (▲) for each vehicle
- Arrow rotates to show travel direction based on vehicle bearing
- Arrow color indicates speed (same color scheme as dots):
  - **Gray**: Stationary
  - **Red**: Slow
  - **Orange**: Medium
  - **Yellow**: Fast
  - **Green**: Very Fast
- Excellent for understanding traffic flow patterns
- Route label displays below each arrow

#### 6. Heatmap
- Visualizes vehicle density and speed as a heat map
- Color gradient:
  - **Blue**: Low density/speed
  - **Cyan**: Medium-low density
  - **Yellow**: Medium density
  - **Orange**: Medium-high density
  - **Red**: High density/speed
- Weight increases with vehicle speed
- Radius adjusts based on zoom level
- Intensity increases with zoom for better detail
- Fades at high zoom levels (>15) to transition to individual vehicles
- Best for identifying congestion and high-traffic areas
- Note: Individual vehicles cannot be clicked in heatmap mode

## Vehicle Clustering

The "Cluster vehicles" toggle button (🔢 icon) enables/disables vehicle clustering.

### When Clustering is Enabled:
- Nearby vehicles (within 50px) are grouped into clusters
- Cluster circles are blue with a count badge showing number of vehicles
- Cluster size increases with vehicle count:
  - Small clusters (1-9 vehicles): 15px radius
  - Medium clusters (10-99 vehicles): 20px radius
  - Large clusters (100+ vehicles): 25px radius
- Click a cluster to zoom in and expand it
- Individual vehicles appear when zoomed in past level 14
- Works with all display modes except heatmap

### When Clustering is Disabled:
- All vehicles display individually at all zoom levels
- Better for viewing specific vehicles
- May appear crowded at low zoom levels in dense areas

## Interaction

### Clicking Vehicles
- **All modes except heatmap**: Click any vehicle to:
  - View route details, speed, destination
  - See upcoming stops and ETAs
  - Enable "Follow" mode to track that vehicle
  - Automatically filter to show only that route
  
### Clicking Clusters
- Click a cluster circle to zoom in and expand
- Map automatically adjusts zoom level to show individual vehicles

### Mobile Considerations
- All display modes work on mobile devices
- Touch targets are optimized for finger taps
- Settings panel is accessible via bottom navigation bar
- Display mode and clustering settings sync between desktop and mobile views

## Performance Tips

- **Dots mode**: Fastest rendering, best for low-end devices
- **Emoji/Icons mode**: Good balance of visual appeal and performance
- **Heatmap mode**: More GPU-intensive, best for modern devices
- **Enable clustering**: Reduces visible elements at low zoom levels, improving performance
- **Disable clustering**: Shows all vehicles, may impact performance in dense areas

## Use Cases

- **Traffic Monitoring**: Use heatmap or direction arrows to identify congestion
- **Route Planning**: Use emoji/dots with clustering to see service coverage
- **Vehicle Tracking**: Use any mode with clustering disabled to track specific buses
- **Data Analysis**: Use heatmap to visualize speed and density patterns
- **Accessibility**: Use single character mode for minimal visual clutter

## Technical Details

- Display modes dynamically rebuild map layers without page reload
- All modes use the same vehicle data source for efficiency
- Speed calculations use GPS position history when GTFS-RT doesn't provide speed
- Color interpolation ensures smooth transitions between speed thresholds
- Clustering uses MapLibre GL native clustering for optimal performance
- Mode changes are instant and don't interrupt data updates
