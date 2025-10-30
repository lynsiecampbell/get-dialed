/**
 * Build a complete URL with UTM parameters
 * @param baseUrl - The base landing page URL
 * @param utmSource - UTM source parameter
 * @param utmMedium - UTM medium parameter
 * @param utmCampaign - UTM campaign parameter
 * @param utmContent - Optional UTM content parameter
 * @returns Complete URL with UTM parameters appended
 */
export function buildUTMUrl(
  baseUrl: string,
  utmSource?: string | null,
  utmMedium?: string | null,
  utmCampaign?: string | null,
  utmContent?: string | null
): string {
  if (!baseUrl) return "";
  
  try {
    const url = new URL(baseUrl);
    
    // Add UTM parameters if provided
    if (utmSource) {
      url.searchParams.set("utm_source", slugifyParam(utmSource));
    }
    if (utmMedium) {
      url.searchParams.set("utm_medium", slugifyParam(utmMedium));
    }
    if (utmCampaign) {
      url.searchParams.set("utm_campaign", slugifyParam(utmCampaign));
    }
    if (utmContent) {
      url.searchParams.set("utm_content", slugifyParam(utmContent));
    }
    
    return url.toString();
  } catch (error) {
    // If URL parsing fails, fall back to manual concatenation
    console.error("Failed to parse URL:", error);
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    const params: string[] = [];
    
    if (utmSource) params.push(`utm_source=${slugifyParam(utmSource)}`);
    if (utmMedium) params.push(`utm_medium=${slugifyParam(utmMedium)}`);
    if (utmCampaign) params.push(`utm_campaign=${slugifyParam(utmCampaign)}`);
    if (utmContent) params.push(`utm_content=${slugifyParam(utmContent)}`);
    
    return params.length > 0 ? `${baseUrl}${separator}${params.join('&')}` : baseUrl;
  }
}

/**
 * Slugify a UTM parameter value (lowercase, replace spaces and pipes with underscores)
 */
function slugifyParam(text: string): string {
  return text.toLowerCase().replace(/\s*\|\s*/g, '_').replace(/\s+/g, '_');
}
