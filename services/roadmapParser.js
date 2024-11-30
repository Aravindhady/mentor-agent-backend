class RoadmapParser {
  static parseRoadmap(rawRoadmap, timeline, planPreference) {
    try {
      const lines = rawRoadmap.split('\n').filter(line => line.trim());
      const topics = [];
      const milestones = [];
      
      let currentTopic = null;
      let currentResources = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Parse topics
        if (trimmedLine.match(/^#|^Topic:|^Module:/i)) {
          if (currentTopic) {
            currentTopic.resources = currentResources;
            topics.push(currentTopic);
            currentResources = [];
          }
          
          currentTopic = {
            title: trimmedLine.replace(/^#|^Topic:|^Module:/i, '').trim(),
            description: '',
            resources: [],
            completed: false
          };
        }
        // Parse resources
        else if (trimmedLine.match(/^-|^\*/)) {
          const resource = this.parseResource(trimmedLine);
          if (resource) {
            currentResources.push(resource);
          }
        }
        // Parse milestones
        else if (trimmedLine.match(/milestone|achievement|goal/i)) {
          const milestone = this.parseMilestone(trimmedLine, timeline);
          if (milestone) {
            milestones.push(milestone);
          }
        }
        // Add to current topic description
        else if (currentTopic) {
          currentTopic.description += trimmedLine + '\n';
        }
      }

      // Add the last topic
      if (currentTopic) {
        currentTopic.resources = currentResources;
        topics.push(currentTopic);
      }

      return { topics, milestones };
    } catch (error) {
      console.error('Error parsing roadmap:', error);
      return { topics: [], milestones: [] };
    }
  }

  static parseResource(line) {
    const trimmedLine = line.replace(/^-|\*/, '').trim();
    const urlMatch = trimmedLine.match(/\[(.*?)\]\((.*?)\)/);
    
    if (urlMatch) {
      return {
        title: urlMatch[1],
        url: urlMatch[2],
        type: this.detectResourceType(urlMatch[2]),
        completed: false
      };
    }

    return {
      title: trimmedLine,
      type: 'other',
      completed: false
    };
  }

  static parseMilestone(line, timeline) {
    const title = line.replace(/^-|\*/, '').trim();
    const timelineInDays = this.convertTimelineTodays(timeline);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * timelineInDays));

    return {
      title,
      description: '',
      completed: false,
      dueDate
    };
  }

  static detectResourceType(url) {
    if (!url) return 'other';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'video';
    } else if (url.includes('coursera.org') || url.includes('udemy.com')) {
      return 'course';
    } else if (url.includes('medium.com') || url.includes('dev.to')) {
      return 'article';
    } else if (url.includes('amazon.com') || url.includes('oreilly.com')) {
      return 'book';
    }
    
    return 'other';
  }

  static convertTimelineTodays(timeline) {
    switch (timeline) {
      case '3 months':
        return 90;
      case '6 months':
        return 180;
      case '1 year':
        return 365;
      default:
        return 90;
    }
  }
}

module.exports = RoadmapParser; 