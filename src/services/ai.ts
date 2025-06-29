import OpenAI from 'openai';
import { AIValidation } from '../types';
import { researchService, ResearchResults } from './research';

export interface IdeaAnalysisRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

export interface AIProvider {
  analyzeIdea(idea: IdeaAnalysisRequest): Promise<AIValidation>;
  generateTags(title: string, description: string): Promise<string[]>;
  generateImprovements(idea: IdeaAnalysisRequest): Promise<string[]>;
  isConfigured(): boolean;
}

// Enhanced OpenRouter Provider with Research Integration
class OpenRouterProvider implements AIProvider {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log('🔑 OpenRouter API Key configured:', !!apiKey);
    
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        "HTTP-Referer": window.location.origin,
        "X-Title": "CreativePro"
      }
    });
    this.model = import.meta.env.VITE_AI_MODEL || 'openai/gpt-4o-mini';
    this.maxTokens = parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '2000');
    
    console.log('🤖 AI Model:', this.model);
  }

  async analyzeIdea(idea: IdeaAnalysisRequest): Promise<AIValidation> {
    console.log('🔍 Starting comprehensive AI analysis with research for:', idea.title);
    
    // Step 1: Conduct real-time research
    let researchResults: ResearchResults | null = null;
    try {
      console.log('📊 Conducting market research...');
      researchResults = await researchService.conductResearch(
        idea.title, 
        idea.description, 
        idea.category
      );
      console.log('✅ Research completed');
    } catch (error) {
      console.warn('⚠️ Research failed, proceeding with AI-only analysis:', error);
    }

    // Step 2: Enhanced AI analysis with research data
    const prompt = this.buildEnhancedAnalysisPrompt(idea, researchResults);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert startup advisor, venture capitalist, and market researcher with access to real-time market data. 

Your analysis should be comprehensive and data-driven, incorporating:
- Real competitive landscape analysis
- Current market conditions and trends
- Patent landscape assessment
- Industry news and developments
- Actual company data and funding information

Provide structured, actionable feedback in JSON format. Be thorough, specific, and reference the research data when available.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7
      });

      console.log('✅ Enhanced AI analysis completed');
      
      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      // Parse AI response
      let analysis;
      try {
        analysis = JSON.parse(response);
      } catch {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse AI response');
        }
      }

      console.log('📊 Enhanced analysis completed with research data');
      return this.formatEnhancedAIValidation(analysis, researchResults);
    } catch (error) {
      console.error('❌ Enhanced AI analysis error:', error);
      throw error;
    }
  }

  async generateTags(title: string, description: string): Promise<string[]> {
    console.log('🏷️ Generating enhanced tags with market research');
    
    // Get research data for better tag generation
    let researchResults: ResearchResults | null = null;
    try {
      researchResults = await researchService.conductResearch(title, description, '');
    } catch (error) {
      console.warn('⚠️ Research failed for tag generation:', error);
    }
    
    const prompt = `Generate 5-8 relevant, specific, and market-aware tags for this startup idea. 

Title: ${title}
Description: ${description}

${researchResults ? `
MARKET RESEARCH DATA:
- Existing Companies: ${researchResults.companies.map(c => c.name).join(', ')}
- Industry Trends: ${researchResults.industryNews.map(n => n.title).slice(0, 3).join('; ')}
- Market Segments: ${researchResults.marketData?.marketSegments?.join(', ') || 'N/A'}
` : ''}

Generate tags that are:
1. Specific to the technology/approach
2. Relevant to the market category
3. Aligned with current industry trends
4. Useful for discovery and categorization

Return as JSON: {"tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]}

Focus on actionable, searchable tags that reflect both the innovation and market positioning.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "Generate relevant, market-aware startup tags in JSON format." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.5
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      try {
        const parsed = JSON.parse(response);
        console.log('✅ Enhanced tags generated:', parsed.tags);
        return parsed.tags || [];
      } catch {
        const tagMatches = response.match(/"([^"]+)"/g);
        const tags = tagMatches ? tagMatches.map(tag => tag.replace(/"/g, '')) : [];
        console.log('✅ Tags extracted from text:', tags);
        return tags;
      }
    } catch (error) {
      console.error('❌ Enhanced tag generation error:', error);
      return [];
    }
  }

  async generateImprovements(idea: IdeaAnalysisRequest): Promise<string[]> {
    console.log('💡 Generating market-informed improvements');
    
    // Get research data for better improvement suggestions
    let researchResults: ResearchResults | null = null;
    try {
      researchResults = await researchService.conductResearch(
        idea.title, 
        idea.description, 
        idea.category
      );
    } catch (error) {
      console.warn('⚠️ Research failed for improvements:', error);
    }
    
    const prompt = `Provide 3-5 specific, actionable improvement suggestions for this startup idea based on current market conditions and competitive landscape:

Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

${researchResults ? `
CURRENT MARKET INTELLIGENCE:
- Direct Competitors: ${researchResults.competitiveAnalysis.directCompetitors.join(', ') || 'None identified'}
- Market Gaps: ${researchResults.competitiveAnalysis.marketGaps.join(', ') || 'Research ongoing'}
- Recent Patents: ${researchResults.patents.length} related patents found
- Market Size: ${researchResults.marketData?.marketSize || 'Unknown'}
- Growth Rate: ${researchResults.marketData?.growthRate || 'Unknown'}
- Key Trends: ${researchResults.marketData?.keyTrends?.join(', ') || 'Unknown'}
- Recent News: ${researchResults.industryNews.map(n => n.title).slice(0, 2).join('; ')}
` : ''}

Return as JSON: {"suggestions": ["suggestion1", "suggestion2", "suggestion3"]}

Focus on:
1. Competitive differentiation strategies
2. Market positioning improvements
3. Technical/product development priorities
4. Go-to-market strategy refinements
5. Partnership and collaboration opportunities

Make suggestions specific and actionable based on the current market landscape.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "Provide market-informed, actionable startup advice in JSON format." },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.8
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      try {
        const parsed = JSON.parse(response);
        console.log('✅ Market-informed improvements generated:', parsed.suggestions);
        return parsed.suggestions || [];
      } catch {
        console.log('⚠️ Fallback improvements used');
        return [
          'Conduct competitive analysis based on current market players',
          'Validate market demand through customer interviews',
          'Develop IP strategy to protect core innovations'
        ];
      }
    } catch (error) {
      console.error('❌ Improvement generation error:', error);
      return [];
    }
  }

  isConfigured(): boolean {
    const configured = !!import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log('🔧 Enhanced AI configured:', configured);
    return configured;
  }

  private buildEnhancedAnalysisPrompt(idea: IdeaAnalysisRequest, research: ResearchResults | null): string {
    return `Analyze this startup idea comprehensively using both AI reasoning and real-time market research data:

STARTUP IDEA:
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Tags: ${idea.tags.join(', ')}

${research ? `
REAL-TIME MARKET RESEARCH DATA:

WEB SEARCH INSIGHTS:
${research.webSearch.map(result => `- ${result.title}: ${result.snippet}`).join('\n')}

COMPETITIVE LANDSCAPE:
- Direct Competitors: ${research.companies.filter(c => c.stage === 'Seed' || c.stage === 'Series A').map(c => `${c.name} (${c.funding}, ${c.stage})`).join(', ') || 'None identified'}
- Established Players: ${research.companies.filter(c => c.stage !== 'Seed' && c.stage !== 'Series A').map(c => `${c.name} (${c.funding})`).join(', ') || 'None identified'}

PATENT LANDSCAPE:
${research.patents.length > 0 ? research.patents.map(p => `- ${p.title} (${p.patentNumber}) by ${p.assignee}`).join('\n') : '- No directly related patents found'}

MARKET DATA:
- Market Size: ${research.marketData?.marketSize || 'Unknown'}
- Growth Rate: ${research.marketData?.growthRate || 'Unknown'}
- Key Trends: ${research.marketData?.keyTrends?.join(', ') || 'Unknown'}
- Major Players: ${research.marketData?.majorPlayers?.join(', ') || 'Unknown'}

RECENT INDUSTRY NEWS:
${research.industryNews.map(news => `- ${news.title} (${news.source})`).join('\n')}

COMPETITIVE ANALYSIS:
- Market Gaps Identified: ${research.competitiveAnalysis.marketGaps.join(', ') || 'None identified'}
- Potential Advantages: ${research.competitiveAnalysis.competitiveAdvantages.join(', ') || 'None identified'}
` : 'Note: Real-time market research data unavailable - proceeding with AI-only analysis.'}

Provide a comprehensive analysis that incorporates this real market data. Consider:

1. How does this idea compare to existing solutions in the market?
2. What does the patent landscape reveal about innovation opportunities?
3. How do current market trends support or challenge this idea?
4. What competitive advantages can be identified from the research?
5. What market gaps does this idea address?
6. How does recent industry news impact the viability of this idea?

Return JSON with this EXACT structure:
{
  "noveltyScore": <number 0-100 based on competitive landscape and patent analysis>,
  "marketPotential": <number 0-100 based on market size, growth, and trends>,
  "feasibilityScore": <number 0-100 based on technical complexity and market readiness>,
  "swotAnalysis": {
    "strengths": [<2-4 specific strengths based on research data>],
    "weaknesses": [<2-4 specific weaknesses considering competition>],
    "opportunities": [<2-4 specific opportunities from market research>],
    "threats": [<2-4 specific threats from competitive analysis>],
    "suggestions": [<3-5 specific, research-informed improvement suggestions>]
  },
  "marketInsights": {
    "competitorCount": <number of direct competitors found>,
    "patentDensity": <"low" | "medium" | "high" based on patent search>,
    "marketMaturity": <"emerging" | "growing" | "mature" based on research>,
    "trendAlignment": <"strong" | "moderate" | "weak" based on industry trends>
  }
}

Be specific and reference the research data in your analysis. If research data is unavailable, clearly indicate this in your reasoning.`;
  }

  private formatEnhancedAIValidation(analysis: any, research: ResearchResults | null): AIValidation {
    // Enhanced validation with research insights
    const baseValidation = {
      noveltyScore: Math.min(100, Math.max(0, analysis.noveltyScore || 70)),
      marketPotential: Math.min(100, Math.max(0, analysis.marketPotential || 60)),
      feasibilityScore: Math.min(100, Math.max(0, analysis.feasibilityScore || 65)),
      swotAnalysis: {
        strengths: Array.isArray(analysis.swotAnalysis?.strengths) 
          ? analysis.swotAnalysis.strengths 
          : ['Addresses a clear market need'],
        weaknesses: Array.isArray(analysis.swotAnalysis?.weaknesses) 
          ? analysis.swotAnalysis.weaknesses 
          : ['May require significant investment'],
        opportunities: Array.isArray(analysis.swotAnalysis?.opportunities) 
          ? analysis.swotAnalysis.opportunities 
          : ['Growing market demand'],
        threats: Array.isArray(analysis.swotAnalysis?.threats) 
          ? analysis.swotAnalysis.threats 
          : ['Competitive landscape'],
        suggestions: Array.isArray(analysis.swotAnalysis?.suggestions) 
          ? analysis.swotAnalysis.suggestions 
          : ['Conduct market research']
      }
    };

    // Add research-based insights to suggestions if available
    if (research) {
      const researchInsights = [];
      
      if (research.competitiveAnalysis.directCompetitors.length === 0) {
        researchInsights.push('Low competition detected - opportunity for market leadership');
      } else if (research.competitiveAnalysis.directCompetitors.length > 5) {
        researchInsights.push('High competition - focus on differentiation strategy');
      }
      
      if (research.patents.length < 3) {
        researchInsights.push('Limited patent activity - opportunity for IP development');
      }
      
      if (research.marketData?.growthRate && parseFloat(research.marketData.growthRate) > 15) {
        researchInsights.push('High-growth market - timing is favorable for entry');
      }

      // Prepend research insights to suggestions
      baseValidation.swotAnalysis.suggestions = [
        ...researchInsights,
        ...baseValidation.swotAnalysis.suggestions
      ].slice(0, 5);
    }

    return baseValidation;
  }
}

// Mock Provider (fallback when no API key)
class MockProvider implements AIProvider {
  async analyzeIdea(idea: IdeaAnalysisRequest): Promise<AIValidation> {
    console.log('⚠️ Using MOCK AI provider - no real API calls or research');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate longer research time
    
    const noveltyScore = Math.floor(Math.random() * 31) + 65;
    
    return {
      noveltyScore,
      marketPotential: Math.floor(Math.random() * 31) + 60,
      feasibilityScore: Math.floor(Math.random() * 31) + 55,
      swotAnalysis: {
        strengths: [
          'Addresses a clear market need',
          'Leverages existing technology effectively',
          'Strong potential for scalability'
        ],
        weaknesses: [
          'May require significant initial investment',
          'Complex implementation challenges',
          'Potential user adoption barriers'
        ],
        opportunities: [
          'Growing market demand in this sector',
          'Potential for strategic partnerships',
          'Expanding global market reach'
        ],
        threats: [
          'Competitive market landscape',
          'Potential regulatory challenges',
          'Rapidly evolving technology standards'
        ],
        suggestions: [
          'Consider a phased implementation approach',
          'Explore potential partnerships with established players',
          'Conduct preliminary market research to validate demand',
          'Note: Enable real AI and research APIs for comprehensive analysis'
        ]
      }
    };
  }

  async generateTags(title: string, description: string): Promise<string[]> {
    console.log('⚠️ Using MOCK tag generation');
    await new Promise(resolve => setTimeout(resolve, 800));
    return ['innovation', 'startup', 'technology', 'business', 'growth'];
  }

  async generateImprovements(idea: IdeaAnalysisRequest): Promise<string[]> {
    console.log('⚠️ Using MOCK improvements');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      'Conduct market research to validate demand',
      'Build a minimum viable product (MVP)',
      'Identify key partnerships and collaborations',
      'Enable real AI APIs for comprehensive analysis'
    ];
  }

  isConfigured(): boolean {
    return false;
  }
}

// Factory function to create the appropriate provider
export function createAIProvider(): AIProvider {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'openrouter';
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  console.log('🚀 Enhanced AI Provider:', provider);
  console.log('🔑 OpenRouter Key Present:', !!openRouterKey);
  console.log('🔍 Research Service Configured:', researchService.isConfigured());
  
  if (provider === 'openrouter' && openRouterKey) {
    console.log('✅ Using Enhanced OpenRouter AI Provider with Real-time Research');
    return new OpenRouterProvider();
  }
  
  console.warn('⚠️ No AI provider configured, using mock data');
  console.log('💡 To enable real AI + Research: Set API keys in .env file');
  return new MockProvider();
}

export const aiService = createAIProvider();