/**
 * Annotation Canvas for Visual Bug Reporter
 * Allows users to annotate screenshots with arrows, circles, text, etc.
 */

class AnnotationCanvas {
  constructor(screenshot) {
    this.screenshot = screenshot;
    this.canvas = null;
    this.ctx = null;
    this.currentTool = 'arrow';
    this.isDrawing = false;
    this.startPoint = null;
    this.annotations = [];
    this.currentAnnotation = null;
    this.currentColor = '#FF0000';
    this.currentLineWidth = 3;
    this.history = [];
    this.historyStep = -1;

    this.init();
  }

  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.loadImage();
  }

  createCanvas() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'mosqit-annotation-container';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 1000000;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    `;

    // Create toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'mosqit-annotation-toolbar';
    this.toolbar.innerHTML = `
      <div class="annotation-tools">
        <button class="anno-tool active" data-tool="arrow" title="Arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14m-7-7l7 7-7 7"/>
          </svg>
        </button>
        <button class="anno-tool" data-tool="rectangle" title="Rectangle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18"/>
          </svg>
        </button>
        <button class="anno-tool" data-tool="circle" title="Circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </button>
        <button class="anno-tool" data-tool="text" title="Text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
          </svg>
        </button>
        <button class="anno-tool" data-tool="highlight" title="Highlight">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8.5 4l8.5 8.5-3 3L5.5 7z"/>
            <path d="M20 9l-1-1m-5 5l1 1"/>
          </svg>
        </button>
        <button class="anno-tool" data-tool="blur" title="Blur Sensitive Info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="12" r="8" stroke-dasharray="2,2"/>
          </svg>
        </button>
        <div class="anno-separator"></div>
        <input type="color" class="anno-color" value="#FF0000" title="Color">
        <select class="anno-width" title="Line Width">
          <option value="2">Thin</option>
          <option value="3" selected>Medium</option>
          <option value="5">Thick</option>
          <option value="8">Extra Thick</option>
        </select>
        <div class="anno-separator"></div>
        <button class="anno-action" data-action="undo" title="Undo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 7h10l4-4m0 0l-4 4m4-4v12a2 2 0 01-2 2H5"/>
          </svg>
        </button>
        <button class="anno-action" data-action="clear" title="Clear All">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 6l12 12M6 18L18 6"/>
          </svg>
        </button>
        <button class="anno-action" data-action="save" title="Save">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        </button>
      </div>
    `;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'mosqit-annotation-canvas';
    this.canvas.style.cssText = `
      cursor: crosshair;
      max-width: 100%;
      max-height: calc(90vh - 60px);
      display: block;
    `;

    this.ctx = this.canvas.getContext('2d');

    // Append elements
    this.container.appendChild(this.toolbar);
    this.container.appendChild(this.canvas);
    document.body.appendChild(this.container);

    // Add styles
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .mosqit-annotation-toolbar {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f8f8;
        border-radius: 12px 12px 0 0;
      }

      .annotation-tools {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .anno-tool, .anno-action {
        width: 36px;
        height: 36px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        color: #666;
      }

      .anno-tool:hover, .anno-action:hover {
        background: #f0f0f0;
        border-color: #999;
        color: #333;
      }

      .anno-tool.active {
        background: #FF6B6B;
        border-color: #FF6B6B;
        color: white;
      }

      .anno-separator {
        width: 1px;
        height: 30px;
        background: #ddd;
        margin: 0 4px;
      }

      .anno-color {
        width: 36px;
        height: 36px;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
      }

      .anno-width {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        cursor: pointer;
      }

      .mosqit-text-annotation {
        position: absolute;
        background: #FFE4B5;
        border: 2px solid #FF8C00;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        font-family: -apple-system, system-ui, sans-serif;
        min-width: 100px;
        cursor: move;
        user-select: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .mosqit-text-annotation:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Tool selection
    this.toolbar.querySelectorAll('.anno-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTool(btn.dataset.tool);
      });
    });

    // Actions
    this.toolbar.querySelectorAll('.anno-action').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleAction(btn.dataset.action);
      });
    });

    // Color picker
    this.toolbar.querySelector('.anno-color').addEventListener('change', (e) => {
      this.currentColor = e.target.value;
    });

    // Line width
    this.toolbar.querySelector('.anno-width').addEventListener('change', (e) => {
      this.currentLineWidth = parseInt(e.target.value);
    });

    // Canvas drawing
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard.bind(this));

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  selectTool(tool) {
    this.currentTool = tool;

    // Update UI
    this.toolbar.querySelectorAll('.anno-tool').forEach(btn => {
      btn.classList.remove('active');
    });
    this.toolbar.querySelector(`[data-tool="${tool}"]`).classList.add('active');

    // Update cursor
    if (tool === 'text') {
      this.canvas.style.cursor = 'text';
    } else if (tool === 'blur') {
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'crosshair';
    }
  }

  handleAction(action) {
    switch (action) {
      case 'undo':
        this.undo();
        break;
      case 'clear':
        this.clearCanvas();
        break;
      case 'save':
        this.save();
        break;
    }
  }

  loadImage() {
    const img = new Image();
    img.onload = () => {
      // Set canvas size
      this.canvas.width = img.width;
      this.canvas.height = img.height;

      // Draw image
      this.ctx.drawImage(img, 0, 0);

      // Save initial state
      this.saveHistory();
    };
    img.src = this.screenshot;
  }

  startDrawing(e) {
    if (this.currentTool === 'text') {
      this.addTextAnnotation(e);
      return;
    }

    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startPoint = {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };

    if (this.currentTool === 'blur') {
      this.applyBlur(this.startPoint);
    }
  }

  draw(e) {
    if (!this.isDrawing) return;
    if (this.currentTool === 'blur' || this.currentTool === 'text') return;

    const rect = this.canvas.getBoundingClientRect();
    const currentPoint = {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };

    // Redraw canvas with saved state
    this.redrawCanvas();

    // Draw current annotation
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentLineWidth;
    this.ctx.lineCap = 'round';

    switch (this.currentTool) {
      case 'arrow':
        this.drawArrow(this.startPoint, currentPoint);
        break;
      case 'rectangle':
        this.drawRectangle(this.startPoint, currentPoint);
        break;
      case 'circle':
        this.drawCircle(this.startPoint, currentPoint);
        break;
      case 'highlight':
        this.drawHighlight(this.startPoint, currentPoint);
        break;
    }
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    // Save to history
    this.saveHistory();
  }

  drawArrow(from, to) {
    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();

    // Draw arrowhead
    this.ctx.beginPath();
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  drawRectangle(start, end) {
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.beginPath();
    this.ctx.rect(
      start.x,
      start.y,
      end.x - start.x,
      end.y - start.y
    );
    this.ctx.stroke();
  }

  drawCircle(start, end) {
    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.beginPath();
    this.ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawHighlight(start, end) {
    this.ctx.fillStyle = this.currentColor + '33'; // Add transparency
    this.ctx.fillRect(
      start.x,
      start.y,
      end.x - start.x,
      end.y - start.y
    );
  }

  applyBlur(point) {
    const size = 40;
    const imageData = this.ctx.getImageData(
      point.x - size / 2,
      point.y - size / 2,
      size,
      size
    );

    // Simple pixelation for blur effect
    const pixelSize = 8;
    for (let y = 0; y < size; y += pixelSize) {
      for (let x = 0; x < size; x += pixelSize) {
        const index = (y * size + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];

        // Apply to block
        for (let dy = 0; dy < pixelSize && y + dy < size; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < size; dx++) {
            const idx = ((y + dy) * size + (x + dx)) * 4;
            imageData.data[idx] = r;
            imageData.data[idx + 1] = g;
            imageData.data[idx + 2] = b;
          }
        }
      }
    }

    this.ctx.putImageData(imageData, point.x - size / 2, point.y - size / 2);
    this.saveHistory();
  }

  addTextAnnotation(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const textBox = document.createElement('div');
    textBox.className = 'mosqit-text-annotation';
    textBox.contentEditable = true;
    textBox.style.left = (x + rect.left) + 'px';
    textBox.style.top = (y + rect.top) + 'px';
    textBox.style.color = this.currentColor;
    textBox.innerText = 'Add comment...';

    document.body.appendChild(textBox);

    // Focus and select text
    textBox.focus();
    const range = document.createRange();
    range.selectNodeContents(textBox);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Save text on blur
    textBox.addEventListener('blur', () => {
      const text = textBox.innerText.trim();
      if (text && text !== 'Add comment...') {
        // Draw text on canvas
        const canvasX = (x) * (this.canvas.width / rect.width);
        const canvasY = (y) * (this.canvas.height / rect.height);

        this.ctx.fillStyle = this.currentColor;
        this.ctx.font = '16px -apple-system, system-ui, sans-serif';
        this.ctx.fillText(text, canvasX, canvasY);

        this.saveHistory();
      }
      textBox.remove();
    });
  }

  redrawCanvas() {
    if (this.history.length > 0 && this.historyStep >= 0) {
      const imageData = this.history[this.historyStep];
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  saveHistory() {
    this.historyStep++;
    if (this.historyStep < this.history.length) {
      this.history.length = this.historyStep;
    }
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.redrawCanvas();
    }
  }

  clearCanvas() {
    if (confirm('Clear all annotations?')) {
      this.loadImage();
      this.history = [];
      this.historyStep = -1;
    }
  }

  save() {
    // Convert canvas to blob
    this.canvas.toBlob((blob) => {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const annotatedScreenshot = reader.result;

        // Send annotated screenshot back
        if (this.onSave) {
          this.onSave(annotatedScreenshot);
        }

        this.close();
      };
      reader.readAsDataURL(blob);
    }, 'image/png');
  }

  close() {
    this.container.remove();
    document.removeEventListener('keydown', this.handleKeyboard);
  }

  handleKeyboard(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        this.undo();
      } else if (e.key === 's') {
        e.preventDefault();
        this.save();
      }
    }
  }
}

// Export for use
window.AnnotationCanvas = AnnotationCanvas;