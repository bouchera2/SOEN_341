// Utility functions for generating placeholder images using data URLs

export const getPlaceholderImage = (category: string, width: number = 400, height: number = 250): string => {
  const colors = {
    general: '#4A90E2',
    tech: '#7B68EE',
    music: '#FF6B6B',
    sports: '#4ECDC4',
    academic: '#45B7D1',
    social: '#96CEB4',
    event: '#4A90E2'
  };
  
  const color = colors[category as keyof typeof colors] || colors.general;
  const text = category.toUpperCase();
  
  // Create a simple SVG as data URL
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Fallback to a reliable placeholder service
export const getPlaceholderImageFallback = (category: string, width: number = 400, height: number = 250): string => {
  const colors = {
    general: '4A90E2',
    tech: '7B68EE',
    music: 'FF6B6B',
    sports: '4ECDC4',
    academic: '45B7D1',
    social: '96CEB4',
    event: '4A90E2'
  };
  
  const color = colors[category as keyof typeof colors] || colors.general;
  const text = category.toUpperCase();
  
  // Use picsum.photos as a more reliable service
  return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
};

export const getEventPlaceholder = (width: number = 400, height: number = 250): string => {
  return getPlaceholderImage('event', width, height);
};

export const getCategoryPlaceholder = (tags: string[], width: number = 400, height: number = 250): string => {
  if (!tags || tags.length === 0) return getPlaceholderImage('general', width, height);
  
  const firstTag = tags[0].toLowerCase();
  if (firstTag.includes('tech') || firstTag.includes('technology')) {
    return getPlaceholderImage('tech', width, height);
  } else if (firstTag.includes('music') || firstTag.includes('entertainment')) {
    return getPlaceholderImage('music', width, height);
  } else if (firstTag.includes('sport') || firstTag.includes('fitness')) {
    return getPlaceholderImage('sports', width, height);
  } else if (firstTag.includes('academic') || firstTag.includes('education')) {
    return getPlaceholderImage('academic', width, height);
  } else if (firstTag.includes('social') || firstTag.includes('networking')) {
    return getPlaceholderImage('social', width, height);
  }
  
  return getPlaceholderImage('general', width, height);
};
