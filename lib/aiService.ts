import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

interface DrawingAnalysis {
  id: string;
  imageUri: string;
  createdAt: string;
  headline: string;
  mood: 'happy' | 'sad' | 'angry' | 'neutral';
  insights: string[];
  developmentalStage: string;
  emotionalState: string;
  recommendations: string[];
  confidenceScore: number;
}

class AIService {
  private static instance: AIService;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Only for client-side usage
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeDrawing(imageUri: string): Promise<DrawingAnalysis> {
    try {
      // Convert image URI to base64
      const base64Image = await this.uriToBase64(imageUri);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert child psychologist specializing in analyzing children's drawings. 
            Analyze the drawing and provide insights about the child's emotional state, developmental stage, 
            and psychological well-being. Focus on positive aspects and provide constructive recommendations.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this children's drawing and provide: 1. A headline summary, 2. The child's mood (happy/sad/angry/neutral), 3. Key psychological insights, 4. Developmental stage, 5. Emotional state, 6. Recommendations for parents, 7. Confidence score (0-1)"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No analysis received from OpenAI');
      }

      // Parse the response into structured data
      const analysis = this.parseOpenAIResponse(content, imageUri);
      return analysis;

    } catch (error) {
      console.error('Error analyzing drawing:', error);
      throw new Error('Failed to analyze drawing');
    }
  }

  private async uriToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private parseOpenAIResponse(content: string, imageUri: string): DrawingAnalysis {
    // Extract information from the OpenAI response
    // This is a simplified parser - you might want to make it more robust
    const lines = content.split('\n');
    
    const headline = lines.find(line => line.toLowerCase().includes('headline'))?.split(':')[1]?.trim() || 
                    "Creative Expression Analysis";
    
    const moodMatch = content.match(/mood:\s*(happy|sad|angry|neutral)/i);
    const mood = (moodMatch?.[1]?.toLowerCase() as 'happy' | 'sad' | 'angry' | 'neutral') || 'neutral';
    
    const insights = lines
      .filter(line => line.toLowerCase().includes('insight'))
      .map(line => line.split(':')[1]?.trim())
      .filter(Boolean) as string[];
    
    const developmentalStage = lines
      .find(line => line.toLowerCase().includes('developmental stage'))
      ?.split(':')[1]?.trim() || "Schematic Stage";
    
    const emotionalState = lines
      .find(line => line.toLowerCase().includes('emotional state'))
      ?.split(':')[1]?.trim() || "Expressive and confident";
    
    const recommendations = lines
      .filter(line => line.toLowerCase().includes('recommendation'))
      .map(line => line.split(':')[1]?.trim())
      .filter(Boolean) as string[];
    
    const confidenceMatch = content.match(/confidence score:\s*([0-9.]+)/i);
    const confidenceScore = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;

    return {
      id: uuidv4(),
      imageUri,
      createdAt: new Date().toISOString(),
      headline,
      mood,
      insights: insights.length > 0 ? insights : this.generateInsights(),
      developmentalStage,
      emotionalState,
      recommendations: recommendations.length > 0 ? recommendations : this.generateRecommendations(),
      confidenceScore
    };
  }

  // Keep these as fallbacks in case the API response parsing fails
  private generateInsights(): string[] {
    return [
      "The drawing shows strong creative expression",
      "Use of bright colors indicates positive emotional state",
      "Detailed elements suggest good focus and attention",
      "Proportional elements show developing spatial awareness",
      "Symbolic elements indicate healthy imagination"
    ];
  }

  private generateRecommendations(): string[] {
    return [
      "Encourage more drawing activities to develop fine motor skills",
      "Provide a variety of art materials to explore different textures",
      "Ask open-ended questions about their drawings to develop language skills",
      "Create a dedicated art space to foster creativity",
      "Display their artwork to build confidence and self-esteem"
    ];
  }
}

export default AIService; 