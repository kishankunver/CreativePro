// Research service for web search, patent search, and market analysis
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevanceScore?: number;
}

export interface CompanyData {
  name: string;
  description: string;
  website: string;
  funding: string;
  stage: string;
  founded: string;
  employees: string;
  category: string;
}

export interface PatentData {
  title: string;
  patentNumber: string;
  inventors: string[];
  assignee: string;
  publicationDate: string;
  abstract: string;
  url: string;
}

export interface MarketData {
  marketSize: string;
  growthRate: string;
  keyTrends: string[];
  majorPlayers: string[];
  marketSegments: string[];
}

export interface NewsData {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  summary: string;
}

export interface ResearchResults {
  webSearch: SearchResult[];
  companies: CompanyData[];
  patents: PatentData[];
  marketData: MarketData | null;
  industryNews: NewsData[];
  competitiveAnalysis: {
    directCompetitors: string[];
    indirectCompetitors: string[];
    marketGaps: string[];
    competitiveAdvantages: string[];
  };
}

class ResearchService {
  private serpApiKey: string;
  private braveApiKey: string;
  private crunchbaseApiKey: string;
  private googlePatentsApiKey: string;
  private alphaVantageApiKey: string;
  private newsApiKey: string;

  constructor() {
    this.serpApiKey = import.meta.env.VITE_SERP_API_KEY || '';
    this.braveApiKey = import.meta.env.VITE_BRAVE_SEARCH_API_KEY || '';
    this.crunchbaseApiKey = import.meta.env.VITE_CRUNCHBASE_API_KEY || '';
    this.googlePatentsApiKey = import.meta.env.VITE_GOOGLE_PATENTS_API_KEY || '';
    this.alphaVantageApiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';
    this.newsApiKey = import.meta.env.VITE_NEWS_API_KEY || '';
  }

  async conductResearch(title: string, description: string, category: string): Promise<ResearchResults> {
    console.log('🔍 Starting comprehensive research for:', title);
    
    const searchTerms = this.generateSearchTerms(title, description, category);
    
    const [
      webSearch,
      companies,
      patents,
      marketData,
      industryNews
    ] = await Promise.allSettled([
      this.performWebSearch(searchTerms),
      this.searchCompanies(searchTerms),
      this.searchPatents(searchTerms),
      this.getMarketData(category, searchTerms),
      this.getIndustryNews(category, searchTerms)
    ]);

    const results: ResearchResults = {
      webSearch: webSearch.status === 'fulfilled' ? webSearch.value : [],
      companies: companies.status === 'fulfilled' ? companies.value : [],
      patents: patents.status === 'fulfilled' ? patents.value : [],
      marketData: marketData.status === 'fulfilled' ? marketData.value : null,
      industryNews: industryNews.status === 'fulfilled' ? industryNews.value : [],
      competitiveAnalysis: {
        directCompetitors: [],
        indirectCompetitors: [],
        marketGaps: [],
        competitiveAdvantages: []
      }
    };

    // Analyze competitive landscape
    results.competitiveAnalysis = this.analyzeCompetitiveLandscape(results);

    console.log('✅ Research completed:', results);
    return results;
  }

  private generateSearchTerms(title: string, description: string, category: string): string[] {
    const baseTerms = [
      title,
      `${title} startup`,
      `${title} company`,
      `${category} ${title}`,
      `${category} startup`,
      `${category} market size`,
      `${category} industry trends`
    ];

    // Extract key terms from description
    const descriptionWords = description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !['that', 'with', 'this', 'they', 'have', 'will', 'from', 'been'].includes(word))
      .slice(0, 5);

    descriptionWords.forEach(word => {
      baseTerms.push(`${word} startup`);
      baseTerms.push(`${word} ${category}`);
    });

    return baseTerms.slice(0, 10); // Limit to 10 search terms
  }

  private async performWebSearch(searchTerms: string[]): Promise<SearchResult[]> {
    if (!this.isWebSearchEnabled()) {
      console.log('⚠️ Web search disabled or no API key');
      return this.getMockWebSearchResults();
    }

    const results: SearchResult[] = [];
    
    try {
      // Use SerpAPI for Google search results
      if (this.serpApiKey) {
        for (const term of searchTerms.slice(0, 3)) { // Limit to 3 searches to avoid rate limits
          const searchResults = await this.searchWithSerpAPI(term);
          results.push(...searchResults);
        }
      }
      // Fallback to Brave Search API
      else if (this.braveApiKey) {
        for (const term of searchTerms.slice(0, 3)) {
          const searchResults = await this.searchWithBraveAPI(term);
          results.push(...searchResults);
        }
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = this.deduplicateResults(results);
      return uniqueResults.slice(0, parseInt(import.meta.env.VITE_MAX_SEARCH_RESULTS || '10'));
    } catch (error) {
      console.error('❌ Web search error:', error);
      return this.getMockWebSearchResults();
    }
  }

  private async searchWithSerpAPI(query: string): Promise<SearchResult[]> {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${this.serpApiKey}&num=5`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return (data.organic_results || []).map((result: any) => ({
      title: result.title,
      url: result.link,
      snippet: result.snippet,
      source: 'Google',
      relevanceScore: result.position ? (10 - result.position) / 10 : 0.5
    }));
  }

  private async searchWithBraveAPI(query: string): Promise<SearchResult[]> {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
    
    const response = await fetch(url, {
      headers: {
        'X-Subscription-Token': this.braveApiKey,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return (data.web?.results || []).map((result: any, index: number) => ({
      title: result.title,
      url: result.url,
      snippet: result.description,
      source: 'Brave',
      relevanceScore: (5 - index) / 5
    }));
  }

  private async searchCompanies(searchTerms: string[]): Promise<CompanyData[]> {
    if (!this.crunchbaseApiKey) {
      console.log('⚠️ Company search disabled or no Crunchbase API key');
      return this.getMockCompanyData();
    }

    try {
      const companies: CompanyData[] = [];
      
      for (const term of searchTerms.slice(0, 2)) {
        const url = `https://api.crunchbase.com/api/v4/searches/organizations?query=${encodeURIComponent(term)}&limit=5`;
        
        const response = await fetch(url, {
          headers: {
            'X-cb-user-key': this.crunchbaseApiKey,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        (data.entities || []).forEach((entity: any) => {
          const org = entity.properties;
          companies.push({
            name: org.name,
            description: org.short_description || 'No description available',
            website: org.website || '',
            funding: org.funding_total?.value_usd ? `$${(org.funding_total.value_usd / 1000000).toFixed(1)}M` : 'Unknown',
            stage: org.stage || 'Unknown',
            founded: org.founded_on || 'Unknown',
            employees: org.num_employees_enum || 'Unknown',
            category: org.categories?.[0]?.name || 'Unknown'
          });
        });
      }

      return companies.slice(0, 10);
    } catch (error) {
      console.error('❌ Company search error:', error);
      return this.getMockCompanyData();
    }
  }

  private async searchPatents(searchTerms: string[]): Promise<PatentData[]> {
    if (!this.googlePatentsApiKey) {
      console.log('⚠️ Patent search disabled or no Google Patents API key');
      return this.getMockPatentData();
    }

    try {
      const patents: PatentData[] = [];
      
      // Use Google Patents Public Datasets API
      for (const term of searchTerms.slice(0, 2)) {
        const url = `https://patents.googleapis.com/v1/patents:search?q=${encodeURIComponent(term)}&key=${this.googlePatentsApiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        (data.patents || []).forEach((patent: any) => {
          patents.push({
            title: patent.title,
            patentNumber: patent.publicationNumber,
            inventors: patent.inventor?.map((inv: any) => inv.name) || [],
            assignee: patent.assignee?.[0]?.name || 'Unknown',
            publicationDate: patent.publicationDate,
            abstract: patent.abstract?.substring(0, 200) + '...' || 'No abstract available',
            url: `https://patents.google.com/patent/${patent.publicationNumber}`
          });
        });
      }

      return patents.slice(0, 10);
    } catch (error) {
      console.error('❌ Patent search error:', error);
      return this.getMockPatentData();
    }
  }

  private async getMarketData(category: string, searchTerms: string[]): Promise<MarketData | null> {
    if (!this.alphaVantageApiKey) {
      console.log('⚠️ Market data disabled or no Alpha Vantage API key');
      return this.getMockMarketData(category);
    }

    try {
      // This is a simplified example - in practice, you'd need more sophisticated market data APIs
      const marketKeywords = `${category} market size trends`;
      
      // You could integrate with various market research APIs here
      // For now, returning mock data with real API structure
      return this.getMockMarketData(category);
    } catch (error) {
      console.error('❌ Market data error:', error);
      return this.getMockMarketData(category);
    }
  }

  private async getIndustryNews(category: string, searchTerms: string[]): Promise<NewsData[]> {
    if (!this.newsApiKey) {
      console.log('⚠️ News search disabled or no News API key');
      return this.getMockNewsData(category);
    }

    try {
      const news: NewsData[] = [];
      const query = `${category} startup trends innovation`;
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&apiKey=${this.newsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      (data.articles || []).forEach((article: any) => {
        news.push({
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          summary: article.description || 'No summary available'
        });
      });

      return news;
    } catch (error) {
      console.error('❌ News search error:', error);
      return this.getMockNewsData(category);
    }
  }

  private analyzeCompetitiveLandscape(results: ResearchResults): ResearchResults['competitiveAnalysis'] {
    const directCompetitors: string[] = [];
    const indirectCompetitors: string[] = [];
    const marketGaps: string[] = [];
    const competitiveAdvantages: string[] = [];

    // Analyze companies for competitors
    results.companies.forEach(company => {
      if (company.stage === 'Seed' || company.stage === 'Series A') {
        directCompetitors.push(company.name);
      } else {
        indirectCompetitors.push(company.name);
      }
    });

    // Analyze web search results for market gaps
    const commonThemes = this.extractThemes(results.webSearch);
    marketGaps.push(...commonThemes.filter(theme => 
      theme.includes('gap') || theme.includes('need') || theme.includes('problem')
    ));

    // Generate competitive advantages based on research
    if (results.patents.length < 5) {
      competitiveAdvantages.push('Low patent density - opportunity for IP development');
    }
    if (directCompetitors.length < 3) {
      competitiveAdvantages.push('Limited direct competition in the space');
    }
    if (results.marketData?.growthRate && parseFloat(results.marketData.growthRate) > 10) {
      competitiveAdvantages.push('High-growth market opportunity');
    }

    return {
      directCompetitors: directCompetitors.slice(0, 5),
      indirectCompetitors: indirectCompetitors.slice(0, 5),
      marketGaps: marketGaps.slice(0, 3),
      competitiveAdvantages: competitiveAdvantages.slice(0, 3)
    };
  }

  private extractThemes(searchResults: SearchResult[]): string[] {
    const allText = searchResults.map(result => result.snippet).join(' ').toLowerCase();
    const words = allText.split(/\s+/);
    const wordCount: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = result.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private isWebSearchEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_WEB_SEARCH === 'true' && 
           (!!this.serpApiKey || !!this.braveApiKey);
  }

  // Mock data methods for fallback
  private getMockWebSearchResults(): SearchResult[] {
    return [
      {
        title: "Similar Startup Raises $2M for AI-Powered Solution",
        url: "https://techcrunch.com/example",
        snippet: "A startup working on similar technology recently secured funding...",
        source: "TechCrunch",
        relevanceScore: 0.9
      },
      {
        title: "Market Analysis: Growing Demand in This Sector",
        url: "https://forbes.com/example",
        snippet: "Industry experts predict significant growth in this market segment...",
        source: "Forbes",
        relevanceScore: 0.8
      }
    ];
  }

  private getMockCompanyData(): CompanyData[] {
    return [
      {
        name: "CompetitorCorp",
        description: "A company working on similar solutions in this space",
        website: "https://competitorcorp.com",
        funding: "$5.2M",
        stage: "Series A",
        founded: "2021",
        employees: "11-50",
        category: "Technology"
      }
    ];
  }

  private getMockPatentData(): PatentData[] {
    return [
      {
        title: "Method and System for Related Technology",
        patentNumber: "US10123456B2",
        inventors: ["John Smith", "Jane Doe"],
        assignee: "Tech Company Inc.",
        publicationDate: "2023-01-15",
        abstract: "A method for implementing similar functionality using novel approaches...",
        url: "https://patents.google.com/patent/US10123456B2"
      }
    ];
  }

  private getMockMarketData(category: string): MarketData {
    const marketSizes: { [key: string]: string } = {
      'Tech': '$2.8 trillion',
      'Health': '$4.5 trillion',
      'Finance': '$22.5 trillion',
      'Education': '$6.2 trillion',
      'Sustainability': '$12.8 trillion'
    };

    return {
      marketSize: marketSizes[category] || '$1.2 trillion',
      growthRate: '12.5% CAGR',
      keyTrends: [
        'Digital transformation acceleration',
        'Increased focus on automation',
        'Growing consumer demand for personalized solutions'
      ],
      majorPlayers: ['Company A', 'Company B', 'Company C'],
      marketSegments: ['Enterprise', 'SMB', 'Consumer']
    };
  }

  private getMockNewsData(category: string): NewsData[] {
    return [
      {
        title: `${category} Sector Sees Record Investment in Q4`,
        url: "https://news.example.com/article1",
        publishedAt: "2024-01-15T10:00:00Z",
        source: "Industry Weekly",
        summary: "Investment in the sector reached new heights with several major funding rounds..."
      }
    ];
  }

  isConfigured(): boolean {
    return this.isWebSearchEnabled() || 
           !!this.crunchbaseApiKey || 
           !!this.googlePatentsApiKey || 
           !!this.newsApiKey;
  }
}

export const researchService = new ResearchService();