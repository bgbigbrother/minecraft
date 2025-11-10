# Minecraft.js 🎮

A fully functional Minecraft clone built entirely in the browser using Three.js and modern web technologies. This project serves as an educational resource for developers learning 3D web development, voxel-based game programming, and procedural generation techniques.

![Minecraft.js](https://img.shields.io/badge/Three.js-v0.156.1-blue)
![Vite](https://img.shields.io/badge/Vite-v4.4.5-646CFF)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Overview

Minecraft.js is a browser-based voxel game that recreates the core mechanics of Minecraft without relying on advanced graphics techniques or custom shaders. The project demonstrates fundamental game development concepts including:

- **Procedural World Generation** - Infinite terrain with multiple biomes
- **Chunk-Based Rendering** - Optimized performance through spatial partitioning
- **Voxel Physics** - Collision detection and player movement
- **Block Manipulation** - Place and destroy blocks in real-time
- **Resource System** - Ore generation and resource gathering
- **Persistence** - Save and load world state
- **WebRTC Networking** - Multiplayer capabilities (in development)

## ✨ Features

### World Generation
- **Procedural Terrain** - Dynamically generated landscapes using noise algorithms
- **Multiple Biomes** - Varied environments including forests, deserts, and snowy regions
- **Natural Structures** - Trees, cacti, and vegetation
- **Resource Distribution** - Coal and iron ore generation
- **Cloud System** - Animated sky elements
- **Water Bodies** - Lakes and water features

### Gameplay Mechanics
- **First-Person Controls** - Smooth WASD movement with mouse look
- **Block Placement/Destruction** - Full terraforming capabilities
- **Tool System** - Pickaxe for mining blocks
- **Inventory Hotbar** - Quick access to 8 different block types
- **Sprint & Jump** - Enhanced movement options
- **Collision Detection** - Realistic physics interactions

### Technical Features
- **Chunk Management** - Dynamic loading/unloading based on player position
- **Performance Optimization** - Instanced rendering for efficient GPU usage
- **Save/Load System** - Persistent world storage using browser storage
- **Debug Tools** - Performance monitoring and debug camera
- **Responsive Design** - Adapts to different screen sizes

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- Modern web browser with WebGL support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/bgbigbrother/minecraft
cd minecraft
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🎮 Controls

### Movement
- **W/A/S/D** - Move forward/left/backward/right
- **SPACE** - Jump
- **SHIFT** - Sprint (faster movement)
- **Mouse** - Look around

### Interaction
- **Left Click** - Destroy block
- **Right Click** - Place block
- **0** - Select pickaxe (mining tool)
- **1-8** - Select block type from hotbar
- **Mouse Wheel** - Cycle through hotbar items

### System
- **R** - Reset camera position
- **U** - Toggle UI visibility
- **F1** - Save game
- **F2** - Load game
- **F10** - Toggle debug camera
- **ESC** - Release pointer lock

### Getting Started
Press any key on the start screen to begin playing!

## 📁 Project Structure

```
minecraft-test-2/
├── public/                    # Static assets
│   ├── assets/               # Audio files
│   │   └── theme.mp3
│   ├── fonts/                # Custom fonts
│   │   └── Minecraft.ttf
│   ├── models/               # 3D models (GLB format)
│   │   ├── cow.glb
│   │   └── pickaxe.glb
│   └── textures/             # Block textures (PNG)
│       ├── grass.png
│       ├── dirt.png
│       ├── stone.png
│       └── ...
│
├── scripts/                   # Source code
│   ├── main.js               # Application entry point
│   │
│   ├── core/                 # Core engine systems
│   │   ├── scene.js          # Three.js scene setup
│   │   ├── renderer.js       # WebGL renderer
│   │   ├── camera.js         # Camera configuration
│   │   ├── lights.js         # Lighting setup
│   │   ├── animation.js      # Main render loop
│   │   ├── controls.js       # Input handling
│   │   ├── network.js        # WebRTC networking
│   │   └── stats.js          # Performance monitoring
│   │
│   ├── world/                # World generation & management
│   │   ├── world.js          # Main world class
│   │   ├── chunk.js          # Chunk generation
│   │   ├── base.js           # Base world functionality
│   │   ├── edit_chunk.js     # Block editing
│   │   └── store_world.js    # Save/load system
│   │
│   ├── player/               # Player systems
│   │   ├── player.js         # Main player class
│   │   ├── controls.js       # Player input
│   │   ├── tool.js           # Tool/item system
│   │   └── body/
│   │       └── simple.js     # Player body representation
│   │
│   ├── textures/             # Block & texture systems
│   │   ├── blocks.js         # Block type definitions
│   │   ├── texture_loader.js # Texture loading
│   │   └── blocks/           # Individual block configs
│   │
│   ├── biome/                # Biome generation
│   │   ├── terrain.js        # Terrain generation
│   │   ├── trees.js          # Tree generation
│   │   ├── water.js          # Water system
│   │   └── clouds.js         # Cloud rendering
│   │
│   ├── physics/              # Physics simulation
│   │   └── physics.js        # Collision & movement
│   │
│   ├── mobs/                 # Entity system
│   │   └── model_loader.js   # 3D model loading
│   │
│   ├── libraries/            # Utility libraries
│   │   └── rng.js            # Random number generation
│   │
│   └── ui/                   # User interface
│       └── ...               # UI components
│
├── index.html                # HTML entry point
├── style.css                 # Global styles
├── vite.config.js            # Vite configuration
└── package.json              # Project dependencies
```

## 🏗️ Architecture

### Core Systems

#### World Generation
The world is divided into chunks (16x16x32 blocks) that are generated procedurally using noise algorithms. Each chunk contains:
- Terrain data (block types and positions)
- Biome information
- Resource distribution
- Mesh geometry for rendering

```javascript
// Example: World generation flow
World → Chunks → Biomes → Terrain → Resources → Meshes
```

#### Chunk Management
Chunks are dynamically loaded and unloaded based on the player's position to maintain performance:
- **Draw Distance**: Configurable radius around player
- **Lazy Loading**: Chunks generate only when needed
- **Memory Management**: Unused chunks are disposed properly
- **Instanced Rendering**: Multiple blocks share geometry for efficiency

#### Player System
The player system handles:
- Camera positioning and rotation
- Movement physics (walking, sprinting, jumping)
- Collision detection with world geometry
- Tool/item management
- Raycasting for block interaction

#### Block System
Each block type is defined with:
- Texture mapping (top, bottom, sides)
- Physical properties (solid, transparent)
- Rendering behavior
- Interaction rules

### Performance Optimizations

1. **Instanced Rendering** - Reduces draw calls by batching similar blocks
2. **Frustum Culling** - Only renders visible chunks
3. **Chunk Pooling** - Reuses chunk objects to reduce garbage collection
4. **Texture Atlasing** - Combines textures to minimize state changes
5. **LOD System** - (Planned) Level of detail for distant chunks

## 🛠️ Technology Stack

### Core Technologies
- **[Three.js](https://threejs.org/)** (v0.156.1) - 3D graphics library built on WebGL
- **[Vite](https://vitejs.dev/)** (v4.4.5) - Next-generation frontend build tool
- **ES6 Modules** - Modern JavaScript module system
- **WebRTC** - Peer-to-peer networking (in development)

### Development Tools
- **Hot Module Replacement** - Instant updates during development
- **Source Maps** - Enabled for debugging
- **Performance Monitoring** - Built-in stats display

### Browser Requirements
- WebGL 2.0 support
- ES6+ JavaScript support
- Pointer Lock API
- Local Storage API

## 🎨 Block Types

Currently implemented blocks:

| Block | Description | Texture |
|-------|-------------|---------|
| Grass | Surface block with grass texture | `grass.png`, `grass_side.png`, `dirt.png` |
| Dirt | Basic earth block | `dirt.png` |
| Stone | Hard rock block | `stone.png` |
| Coal Ore | Mineable resource | `coal_ore.png` |
| Iron Ore | Mineable resource | `iron_ore.png` |
| Wood | Tree trunk | `tree_side.png`, `tree_top.png` |
| Leaves | Tree foliage | `leaves.png` |
| Sand | Desert/beach block | `sand.png` |
| Snow | Cold biome surface | `snow.png`, `snow_side.png` |
| Cactus | Desert plant | `cactus_side.png`, `cactus_top.png` |
| Jungle Wood | Tropical tree | `jungle_tree_side.png`, `jungle_tree_top.png` |
| Jungle Leaves | Tropical foliage | `jungle_leaves.png` |

## 🔧 Configuration

### World Settings
Modify world generation parameters in `scripts/world/base.js`:

```javascript
// Chunk dimensions
chunkWidth = 16;
chunkHeight = 32;

// Render distance (in chunks)
drawDistance = 3;

// Terrain generation
terrainScale = 30;
terrainMagnitude = 0.5;
```

### Performance Tuning
Adjust rendering settings in `scripts/core/renderer.js`:

```javascript
// Anti-aliasing
antialias: true

// Pixel ratio (lower = better performance)
renderer.setPixelRatio(window.devicePixelRatio);
```

## 🚧 Roadmap

### Planned Features
- [ ] **Inventory System** - Full inventory management
- [ ] **Crafting System** - Recipe-based item creation
- [ ] **Mob System** - NPCs and animals
- [ ] **Day/Night Cycle** - Dynamic lighting
- [ ] **Weather System** - Rain and snow effects
- [ ] **Multiplayer** - WebRTC-based networking
- [ ] **Sound Effects** - Block placement/destruction audio
- [ ] **Particle Effects** - Visual feedback for actions
- [ ] **Advanced Biomes** - More varied terrain types
- [ ] **Structure Generation** - Villages, dungeons, etc.

### Known Issues
- Performance may degrade with very large render distances
- Some edge cases in chunk boundary collision detection
- Mobile device support is limited

## 🤝 Contributing

Contributions are welcome! This is an educational project, so improvements to code clarity and documentation are especially appreciated.

### Development Guidelines
1. Follow ES6 module syntax
2. Use camelCase for variables and functions
3. Use PascalCase for class names
4. Comment complex algorithms
5. Dispose Three.js objects properly to prevent memory leaks
6. Test changes across different browsers

### Submitting Changes
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Learning Resources

### Three.js
- [Official Documentation](https://threejs.org/docs/)
- [Three.js Fundamentals](https://threejs.org/manual/)
- [Three.js Examples](https://threejs.org/examples/)

### Voxel Game Development
- [Voxel Engine Basics](https://0fps.net/2012/06/30/meshing-in-a-minecraft-game/)
- [Procedural Generation](https://www.redblobgames.com/maps/terrain-from-noise/)
- [Chunk Management](https://tomcc.github.io/2014/08/31/visibility-1.html)

### WebGL & Graphics
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Learn OpenGL](https://learnopengl.com/) (concepts apply to WebGL)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Minecraft](https://www.minecraft.net/) by Mojang Studios
- Built with [Three.js](https://threejs.org/) by Ricardo Cabello (mrdoob)
- Minecraft font from [Minecraft Font](https://www.dafont.com/minecraft.font)
- Educational resources from the Three.js and game development communities

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the code comments for implementation details

---

**Note**: This is an educational project and is not affiliated with or endorsed by Mojang Studios or Microsoft. Minecraft is a trademark of Mojang Studios.

Happy coding! 🎮✨
