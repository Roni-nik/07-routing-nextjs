import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import type { NoteSearchResponse } from "@/lib/api";

type Props = {
  params: { slug?: string[] };
};

export default async function NotesPage({ params }: Props) {
  const [tag] = params.slug || [];
  const page = 1;

  const initialData: NoteSearchResponse = await fetchNotes({
    tag,
    searchQuery: "",
    page,
  });

  return <NotesClient initialData={initialData} tag={tag} />;
}