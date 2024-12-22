const API_KEY = "6079|kQr3TNBAD4pT2xWNP1TBP0pNZVbM3zzeSmEw3YtN";
const BASE_URL = "https://zylalabs.com/api/5617/social+saver+api/7304";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  platform: string;
}

interface Media {
  url: string;
  quality: string;
  extension: string;
  type: string;
}

export const videoDownloader = {
  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const response = await fetch(`${BASE_URL}/download+video?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Convertir la durée en format lisible si nécessaire
      let duration = data.duration || data.Duration || '00:00';
      if (typeof duration === 'number') {
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      return {
        title: data.title || data.Title || 'Vidéo sans titre',
        thumbnail: data.thumbnail || data.Thumbnail || '',
        duration: duration,
        platform: data.platform || data.Platform || 'Inconnu'
      };
    } catch (error) {
      console.error('Error fetching video info:', error);
      throw error;
    }
  },

  async downloadVideo(url: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/download+video?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Download Response:', data);
      
      let downloadUrl = '';
      
      // Chercher la meilleure qualité sans filigrane
      if (data.medias && Array.isArray(data.medias)) {
        // Priorité des qualités
        const qualities = ['hd_no_watermark', 'no_watermark', 'watermark'];
        
        for (const quality of qualities) {
          const media = data.medias.find((m: Media) => 
            m.quality === quality && m.type === 'video'
          );
          if (media) {
            downloadUrl = media.url;
            break;
          }
        }
      }

      // Fallback sur les anciens formats de réponse
      if (!downloadUrl) {
        downloadUrl = data.downloadLink || data.DownloadLink || data.url || data.URL;
      }

      if (!downloadUrl) {
        throw new Error('Aucun lien de téléchargement disponible');
      }

      // Télécharger la vidéo
      const videoResponse = await fetch(downloadUrl);
      const blob = await videoResponse.blob();
      
      // Créer un lien de téléchargement temporaire
      const downloadElement = document.createElement('a');
      downloadElement.href = URL.createObjectURL(blob);
      downloadElement.download = `video_${Date.now()}.mp4`; // Nom du fichier par défaut
      
      // Déclencher le téléchargement
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      
      // Nettoyer l'URL temporaire
      URL.revokeObjectURL(downloadElement.href);
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  }
};