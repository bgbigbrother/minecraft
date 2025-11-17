/**
 * ToolbarUI - Manages the visual display of inventory items in the toolbar
 * 
 * Displays up to 8 collected items with icons and quantities.
 * Updates automatically when inventory changes.
 */
export class ToolbarUI {
  /**
   * Create a new ToolbarUI instance
   * @param {InventoryManager} inventoryManager - Reference to the inventory manager
   */
  constructor(inventoryManager) {
    // Store reference to inventory manager
    this.inventoryManager = inventoryManager;
    
    // Maximum number of item slots to display (excluding pickaxe at toolbar-0)
    this.maxSlots = 8;
    
    // Empty slot placeholder texture
    this.emptySlotTexture = 'textures/empty_slot.png';
    
    // Reference to the toolbar container DOM element
    this.toolbarContainer = document.getElementById('toolbar');
    
    if (!this.toolbarContainer) {
      console.warn('Toolbar container not found in DOM');
    }
    
    // Map of block IDs to texture paths for icon display
    this.blockIconMap = this.createIconMap();
    
    // Reference to player (set externally) for updating activeBlockId
    this.player = null;
    
    // Cache of current slot contents [blockId, quantity] indexed by slot number (1-8)
    this.slotContents = new Map();
    
    // Currently selected toolbar slot (0 = pickaxe, 1-8 = inventory slots)
    // Default to 0 (pickaxe) as it's the starting tool
    this.selectedSlot = 0;
  }

  /**
   * Create a mapping of block IDs to their texture file paths
   * For blocks with multiple textures, uses the top texture
   * @returns {Map<number, string>} Map of blockId to texture path
   */
  createIconMap() {
    const iconMap = new Map();
    
    // Map each block ID to its corresponding texture path
    // Paths are relative to the public directory (served by Vite)
    iconMap.set(1, 'textures/grass.png');              // grass (top texture)
    iconMap.set(2, 'textures/dirt.png');               // dirt
    iconMap.set(3, 'textures/stone.png');              // stone
    iconMap.set(4, 'textures/coal_ore.png');           // coal ore
    iconMap.set(5, 'textures/iron_ore.png');           // iron ore
    iconMap.set(6, 'textures/tree_top.png');           // tree (top texture)
    iconMap.set(7, 'textures/leaves.png');             // leaves
    iconMap.set(8, 'textures/sand.png');               // sand
    iconMap.set(9, 'textures/grass.png');              // cloud (using grass as placeholder since cloud has no texture file)
    iconMap.set(10, 'textures/snow.png');              // snow (top texture)
    iconMap.set(11, 'textures/jungle_tree_top.png');   // jungle tree (top texture)
    iconMap.set(12, 'textures/jungle_leaves.png');     // jungle leaves
    iconMap.set(13, 'textures/cactus_top.png');        // cactus (top texture)
    iconMap.set(14, 'textures/grass.png');             // jungle grass (uses grass texture with color tint)
    iconMap.set(15, 'textures/stone.png');             // water (using stone as placeholder - will be tinted blue)
    
    return iconMap;
  }

  /**
   * Update the toolbar display to reflect current inventory state
   * Shows up to 8 items with icons and quantities
   * Requirements: 7.1, 7.2, 7.3, 7.5, 8.3, 8.4, 8.5
   */
  render() {
    if (!this.toolbarContainer) {
      console.warn('Cannot render toolbar: container not found');
      return;
    }

    // Get all items from inventory as array of [blockId, quantity] pairs
    const inventoryItems = Array.from(this.inventoryManager.items.entries());
    
    // Filter out items with zero quantity (edge case: last item placed)
    const validItems = inventoryItems.filter(([blockId, quantity]) => quantity > 0);
    
    // Take only the first 8 items (toolbar slot limit)
    // If inventory has more than 8 items, extras are hidden
    const displayItems = validItems.slice(0, this.maxSlots);
    
    // Track if the currently selected slot changed its contents
    let selectedSlotChanged = false;
    
    // Update each toolbar slot (1-8)
    for (let i = 0; i < this.maxSlots; i++) {
      const slotIndex = i + 1; // Slots are numbered 1-8
      
      if (i < displayItems.length) {
        // We have an item for this slot
        const [blockId, quantity] = displayItems[i];
        
        // Check if this is the currently selected slot and its contents changed
        if (slotIndex === this.selectedSlot) {
          const previousContent = this.slotContents.get(slotIndex);
          if (previousContent && previousContent[0] !== blockId) {
            selectedSlotChanged = true;
          }
        }
        
        this.updateSlot(slotIndex, blockId, quantity);
        this.slotContents.set(slotIndex, [blockId, quantity]);
      } else {
        // No item for this slot, clear it (displays empty slot)
        
        // Check if this is the currently selected slot and it became empty
        if (slotIndex === this.selectedSlot && this.slotContents.has(slotIndex)) {
          selectedSlotChanged = true;
        }
        
        this.updateSlot(slotIndex, null, 0);
        this.slotContents.delete(slotIndex);
      }
    }
    
    // If the selected slot's contents changed, update player's activeBlockId
    if (selectedSlotChanged && this.player && this.selectedSlot > 0) {
      const newContent = this.slotContents.get(this.selectedSlot);
      if (newContent) {
        // Update to the new block ID in this slot
        this.player.activeBlockId = newContent[0];
      } else {
        // Slot is now empty, switch to pickaxe
        this.setSelectedSlot(0);
      }
    }
    
    // Ensure toolbar-0 (pickaxe) is never affected by inventory rendering
    // This is handled by only updating slots 1-8, never touching slot 0
  }

  /**
   * Update a single toolbar slot with item data
   * Requirements: 7.4, 8.1, 8.3, 9.2
   * 
   * @param {number} slotIndex - Slot number (1-8)
   * @param {number|null} blockId - Block type ID or null for empty slot
   * @param {number} quantity - Item quantity
   */
  updateSlot(slotIndex, blockId, quantity) {
    // Ensure we never modify toolbar-0 (pickaxe slot)
    if (slotIndex === 0) {
      console.warn('Attempted to modify toolbar-0 (pickaxe slot) - operation blocked');
      return;
    }
    
    // Get the toolbar slot element
    const slotElement = document.getElementById(`toolbar-${slotIndex}`);
    
    if (!slotElement) {
      console.warn(`Toolbar slot ${slotIndex} not found`);
      return;
    }

    // Handle empty slots or zero quantity (e.g., when last item is placed)
    if (blockId === null || quantity === 0 || quantity < 0) {
      // Clear the slot - set to empty slot placeholder texture
      slotElement.src = this.emptySlotTexture;
      slotElement.style.opacity = '0.5';
      slotElement.style.filter = 'none'; // Clear any color filters
      
      // Remove any existing quantity overlay
      const existingOverlay = slotElement.parentElement.querySelector(`#quantity-${slotIndex}`);
      if (existingOverlay) {
        existingOverlay.remove();
      }
    } else {
      // Set the icon texture
      const texturePath = this.blockIconMap.get(blockId);
      if (texturePath) {
        slotElement.src = texturePath;
        slotElement.style.opacity = '1';
        
        // Apply blue tint for water block (ID 15)
        if (blockId === 15) {
          slotElement.style.filter = 'sepia(100%) saturate(300%) brightness(70%) hue-rotate(180deg)';
        } else {
          slotElement.style.filter = 'none';
        }
      } else {
        console.warn(`No texture mapping found for block ID ${blockId}`);
        slotElement.src = '';
        slotElement.style.opacity = '0.3';
        return; // Don't show quantity if we can't show the icon
      }
      
      // Create or update quantity overlay
      let quantityOverlay = slotElement.parentElement.querySelector(`#quantity-${slotIndex}`);
      
      if (!quantityOverlay) {
        // Create new overlay element
        quantityOverlay = document.createElement('span');
        quantityOverlay.id = `quantity-${slotIndex}`;
        quantityOverlay.className = 'toolbar-quantity';
        
        // Insert overlay relative to the slot
        // We need to wrap the img in a positioned container if not already
        const parent = slotElement.parentElement;
        if (parent.id === 'toolbar') {
          // Need to wrap the img element with toolbar-slot class for positioning
          const wrapper = document.createElement('div');
          wrapper.className = 'toolbar-slot';
          parent.insertBefore(wrapper, slotElement);
          wrapper.appendChild(slotElement);
          wrapper.appendChild(quantityOverlay);
        } else {
          // Already wrapped
          parent.appendChild(quantityOverlay);
        }
      }
      
      // Update quantity text
      quantityOverlay.textContent = quantity.toString();
    }
  }

  /**
   * Clear all toolbar item slots (1-8)
   * Keeps toolbar-0 (pickaxe) unchanged
   * Requirements: 8.3, 8.4, 8.5
   */
  clearToolbar() {
    // Iterate through toolbar slots 1-8 only
    // Explicitly skip toolbar-0 (pickaxe) to ensure it's never affected
    for (let i = 1; i <= this.maxSlots; i++) {
      const slotElement = document.getElementById(`toolbar-${i}`);
      
      if (slotElement) {
        // Reset to empty slot placeholder texture
        slotElement.src = this.emptySlotTexture;
        slotElement.style.opacity = '0.5';
        
        // Remove quantity overlay if it exists
        const quantityOverlay = slotElement.parentElement.querySelector(`#quantity-${i}`);
        if (quantityOverlay) {
          quantityOverlay.remove();
        }
      }
    }
    
    // toolbar-0 (pickaxe) is intentionally left unchanged
    // Verify pickaxe slot is still intact
    const pickaxeSlot = document.getElementById('toolbar-0');
    if (pickaxeSlot && pickaxeSlot.src && !pickaxeSlot.src.includes('pickaxe.png')) {
      console.warn('Pickaxe slot (toolbar-0) may have been modified - restoring');
      pickaxeSlot.src = 'textures/pickaxe.png';
      pickaxeSlot.style.opacity = '1';
    }
  }

  /**
   * Update the selected toolbar slot
   * Requirements: 10.7
   * 
   * @param {number} index - Slot index (0-8, where 0 is pickaxe)
   */
  setSelectedSlot(index) {
    // Validate slot index
    if (index < 0 || index > 8) {
      console.warn(`Invalid slot index: ${index}. Must be 0-8.`);
      return;
    }
    
    // Remove selection from current slot
    const currentSlotElement = document.getElementById(`toolbar-${this.selectedSlot}`);
    if (currentSlotElement) {
      currentSlotElement.classList.remove('selected');
    }
    
    // Update selected slot
    this.selectedSlot = index;
    
    // Add selection to new slot
    const newSlotElement = document.getElementById(`toolbar-${index}`);
    if (newSlotElement) {
      newSlotElement.classList.add('selected');
    }
    
    // Update player's activeBlockId if player reference exists
    if (this.player) {
      if (index === 0) {
        // Pickaxe selected
        this.player.activeBlockId = 0;
        this.player.tool.container.visible = true;
      } else {
        // Inventory slot selected
        const blockId = this.getSelectedBlockId();
        if (blockId !== null) {
          this.player.activeBlockId = blockId;
          this.player.tool.container.visible = false;
        } else {
          // Empty slot, switch back to pickaxe
          this.player.activeBlockId = 0;
          this.player.tool.container.visible = true;
        }
      }
    }
  }

  /**
   * Get the block ID of the currently selected toolbar slot
   * Requirements: 10.7
   * 
   * @returns {number|null} Block ID of selected slot, or null if empty/pickaxe
   */
  getSelectedBlockId() {
    // Slot 0 (pickaxe) always returns null
    if (this.selectedSlot === 0) {
      return null;
    }
    
    // Get the block ID from the slot contents cache
    const slotContent = this.slotContents.get(this.selectedSlot);
    
    // Return block ID if slot has content, otherwise null
    return slotContent ? slotContent[0] : null;
  }
}
