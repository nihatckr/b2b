import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';

interface ComfyUIWorkflow {
  prompt: {
    [key: string]: {
      inputs: Record<string, any>;
      class_type: string;
    };
  };
}

/**
 * ComfyUI ile numune tasarımı için workflow
 */
export class ComfyUIService {
  /**
   * Upload image to ComfyUI
   */
  static async uploadImage(imagePath: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      formData.append('overwrite', 'true');

      const response = await axios.post(`${COMFYUI_URL}/upload/image`, formData, {
        headers: formData.getHeaders(),
      });

      return response.data.name;
    } catch (error) {
      console.error('Error uploading image to ComfyUI:', error);
      throw new Error('Failed to upload image to ComfyUI');
    }
  }

  /**
   * Load workflow from JSON file
   */
  static loadWorkflow(workflowName: string = 'protext_flow_design'): any {
    try {
      const workflowPath = path.join(__dirname, '../workflows', `${workflowName}.json`);
      const workflowData = fs.readFileSync(workflowPath, 'utf-8');
      return JSON.parse(workflowData);
    } catch (error) {
      console.error(`Error loading workflow ${workflowName}:`, error);
      throw new Error(`Failed to load workflow: ${workflowName}`);
    }
  }

  /**
   * Convert ComfyUI workflow (UI format) to API format
   */
  static convertWorkflowToAPI(workflow: any): any {
    if (workflow.prompt) {
      // Already in API format
      return workflow;
    }

    // List of node types that are UI-only and should be excluded from execution
    const excludedNodeTypes = [
      'MarkdownNote',
      'Note',
      'Reroute',
      'PrimitiveNode'
    ];

    // Convert from UI format (nodes array) to API format (prompt object)
    const apiWorkflow: any = {};

    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      workflow.nodes.forEach((node: any) => {
        // Skip UI-only nodes
        if (excludedNodeTypes.includes(node.type)) {
          console.log(`⏭️ Skipping UI-only node: ${node.type} (ID: ${node.id})`);
          return;
        }

        // Build inputs object from node inputs
        const inputs: any = {};

        // First, add all linked inputs
        if (node.inputs && Array.isArray(node.inputs)) {
          node.inputs.forEach((input: any) => {
            if (input.link !== null && input.link !== undefined) {
              // Find the source node for this link
              const link = workflow.links?.find((l: any) => l[0] === input.link);
              if (link) {
                const [linkId, sourceNodeId, sourceSlot] = link;
                inputs[input.name] = [String(sourceNodeId), sourceSlot];
              }
            }
          });
        }

        // Then, add widget values
        // In ComfyUI, widgets_values array directly corresponds to inputs that have a widget property
        // The order in widgets_values matches the order of widget inputs (not all inputs)
        if (node.widgets_values && Array.isArray(node.widgets_values) && node.inputs && Array.isArray(node.inputs)) {
          // Get only the widget inputs (those with widget property), preserving their order
          const widgetInputs = node.inputs.filter((input: any) => input.widget);

          // Map widgets_values to widget inputs by index
          widgetInputs.forEach((input: any, index: number) => {
            if (index < node.widgets_values.length) {
              // Skip if this widget input also has a link (rare case)
              if (input.link === null || input.link === undefined) {
                inputs[input.name] = node.widgets_values[index];
              }
            }
          });
        }        apiWorkflow[String(node.id)] = {
          inputs,
          class_type: node.type
        };
      });
    }

    return { prompt: apiWorkflow };
  }

  /**
   * Create a sample design workflow with ControlNet
   * You can override this by putting your ComfyUI workflow JSON in server/src/workflows/protext_flow_design.json
   */
  static createSampleDesignWorkflow(
    sketchImageName: string,
    prompt: string,
    negativePrompt: string = 'low quality, blurry, distorted',
    width: number = 512,
    height: number = 512,
    steps: number = 20,
    cfgScale: number = 7.5
  ): ComfyUIWorkflow {
    // Try to load custom workflow first
    try {
      const customWorkflow = this.loadWorkflow('protext_flow_design');

      // Convert UI format to API format if needed
      let apiWorkflow = this.convertWorkflowToAPI(customWorkflow);

      // Update workflow with dynamic parameters
      if (apiWorkflow && apiWorkflow.prompt) {
        // Find and update nodes based on your specific workflow
        Object.keys(apiWorkflow.prompt).forEach((nodeId) => {
          const node = apiWorkflow.prompt[nodeId];

          // Node 6: Positive prompt (CLIPTextEncode)
          if (nodeId === '6' && node.class_type === 'CLIPTextEncode') {
            node.inputs.text = prompt;
          }

          // Node 7: Negative prompt (CLIPTextEncode)
          if (nodeId === '7' && node.class_type === 'CLIPTextEncode') {
            node.inputs.text = negativePrompt;
          }

          // Node 11: LoadImage - sketch/reference image
          if (nodeId === '11' && node.class_type === 'LoadImage') {
            node.inputs.image = sketchImageName;
          }

          // Node 5: EmptyLatentImage - dimensions
          if (nodeId === '5' && node.class_type === 'EmptyLatentImage') {
            node.inputs.width = width;
            node.inputs.height = height;
          }

          // Node 3: KSampler - sampling settings
          if (nodeId === '3' && node.class_type === 'KSampler') {
            // Override with our parameters
            node.inputs.seed = Math.floor(Math.random() * 1000000);
            node.inputs.steps = steps;
            node.inputs.cfg = cfgScale;
            node.inputs.sampler_name = 'euler';
            node.inputs.scheduler = 'normal';
            node.inputs.denoise = 1.0;
          }

          // Node 32: ControlNetApplyAdvanced - ensure required inputs
          if (nodeId === '32' && node.class_type === 'ControlNetApplyAdvanced') {
            if (!node.inputs.strength) node.inputs.strength = 1.0;
            if (!node.inputs.start_percent) node.inputs.start_percent = 0.0;
            if (!node.inputs.end_percent) node.inputs.end_percent = 1.0;
          }

          // Node 9: SaveImage - ensure proper output filename
          if (nodeId === '9' && node.class_type === 'SaveImage') {
            node.inputs.filename_prefix = 'sample_design';
          }
        });

        console.log('✅ Using custom workflow: protext_flow_design');
        console.log('📋 Workflow nodes:', Object.keys(apiWorkflow.prompt).length);

        // Debug log for Node 3
        if (apiWorkflow.prompt['3']) {
          console.log('🔍 Node 3 (KSampler) inputs:', JSON.stringify(apiWorkflow.prompt['3'].inputs, null, 2));
        }

        return apiWorkflow;
      }
    } catch (error) {
      console.log('⚠️ Custom workflow error:', error);
      console.log('⚠️ Falling back to default workflow');
    }

    // Fallback to default workflow
    return {
      prompt: {
        // Load Checkpoint
        '1': {
          inputs: {
            ckpt_name: 'sd_xl_base_1.0.safetensors', // Veya kullanılan model
          },
          class_type: 'CheckpointLoaderSimple',
        },
        // Positive Prompt
        '2': {
          inputs: {
            text: prompt,
            clip: ['1', 1],
          },
          class_type: 'CLIPTextEncode',
        },
        // Negative Prompt
        '3': {
          inputs: {
            text: negativePrompt,
            clip: ['1', 1],
          },
          class_type: 'CLIPTextEncode',
        },
        // Load Sketch Image
        '4': {
          inputs: {
            image: sketchImageName,
            upload: 'image',
          },
          class_type: 'LoadImage',
        },
        // ControlNet Loader
        '5': {
          inputs: {
            control_net_name: 'control_v11p_sd15_canny.pth', // ControlNet modeli
          },
          class_type: 'ControlNetLoader',
        },
        // Apply ControlNet
        '6': {
          inputs: {
            strength: 0.8,
            conditioning: ['2', 0],
            control_net: ['5', 0],
            image: ['4', 0],
          },
          class_type: 'ControlNetApply',
        },
        // KSampler
        '7': {
          inputs: {
            seed: Math.floor(Math.random() * 1000000),
            steps: steps,
            cfg: cfgScale,
            sampler_name: 'euler',
            scheduler: 'normal',
            denoise: 1.0,
            model: ['1', 0],
            positive: ['6', 0],
            negative: ['3', 0],
            latent_image: ['8', 0],
          },
          class_type: 'KSampler',
        },
        // Empty Latent Image
        '8': {
          inputs: {
            width: width,
            height: height,
            batch_size: 1,
          },
          class_type: 'EmptyLatentImage',
        },
        // VAE Decode
        '9': {
          inputs: {
            samples: ['7', 0],
            vae: ['1', 2],
          },
          class_type: 'VAEDecode',
        },
        // Save Image
        '10': {
          inputs: {
            filename_prefix: 'sample_design',
            images: ['9', 0],
          },
          class_type: 'SaveImage',
        },
      },
    };
  }

  /**
   * Queue a prompt to ComfyUI
   */
  static async queuePrompt(workflow: ComfyUIWorkflow): Promise<string> {
    try {
      console.log('📤 Sending workflow to ComfyUI...');
      console.log('🔗 ComfyUI URL:', COMFYUI_URL);
      console.log('📋 Workflow nodes:', Object.keys(workflow.prompt || {}).length);

      const response = await axios.post(`${COMFYUI_URL}/prompt`, {
        prompt: workflow.prompt,
      });

      console.log('✅ Workflow queued successfully. Prompt ID:', response.data.prompt_id);
      return response.data.prompt_id;
    } catch (error: any) {
      console.error('❌ Error queuing prompt to ComfyUI:');
      console.error('Error message:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to ComfyUI. Please ensure ComfyUI is running at ' + COMFYUI_URL);
      }
      throw new Error('Failed to queue prompt to ComfyUI: ' + (error.response?.data?.error || error.message));
    }
  }

  /**
   * Check workflow status
   */
  static async checkStatus(promptId: string): Promise<any> {
    try {
      const response = await axios.get(`${COMFYUI_URL}/history/${promptId}`);
      return response.data[promptId];
    } catch (error) {
      console.error('Error checking ComfyUI status:', error);
      throw new Error('Failed to check status');
    }
  }

  /**
   * Wait for workflow completion and get result
   */
  static async waitForCompletion(
    promptId: string,
    maxWaitTime: number = 300000 // 5 minutes
  ): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkStatus(promptId);

      if (status && status.outputs) {
        // Get the output image filename
        const outputNode = Object.keys(status.outputs).find((key) =>
          status.outputs[key].images
        );

        if (outputNode && status.outputs[outputNode].images[0]) {
          return status.outputs[outputNode].images[0].filename;
        }
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('ComfyUI workflow timed out');
  }

  /**
   * Download generated image from ComfyUI
   */
  static async downloadImage(
    filename: string,
    outputPath: string
  ): Promise<string> {
    try {
      const response = await axios.get(
        `${COMFYUI_URL}/view?filename=${filename}`,
        {
          responseType: 'stream',
        }
      );

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading image from ComfyUI:', error);
      throw new Error('Failed to download image from ComfyUI');
    }
  }

  /**
   * Full pipeline: Generate sample design from sketch
   */
  static async generateSampleDesign(
    sketchPath: string,
    prompt: string,
    options: {
      negativePrompt?: string;
      width?: number;
      height?: number;
      steps?: number;
      cfgScale?: number;
    } = {}
  ): Promise<string> {
    try {
      console.log('🎨 Starting sample design generation...');

      // 1. Upload sketch image
      console.log('📤 Uploading sketch to ComfyUI...');
      const sketchImageName = await this.uploadImage(sketchPath);

      // 2. Create workflow
      console.log('⚙️ Creating workflow...');
      const workflow = this.createSampleDesignWorkflow(
        sketchImageName,
        prompt,
        options.negativePrompt,
        options.width,
        options.height,
        options.steps,
        options.cfgScale
      );

      // 3. Queue prompt
      console.log('🚀 Queuing prompt...');
      const promptId = await this.queuePrompt(workflow);
      console.log('✅ Prompt queued with ID:', promptId);

      // 4. Wait for completion
      console.log('⏳ Waiting for generation to complete...');
      const outputFilename = await this.waitForCompletion(promptId);
      console.log('✅ Generation complete:', outputFilename);

      // 5. Download image
      const outputDir = path.join(
        __dirname,
        '../../uploads/ai-generated-samples'
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, outputFilename);
      console.log('📥 Downloading generated image...');
      await this.downloadImage(outputFilename, outputPath);

      console.log('🎉 Sample design generated successfully!');
      return outputPath;
    } catch (error) {
      console.error('❌ Error in sample design generation:', error);
      throw error;
    }
  }

  /**
   * Full pipeline: Generate design from text-only prompt using a text workflow
   */
  static async generateDesignFromText(
    promptText: string,
    options: {
      negativePrompt?: string;
      width?: number;
      height?: number;
      steps?: number;
      cfgScale?: number;
      workflowName?: string;
    } = {}
  ): Promise<string> {
    try {
      console.log('🎨 Starting text-to-design generation...');

      // 1. Load workflow (use protextflow_text-to-model by default)
      const workflowName = options.workflowName || 'protextflow_text-to-model';
      console.log('📂 Loading workflow:', workflowName);
      const rawWorkflow = this.loadWorkflow(workflowName);

      // 2. Convert to API format if needed
      let apiWorkflow = this.convertWorkflowToAPI(rawWorkflow);

      // 3. Set prompt texts and parameters for text-to-model workflow
      if (apiWorkflow && apiWorkflow.prompt) {
        Object.keys(apiWorkflow.prompt).forEach((nodeId) => {
          const node = apiWorkflow.prompt[nodeId];
          if (!node || !node.class_type) return;

          // Node 6: Positive prompt (CLIPTextEncode) - based on workflow structure
          if (nodeId === '6' && node.class_type === 'CLIPTextEncode') {
            node.inputs.text = promptText;
          }

          // Node 33: Negative prompt (CLIPTextEncode)
          if (nodeId === '33' && node.class_type === 'CLIPTextEncode') {
            node.inputs.text = options.negativePrompt || '';
          }

          // Node 27: EmptySD3LatentImage - dimensions
          if (nodeId === '27' && node.class_type === 'EmptySD3LatentImage') {
            node.inputs.width = options.width || 1024;
            node.inputs.height = options.height || 1024;
            node.inputs.batch_size = 1;
          }

          // Node 31: KSampler - sampling settings for Flux model
          if (nodeId === '31' && node.class_type === 'KSampler') {
            // Flux models use specific parameters
            node.inputs.seed = Math.floor(Math.random() * 1000000000);
            node.inputs.steps = options.steps || 20;
            node.inputs.cfg = options.cfgScale || 1.0; // Flux dev/schnell use cfg=1.0
            node.inputs.sampler_name = 'euler'; // Valid sampler for Flux
            node.inputs.scheduler = 'simple'; // Valid scheduler from ComfyUI
            node.inputs.denoise = 1.0; // Must be float 0-1
          }

          // Node 35: FluxGuidance - guidance scale
          if (nodeId === '35' && node.class_type === 'FluxGuidance') {
            node.inputs.guidance = 3.5; // Default guidance for Flux
          }
        });
      }

      console.log('📤 Queuing workflow to ComfyUI...');
      const promptId = await this.queuePrompt(apiWorkflow);
      console.log('✅ Prompt queued with ID:', promptId);

      // 4. Wait for completion
      console.log('⏳ Waiting for generation to complete...');
      const outputFilename = await this.waitForCompletion(promptId);
      console.log('✅ Generation complete:', outputFilename);

      // 5. Download image
      const outputDir = path.join(__dirname, '../../uploads/ai-generated-samples');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, outputFilename);
      console.log('📥 Downloading generated image...');
      await this.downloadImage(outputFilename, outputPath);

      console.log('🎉 Text-to-design generated successfully!');
      return outputPath;
    } catch (error) {
      console.error('❌ Error in text-to-design generation:', error);
      throw error;
    }
  }
}
