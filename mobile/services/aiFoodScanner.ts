/**
 * AI Food Scanner Service
 *
 * Integrates with multiple free AI vision APIs for food recognition:
 * 1. Google Gemini Vision (free tier - 60 requests/min)
 * 2. HuggingFace Food Classification (free inference)
 * 3. Groq LLaMA Vision (free tier)
 *
 * Features:
 * - Multi-model fallback for reliability
 * - Structured food + nutrition output
 * - Confidence scoring
 * - Error handling for blurry/unclear images
 */

import * as FileSystem from 'expo-file-system';

// ============================================================================
// TYPES
// ============================================================================

export interface DetectedFood {
  id: string;
  name: string;
  quantity: string;
  match: number; // 0-100 percentage
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  icon: string; // emoji
}

export interface ScanResult {
  success: boolean;
  title: string;
  items: DetectedFood[];
  error?: string;
  errorType?: 'blurry' | 'no_food' | 'unknown' | 'api_error';
  rawResponse?: string;
}

// ============================================================================
// CONFIGURATION - Add your API keys here
// ============================================================================

// Get free API keys from:
// - Gemini: https://makersuite.google.com/app/apikey
// - HuggingFace: https://huggingface.co/settings/tokens
// - Groq: https://console.groq.com/keys

const API_KEYS = {
  GEMINI: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  HUGGINGFACE: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY || '',
  GROQ: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
};

// ============================================================================
// NUTRITION DATABASE (for estimation when AI doesn't provide exact values)
// ============================================================================

const nutritionDatabase: Record<string, Omit<DetectedFood, 'id' | 'name' | 'match'>> = {
  // Proteins
  'chicken breast': { quantity: '100g', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, icon: '🍗' },
  'chicken': { quantity: '100g', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, icon: '🍗' },
  'grilled chicken': { quantity: '100g', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, icon: '🍗' },
  'salmon': { quantity: '100g', calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, icon: '🐟' },
  'fish': { quantity: '100g', calories: 180, protein: 22, carbs: 0, fats: 8, fiber: 0, icon: '🐟' },
  'steak': { quantity: '100g', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, icon: '🥩' },
  'beef': { quantity: '100g', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, icon: '🥩' },
  'eggs': { quantity: '2 large', calories: 156, protein: 12, carbs: 1.2, fats: 10, fiber: 0, icon: '🥚' },
  'egg': { quantity: '1 large', calories: 78, protein: 6, carbs: 0.6, fats: 5, fiber: 0, icon: '🥚' },
  'tofu': { quantity: '100g', calories: 144, protein: 17, carbs: 3, fats: 9, fiber: 2, icon: '🧊' },
  'shrimp': { quantity: '100g', calories: 99, protein: 24, carbs: 0, fats: 0.3, fiber: 0, icon: '🦐' },
  'turkey': { quantity: '100g', calories: 135, protein: 30, carbs: 0, fats: 1, fiber: 0, icon: '🦃' },
  'tuna': { quantity: '100g', calories: 132, protein: 29, carbs: 0, fats: 1, fiber: 0, icon: '🐟' },

  // Carbs
  'rice': { quantity: '100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, icon: '🍚' },
  'white rice': { quantity: '100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, icon: '🍚' },
  'brown rice': { quantity: '100g', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, fiber: 1.8, icon: '🍚' },
  'pasta': { quantity: '100g', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, icon: '🍝' },
  'spaghetti': { quantity: '100g', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, icon: '🍝' },
  'noodles': { quantity: '100g', calories: 138, protein: 4.5, carbs: 25, fats: 2, fiber: 1, icon: '🍜' },
  'bread': { quantity: '1 slice', calories: 81, protein: 4, carbs: 14, fats: 1, fiber: 2, icon: '🍞' },
  'potato': { quantity: '100g', calories: 93, protein: 2.5, carbs: 21, fats: 0.1, fiber: 2.2, icon: '🥔' },
  'sweet potato': { quantity: '100g', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3, icon: '🍠' },
  'oatmeal': { quantity: '40g dry', calories: 152, protein: 5.3, carbs: 27, fats: 2.7, fiber: 4, icon: '🥣' },
  'quinoa': { quantity: '100g', calories: 120, protein: 4.4, carbs: 21, fats: 1.9, fiber: 2.8, icon: '🌾' },
  'banana': { quantity: '1 medium', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3.1, icon: '🍌' },
  'apple': { quantity: '1 medium', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4.4, icon: '🍎' },

  // Vegetables
  'salad': { quantity: '100g', calories: 20, protein: 1.5, carbs: 3, fats: 0.2, fiber: 2, icon: '🥗' },
  'broccoli': { quantity: '100g', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, icon: '🥦' },
  'spinach': { quantity: '100g', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, icon: '🥬' },
  'carrots': { quantity: '100g', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, icon: '🥕' },
  'tomato': { quantity: '100g', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, icon: '🍅' },
  'cucumber': { quantity: '100g', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, fiber: 0.5, icon: '🥒' },

  // Fats
  'avocado': { quantity: '1/2 fruit', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, icon: '🥑' },
  'almonds': { quantity: '28g', calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5, icon: '🥜' },
  'peanut butter': { quantity: '2 tbsp', calories: 188, protein: 8, carbs: 6, fats: 16, fiber: 2, icon: '🥜' },
  'cheese': { quantity: '28g', calories: 113, protein: 7, carbs: 0.4, fats: 9, fiber: 0, icon: '🧀' },

  // Drinks & Supplements
  'protein shake': { quantity: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 1, fiber: 0, icon: '🥤' },
  'protein smoothie': { quantity: '1 large', calories: 350, protein: 30, carbs: 40, fats: 8, fiber: 5, icon: '🥤' },
  'smoothie': { quantity: '1 large', calories: 280, protein: 8, carbs: 50, fats: 5, fiber: 6, icon: '🥤' },
  'whey protein': { quantity: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 1, fiber: 0, icon: '🥤' },
  'milk': { quantity: '240ml', calories: 150, protein: 8, carbs: 12, fats: 8, fiber: 0, icon: '🥛' },
  'yogurt': { quantity: '170g', calories: 100, protein: 17, carbs: 6, fats: 0.7, fiber: 0, icon: '🥛' },
  'greek yogurt': { quantity: '170g', calories: 100, protein: 17, carbs: 6, fats: 0.7, fiber: 0, icon: '🥛' },

  // Common Meals
  'burger': { quantity: '1 burger', calories: 540, protein: 25, carbs: 40, fats: 30, fiber: 2, icon: '🍔' },
  'pizza': { quantity: '1 slice', calories: 285, protein: 12, carbs: 36, fats: 10, fiber: 2, icon: '🍕' },
  'sandwich': { quantity: '1 sandwich', calories: 380, protein: 20, carbs: 40, fats: 14, fiber: 3, icon: '🥪' },
  'burrito': { quantity: '1 burrito', calories: 550, protein: 25, carbs: 55, fats: 22, fiber: 8, icon: '🌯' },
  'sushi': { quantity: '6 pieces', calories: 280, protein: 12, carbs: 38, fats: 6, fiber: 2, icon: '🍣' },
  'soup': { quantity: '1 bowl', calories: 150, protein: 8, carbs: 18, fats: 5, fiber: 3, icon: '🍲' },
  'fried rice': { quantity: '1 plate', calories: 450, protein: 12, carbs: 60, fats: 18, fiber: 2, icon: '🍚' },
  'stir fry': { quantity: '1 plate', calories: 380, protein: 25, carbs: 30, fats: 18, fiber: 4, icon: '🥘' },

  // Default fallback
  'food': { quantity: '1 serving', calories: 200, protein: 10, carbs: 20, fats: 8, fiber: 2, icon: '🍽️' },
  'meal': { quantity: '1 serving', calories: 450, protein: 25, carbs: 45, fats: 18, fiber: 4, icon: '🍽️' },
  'unknown': { quantity: '1 serving', calories: 200, protein: 10, carbs: 20, fats: 8, fiber: 2, icon: '❓' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert image URI to base64
 */
async function imageToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Find nutrition info for a food item
 */
function getNutritionInfo(foodName: string): Omit<DetectedFood, 'id' | 'name' | 'match'> {
  const normalizedName = foodName.toLowerCase().trim();

  // Direct match
  if (nutritionDatabase[normalizedName]) {
    return nutritionDatabase[normalizedName];
  }

  // Partial match
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }

  // Default fallback
  return nutritionDatabase['food'];
}

/**
 * Parse AI response and extract food items
 */
function parseAIResponse(response: string): DetectedFood[] {
  const foods: DetectedFood[] = [];

  try {
    // Try to parse as JSON first
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const nutrition = getNutritionInfo(item.name || item.food || 'unknown');
          foods.push({
            id: generateId(),
            name: item.name || item.food || 'Unknown Food',
            quantity: item.quantity || item.portion || nutrition.quantity,
            match: Math.min(100, Math.max(0, item.confidence || item.match || 75)),
            calories: item.calories || nutrition.calories,
            protein: item.protein || nutrition.protein,
            carbs: item.carbs || nutrition.carbs,
            fats: item.fats || nutrition.fats,
            fiber: item.fiber || nutrition.fiber,
            icon: item.icon || nutrition.icon,
          });
        }
        return foods;
      }
    }
  } catch (e) {
    // JSON parse failed, try text parsing
  }

  // Text-based parsing
  const lines = response.split('\n');
  for (const line of lines) {
    // Match patterns like "- Chicken breast (85% confidence)"
    const match = line.match(/[-•*]?\s*([A-Za-z\s]+)(?:\s*[\(\[]?\s*(\d+)%?)?/);
    if (match && match[1]) {
      const foodName = match[1].trim();
      if (foodName.length > 2 && !foodName.toLowerCase().includes('detect') && !foodName.toLowerCase().includes('image')) {
        const nutrition = getNutritionInfo(foodName);
        const confidence = match[2] ? parseInt(match[2]) : 75;

        foods.push({
          id: generateId(),
          name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
          quantity: nutrition.quantity,
          match: Math.min(100, Math.max(0, confidence)),
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats,
          fiber: nutrition.fiber,
          icon: nutrition.icon,
        });
      }
    }
  }

  return foods;
}

// ============================================================================
// GEMINI VISION API
// ============================================================================

const GEMINI_PROMPT = `You are a food recognition AI. Analyze this image and identify ALL food items visible.

For each food item, provide:
1. Name of the food
2. Estimated portion size
3. Confidence percentage (0-100)
4. Estimated calories
5. Estimated protein (grams)

IMPORTANT RULES:
- If the image is blurry or unclear, respond with: {"error": "blurry", "message": "Image is too blurry"}
- If no food is detected, respond with: {"error": "no_food", "message": "No food detected"}
- If you can identify food, respond with a JSON array

Response format for detected food:
[
  {"name": "Grilled Chicken Breast", "quantity": "150g", "confidence": 92, "calories": 248, "protein": 46},
  {"name": "White Rice", "quantity": "200g", "confidence": 88, "calories": 260, "protein": 5}
]

Analyze the image now:`;

async function scanWithGemini(imageBase64: string): Promise<ScanResult> {
  if (!API_KEYS.GEMINI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.GEMINI}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: GEMINI_PROMPT },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Check for error responses
    if (text.includes('"error"')) {
      try {
        const errorObj = JSON.parse(text);
        if (errorObj.error === 'blurry') {
          return {
            success: false,
            title: 'Image Unclear',
            items: [],
            error: 'The image is too blurry. Please try again with better lighting.',
            errorType: 'blurry',
          };
        }
        if (errorObj.error === 'no_food') {
          return {
            success: false,
            title: 'No Food Detected',
            items: [],
            error: "I couldn't detect any food in this image. Try again with food in frame.",
            errorType: 'no_food',
          };
        }
      } catch (e) {
        // Not a JSON error, continue parsing
      }
    }

    const foods = parseAIResponse(text);

    if (foods.length === 0) {
      return {
        success: false,
        title: 'No Food Detected',
        items: [],
        error: "I couldn't identify any food items. Please try again.",
        errorType: 'no_food',
      };
    }

    return {
      success: true,
      title: 'Food Identified!',
      items: foods,
      rawResponse: text,
    };
  } catch (error) {
    console.error('Gemini scan error:', error);
    throw error;
  }
}

// ============================================================================
// HUGGINGFACE FOOD CLASSIFICATION API
// ============================================================================

async function scanWithHuggingFace(imageBase64: string): Promise<ScanResult> {
  if (!API_KEYS.HUGGINGFACE) {
    throw new Error('HuggingFace API key not configured');
  }

  try {
    // Use a food classification model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/nateraw/food',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.HUGGINGFACE}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageBase64,
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API error:', errorText);
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();

    // HuggingFace returns array of classifications with scores
    if (Array.isArray(data) && data.length > 0) {
      const foods: DetectedFood[] = [];

      // Take top 3 predictions with score > 0.1
      const topPredictions = data.filter((p: any) => p.score > 0.1).slice(0, 3);

      for (const prediction of topPredictions) {
        const foodName = prediction.label.replace(/_/g, ' ');
        const nutrition = getNutritionInfo(foodName);

        foods.push({
          id: generateId(),
          name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
          quantity: nutrition.quantity,
          match: Math.round(prediction.score * 100),
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats,
          fiber: nutrition.fiber,
          icon: nutrition.icon,
        });
      }

      if (foods.length > 0) {
        return {
          success: true,
          title: 'Food Identified!',
          items: foods,
        };
      }
    }

    return {
      success: false,
      title: 'No Food Detected',
      items: [],
      error: "Couldn't identify food in this image.",
      errorType: 'no_food',
    };
  } catch (error) {
    console.error('HuggingFace scan error:', error);
    throw error;
  }
}

// ============================================================================
// GROQ LLAMA VISION API
// ============================================================================

async function scanWithGroq(imageBase64: string): Promise<ScanResult> {
  if (!API_KEYS.GROQ) {
    throw new Error('Groq API key not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.GROQ}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: GEMINI_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const foods = parseAIResponse(text);

    if (foods.length === 0) {
      return {
        success: false,
        title: 'No Food Detected',
        items: [],
        error: "I couldn't identify any food items.",
        errorType: 'no_food',
      };
    }

    return {
      success: true,
      title: 'Food Identified!',
      items: foods,
      rawResponse: text,
    };
  } catch (error) {
    console.error('Groq scan error:', error);
    throw error;
  }
}

// ============================================================================
// MAIN SCAN FUNCTION WITH FALLBACKS
// ============================================================================

export async function scanFoodImage(imageUri: string): Promise<ScanResult> {
  try {
    // Convert image to base64
    const imageBase64 = await imageToBase64(imageUri);

    // Try APIs in order of preference
    const scanners = [
      { name: 'Gemini', fn: () => scanWithGemini(imageBase64) },
      { name: 'Groq', fn: () => scanWithGroq(imageBase64) },
      { name: 'HuggingFace', fn: () => scanWithHuggingFace(imageBase64) },
    ];

    for (const scanner of scanners) {
      try {
        console.log(`Trying ${scanner.name}...`);
        const result = await scanner.fn();
        console.log(`${scanner.name} result:`, result.success ? 'success' : 'failed');
        return result;
      } catch (error) {
        console.log(`${scanner.name} failed, trying next...`, error);
        continue;
      }
    }

    // All APIs failed - use demo mode
    console.log('All APIs failed, using demo mode');
    return getDemoResult();

  } catch (error) {
    console.error('Food scan error:', error);
    return {
      success: false,
      title: 'Scan Failed',
      items: [],
      error: 'Failed to analyze the image. Please try again.',
      errorType: 'api_error',
    };
  }
}

// ============================================================================
// DEMO MODE (when no API keys configured)
// ============================================================================

export function getDemoResult(): ScanResult {
  const demoFoods = [
    ['Grilled Chicken Breast', '150g', 92, 248, 46, 0, 6, 0, '🍗'],
    ['White Rice', '200g', 88, 260, 5, 56, 0.6, 0.8, '🍚'],
    ['Steamed Broccoli', '100g', 85, 34, 3, 7, 0.4, 2.6, '🥦'],
  ];

  const items: DetectedFood[] = demoFoods.map(([name, quantity, match, calories, protein, carbs, fats, fiber, icon]) => ({
    id: generateId(),
    name: name as string,
    quantity: quantity as string,
    match: match as number,
    calories: calories as number,
    protein: protein as number,
    carbs: carbs as number,
    fats: fats as number,
    fiber: fiber as number,
    icon: icon as string,
  }));

  return {
    success: true,
    title: 'Food Identified!',
    items,
  };
}

// ============================================================================
// BARCODE LOOKUP (using Backend API with Open Food Facts fallback)
// ============================================================================

export interface BarcodeResult {
  success: boolean;
  food?: DetectedFood;
  error?: string;
  cached?: boolean;
}

/**
 * Lookup barcode using backend API (with caching) or Open Food Facts directly.
 *
 * The backend API will:
 * 1. Check local database first (instant)
 * 2. Query Open Food Facts if not cached
 * 3. Cache the result for future lookups
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeResult> {
  // Try backend API first (for caching benefits)
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/nutrition/foods/barcode/${barcode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const product = await response.json();
      return {
        success: true,
        cached: true,
        food: {
          id: String(product.id),
          name: product.name || 'Unknown Product',
          quantity: `${product.serving_size || 100}${product.serving_unit || 'g'}`,
          match: 100,
          calories: Math.round(product.calories || 0),
          protein: Math.round(product.protein || 0),
          carbs: Math.round(product.carbs || 0),
          fats: Math.round(product.fat || 0),
          fiber: Math.round(product.fiber || 0),
          icon: '📦',
        },
      };
    }
  } catch (backendError) {
    console.log('Backend barcode lookup failed, falling back to Open Food Facts:', backendError);
  }

  // Fallback to Open Food Facts directly
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;
      const nutrients = product.nutriments || {};

      return {
        success: true,
        cached: false,
        food: {
          id: generateId(),
          name: product.product_name || 'Unknown Product',
          quantity: product.serving_size || '100g',
          match: 100,
          calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0),
          protein: Math.round(nutrients.proteins_100g || nutrients.proteins || 0),
          carbs: Math.round(nutrients.carbohydrates_100g || nutrients.carbohydrates || 0),
          fats: Math.round(nutrients.fat_100g || nutrients.fat || 0),
          fiber: Math.round(nutrients.fiber_100g || nutrients.fiber || 0),
          icon: '📦',
        },
      };
    }

    return {
      success: false,
      error: 'Product not found in database',
    };
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return {
      success: false,
      error: 'Failed to lookup barcode',
    };
  }
}

/**
 * Manually add a food item for an unknown barcode
 */
export async function addManualBarcodeEntry(
  barcode: string,
  food: {
    name: string;
    brand?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    serving_size?: number;
    serving_unit?: string;
  }
): Promise<{ success: boolean; food?: DetectedFood; error?: string }> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/nutrition/foods/barcode/${barcode}/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: Auth header should be added by the API client
      },
      body: JSON.stringify({
        name: food.name,
        brand: food.brand,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
        serving_size: food.serving_size || 100,
        serving_unit: food.serving_unit || 'g',
      }),
    });

    if (response.ok) {
      const product = await response.json();
      return {
        success: true,
        food: {
          id: String(product.id),
          name: product.name,
          quantity: `${product.serving_size}${product.serving_unit}`,
          match: 100,
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fats: product.fat,
          fiber: product.fiber || 0,
          icon: '📦',
        },
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      error: errorData.detail || 'Failed to save food item',
    };
  } catch (error) {
    console.error('Manual barcode entry error:', error);
    return {
      success: false,
      error: 'Failed to save food item',
    };
  }
}

export default {
  scanFoodImage,
  lookupBarcode,
  addManualBarcodeEntry,
  getDemoResult,
};
