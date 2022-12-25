import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  NearestFilter,
  sRGBEncoding,
} from "three";

export type TextureRange = {
  startU: number;
  endU: number;
  startV: number;
  endV: number;
};

/**
 * Parameters to create a new {@link TextureAtlas} instance.
 */
export type TextureAtlasParams = {
  /**
   * The number of block textures on each side of the this.
   */
  countPerSide: number;

  /**
   * The dimension of each block texture.
   */
  dimension: number;
};

/**
 * A texture atlas is a collection of textures that are packed into a single texture.
 * This is useful for reducing the number of draw calls required to render a scene, since
 * all block textures can be rendered with a single draw call.
 *
 * By default, the texture atlas creates an additional border around each texture to prevent
 * texture bleeding.
 *
 * ![Texture bleeding](/img/docs/texture-bleeding.png)
 *
 */
export class TextureAtlas {
  /**
   * The parameters used to create the texture this.
   */
  public params: TextureAtlasParams;

  /**
   * The THREE.JS canvas texture that has been generated.
   */
  public texture: CanvasTexture;

  /**
   * The canvas that is used to generate the texture this.
   */
  public canvas = document.createElement("canvas");

  /**
   * The margin between each block texture in the this.
   */
  public margin = 0;

  /**
   * The offset of each block's texture to the end of its border.
   */
  public offset = 0;

  /**
   * The ratio of the texture on the atlas to the original texture.
   */
  public ratio = 0;

  /**
   * Create a new texture this.
   *
   * @param textureMap A map that points a side name to a texture or color.
   * @param ranges The ranges on the texture atlas generated by the server.
   * @param params The parameters used to create the texture this.
   * @returns The texture atlas generated.
   */
  constructor(params: TextureAtlasParams) {
    this.params = params;

    const { countPerSide, dimension } = params;

    if (countPerSide === 1) {
      this.offset = 0;
      this.ratio = 1;
      this.margin = 0;
    } else {
      this.offset = 1 / (countPerSide * 4);

      this.margin = 1;
      this.ratio =
        (this.margin / this.offset / countPerSide - 2 * this.margin) /
        dimension;

      while (this.ratio !== Math.floor(this.ratio)) {
        this.ratio *= 2;
        this.margin *= 2;
      }
    }

    const canvasWidth =
      (dimension * this.ratio + this.margin * 2) * countPerSide;
    const canvasHeight =
      (dimension * this.ratio + this.margin * 2) * countPerSide;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    const context = this.canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    this.makeCanvasPowerOfTwo(this.canvas);
    this.texture = new CanvasTexture(this.canvas);
    this.texture.wrapS = ClampToEdgeWrapping;
    this.texture.wrapT = ClampToEdgeWrapping;
    this.texture.minFilter = NearestFilter;
    this.texture.magFilter = NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.premultiplyAlpha = false;
    this.texture.needsUpdate = true;
    this.texture.encoding = sRGBEncoding;
  }

  /**
   * Draw a texture to a range on the texture atlas.
   *
   * @param range The range on the texture atlas to draw the texture to.
   * @param image The texture to draw to the range.
   */
  drawImageToRange = (
    range: TextureRange,
    image: typeof Image | HTMLImageElement | Color,
    clearRect = true,
    opacity = 1.0
  ) => {
    const { startU, endV } = range;
    const { dimension } = this.params;

    const context = this.canvas.getContext("2d");

    context.save();

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    context.globalAlpha = opacity;

    if (opacity !== 1) context.globalCompositeOperation = "lighter";

    if (clearRect) {
      context.clearRect(
        (startU - this.offset) * canvasWidth,
        (1 - endV - this.offset) * canvasHeight,
        dimension * this.ratio + 2 * this.margin,
        dimension * this.ratio + 2 * this.margin
      );
    }

    if ((image as any as Color).isColor) {
      context.fillStyle = `#${(image as any).getHexString()}`;
      context.fillRect(
        (startU - this.offset) * canvasWidth,
        (1 - endV - this.offset) * canvasHeight,
        dimension * this.ratio + 2 * this.margin,
        dimension * this.ratio + 2 * this.margin
      );

      return;
    }

    const image2 = image as any as HTMLImageElement;

    // Draw a background first.

    if (clearRect) {
      context.drawImage(
        image2,
        (startU - this.offset) * canvasWidth,
        (1 - endV - this.offset) * canvasHeight,
        dimension * this.ratio + 2 * this.margin,
        dimension * this.ratio + 2 * this.margin
      );

      // Carve out the middle.
      context.clearRect(
        (startU - this.offset) * canvasWidth + this.margin,
        (1 - endV - this.offset) * canvasHeight + this.margin,
        dimension * this.ratio,
        dimension * this.ratio
      );
    }

    // Draw the actual texture.
    context.drawImage(
      image2,
      (startU - this.offset) * canvasWidth + this.margin,
      (1 - endV - this.offset) * canvasHeight + this.margin,
      dimension * this.ratio,
      dimension * this.ratio
    );

    context.restore();
  };

  private makeCanvasPowerOfTwo(canvas?: HTMLCanvasElement | undefined) {
    let setCanvas = false;
    if (!canvas) {
      canvas = this.canvas;
      setCanvas = true;
    }
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    const newWidth = Math.pow(2, Math.round(Math.log(oldWidth) / Math.log(2)));
    const newHeight = Math.pow(
      2,
      Math.round(Math.log(oldHeight) / Math.log(2))
    );
    const newCanvas = document.createElement("canvas");
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    newCanvas.getContext("2d")?.drawImage(canvas, 0, 0, newWidth, newHeight);
    if (setCanvas) {
      this.canvas = newCanvas;
    }
  }
}

export class AnimatedTexture {}