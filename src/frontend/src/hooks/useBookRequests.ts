const REQUESTS_KEY = "booklo_book_requests";

export interface BookRequestEntry {
  id: string;
  bookName: string;
  author: string;
  bookClass: string;
  phone: string;
  notes: string;
  createdAt: string;
}

function loadRequests(): BookRequestEntry[] {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useBookRequests(): BookRequestEntry[] {
  return loadRequests();
}

export function useSubmitBookRequest() {
  return (data: Omit<BookRequestEntry, "id" | "createdAt">) => {
    const requests = loadRequests();
    requests.push({
      ...data,
      id: `BR${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  };
}
