// View tracking service to prevent uncontrolled view count increases
class ViewService {
  private viewedIdeas: Set<string> = new Set();

  constructor() {
    // Load viewed ideas from localStorage on initialization
    const stored = localStorage.getItem('creativepro_viewed_ideas');
    if (stored) {
      try {
        const viewedArray = JSON.parse(stored);
        this.viewedIdeas = new Set(viewedArray);
      } catch (error) {
        console.error('Failed to load viewed ideas from localStorage:', error);
      }
    }
  }

  // Check if an idea has been viewed by the current user
  hasViewed(ideaId: string): boolean {
    return this.viewedIdeas.has(ideaId);
  }

  // Mark an idea as viewed and increment its view count
  incrementViewCount(ideaId: string): void {
    if (this.hasViewed(ideaId)) {
      return; // Already viewed, don't increment again
    }

    // Mark as viewed
    this.viewedIdeas.add(ideaId);
    
    // Save to localStorage
    try {
      localStorage.setItem('creativepro_viewed_ideas', JSON.stringify(Array.from(this.viewedIdeas)));
    } catch (error) {
      console.error('Failed to save viewed ideas to localStorage:', error);
    }

    // In a real application, this would make an API call to increment the view count
    // For now, we'll just log it
    console.log(`View count incremented for idea: ${ideaId}`);
  }

  // Clear all viewed ideas (useful for testing or user logout)
  clearViewHistory(): void {
    this.viewedIdeas.clear();
    localStorage.removeItem('creativepro_viewed_ideas');
  }

  // Get the number of ideas viewed by the current user
  getViewedCount(): number {
    return this.viewedIdeas.size;
  }
}

export const viewService = new ViewService();

// Export the increment function for easy import
export const incrementViewCount = (ideaId: string) => {
  viewService.incrementViewCount(ideaId);
};