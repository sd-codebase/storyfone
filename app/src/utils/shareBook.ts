import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_BASE } from '../constants/api';

interface ShareableBook {
  title: string;
  author: string;
  thumbnailUrl: string | null;
}

export async function shareBook(book: ShareableBook) {
  const message = `Listen to "${book.title}" by ${book.author} on Storyfone!`;

  if (book.thumbnailUrl) {
    try {
      const uri = book.thumbnailUrl.startsWith('http')
        ? book.thumbnailUrl
        : API_BASE + book.thumbnailUrl;
      const localUri = FileSystem.cacheDirectory + 'share-thumbnail.jpg';
      const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, localUri);
      await Sharing.shareAsync(downloadedUri, {
        mimeType: 'image/jpeg',
        dialogTitle: message,
      });
      return;
    } catch {
      // Fall through to text-only share
    }
  }

  try {
    await Share.share({ message });
  } catch {}
}
